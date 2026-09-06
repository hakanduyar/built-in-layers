// V14.1 evidence tool: is the information foreground actually softer WHILE the
// camera is moving, and by how much?
//
// The owner reports a visible loss of sharpness during scroll. The existing
// motion-sharpness probe proves the ABSENCE of the usual culprits (no scale on
// a text ancestor, no filter) and captures full-page stills for the eye; it
// does not produce a number, so it cannot say whether a change helped. This
// does: it crops the same real foreground element at rest and in motion and
// measures edge acutance -- the gradient energy of the luminance field, which
// is exactly what resampling a rasterised glyph destroys.
//
// It also records WHY: the device-pixel offset the element is painted at. A
// composited layer is rasterised once and then translated by the compositor, so
// a translation landing on a fractional device pixel resamples every glyph in
// it. Whole-pixel offsets cannot.
//
//   PROBE_BASE=http://127.0.0.1:3200 node tests/tools/foreground-sharpness-probe.mjs [--out f.json]
//   PROBE_VIEWPORT=1440x900   PROBE_DPR=1   PROBE_LABEL=before   SHOT_OUT=dir
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const OUT = outIndex >= 0 ? args[outIndex + 1] : undefined;
const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3200";
const [WIDTH, HEIGHT] = (process.env.PROBE_VIEWPORT ?? "1440x900").split("x").map(Number);
const DPR = Number(process.env.PROBE_DPR ?? 1);
const LABEL = process.env.PROBE_LABEL ?? "run";
const SHOTS = process.env.SHOT_OUT ?? null;
const TOUR = "section[aria-label='Spatial system tour']";
// The scene title: the largest piece of information text the world carries.
const TITLE = TOUR + ' [data-scene="software-factory"] h3';
const FOCUS = 0.1;

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: DPR,
});
const page = await context.newPage();
await page.goto(BASE, { waitUntil: "networkidle" });
await page.locator(TOUR + " .sticky").waitFor({ state: "attached", timeout: 30000 });
await page.waitForTimeout(500);

const range = await page.evaluate(() => {
  const section = document.querySelector("section[aria-label='Spatial system tour']");
  const spacer = section.querySelector(":scope > div");
  const start = section.getBoundingClientRect().top + window.scrollY;
  return { start, end: start + spacer.getBoundingClientRect().height - window.innerHeight };
});

/** The world plane's transform unchanged for four consecutive polls. */
async function settle(timeout = 25000) {
  await page.evaluate(() => {
    window.__shLast = undefined;
    window.__shHits = 0;
  });
  await page.waitForFunction(
    () => {
      const el = document.querySelector("[data-camera-plane='world']");
      const t = el ? getComputedStyle(el).transform : String(window.scrollY);
      const n = window.__shLast === t ? (window.__shHits ?? 0) + 1 : 0;
      window.__shLast = t;
      window.__shHits = n;
      return n >= 4;
    },
    { timeout, polling: 90 },
  );
}

async function readGeometry() {
  return page.evaluate(
    (input) => {
      const el = document.querySelector(input.sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      // Distance to the nearest whole device pixel, in device pixels.
      const frac = (v) => {
        const d = Math.abs(v * input.dpr) % 1;
        return +Math.min(d, 1 - d).toFixed(4);
      };
      return {
        x: +r.x.toFixed(3),
        y: +r.y.toFixed(3),
        w: +r.width.toFixed(2),
        h: +r.height.toFixed(2),
        devicePixelOffsetX: frac(r.x),
        devicePixelOffsetY: frac(r.y),
      };
    },
    { sel: TITLE, dpr: DPR },
  );
}

/** Edge acutance of a PNG buffer: mean, p99 and max luminance gradient. */
async function acutance(buffer) {
  const dataUrl = "data:image/png;base64," + buffer.toString("base64");
  return page.evaluate(async (url) => {
    const img = await new Promise((res) => {
      const i = new Image();
      i.onload = () => res(i);
      i.src = url;
    });
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const x = c.getContext("2d", { willReadFrequently: true });
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    const lum = new Float32Array(c.width * c.height);
    for (let i = 0, p = 0; i < d.length; i += 4, p += 1) {
      lum[p] = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    }
    const grads = [];
    let sum = 0;
    for (let yy = 1; yy < c.height - 1; yy += 1) {
      for (let xx = 1; xx < c.width - 1; xx += 1) {
        const i = yy * c.width + xx;
        const gx = Math.abs(lum[i + 1] - lum[i - 1]);
        const gy = Math.abs(lum[i + c.width] - lum[i - c.width]);
        const g = Math.max(gx, gy);
        grads.push(g);
        sum += g;
      }
    }
    grads.sort((a, b) => a - b);
    return {
      pixels: grads.length,
      meanGradient: +(sum / grads.length).toFixed(3),
      p99Gradient: +grads[Math.floor(grads.length * 0.99)].toFixed(1),
      maxGradient: +grads[grads.length - 1].toFixed(1),
    };
  }, dataUrl);
}

await page.evaluate(
  (input) => window.scrollTo(0, Math.round(input.start + (input.end - input.start) * input.p)),
  { start: range.start, end: range.end, p: FOCUS },
);
await settle();
await page.mouse.move(WIDTH / 2, HEIGHT / 2);

const restGeom = await readGeometry();
const clip = {
  x: Math.max(0, restGeom.x - 8),
  y: Math.max(0, restGeom.y - 8),
  width: Math.min(WIDTH - Math.max(0, restGeom.x - 8), restGeom.w + 16),
  height: Math.min(HEIGHT - Math.max(0, restGeom.y - 8), restGeom.h + 16),
};
const restShot = await page.screenshot({ clip });
const rest = await acutance(restShot);

// The same glyphs while the camera translates. The governor pays an intent out
// over many frames, so these notches leave the camera moving for well over a
// second and the capture below lands inside that window.
await page.mouse.wheel(0, 240);
await page.mouse.wheel(0, 240);
const movingGeom = await readGeometry();
const movingShot = await page.screenshot({
  clip: {
    x: Math.max(0, movingGeom.x - 8),
    y: Math.max(0, movingGeom.y - 8),
    width: clip.width,
    height: clip.height,
  },
});
const afterGeom = await readGeometry();
const movedDuringCapture = +Math.hypot(
  afterGeom.x - movingGeom.x,
  afterGeom.y - movingGeom.y,
).toFixed(2);
const moving = await acutance(movingShot);

if (SHOTS) {
  mkdirSync(SHOTS, { recursive: true });
  writeFileSync(
    SHOTS + "/" + LABEL + "-" + WIDTH + "x" + HEIGHT + "@" + DPR + "x-rest.png",
    restShot,
  );
  writeFileSync(
    SHOTS + "/" + LABEL + "-" + WIDTH + "x" + HEIGHT + "@" + DPR + "x-moving.png",
    movingShot,
  );
}

const report = {
  label: LABEL,
  base: BASE,
  viewport: WIDTH + "x" + HEIGHT,
  devicePixelRatio: DPR,
  element: TITLE,
  rest: { ...rest, geometry: restGeom },
  moving: { ...moving, geometry: movingGeom, movedDuringCaptureCssPx: movedDuringCapture },
  acutanceRetainedWhileMoving: +(moving.meanGradient / rest.meanGradient).toFixed(4),
};
console.log(
  LABEL +
    " " +
    WIDTH +
    "x" +
    HEIGHT +
    "@" +
    DPR +
    "x  rest mean-grad " +
    rest.meanGradient +
    " p99 " +
    rest.p99Gradient +
    "  |  moving " +
    moving.meanGradient +
    " p99 " +
    moving.p99Gradient +
    "  |  retained " +
    (report.acutanceRetainedWhileMoving * 100).toFixed(1) +
    "%",
);
console.log(
  "   device-pixel offset  rest x" +
    restGeom.devicePixelOffsetX +
    " y" +
    restGeom.devicePixelOffsetY +
    "   moving x" +
    movingGeom.devicePixelOffsetX +
    " y" +
    movingGeom.devicePixelOffsetY +
    "   (camera moved " +
    movedDuringCapture +
    "px during the capture)",
);
if (OUT) {
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(report, null, 2) + "\n");
  console.log("   written " + OUT);
}
await browser.close();
