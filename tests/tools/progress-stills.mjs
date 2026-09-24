// V14.2 Gate B evidence tool: full-size stills of the built page parked at
// arbitrary route progress values -- the frames BETWEEN the focus table's
// beats, at native resolution, where transition-sheet.mjs gives the same
// frames as a scaled contact sheet. Used to judge the cover, the landing and
// the surface return at 1440x900 and 1920x1080 (docs/review/v14.2-gate-b/).
//
//   PROBE_BASE=http://127.0.0.1:3200 VP=1440x900 PS=0.700,0.720 OUT=dir \
//     node tests/tools/progress-stills.mjs
//
// Each still waits for the governed camera to settle (the world plane's
// transform unchanged across four polls), exactly as transition-sheet.mjs
// does, so a frame is what a reader who stopped there would see.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3200";
const [W, H] = (process.env.VP ?? "1440x900").split("x").map(Number);
const OUT = process.env.OUT ?? "docs/review/v14.2-gate-b/after/stills";
const PS = (process.env.PS ?? "0.700,0.712,0.724,0.736,0.744").split(",").map(Number);
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto(BASE, { waitUntil: "networkidle" });
await page
  .locator("section[aria-label='Spatial system tour'] .sticky")
  .waitFor({ state: "attached" });
await page.waitForTimeout(300);
const range = await page.evaluate(() => {
  const s = document.querySelector("section[aria-label='Spatial system tour']");
  const sp = s.querySelector(":scope > div");
  const start = s.getBoundingClientRect().top + window.scrollY;
  return { start, end: start + sp.getBoundingClientRect().height - window.innerHeight };
});
for (const p of PS) {
  await page.evaluate((y) => window.scrollTo(0, y), range.start + p * (range.end - range.start));
  await page.evaluate(() => {
    window.__l = undefined;
    window.__h = 0;
  });
  await page.waitForFunction(
    () => {
      const el = document.querySelector("[data-camera-plane='world']");
      const t = el ? getComputedStyle(el).transform : "";
      const n = window.__l === t ? (window.__h ?? 0) + 1 : 0;
      window.__l = t;
      window.__h = n;
      return n >= 4;
    },
    { timeout: 30000, polling: 90 },
  );
  await page.screenshot({ path: `${OUT}/${W}x${H}--p${p.toFixed(3)}.png` });
}
await browser.close();
console.log("stills written to", OUT);
