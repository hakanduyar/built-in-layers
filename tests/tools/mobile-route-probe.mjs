// V13 MOBILE GATE — HOMEPAGE ROUTE PROBE
//
// The Phase 6 audit measured the homepage as 11–15 screens tall on phones and,
// from one still, estimated that a project scene arrives with ~67% of the
// viewport empty above it. Both are single-frame observations. This probe
// walks the whole page in half-viewport steps at each real device size, lets
// the camera settle (same consecutive-frame criterion as the e2e helper), and
// records at every step how much of the viewport actually carries ink — from
// the DOM (text ranges + images) and, when `sharp` is available, from the
// rendered pixels — plus where each scene sits and how big its touch targets
// are. The result is a coverage profile of the mobile route rather than an
// impression of it, and the same script re-run after a change is the
// before/after evidence for any move of a frozen route file.
import { chromium } from "@playwright/test";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
function loadSharp() {
  for (const spec of [
    "sharp",
    `${process.cwd()}/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp`,
  ]) {
    try {
      return require(spec);
    } catch {
      /* try the next location */
    }
  }
  return null;
}
const sharp = loadSharp();

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3200";
const OUT = process.env.PROBE_OUT ?? "docs/review/v13-mobile-gate/before";
const STILLS = `${OUT}/route-stills`;
mkdirSync(`${OUT}/metrics`, { recursive: true });
mkdirSync(STILLS, { recursive: true });

const TOUR = "section[aria-label='Spatial system tour']";
const STEP_VH = Number(process.env.PROBE_STEP ?? 0.5);
const STILL_WIDTHS = new Set(
  (process.env.PROBE_STILLS ?? "320,375").split(",").map((s) => Number(s.trim())),
);
// Widths that also get one viewport still per sweep step (the whole page as
// the reader actually sees it, settled frame by frame -- a full-page capture
// cannot show a sticky route or in-view reveals).
const SWEEP_STILLS = new Set(
  (process.env.PROBE_SWEEP ?? "")
    .split(",")
    .filter(Boolean)
    .map((s) => Number(s.trim())),
);

const VIEWPORTS = [
  { w: 320, h: 568, label: "320x568" },
  { w: 360, h: 800, label: "360x800" },
  { w: 375, h: 667, label: "375x667" },
  { w: 390, h: 844, label: "390x844" },
  { w: 430, h: 932, label: "430x932" },
  { w: 768, h: 1024, label: "768x1024" },
];
const ONLY = process.env.PROBE_WIDTHS
  ? new Set(process.env.PROBE_WIDTHS.split(",").map((s) => Number(s.trim())))
  : null;

// Paper is #f1efe8. A pixel is "material" when it departs from paper by more
// than this (sum of channel deltas): soft-paper plates (#e5e2d8, Δ41) and lines
// (#b8b5ac, Δ175) count, anti-aliasing noise does not. "Ink" is dark pixels.
const MATERIAL_DELTA = 24;
const INK_LUMA = 150;
const PAPER = [0xf1, 0xef, 0xe8];

async function scrollAndSettle(page, y) {
  await page.evaluate(
    (target) =>
      new Promise((resolve) => {
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          window.removeEventListener("scroll", onScroll);
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        };
        const onScroll = () => finish();
        window.addEventListener("scroll", onScroll);
        window.scrollTo(0, Math.round(target));
        setTimeout(finish, 500);
      }),
    y,
  );
  return page.evaluate(
    (selector) =>
      new Promise((resolve) => {
        const world = document.querySelector(`${selector} [data-camera-plane="world"]`);
        if (!world) return resolve({ settled: true, frames: 0 });
        let last = null;
        let stable = 0;
        let frames = 0;
        const tick = () => {
          frames += 1;
          const t = getComputedStyle(world).transform;
          if (t === last && t !== "none") {
            stable += 1;
            if (stable >= 8) return resolve({ settled: true, frames });
          } else {
            stable = 0;
            last = t;
          }
          if (frames > 900) return resolve({ settled: false, frames });
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    TOUR,
  );
}

function domSnapshot() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const clip = (a, b) => [Math.max(0, a), Math.min(vh, b)];
  const unionLength = (intervals) => {
    const sorted = intervals
      .map(([a, b]) => clip(a, b))
      .filter(([a, b]) => b - a > 0.5)
      .sort((p, q) => p[0] - q[0]);
    let total = 0;
    let cur = null;
    for (const [a, b] of sorted) {
      if (!cur || a > cur[1]) {
        if (cur) total += cur[1] - cur[0];
        cur = [a, b];
      } else if (b > cur[1]) cur[1] = b;
    }
    if (cur) total += cur[1] - cur[0];
    return total;
  };
  const isShown = (el) => {
    const cs = getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > 0.05;
  };
  // Text ranges, image boxes and drawn vectors = ink. Anything that paints a
  // background or border different from paper = material (plates, rails).
  const ink = [];
  const material = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (!node.nodeValue || !node.nodeValue.trim()) continue;
    const parent = node.parentElement;
    if (!parent || !isShown(parent)) continue;
    const cs = getComputedStyle(parent);
    if (cs.position === "absolute" && parseFloat(cs.width) <= 1 && parseFloat(cs.height) <= 1)
      continue; // sr-only
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const r of range.getClientRects()) {
      if (r.width < 1 || r.height < 1) continue;
      if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) continue;
      ink.push([r.top, r.bottom]);
    }
  }
  for (const el of document.querySelectorAll("img, svg, canvas, hr")) {
    if (!isShown(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (r.bottom < 0 || r.top > vh) continue;
    ink.push([r.top, r.bottom]);
  }
  for (const el of document.querySelectorAll("*")) {
    if (!isShown(el)) continue;
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor;
    const painted =
      (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "rgb(241, 239, 232)") ||
      (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none") ||
      (parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== "none") ||
      (parseFloat(cs.borderLeftWidth) > 0 && cs.borderLeftStyle !== "none");
    if (!painted) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 1) continue;
    if (r.bottom < 0 || r.top > vh) continue;
    if (r.width >= vw - 2 && r.height >= vh - 2) continue; // page-sized frames
    material.push([r.top, r.bottom]);
  }
  const inkTops = ink.map(([a]) => a).filter((a) => a >= -1);
  const scenes = [...document.querySelectorAll("[data-scene]")].map((el) => {
    const r = el.getBoundingClientRect();
    return {
      id: el.getAttribute("data-scene"),
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      height: Math.round(r.height),
      onScreen: r.bottom > 0 && r.top < vh,
    };
  });
  return {
    inkCoverage: +(unionLength(ink) / vh).toFixed(3),
    materialCoverage: +(unionLength([...ink, ...material]) / vh).toFixed(3),
    firstInkVh: inkTops.length ? +(Math.min(...inkTops) / vh).toFixed(3) : null,
    scenes,
  };
}

async function pixelProfile(page) {
  if (!sharp) return null;
  const png = await page.screenshot({ type: "png" });
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  let inkRows = 0;
  let materialRows = 0;
  let firstInk = null;
  let lastInk = null;
  for (let y = 0; y < info.height; y++) {
    let ink = false;
    let mat = false;
    const row = y * info.width * ch;
    for (let x = 0; x < info.width; x++) {
      const i = row + x * ch;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const delta = Math.abs(r - PAPER[0]) + Math.abs(g - PAPER[1]) + Math.abs(b - PAPER[2]);
      if (delta > MATERIAL_DELTA) {
        mat = true;
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (luma < INK_LUMA) {
          ink = true;
          break;
        }
      }
    }
    if (mat) materialRows++;
    if (ink) {
      inkRows++;
      if (firstInk === null) firstInk = y;
      lastInk = y;
    }
  }
  return {
    inkRows: +(inkRows / info.height).toFixed(3),
    materialRows: +(materialRows / info.height).toFixed(3),
    firstInkVh: firstInk === null ? null : +(firstInk / info.height).toFixed(3),
    lastInkVh: lastInk === null ? null : +(lastInk / info.height).toFixed(3),
  };
}

const browser = await chromium.launch();
const REPORT_PATH = `${OUT}/metrics/mobile-route.json`;
// A partial run (PROBE_WIDTHS) merges into the existing report rather than
// replacing the widths it did not measure.
const previous = existsSync(REPORT_PATH) ? JSON.parse(readFileSync(REPORT_PATH, "utf8")) : null;
const report = {
  base: BASE,
  generated: "v13-mobile-gate/route",
  stepVh: STEP_VH,
  viewports: ONLY && previous?.viewports ? previous.viewports : {},
};

for (const vp of VIEWPORTS) {
  if (ONLY && !ONLY.has(vp.w)) continue;
  const context = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.locator(`${TOUR} .sticky`).waitFor({ state: "attached" });
  await page.waitForTimeout(300);

  const route = await page.evaluate((selector) => {
    const section = document.querySelector(selector);
    const spacer = section?.querySelector(":scope > div");
    return {
      sectionTop: section ? Math.round(section.getBoundingClientRect().top + window.scrollY) : 0,
      spacerHeight: spacer ? Math.round(spacer.getBoundingClientRect().height) : 0,
      docHeight: document.documentElement.scrollHeight,
    };
  }, TOUR);
  const maxY = route.docHeight - vp.h;
  const step = vp.h * STEP_VH;
  const ys = [];
  for (let y = 0; y < maxY; y += step) ys.push(Math.round(y));
  ys.push(maxY);

  const frames = [];
  const sweepDir = `${OUT}/route-sweep/${vp.label}`;
  if (SWEEP_STILLS.has(vp.w)) mkdirSync(sweepDir, { recursive: true });
  for (const [i, y] of ys.entries()) {
    const settle = await scrollAndSettle(page, y);
    const dom = await page.evaluate(domSnapshot);
    const px = await pixelProfile(page);
    frames.push({ y, yVh: +(y / vp.h).toFixed(2), settled: settle.settled, ...dom, px });
    if (SWEEP_STILLS.has(vp.w)) {
      await page.screenshot({
        path: `${sweepDir}/${String(i).padStart(3, "0")}--${(y / vp.h).toFixed(2)}vh.png`,
      });
    }
  }

  // Scene focus: the step at which the scene's top sits nearest the mobile
  // camera inset (10vh). Recorded with the frame's coverage so "empty above"
  // is measured at the moment the scene is presented, not guessed.
  const sceneIds = frames[0].scenes.map((s) => s.id);
  const focus = {};
  for (const id of sceneIds) {
    let best = null;
    for (const f of frames) {
      const s = f.scenes.find((x) => x.id === id);
      if (!s) continue;
      const d = Math.abs(s.top - vp.h * 0.1);
      if (!best || d < best.d) best = { d, f, s };
    }
    if (!best) continue;
    focus[id] = {
      y: best.f.y,
      yVh: best.f.yVh,
      sceneTop: best.s.top,
      sceneHeight: best.s.height,
      sceneHeightVh: +(best.s.height / vp.h).toFixed(2),
      inkCoverage: best.f.inkCoverage,
      materialCoverage: best.f.materialCoverage,
      firstInkVh: best.f.firstInkVh,
      px: best.f.px,
    };
  }
  // Distance between consecutive focuses, in viewport heights.
  const focusSteps = [];
  for (let i = 1; i < sceneIds.length; i++) {
    const a = focus[sceneIds[i - 1]];
    const b = focus[sceneIds[i]];
    if (a && b)
      focusSteps.push({
        from: sceneIds[i - 1],
        to: sceneIds[i],
        vh: +((b.y - a.y) / vp.h).toFixed(2),
      });
  }

  // Touch targets inside the tour, measured at each scene's focus (scale is
  // progress-dependent, so a rest-scale reading would understate them).
  const tourTargets = {};
  for (const id of sceneIds) {
    if (!focus[id]) continue;
    await scrollAndSettle(page, focus[id].y);
    tourTargets[id] = await page.evaluate((sceneId) => {
      const scene = document.querySelector(`[data-scene="${sceneId}"]`);
      if (!scene) return [];
      return [...scene.querySelectorAll("a[href], button")].map((el) => {
        const r = el.getBoundingClientRect();
        return {
          text: (el.textContent || "").trim().slice(0, 40),
          w: Math.round(r.width),
          h: Math.round(r.height),
        };
      });
    }, id);
    if (STILL_WIDTHS.has(vp.w)) {
      await page.screenshot({ path: `${STILLS}/home--${vp.label}--focus-${id}.png` });
    }
  }
  // Travel frames: the midpoint between consecutive focuses, where the
  // audit's "empty above" claim lives.
  if (STILL_WIDTHS.has(vp.w)) {
    for (const s of focusSteps) {
      const mid = Math.round((focus[s.from].y + focus[s.to].y) / 2);
      await scrollAndSettle(page, mid);
      await page.screenshot({ path: `${STILLS}/home--${vp.label}--travel-${s.from}-${s.to}.png` });
    }
  }

  const routeFrames = frames.filter(
    (f) => f.y >= route.sectionTop && f.y <= route.sectionTop + route.spacerHeight - vp.h,
  );
  const lowerFrames = frames.filter((f) => f.y > route.sectionTop + route.spacerHeight - vp.h);
  const mean = (arr, key) =>
    arr.length ? +(arr.reduce((s, f) => s + (f[key] ?? 0), 0) / arr.length).toFixed(3) : null;
  const meanPx = (arr, key) => {
    const vals = arr.map((f) => f.px?.[key]).filter((v) => typeof v === "number");
    return vals.length ? +(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(3) : null;
  };
  const nearEmpty = (arr) => arr.filter((f) => (f.px ? f.px.inkRows : f.inkCoverage) < 0.12).length;

  const summary = {
    vw: vp.w,
    vh: vp.h,
    docHeight: route.docHeight,
    screens: +(route.docHeight / vp.h).toFixed(1),
    routeScreens: +(route.spacerHeight / vp.h).toFixed(1),
    lowerScreens: +((route.docHeight - route.sectionTop - route.spacerHeight) / vp.h).toFixed(1),
    sectionTop: route.sectionTop,
    spacerHeight: route.spacerHeight,
    steps: frames.length,
    unsettled: frames.filter((f) => !f.settled).length,
    meanInkCoverage: {
      route: mean(routeFrames, "inkCoverage"),
      lower: mean(lowerFrames, "inkCoverage"),
    },
    meanMaterialCoverage: {
      route: mean(routeFrames, "materialCoverage"),
      lower: mean(lowerFrames, "materialCoverage"),
    },
    meanPxInkRows: { route: meanPx(routeFrames, "inkRows"), lower: meanPx(lowerFrames, "inkRows") },
    nearEmptyFrames: { route: nearEmpty(routeFrames), lower: nearEmpty(lowerFrames) },
    nearEmptyVh: +((nearEmpty(routeFrames) + nearEmpty(lowerFrames)) * STEP_VH).toFixed(1),
    focus,
    focusSteps,
    tourTargets,
    errors,
  };
  report.viewports[vp.label] = { summary, frames };

  const fmt = (v) =>
    v === null || v === undefined ? "  —" : String(Math.round(v * 100)).padStart(3);
  console.log(
    `${vp.label.padEnd(9)} ${String(summary.screens).padStart(5)} screens (route ${summary.routeScreens}, lower ${summary.lowerScreens})  ` +
      `ink route ${fmt(summary.meanPxInkRows.route ?? summary.meanInkCoverage.route)}% lower ${fmt(summary.meanPxInkRows.lower ?? summary.meanInkCoverage.lower)}%  ` +
      `near-empty ${summary.nearEmptyVh}vh  unsettled ${summary.unsettled}`,
  );
  for (const id of sceneIds) {
    const f = focus[id];
    if (!f) continue;
    console.log(
      `   ${id.padEnd(17)} y=${String(f.y).padStart(5)} (${String(f.yVh).padStart(5)}vh)  ` +
        `scene ${String(f.sceneHeightVh).padStart(4)}vh  first-ink ${fmt(f.px?.firstInkVh ?? f.firstInkVh)}%  ` +
        `ink ${fmt(f.px?.inkRows ?? f.inkCoverage)}%  material ${fmt(f.px?.materialRows ?? f.materialCoverage)}%`,
    );
  }
  console.log(`   steps: ${focusSteps.map((s) => `${s.from}→${s.to} ${s.vh}vh`).join(" | ")}`);
  const small = Object.entries(tourTargets).flatMap(([id, ts]) =>
    ts.filter((t) => t.w < 44 || t.h < 44).map((t) => `${id}:${t.text} ${t.w}×${t.h}`),
  );
  console.log(`   tour targets <44: ${small.length ? small.join(" | ") : "none"}`);

  await context.close();
}

writeFileSync(`${OUT}/metrics/mobile-route.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(`\nwritten: ${OUT}/metrics/mobile-route.json (sharp: ${sharp ? "yes" : "no"})`);
