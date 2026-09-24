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
      // V14.1: an element's INK is its box clipped by every overflow-hidden
      // ancestor. The detail plates (components/ui/Figure.tsx, `detail`) lay
      // the whole asset out inside a clipping frame, so the image's own box
      // runs far past what is painted; measuring it unclipped reported a
      // 73-109px overflow for plates that stood 60px clear of the frame floor.
      const clipped = (el) => {
        let r = el.getBoundingClientRect();
        let node = el.parentElement;
        while (node && node !== scene) {
          const o = getComputedStyle(node);
          if (/(hidden|clip)/.test(o.overflow + o.overflowY + o.overflowX)) {
            const c = node.getBoundingClientRect();
            r = {
              top: Math.max(r.top, c.top),
              bottom: Math.min(r.bottom, c.bottom),
              left: Math.max(r.left, c.left),
              right: Math.min(r.right, c.right),
              width: 0,
              height: 0,
            };
            r.width = Math.max(0, r.right - r.left);
            r.height = Math.max(0, r.bottom - r.top);
          }
          node = node.parentElement;
        }
        return r;
      };
      for (const el of scene.querySelectorAll("h3,p,img,figcaption,span,dt,dd,a,button")) {
        const r = clipped(el);
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
