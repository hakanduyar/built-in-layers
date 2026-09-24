// V14.1 evidence tool: does the first painted composition match the settled one?
//
// The owner's report is a FLASH on first load -- "text/elements initially appear
// larger and then visibly shrink into final composition". That is a measurable
// event, not a feeling: it is the world layer's `zoom` (lib/spatial/worldFit.ts)
// and the on-screen box of real foreground text changing AFTER the browser has
// already painted them.
//
// So this samples, from before navigation until the page has settled:
//
//   - the world layer's computed `zoom`
//   - the on-screen rect and font-size of a named foreground element
//   - whether the enhanced (spatial) tree or the static tree is mounted
//
// on every animation frame, and reports the first painted value, the settled
// value, how many visible steps occurred and when. A PASS is: the first paint
// of a given tree already carries the settled geometry.
//
//   PROBE_BASE=http://127.0.0.1:3200 node tests/tools/initial-paint-probe.mjs [--out file.json]
//   PROBE_VIEWPORT=1920x1080   default 1440x900
//   PROBE_MODE=cold|warm       cold (default) disables cache, warm reuses it
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const OUT = outIndex >= 0 ? args[outIndex + 1] : undefined;
const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3200";
const [WIDTH, HEIGHT] = (process.env.PROBE_VIEWPORT ?? "1440x900").split("x").map(Number);
const MODE = process.env.PROBE_MODE ?? "cold";

// Injected before any of the page's own script runs, so the first frame the
// browser paints is inside the sample window.
const SAMPLER = `
window.__paint = [];
(() => {
  const t0 = performance.now();
  const read = () => {
    // The fit is a layout zoom on the world layer. Find it by its effect rather
    // than by a class, so a markup change cannot silently blind this probe.
    const tour = document.querySelector("section[aria-label='Spatial system tour']");
    let zoom = null;
    if (tour) {
      for (const el of tour.querySelectorAll("div")) {
        const z = getComputedStyle(el).zoom;
        if (z && z !== "1" && z !== "normal") { zoom = z; break; }
      }
      if (zoom === null) zoom = "1";
    }
    const sticky = tour ? tour.querySelector(".sticky") : null;
    const heroLine = document.querySelector("h1");
    const hr = heroLine ? heroLine.getBoundingClientRect() : null;
    const ink = heroLine ? document.createRange() : null;
    if (ink) ink.selectNodeContents(heroLine);
    const ir = ink ? ink.getBoundingClientRect() : null;
    const textNode = heroLine?.querySelector("span")?.firstChild;
    const glyphRange = textNode ? document.createRange() : null;
    if (glyphRange) glyphRange.selectNodeContents(textNode);
    const gr = glyphRange ? glyphRange.getBoundingClientRect() : null;
    const scene = document.querySelector('[data-world-preview-scene="hero"], [data-scene="hero"]');
    const texts = [];
    if (scene) {
      const walker = document.createTreeWalker(scene, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const rect = range.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        texts.push({ text: node.textContent.trim(), x: +rect.x.toFixed(2),
          y: +rect.y.toFixed(2), w: +rect.width.toFixed(2), h: +rect.height.toFixed(2) });
      }
    }
    const ancestors = [];
    for (let el = heroLine; el; el = el.parentElement) {
      const cs = getComputedStyle(el);
      ancestors.push({ tag: el.tagName, transform: cs.transform, zoom: cs.zoom,
        opacity: cs.opacity, font: cs.fontFamily });
    }
    return {
      t: +(performance.now() - t0).toFixed(1),
      zoom,
      enhanced: !!sticky,
      heroW: hr ? +hr.width.toFixed(2) : null,
      heroH: hr ? +hr.height.toFixed(2) : null,
      heroFont: heroLine ? getComputedStyle(heroLine).fontSize : null,
      heroX: hr ? +hr.x.toFixed(2) : null,
      heroY: hr ? +hr.y.toFixed(2) : null,
      inkX: ir ? +ir.x.toFixed(2) : null,
      inkY: ir ? +ir.y.toFixed(2) : null,
      inkW: ir ? +ir.width.toFixed(2) : null,
      inkH: ir ? +ir.height.toFixed(2) : null,
      glyphW: gr ? +gr.width.toFixed(2) : null,
      glyphH: gr ? +gr.height.toFixed(2) : null,
      fonts: document.fonts.status,
      fontFaces: [...document.fonts].map((face) => ({ family: face.family, status: face.status })),
      texts,
      ancestors,
    };
  };
  const tick = () => {
    window.__paint.push(read());
    if (performance.now() - t0 < 4000) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();
`;

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT } });
const page = await context.newPage();
if (process.env.PROBE_PREVIEW_CSS) {
  await page.route(BASE + "/", async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      "</head>",
      `<style>${process.env.PROBE_PREVIEW_CSS}</style></head>`,
    );
    await route.fulfill({ response, body });
  });
}
if (MODE === "warm") {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
}
const client = await context.newCDPSession(page);
const filmstrip = [];
if (process.env.PROBE_FILMSTRIP && OUT) {
  client.on("Page.screencastFrame", (frame) => {
    filmstrip.push({ data: frame.data, metadata: frame.metadata });
    void client.send("Page.screencastFrameAck", { sessionId: frame.sessionId });
  });
  await client.send("Page.startScreencast", { format: "png", everyNthFrame: 1 });
}
await client.send("Network.setCacheDisabled", { cacheDisabled: MODE === "cold" });
await page.addInitScript(SAMPLER);
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(4200);

const samples = await page.evaluate(() => window.__paint);
let filmstripComparison;
if (process.env.PROBE_FILMSTRIP && OUT) {
  await client.send("Page.stopScreencast");
  const settledPng = await page.screenshot();
  filmstripComparison = await page.evaluate(
    async ({ frames, settled }) => {
      const pixels = async (data) => {
        const img = new Image();
        img.src = "data:image/png;base64," + data;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      };
      const final = await pixels(settled);
      const results = [];
      for (const [index, frame] of frames.entries()) {
        const first = await pixels(frame);
        let ink = 0,
          changed = 0,
          total = 0;
        for (let i = 0; i < first.length; i += 4) {
          if (first[i] < 100 && first[i + 1] < 100 && first[i + 2] < 100) ink++;
          const delta = [0, 1, 2].map((c) => Math.abs(first[i + c] - final[i + c]));
          if (Math.max(...delta) > 8) changed++;
          total += delta[0] + delta[1] + delta[2];
        }
        results.push({
          index,
          inkPixels: ink,
          changedPixelsOver8: changed,
          meanAbsoluteRgbDifference: +(total / ((first.length / 4) * 3)).toFixed(5),
        });
      }
      return results;
    },
    { frames: filmstrip.map((frame) => frame.data), settled: settledPng.toString("base64") },
  );
  const directory = OUT.replace(/\.json$/, "-frames");
  mkdirSync(directory, { recursive: true });
  for (const [i, frame] of filmstrip.entries()) {
    writeFileSync(
      `${directory}/${String(i).padStart(3, "0")}.png`,
      Buffer.from(frame.data, "base64"),
    );
  }
  writeFileSync(
    `${directory}/frames.json`,
    JSON.stringify(
      filmstrip.map(({ metadata }) => metadata),
      null,
      2,
    ),
  );
}
await browser.close();

/** Collapse to the moments a value actually changed. */
function steps(key) {
  const out = [];
  let last;
  for (const s of samples) {
    const v = s[key];
    if (v === null || v === undefined) continue;
    if (v !== last) {
      out.push({ t: s.t, value: v });
      last = v;
    }
  }
  return out;
}

const zoomSteps = steps("zoom");
const heroSteps = steps("heroH");
const fontSteps = steps("heroFont");
// The reader's own test: did a foreground box change size after being painted?
const heroShift =
  heroSteps.length > 1
    ? +(heroSteps[heroSteps.length - 1].value / heroSteps[0].value).toFixed(4)
    : 1;
const heroResizePx =
  heroSteps.length > 1
    ? +Math.abs(heroSteps[heroSteps.length - 1].value - heroSteps[0].value).toFixed(2)
    : 0;
const enhancedAt = samples.find((s) => s.enhanced)?.t ?? null;
const firstPaintedZoom = zoomSteps[0]?.value ?? null;
const settledZoom = zoomSteps[zoomSteps.length - 1]?.value ?? null;
// Height alone missed the hydration jump. Compare the whole foreground box
// and actual glyph bounds, including intermediate excursions that return home.
const compositionKeys = ["heroX", "heroY", "heroW", "heroH", "glyphW", "glyphH"];
const textExtents = new Map();
for (const sample of samples) {
  for (const text of sample.texts ?? []) {
    for (const key of ["x", "y", "w", "h"]) {
      const id = text.text + ":" + key;
      const extent = textExtents.get(id) ?? [text[key], text[key]];
      textExtents.set(id, [Math.min(extent[0], text[key]), Math.max(extent[1], text[key])]);
    }
  }
}
const heroTextMaxDeltaPx = +Math.max(
  0,
  ...[...textExtents.values()].map(([lo, hi]) => hi - lo),
).toFixed(2);
const compositionMaxDeltaPx = +Math.max(
  ...compositionKeys.map((key) => {
    const values = steps(key).map((step) => step.value);
    return values.length ? Math.max(...values) - Math.min(...values) : 0;
  }),
).toFixed(2);
const report = {
  base: BASE,
  viewport: `${WIDTH}x${HEIGHT}`,
  mode: MODE,
  frames: samples.length,
  enhancedTreeAtMs: enhancedAt,
  zoom: { firstPainted: firstPaintedZoom, settled: settledZoom, steps: zoomSteps },
  heroHeight: {
    firstPainted: heroSteps[0]?.value ?? null,
    settled: heroSteps[heroSteps.length - 1]?.value ?? null,
    resizeRatio: heroShift,
    resizePx: heroResizePx,
    steps: heroSteps,
  },
  heroFontSize: { steps: fontSteps },
  foreground: Object.fromEntries(
    ["heroX", "heroY", "heroW", "inkX", "inkY", "inkW", "inkH", "glyphW", "glyphH", "fonts"].map(
      (key) => [key, steps(key)],
    ),
  ),
  samples,
  compositionMaxDeltaPx,
  heroTextMaxDeltaPx,
  ...(filmstripComparison ? { filmstripComparison } : {}),
  // THE TEST IS THE FOREGROUND, NOT AN INTERNAL VALUE.
  //
  // The reader's complaint is that painted text changes size after they can
  // already see it, so that is what decides this: the on-screen box of a real
  // heading, from its first paint to its settled one. The world's `zoom` is
  // reported alongside because it is the CAUSE, but it is not the test -- the
  // pre-hydration tree carries the fit as a transform and so has no zoomed
  // element for the sampler to find, which reads as a change of an internal
  // value while the composition itself never moves a pixel. Half a pixel of
  // sub-pixel layout difference is not a flash either; a ninth of the
  // composition is.
  verdict:
    Math.max(compositionMaxDeltaPx, heroTextMaxDeltaPx) <= 1
      ? "FIRST PAINT == SETTLED"
      : `FLASH: foreground changes by up to ${compositionMaxDeltaPx}px; ` +
        `hero height ${heroSteps[0]?.value} -> ${heroSteps[heroSteps.length - 1]?.value}px; ` +
        `zoom ${firstPaintedZoom} -> ${settledZoom}`,
};

console.log(`${report.viewport} ${MODE}: ${report.verdict}`);
console.log(`  world zoom steps: ${zoomSteps.map((s) => `${s.value}@${s.t}ms`).join("  ->  ")}`);
console.log(`  hero box steps:   ${heroSteps.map((s) => `${s.value}px@${s.t}ms`).join("  ->  ")}`);
console.log(`  hero font steps:  ${fontSteps.map((s) => `${s.value}@${s.t}ms`).join("  ->  ")}`);
console.log(`  enhanced tree at: ${enhancedAt}ms`);
if (OUT) {
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(report, null, 2) + "\n");
  console.log(`  written ${OUT}`);
}
