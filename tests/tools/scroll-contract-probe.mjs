// V10 (§H, §P): does the scroll model actually hold its contract?
//
// Drives real wheel events and measures what the PAGE does, not what the code
// intends. Three questions the brief asks by name:
//   1. does aggressive input ever exceed the ceiling?
//   2. does wheel debt queue autonomous movement after input stops?
//   3. does reverse respond, or does it pay off forward debt first?
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3000";
const OUT = process.env.PROBE_OUT ?? "docs/review/v10-spatial/metrics";
const W = Number(process.env.PROBE_W ?? 1536);
const H = Number(process.env.PROBE_H ?? 864);
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: W, height: H } });
const page = await context.newPage();
await page.goto(BASE, { waitUntil: "networkidle" });
await page
  .locator("section[aria-label='Spatial system tour'] .sticky")
  .waitFor({ state: "attached", timeout: 30000 });
await page.waitForTimeout(300);

const geom = await page.evaluate(() => {
  const s = document.querySelector("section[aria-label='Spatial system tour']");
  const sp = s.querySelector(":scope > div");
  const top = s.getBoundingClientRect().top + window.scrollY;
  return {
    routeTop: Math.round(top),
    routeEnd: Math.round(top + sp.getBoundingClientRect().height - window.innerHeight),
    docMax: Math.round(document.documentElement.scrollHeight - window.innerHeight),
  };
});

/** Peak px/sec over any 100ms window, sampling scrollY each tick. */
async function drive({ start, notch, gapMs, ticks }) {
  await page.evaluate((y) => window.scrollTo(0, y), start);
  await page.waitForTimeout(1200);
  const samples = [];
  const t0 = Date.now();
  for (let i = 0; i < ticks; i += 1) {
    await page.mouse.wheel(0, notch);
    await page.waitForTimeout(gapMs);
    samples.push({ t: Date.now() - t0, y: await page.evaluate(() => window.scrollY) });
  }
  // Coast: input stops, keep sampling.
  const coastFrom = await page.evaluate(() => window.scrollY);
  const coast = [];
  for (let i = 0; i < 60; i += 1) {
    await page.waitForTimeout(100);
    coast.push({ t: i * 100, y: await page.evaluate(() => window.scrollY) });
  }
  const coastTo = coast[coast.length - 1].y;
  let peak = 0;
  for (let i = 0; i < samples.length; i += 1) {
    for (let j = i + 1; j < samples.length; j += 1) {
      const dt = samples[j].t - samples[i].t;
      if (dt < 80 || dt > 140) continue;
      peak = Math.max(peak, (Math.abs(samples[j].y - samples[i].y) / dt) * 1000);
    }
  }
  // When did the coast actually stop?
  let settledAt = 0;
  for (let i = 1; i < coast.length; i += 1) {
    if (Math.abs(coast[i].y - coast[i - 1].y) > 1) settledAt = coast[i].t;
  }
  return {
    peakPxPerSec: Math.round(peak),
    coastPx: Math.round(coastTo - coastFrom),
    coastVh: +((coastTo - coastFrom) / H).toFixed(2),
    coastMs: settledAt,
  };
}

const routeStart = Math.round(geom.routeTop + (geom.routeEnd - geom.routeTop) * 0.06);
const lowerStart = Math.round(geom.routeEnd + (geom.docMax - geom.routeEnd) * 0.25);

const results = {
  viewport: `${W}x${H}`,
  geom,
  routeGentle: await drive({ start: routeStart, notch: 60, gapMs: 90, ticks: 22 }),
  routeAggressive: await drive({ start: routeStart, notch: 400, gapMs: 16, ticks: 30 }),
  lowerGentle: await drive({ start: lowerStart, notch: 60, gapMs: 90, ticks: 18 }),
  lowerAggressive: await drive({ start: lowerStart, notch: 400, gapMs: 16, ticks: 24 }),
};

// REVERSE: after an aggressive forward run, how long until the page moves back?
await page.evaluate((y) => window.scrollTo(0, y), routeStart);
await page.waitForTimeout(1200);
for (let i = 0; i < 25; i += 1) {
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(16);
}
const beforeReverse = await page.evaluate(() => window.scrollY);
let notches = 0;
let worstForward = 0;
let reversedAt = null;
const tR = Date.now();
for (let i = 0; i < 30 && reversedAt === null; i += 1) {
  await page.mouse.wheel(0, -400);
  notches += 1;
  await page.waitForTimeout(50);
  const y = await page.evaluate(() => window.scrollY);
  worstForward = Math.max(worstForward, y - beforeReverse);
  if (y < beforeReverse - 2) reversedAt = Date.now() - tR;
}
results.reverse = { notches, wrongWayPx: Math.round(worstForward), ms: reversedAt };

writeFileSync(`${OUT}/scroll-contract-${W}x${H}.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 1));
await browser.close();
