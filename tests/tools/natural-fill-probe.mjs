// V9: content fill measured under NATURAL scrolling.
//
// The step-and-settle probe jumps the camera and waits for it to arrive, which
// is right for geometry and wrong for anything driven by route progress: a
// reader never teleports, so a value that is correct after a jump can still be
// wrong at the moment a real reader passes through. This drives real wheel
// events at a human cadence and samples the frame as it goes.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3000";
const OUT = process.env.PROBE_OUT ?? "docs/review/v9-release/metrics";
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

await page.evaluate(() => {
  const NODES = "h1,h2,h3,p,li,dt,dd,a,img,figure,button,span";
  window.__fill = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let area = 0;
    const labels = [];
    for (const el of document.querySelectorAll(NODES)) {
      if (el.closest("[aria-hidden='true']")) continue;
      const text = (el.textContent ?? "").trim();
      const isMedia = el.tagName === "IMG" || el.tagName === "FIGURE";
      if (!text && !isMedia) continue;
      if (el.querySelector(NODES) && !isMedia) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const vis =
        Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) *
        Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
      if (vis <= 0) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden") continue;
      // Walk up for an inherited opacity: the marker's own span is opaque while
      // its wrapper fades, and the reader sees the product.
      let o = 1;
      for (let n = el; n && n !== document.body; n = n.parentElement)
        o *= Number(getComputedStyle(n).opacity);
      if (o < 0.12) continue;
      area += vis * o;
      if (labels.length < 2 && text) labels.push(text.slice(0, 30));
    }
    return { y: Math.round(window.scrollY), fill: +(area / (vw * vh)).toFixed(4), labels };
  };
});

const samples = [];
let guard = 0;
while (guard < 1400) {
  guard += 1;
  await page.mouse.wheel(0, 60);
  await page.waitForTimeout(45);
  samples.push(await page.evaluate(() => window.__fill()));
  const done = await page.evaluate(
    () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4,
  );
  if (done) break;
}

const THRESHOLD = 0.02;
const runs = [];
let run = null;
for (const s of samples) {
  if (s.fill < THRESHOLD) {
    run = run ?? { from: s.y, to: s.y, minFill: s.fill };
    run.to = s.y;
    run.minFill = Math.min(run.minFill, s.fill);
  } else if (run) {
    runs.push(run);
    run = null;
  }
}
if (run) runs.push(run);

writeFileSync(
  `${OUT}/natural-fill-${W}x${H}.json`,
  JSON.stringify({ W, H, samples, runs }, null, 2),
);
console.log(
  `natural scroll ${W}x${H}: ${samples.length} samples, mean fill ${(samples.reduce((a, s) => a + s.fill, 0) / samples.length).toFixed(3)}`,
);
for (const r of runs)
  console.log(`DEAD RUN y=${r.from}-${r.to} (${r.to - r.from}px) minFill ${r.minFill}`);
if (!runs.length) console.log("no dead runs under natural scrolling");
await browser.close();
