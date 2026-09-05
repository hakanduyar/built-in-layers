// V14 evidence tool: what the governed route actually costs per frame.
//
// The route governor pays its travel budget PER FRAME and forfeits a dropped
// frame's share (lib/spatial/cameraFilter.ts), so frame time IS route speed:
// a traverse that renders at 25ms a frame runs a third slower than one at
// 17ms, with no change to the governor at all. This drives the route with real
// wheel notches at a normal cadence and records the mean rAF interval while it
// moves -- three times, because the cost differs by history:
//
//   forward #1   a fresh page, top to route end
//   forward #2   the same page again, after a scrollTo back to the top
//   reverse      a fresh page, scrollTo to the route end, then back to the top
//
// The V14 pass found forward #1 alone at 17ms while the other two ran at 25ms,
// against 17ms for all three on the baseline; the bisect that named the cause
// (the survey tick spans under the per-frame attention opacity) used PROBE_CSS
// to hide one suspect at a time. Keep both numbers honest: run it against the
// baseline build on another port with the same machine load.
//
//   PROBE_BASE=http://127.0.0.1:3200 node tests/tools/frame-time-probe.mjs [--out file.json]
//   PROBE_CSS='[data-rail-base]{visibility:hidden!important}'   inject CSS for a bisect
//   PROBE_VIEWPORT=1920x1080                                    default 1440x900
//   PROBE_BROWSER=webkit                                        default chromium
//   PROBE_SPAN=0.6,0.85     drive only this fraction of the route (default 0,1);
//                           the cut region is where WebKit's software renderer
//                           is slowest, and where two e2e tests wait for arrival
import { chromium, webkit } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const OUT = outIndex >= 0 ? args[outIndex + 1] : undefined;
const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3200";
const CSS = process.env.PROBE_CSS ?? "";
const [WIDTH, HEIGHT] = (process.env.PROBE_VIEWPORT ?? "1440x900").split("x").map(Number);
const BROWSER = process.env.PROBE_BROWSER === "webkit" ? webkit : chromium;
const [SPAN_FROM, SPAN_TO] = (process.env.PROBE_SPAN ?? "0,1").split(",").map(Number);
const TOUR = "section[aria-label='Spatial system tour']";
const NORMAL = { notch: 120, gapMs: 55 };

const browser = await BROWSER.launch();

async function fresh() {
  const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT } });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.locator(`${TOUR} .sticky`).waitFor({ state: "attached", timeout: 30000 });
  if (CSS) await page.addStyleTag({ content: CSS });
  await page.waitForTimeout(500);
  const geom = await page.evaluate(() => {
    const section = document.querySelector("section[aria-label='Spatial system tour']");
    const spacer = section.querySelector(":scope > div");
    const top = section.getBoundingClientRect().top + window.scrollY;
    return { top, end: top + spacer.getBoundingClientRect().height - window.innerHeight };
  });
  // The driven span: a fraction of the route, so a slow region can be measured alone.
  const span = geom.end - geom.top;
  geom.from = geom.top + span * SPAN_FROM;
  geom.to = geom.top + span * SPAN_TO;
  await page.mouse.move(WIDTH / 2, HEIGHT / 2);
  return { context, page, geom };
}

/** The world plane's transform unchanged for four consecutive polls. */
async function settle(page) {
  await page.evaluate(() => {
    window.__ftLast = undefined;
    window.__ftHits = 0;
  });
  await page.waitForFunction(
    () => {
      const el = document.querySelector("[data-camera-plane='world']");
      const t = el ? getComputedStyle(el).transform : String(window.scrollY);
      const n = window.__ftLast === t ? (window.__ftHits ?? 0) + 1 : 0;
      window.__ftLast = t;
      window.__ftHits = n;
      return n >= 4;
    },
    { timeout: 25000, polling: 90 },
  );
}

async function traverse(page, startY, notch, until, maxNotches = 400) {
  await page.evaluate((y) => window.scrollTo(0, y), startY);
  await settle(page);
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    window.__ftFrames = [];
    window.__ftStop = false;
    let last = performance.now();
    const tick = (t) => {
      window.__ftFrames.push(t - last);
      last = t;
      if (!window.__ftStop) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  const t0 = Date.now();
  let notches = 0;
  let lastY = await page.evaluate(() => window.scrollY);
  let lastMoveAt = Date.now();
  while (notches < maxNotches) {
    const y = await page.evaluate(() => window.scrollY);
    if (notch < 0 ? y <= until + 2 : y >= until - 2) break;
    if (Math.abs(y - lastY) > 1) lastMoveAt = Date.now();
    else if (Date.now() - lastMoveAt > 2500) break;
    lastY = y;
    await page.mouse.wheel(0, notch);
    notches += 1;
    await page.waitForTimeout(NORMAL.gapMs);
  }
  const seconds = +((Date.now() - t0) / 1000).toFixed(1);
  const frame = await page.evaluate(() => {
    window.__ftStop = true;
    const f = window.__ftFrames.slice(5);
    const sorted = [...f].sort((a, b) => a - b);
    return {
      meanMs: +(f.reduce((a, b) => a + b, 0) / f.length).toFixed(1),
      p95Ms: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1),
      over25ms: f.filter((x) => x > 25).length,
      frames: f.length,
    };
  });
  return { notches, seconds, ...frame };
}

const report = {
  base: BASE,
  browser: process.env.PROBE_BROWSER === "webkit" ? "webkit" : "chromium",
  viewport: `${WIDTH}x${HEIGHT}`,
  span: [SPAN_FROM, SPAN_TO],
  css: CSS || null,
  runs: {},
};
{
  const { context, page, geom } = await fresh();
  report.runs["forward-1"] = await traverse(page, geom.from, NORMAL.notch, geom.to);
  report.runs["forward-2"] = await traverse(page, geom.from, NORMAL.notch, geom.to);
  await context.close();
}
{
  const { context, page, geom } = await fresh();
  report.runs.reverse = await traverse(page, geom.to, -NORMAL.notch, geom.from);
  await context.close();
}
for (const [name, r] of Object.entries(report.runs)) {
  console.log(
    `${name.padEnd(10)} ${String(r.notches).padStart(3)} notches ${String(r.seconds).padStart(5)}s` +
      `  ${r.meanMs}ms/frame  p95 ${r.p95Ms}ms  >25ms ${r.over25ms}/${r.frames}`,
  );
}
if (OUT) {
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(report, null, 2) + "\n");
  console.log(`written ${OUT}`);
}
await browser.close();
