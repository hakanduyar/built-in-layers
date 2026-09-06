// V14.1 evidence tool: what does ONE wheel impulse actually buy, and is it out
// of proportion with sustained scrolling?
//
// The owner likes the sustained scroll and suspects isolated wheel actions move
// too far. That is a measurable question, and it must not be answered from
// intuition. The wheel model (useRouteGovernor in components/spatial/
// SpatialCamera.tsx) is: a wheel event moves a TARGET by its own raw delta,
// bounded to INTENT_LEAD_VH of a viewport ahead of the real position; a
// per-frame governor then walks the page toward that target at no more than
// ROUTE_MAX_RATE x routeSpan (x the page's gearing outside the pinned route).
// So an impulse's REACH is set by the raw delta and the lead cap, while its
// SPEED is set by the governor -- two different numbers, and only the first is
// what "moves too far" would be about.
//
// For each position and each impulse count this records:
//   raw wheel delta sent            target increment (scroll px actually taken)
//   scroll before / after           coast after input stopped
//   settle duration                 world travel on screen (px) and in world units
//   route progress crossed          scene focus boundaries crossed
//
// and finally the same notches delivered as sustained input, so the two can be
// compared per notch rather than by feel.
//
//   PROBE_BASE=http://127.0.0.1:3200 node tests/tools/discrete-scroll-probe.mjs [--out f.json]
//   PROBE_VIEWPORT=1440x900   PROBE_LABEL=before
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const OUT = outIndex >= 0 ? args[outIndex + 1] : undefined;
const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3200";
const [WIDTH, HEIGHT] = (process.env.PROBE_VIEWPORT ?? "1440x900").split("x").map(Number);
const LABEL = process.env.PROBE_LABEL ?? "run";
const FOCUS_FILE =
  process.env.FOCUS_FILE ?? "docs/review/v14-owner-visual/after/metrics/route-focus.json";
const FOCUS = JSON.parse(readFileSync(FOCUS_FILE, "utf8"));
const TOUR = "section[aria-label='Spatial system tour']";
const NOTCH = 120; // one ordinary mouse notch in Chromium

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT } });
const page = await context.newPage();
await page.goto(BASE, { waitUntil: "networkidle" });
await page.locator(TOUR + " .sticky").waitFor({ state: "attached", timeout: 30000 });
await page.waitForTimeout(600);
await page.mouse.move(WIDTH / 2, HEIGHT / 2);

const geom = await page.evaluate(() => {
  const section = document.querySelector("section[aria-label='Spatial system tour']");
  const spacer = section.querySelector(":scope > div");
  const start = section.getBoundingClientRect().top + window.scrollY;
  const routeSpan = spacer.getBoundingClientRect().height - window.innerHeight;
  return {
    routeStart: start,
    routeEnd: start + routeSpan,
    routeSpan,
    docMax: document.documentElement.scrollHeight - window.innerHeight,
    vh: window.innerHeight,
  };
});

/** World-plane translation, in screen px, plus the world's own unit. */
async function worldState() {
  return page.evaluate(() => {
    const el = document.querySelector("[data-camera-plane='world']");
    const sticky = document.querySelector("section[aria-label='Spatial system tour'] .sticky");
    let x = 0;
    let y = 0;
    if (el) {
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      x = m.m41;
      y = m.m42;
    }
    // The zoom that the world layer is painted through, so screen px can be
    // reported as the reader sees them rather than in the world's own space.
    let zoom = 1;
    if (sticky) {
      for (const node of sticky.querySelectorAll("div")) {
        const z = getComputedStyle(node).zoom;
        if (z && z !== "1" && z !== "normal") {
          zoom = parseFloat(z);
          break;
        }
      }
    }
    const unit = sticky
      ? parseFloat(getComputedStyle(sticky).getPropertyValue("--world-vh")) || 0
      : 0;
    return { x, y, zoom, unitPx: unit, scrollY: window.scrollY };
  });
}

/**
 * Settled means BOTH the page and the camera have stopped.
 *
 * Scroll alone is not enough: the camera reads a FILTERED progress, so after
 * any jump the world keeps converging for a second or more after `scrollY`
 * is final. A settle that watched only scroll therefore attributed the tail of
 * the previous move to the next impulse -- which is how a single 120px notch
 * came to be credited with 1685px of world travel in the first run of this
 * tool.
 */
async function settle(timeoutMs = 12000) {
  const started = Date.now();
  let last = "";
  let stable = 0;
  while (Date.now() - started < timeoutMs) {
    await page.waitForTimeout(60);
    const key = await page.evaluate(() => {
      const el = document.querySelector("[data-camera-plane='world']");
      return (
        Math.round(window.scrollY * 10) / 10 + "|" + (el ? getComputedStyle(el).transform : "")
      );
    });
    stable = key === last ? stable + 1 : 0;
    last = key;
    if (stable >= 4) break;
  }
  return Date.now() - started;
}

const sceneFocus = FOCUS.desktop;
function boundariesCrossed(p0, p1) {
  const lo = Math.min(p0, p1);
  const hi = Math.max(p0, p1);
  return Object.entries(sceneFocus)
    .filter(([, p]) => p > lo && p <= hi)
    .map(([id]) => id);
}

/**
 * Park at `y`, then PRIME with one notch that is deliberately not measured.
 *
 * The governor adopts any position it did not write itself ("someone else moved
 * the page -- keyboard, scrollbar, a test"), and discards the pending intent
 * when it does. A programmatic jump therefore costs exactly the first wheel
 * event after it, which is a property of the probe's own `scrollTo` and not
 * something a reader can experience. Measured runs start after that event.
 */
async function goTo(y) {
  await page.evaluate((v) => window.scrollTo(0, v), Math.round(y));
  await settle();
  await page.mouse.wheel(0, NOTCH);
  await settle();
  await page.waitForTimeout(150);
}

/**
 * Deliver `count` impulses. `separated` waits for the page to come fully to
 * rest between them, which is the "isolated wheel action" the owner is asking
 * about; otherwise they are delivered back to back at a sustained cadence.
 */
async function impulses(startY, count, separated) {
  await goTo(startY);
  const before = await worldState();
  const t0 = Date.now();
  for (let i = 0; i < count; i += 1) {
    await page.mouse.wheel(0, NOTCH);
    if (separated) {
      await settle();
      await page.waitForTimeout(120);
    } else {
      await page.waitForTimeout(55);
    }
  }
  const atInputStop = await page.evaluate(() => window.scrollY);
  const settleMs = await settle();
  const after = await worldState();
  const p0 = (before.scrollY - geom.routeStart) / geom.routeSpan;
  const p1 = (after.scrollY - geom.routeStart) / geom.routeSpan;
  const worldPx = Math.hypot(after.x - before.x, after.y - before.y) * before.zoom;
  return {
    impulses: count,
    delivery: separated ? "separated" : "sustained",
    rawWheelDeltaPx: count * NOTCH,
    scrollBefore: Math.round(before.scrollY),
    scrollAfter: Math.round(after.scrollY),
    scrollTravelPx: Math.round(after.scrollY - before.scrollY),
    scrollPerImpulsePx: +((after.scrollY - before.scrollY) / count).toFixed(1),
    deliveredFraction: +((after.scrollY - before.scrollY) / (count * NOTCH)).toFixed(3),
    coastAfterInputPx: Math.round(after.scrollY - atInputStop),
    settleMsAfterInput: settleMs,
    totalMs: Date.now() - t0,
    worldScreenPx: Math.round(worldPx),
    worldScreenPxPerImpulse: Math.round(worldPx / count),
    worldUnits: before.unitPx ? +(worldPx / before.zoom / before.unitPx).toFixed(1) : null,
    progressBefore: +p0.toFixed(4),
    progressAfter: +p1.toFixed(4),
    focusBoundariesCrossed: boundariesCrossed(p0, p1),
  };
}

const POSITIONS = [
  ["project-world", geom.routeStart + geom.routeSpan * sceneFocus["software-factory"]],
  [
    "between-projects",
    geom.routeStart + geom.routeSpan * ((sceneFocus.kivilcim + sceneFocus.jointledger) / 2),
  ],
  ["systems-approach", geom.routeStart + geom.routeSpan * (sceneFocus.tail - 0.04)],
  ["lower-vertical-world", geom.routeEnd + (geom.docMax - geom.routeEnd) * 0.25],
];

const report = {
  label: LABEL,
  base: BASE,
  viewport: WIDTH + "x" + HEIGHT,
  notchPx: NOTCH,
  geom: {
    routeStart: Math.round(geom.routeStart),
    routeEnd: Math.round(geom.routeEnd),
    routeSpan: Math.round(geom.routeSpan),
    docMax: Math.round(geom.docMax),
    leadCapPx: Math.round(geom.vh * 0.6),
  },
  positions: {},
};

for (const [name, y] of POSITIONS) {
  const rows = [];
  for (const count of [1, 2, 3, 5]) rows.push(await impulses(y, count, true));
  rows.push(await impulses(y, 5, false));
  rows.push(await impulses(y, 12, false));
  report.positions[name] = rows;
  console.log("\n" + name + "  (start " + Math.round(y) + ")");
  console.log(
    "  n  delivery    raw   scroll  /impulse  delivered  coast  settle  worldPx  /impulse  crossed",
  );
  for (const r of rows) {
    console.log(
      "  " +
        String(r.impulses).padEnd(3) +
        r.delivery.padEnd(12) +
        String(r.rawWheelDeltaPx).padEnd(6) +
        String(r.scrollTravelPx).padEnd(8) +
        String(r.scrollPerImpulsePx).padEnd(10) +
        String(r.deliveredFraction).padEnd(11) +
        String(r.coastAfterInputPx).padEnd(7) +
        String(r.settleMsAfterInput).padEnd(8) +
        String(r.worldScreenPx).padEnd(9) +
        String(r.worldScreenPxPerImpulse).padEnd(10) +
        (r.focusBoundariesCrossed.join(",") || "-"),
    );
  }
}

if (OUT) {
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(report, null, 2) + "\n");
  console.log("\nwritten " + OUT);
}
await browser.close();
