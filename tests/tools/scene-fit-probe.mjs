// V14 evidence tool: does every composition clear its frame at every desktop
// viewport, and at what fit?
//
// WORLD_REFERENCE.height is set where the tallest composition clears the
// sticky frame (lib/spatial/worldFit.ts). This reads that claim back off the
// built page: for each desktop viewport it parks the camera at each scene's
// own focus, measures the composition's box against the frame, and records
// the world layer's zoom. A positive `overflowPx` means the composition's
// bottom is below the frame's bottom -- clipped.
//
//   PROBE_BASE=http://127.0.0.1:3200 node tests/tools/scene-fit-probe.mjs
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3200";
const OUT = process.env.PROBE_OUT ?? "docs/review/v14-owner-visual/after/metrics";
const FOCUS_FILE =
  process.env.FOCUS_FILE ?? "docs/review/v14-owner-visual/baseline/metrics/route-focus.json";
mkdirSync(OUT, { recursive: true });

const FOCUS = JSON.parse(readFileSync(FOCUS_FILE, "utf8")).desktop;
const VIEWPORTS = [
  [1366, 768],
  [1440, 900],
  [1536, 864],
  [1920, 1080],
  [2560, 1440],
];
const SCENES = [
  "software-factory",
  "kivilcim",
  "jointledger",
  "dropspot",
  "reorient",
  "approach",
  "handoff",
];
const TOUR = "section[aria-label='Spatial system tour']";

const browser = await chromium.launch();
const report = {};
for (const [width, height] of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.locator(`${TOUR} .sticky`).waitFor({ state: "attached", timeout: 30000 });
  await page.waitForTimeout(400);
  const range = await page.evaluate(() => {
    const section = document.querySelector("section[aria-label='Spatial system tour']");
    const spacer = section.querySelector(":scope > div");
    const start = section.getBoundingClientRect().top + window.scrollY;
    return { start, end: start + spacer.getBoundingClientRect().height - window.innerHeight };
  });
  const rows = {};
  for (const id of SCENES) {
    await page.evaluate(
      ({ range, p }) => window.scrollTo(0, range.start + (range.end - range.start) * p),
      { range, p: FOCUS[id] },
    );
    await page.waitForFunction(
      () => {
        const el = document.querySelector("[data-camera-plane='world']");
        const t = el ? getComputedStyle(el).transform : "";
        const n = window.__fLast === t ? (window.__fHits ?? 0) + 1 : 0;
        window.__fLast = t;
        window.__fHits = n;
        return n >= 4;
      },
      { timeout: 25000, polling: 90 },
    );
    await page.evaluate(() => {
      window.__fLast = undefined;
      window.__fHits = 0;
    });
    rows[id] = await page.evaluate((sceneId) => {
      const frame = document.querySelector("section[aria-label='Spatial system tour'] .sticky");
      const scene = document.querySelector(`[data-scene="${sceneId}"]`);
      const world = frame.querySelector(":scope > div");
      if (!frame || !scene) return null;
      // The composition's ink: the union of every text/media leaf inside the scene.
      let top = Infinity;
      let bottom = -Infinity;
      for (const el of scene.querySelectorAll("h3,p,img,figcaption,span,dt,dd,a,button")) {
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        if (el.closest("[data-system-pov]")) continue;
        top = Math.min(top, r.top);
        bottom = Math.max(bottom, r.bottom);
      }
      const f = frame.getBoundingClientRect();
      const zoom = Number.parseFloat(getComputedStyle(world).zoom || "1");
      return {
        fit: +zoom.toFixed(3),
        inkTop: Math.round(top - f.top),
        inkBottom: Math.round(bottom - f.top),
        frameHeight: Math.round(f.height),
        overflowPx: Math.round(bottom - f.bottom),
        inkHeightWorldPx: Math.round((bottom - top) / (zoom || 1)),
      };
    }, id);
  }
  report[`${width}x${height}`] = rows;
  await context.close();
  const worst = Math.max(...Object.values(rows).map((r) => r?.overflowPx ?? -Infinity));
  console.log(
    `${width}x${height}  fit ${rows["software-factory"]?.fit}  worst overflow ${worst}px  ` +
      Object.entries(rows)
        .map(([id, r]) => `${id}:${r?.overflowPx}`)
        .join(" "),
  );
}
writeFileSync(`${OUT}/scene-fit.json`, JSON.stringify(report, null, 2));
await browser.close();
