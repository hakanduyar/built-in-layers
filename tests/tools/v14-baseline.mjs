// V14 — OWNER VISUAL ACCEPTANCE: the journey evidence tool.
//
// The owner's brief (.ai/handoffs/V14-OWNER-BRIEF.md §24, §30) asks for the
// same evidence twice: once BEFORE any change, against the accepted technical
// baseline, and once for the review package. So this is one tool with one
// output shape, run twice into two directories. Everything it records is the
// governed journey a reader actually gets -- real wheel events at a human
// cadence, never scrollTo jumps -- except the zoom stills, which need a
// settled camera at a named progress and use scrollTo for that reason.
//
//   node tests/tools/v14-baseline.mjs --out docs/review/v14-owner-visual/baseline
//
// Env: PROBE_BASE (default http://127.0.0.1:3200), FOCUS_FILE (route focus dump).
//
// It writes:
//   recordings/  forward, reverse and lower-world journeys, 1440x900 and 1920x1080
//   zoom/        100 / 80 / 67 / 50 % stills at named route beats (1920 display)
//   journey.json every measurement below, so the AFTER run can be diffed
//
// Measured, not eyeballed: how many wheel notches and how many seconds the
// lower world costs at a normal cadence, the same for the route, the document
// and route spans, and the peak px/s the governor actually permits.

import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3200";
const OUT = flag("out", "docs/review/v14-owner-visual/baseline");
const FOCUS_FILE = process.env.FOCUS_FILE ?? "docs/review/v13-fable-gate/metrics/route-focus.json";
const ONLY = flag("only", "all"); // all | recordings | zoom | metrics

mkdirSync(`${OUT}/recordings`, { recursive: true });
mkdirSync(`${OUT}/zoom`, { recursive: true });

const FOCUS = JSON.parse(readFileSync(FOCUS_FILE, "utf8")).desktop;
const TOUR = "section[aria-label='Spatial system tour']";

/** A normal reader's wheel: 120px notches, ~18 a second. */
const NORMAL = { notch: 120, gapMs: 55 };

const browser = await chromium.launch();
const journey = { base: BASE, focusFile: FOCUS_FILE, viewports: {} };

async function open(context) {
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.locator(`${TOUR} .sticky`).waitFor({ state: "attached", timeout: 30000 });
  await page.waitForTimeout(500);
  const geom = await page.evaluate(() => {
    const section = document.querySelector("section[aria-label='Spatial system tour']");
    const spacer = section.querySelector(":scope > div");
    const start = section.getBoundingClientRect().top + window.scrollY;
    const end = start + spacer.getBoundingClientRect().height - window.innerHeight;
    return {
      routeStart: Math.round(start),
      routeEnd: Math.round(end),
      docMax: Math.round(document.documentElement.scrollHeight - window.innerHeight),
      vh: window.innerHeight,
      vw: window.innerWidth,
    };
  });
  return { page, errors, geom };
}

/** Settle: the world plane's transform unchanged for four consecutive polls. */
async function settle(page, timeout = 25000) {
  await page.evaluate(() => {
    window.__v14Last = undefined;
    window.__v14Hits = 0;
  });
  await page.waitForFunction(
    () => {
      const el = document.querySelector("[data-camera-plane='world']");
      const t = el ? getComputedStyle(el).transform : String(window.scrollY);
      const n = window.__v14Last === t ? (window.__v14Hits ?? 0) + 1 : 0;
      window.__v14Last = t;
      window.__v14Hits = n;
      return n >= 4;
    },
    { timeout, polling: 90 },
  );
}

/**
 * Drive with real wheel notches until scrollY reaches `until` (or stops
 * moving for `stallMs`). Returns notches, elapsed ms, distance, and the peak
 * px/s over any ~100ms window -- the honest "how slow does this feel" number.
 */
async function wheelUntil(page, { notch, gapMs }, until, maxNotches = 900, stallMs = 2500) {
  const t0 = Date.now();
  const samples = [];
  let notches = 0;
  let lastMoveAt = Date.now();
  let lastY = await page.evaluate(() => window.scrollY);
  const forward = notch > 0;
  while (notches < maxNotches) {
    const y = await page.evaluate(() => window.scrollY);
    if (forward ? y >= until - 2 : y <= until + 2) break;
    if (Math.abs(y - lastY) > 1) lastMoveAt = Date.now();
    else if (Date.now() - lastMoveAt > stallMs) break;
    lastY = y;
    await page.mouse.wheel(0, notch);
    notches += 1;
    await page.waitForTimeout(gapMs);
    samples.push({ t: Date.now() - t0, y });
  }
  // Let the governor finish paying out the last intent.
  const before = await page.evaluate(() => window.scrollY);
  await page.waitForTimeout(1200);
  const after = await page.evaluate(() => window.scrollY);
  let peak = 0;
  for (let i = 0; i < samples.length; i += 1) {
    for (let j = i + 1; j < samples.length; j += 1) {
      const dt = samples[j].t - samples[i].t;
      if (dt < 80 || dt > 140) continue;
      peak = Math.max(peak, (Math.abs(samples[j].y - samples[i].y) / dt) * 1000);
    }
  }
  return {
    notches,
    seconds: +((Date.now() - t0) / 1000).toFixed(1),
    from: samples[0]?.y ?? before,
    to: after,
    px: Math.abs(after - (samples[0]?.y ?? before)),
    peakPxPerSec: Math.round(peak),
    coastPxAfterInput: Math.round(after - before),
  };
}

/* ------------------------------------------------------------- recordings */

async function recordJourneys(width, height) {
  const key = `${width}x${height}`;
  const result = { journeys: {} };

  const scenarios = [
    [
      "forward",
      async (page, geom) => {
        const route = await wheelUntil(page, NORMAL, geom.routeEnd);
        const lower = await wheelUntil(page, NORMAL, geom.docMax);
        return { route, lower };
      },
    ],
    [
      "reverse",
      async (page, geom) => {
        await page.evaluate((y) => window.scrollTo(0, y), geom.docMax);
        await settle(page);
        await page.waitForTimeout(600);
        const lower = await wheelUntil(page, { ...NORMAL, notch: -NORMAL.notch }, geom.routeEnd);
        const route = await wheelUntil(page, { ...NORMAL, notch: -NORMAL.notch }, geom.routeStart);
        return { lower, route };
      },
    ],
    [
      "lower-world",
      async (page, geom) => {
        // Start exactly where the world hands over, so the recording is the
        // vertical traversal alone -- the owner's §17 finding.
        await page.evaluate((y) => window.scrollTo(0, y), geom.routeEnd);
        await settle(page);
        await page.waitForTimeout(800);
        const normal = await wheelUntil(page, NORMAL, geom.docMax);
        return { normal };
      },
    ],
    [
      "lower-world-aggressive",
      async (page, geom) => {
        await page.evaluate((y) => window.scrollTo(0, y), geom.routeEnd);
        await settle(page);
        await page.waitForTimeout(800);
        // A hard flick: 400px notches at 16ms. What the ceiling permits.
        const aggressive = await wheelUntil(page, { notch: 400, gapMs: 16 }, geom.docMax);
        return { aggressive };
      },
    ],
  ];

  for (const [name, run] of scenarios) {
    const context = await browser.newContext({
      viewport: { width, height },
      recordVideo: { dir: `${OUT}/recordings`, size: { width, height } },
    });
    const { page, errors, geom } = await open(context);
    await page.mouse.move(width / 2, height / 2);
    const measured = await run(page, geom);
    await page.waitForTimeout(800);
    const video = page.video();
    await context.close();
    const path = `${OUT}/recordings/${key}--${name}.webm`;
    renameSync(await video.path(), path);
    result.journeys[name] = { ...measured, consoleErrors: errors.length, video: path };
    result.geom = geom;
    console.log(`recorded ${path}  ${JSON.stringify(measured)}`);
  }
  journey.viewports[key] = { ...(journey.viewports[key] ?? {}), ...result };
}

/* ------------------------------------------------------------------- zoom */

// Browser zoom changes the CSS viewport, not the device. A 1920x1080 display at
// 80% reports 2400x1350 CSS px; the page responds to the CSS viewport, so that is
// what is emulated. Same method as tests/tools/mobile-zoom-probe.mjs.
const ZOOM_LEVELS = [
  { pct: 100, width: 1920, height: 1080 },
  { pct: 80, width: 2400, height: 1350 },
  { pct: 67, width: 2866, height: 1612 },
  { pct: 50, width: 3840, height: 2160 },
];

// The beats a zoom-out should still explain: a project at focus, the transition
// between two projects, SYSTEMS, UNDERNEATH, the handover, and the lower world.
const ZOOM_BEATS = [
  ["software-factory", () => FOCUS["software-factory"]],
  ["kivilcim-to-jointledger", () => (FOCUS.kivilcim + FOCUS.jointledger) / 2],
  ["dropspot", () => FOCUS.dropspot],
  ["systems", () => FOCUS.tail],
  ["underneath", () => FOCUS.reorient],
  ["handoff", () => FOCUS.handoff],
];

async function captureZoom() {
  const zoom = {};
  for (const level of ZOOM_LEVELS) {
    const context = await browser.newContext({
      viewport: { width: level.width, height: level.height },
    });
    const { page, geom } = await open(context);
    const tag = `1920x1080@${level.pct}`;
    for (const [beat, at] of ZOOM_BEATS) {
      const p = at();
      await page.evaluate(
        ({ geom, p }) =>
          window.scrollTo(0, geom.routeStart + (geom.routeEnd - geom.routeStart) * p),
        { geom, p },
      );
      await settle(page);
      await page.screenshot({ path: `${OUT}/zoom/${tag}--${beat}.png` });
    }
    // The lower world at this zoom, and the whole page's end state.
    await page.evaluate((g) => window.scrollTo(0, g.routeEnd + g.vh * 1.2), geom);
    await settle(page);
    await page.screenshot({ path: `${OUT}/zoom/${tag}--lower-world.png` });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await settle(page);
    await page.screenshot({ path: `${OUT}/zoom/${tag}--cta.png` });
    // How much of the WORLD is in frame at this zoom: the world plane's visible
    // extent in world units, read off the camera inset and the CSS unit.
    const frame = await page.evaluate(() => {
      const sticky = document.querySelector("section[aria-label='Spatial system tour'] .sticky");
      const cs = sticky ? getComputedStyle(sticky) : null;
      const vw = cs ? Number.parseFloat(cs.getPropertyValue("--world-vw")) : NaN;
      return { cssViewport: `${window.innerWidth}x${window.innerHeight}`, worldUnitPx: vw };
    });
    zoom[tag] = frame;
    await context.close();
    console.log(`zoom ${tag} captured`);
  }
  journey.zoom = zoom;
}

/* -------------------------------------------------------------------- run */

if (ONLY === "all" || ONLY === "recordings" || ONLY === "metrics") {
  await recordJourneys(1440, 900);
  await recordJourneys(1920, 1080);
}
if (ONLY === "all" || ONLY === "zoom") {
  await captureZoom();
}

writeFileSync(`${OUT}/journey.json`, JSON.stringify(journey, null, 2));
console.log(`written ${OUT}/journey.json`);
await browser.close();
