// V9 evidence tool: where does the page stop saying anything?
//
// Steps the whole document at a fixed pixel interval and measures, per frame,
// how much REAL content is in view -- text-bearing and media elements only,
// decorative marks excluded -- as a fraction of the viewport area. A run of
// frames under the threshold is a dead zone, and the tool reports each run with
// the scroll range and the nearest landmark, so a fix can be aimed rather than
// guessed at.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3000";
const OUT = process.env.PROBE_OUT ?? "docs/review/v9-release/metrics";
const STEP = Number(process.env.PROBE_STEP ?? 120);
const W = Number(process.env.PROBE_W ?? 1536);
const H = Number(process.env.PROBE_H ?? 864);
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: W, height: H } });
const page = await context.newPage();
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(900);

const total = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
const samples = [];
for (let y = 0; y <= total; y += STEP) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  // Let the governed camera arrive before reading the frame.
  await page.waitForFunction(
    () => {
      const el = document.querySelector("[data-camera-plane='world']");
      if (!el) return true;
      const t = getComputedStyle(el).transform;
      const w = window;
      const n = w.__dsLast === t ? (w.__dsHits ?? 0) + 1 : 0;
      w.__dsLast = t;
      w.__dsHits = n;
      return n >= 3;
    },
    { timeout: 20000, polling: 90 },
  );
  await page.evaluate(() => {
    window.__dsLast = undefined;
    window.__dsHits = 0;
  });
  const s = await page.evaluate(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let area = 0;
    let items = 0;
    const labels = [];
    const NODES = "h1,h2,h3,p,li,dt,dd,a,img,svg[role='img'],figure,button,span";
    for (const el of document.querySelectorAll(NODES)) {
      if (el.closest("[aria-hidden='true']")) continue; // decorative depth material
      const text = (el.textContent ?? "").trim();
      const isMedia = el.tagName === "IMG" || el.tagName === "FIGURE";
      if (!text && !isMedia) continue;
      if (el.querySelector(NODES) && !isMedia) continue; // leaves only, no double count
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const vis =
        Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) *
        Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
      if (vis <= 0) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || Number(cs.opacity) < 0.12) continue;
      area += vis;
      items += 1;
      if (labels.length < 3 && text) labels.push(text.slice(0, 34));
    }
    return {
      y: Math.round(window.scrollY),
      fill: +(area / (vw * vh)).toFixed(4),
      items,
      labels,
    };
  });
  samples.push(s);
}

// A dead run: consecutive samples whose content fill is under the threshold.
const THRESHOLD = 0.02;
const runs = [];
let run = null;
for (const s of samples) {
  if (s.fill < THRESHOLD) {
    run = run ?? { from: s.y, to: s.y, minFill: s.fill, maxFill: s.fill };
    run.to = s.y;
    run.minFill = Math.min(run.minFill, s.fill);
    run.maxFill = Math.max(run.maxFill, s.fill);
  } else if (run) {
    runs.push(run);
    run = null;
  }
}
if (run) runs.push(run);

const named = runs.map((r) => {
  const before = [...samples].reverse().find((s) => s.y < r.from && s.labels.length);
  const after = samples.find((s) => s.y > r.to && s.labels.length);
  return {
    ...r,
    px: r.to - r.from + STEP,
    viewports: +((r.to - r.from + STEP) / H).toFixed(2),
    leaving: before?.labels?.[0] ?? null,
    arriving: after?.labels?.[0] ?? null,
  };
});

writeFileSync(
  `${OUT}/dead-scroll-${W}x${H}.json`,
  JSON.stringify({ W, H, STEP, total, samples, runs: named }, null, 2),
);
console.log(
  `viewport ${W}x${H}  document ${total}px (${(total / H).toFixed(1)} viewports)  samples ${samples.length}`,
);
console.log(
  `mean content fill ${(samples.reduce((a, s) => a + s.fill, 0) / samples.length).toFixed(3)}`,
);
for (const r of named) {
  console.log(
    `DEAD RUN  y=${r.from}-${r.to}  ${r.px}px (${r.viewports} viewports)  fill ${r.minFill}-${r.maxFill}` +
      `  after "${r.leaving}"  before "${r.arriving}"`,
  );
}
await browser.close();
