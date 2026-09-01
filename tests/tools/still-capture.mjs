// V9 evidence: key stills at the route's own focus positions plus the named
// lower-page landmarks. Lightweight by policy (see docs/REVIEW_POLICY.md):
// stills only, no video, written outside the repo by default.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3000";
const OUT = process.env.SHOT_OUT ?? "C:/Users/hakan/portfolio-review/v9";
const W = Number(process.env.PROBE_W ?? 1536);
const H = Number(process.env.PROBE_H ?? 864);
const ZOOM = Number(process.env.PROBE_ZOOM ?? 100);
mkdirSync(OUT, { recursive: true });

const SCENES = [
  "hero",
  "software-factory",
  "kivilcim",
  "jointledger",
  "dropspot",
  "tail",
  "reorient",
  "approach",
  "handoff",
];
const LANDMARKS = [
  ["surface-return", 'section[aria-label="Spatial system tour"]'],
  ["selected-systems", '[data-drift-block="selected-systems"]'],
  ["how-i-build", '[data-drift-block="how-i-build"]'],
  ["field-notes", '[data-drift-block="field-notes"]'],
  ["about", '[data-drift-block="about"]'],
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: W, height: H } });
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
const tag = `${W}x${H}${ZOOM === 100 ? "" : `@${ZOOM}`}`;

const range = await page.evaluate(() => {
  const s = document.querySelector("section[aria-label='Spatial system tour']");
  const sp = s.querySelector(":scope > div");
  const start = s.getBoundingClientRect().top + window.scrollY;
  return { start, end: start + sp.getBoundingClientRect().height - window.innerHeight };
});

// Focus progresses come from the committed route dump.
const focus = JSON.parse(
  (await import("node:fs")).readFileSync("docs/review/v9-release/metrics/route-focus.json", "utf8"),
).desktop;

for (const id of SCENES) {
  const p = focus[id];
  if (p == null) continue;
  await page.evaluate(
    ({ range, p }) => window.scrollTo(0, range.start + (range.end - range.start) * p),
    { range, p },
  );
  await page.waitForFunction(
    (sceneId) => {
      const el = document.querySelector(`[data-scene="${sceneId}"]`);
      if (!el) return true;
      const t = Math.round(el.getBoundingClientRect().top);
      const w = window;
      const n = w.__sLast === t ? (w.__sHits ?? 0) + 1 : 0;
      w.__sLast = t;
      w.__sHits = n;
      return n >= 3;
    },
    id,
    { timeout: 20000, polling: 100 },
  );
  await page.evaluate(() => {
    window.__sLast = undefined;
    window.__sHits = 0;
  });
  await page.screenshot({ path: `${OUT}/${tag}--${id}.png` });
}

// The surface return: the frame just after the route's terminus.
await page.evaluate(({ range }) => window.scrollTo(0, range.end + window.innerHeight * 0.25), {
  range,
});
await page.waitForTimeout(1400);
await page.screenshot({ path: `${OUT}/${tag}--surface-return.png` });

for (const [name, sel] of LANDMARKS.slice(1)) {
  await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (el)
      window.scrollTo(
        0,
        el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.12,
      );
  }, sel);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${tag}--${name}.png` });
}

await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/${tag}--cta.png` });

console.log(`${tag}: stills written to ${OUT}, console errors ${errors.length}`);
await browser.close();
