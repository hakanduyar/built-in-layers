// V14.9 navigation gate evidence tool: what the document actually does when a
// station is clicked.
//
// The browser contracts in tests/e2e/navigation.spec.ts assert that navigation
// ARRIVES. This records HOW it arrives -- the scroll position frame by frame for
// each named station -- so "controlled and smooth, not an instant teleport" is a
// number of record rather than an impression, and so a future change that turns
// the journey into a jump is visible in a diff.
//
//   PROBE_BASE=http://127.0.0.1:3200 VP=1440x900 \
//     PROBE_OUT=docs/review/v14.9-navigation/metrics/route-navigation-1440x900.json \
//     node tests/tools/route-navigation-probe.mjs
//
// Per docs/REVIEW_POLICY.md the summary belongs in Git; the per-frame trace is
// kept, truncated, with `framesCount` recording its original length.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3200";
const [W, H] = (process.env.VP ?? "1440x900").split("x").map(Number);
const OUT = process.env.PROBE_OUT ?? `route-navigation-${W}x${H}.json`;
const STATIONS = (process.env.STATIONS ?? "jointledger,tail,reorient,about,finale").split(",");
const KEPT_FRAMES = 24;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
const errors = [];
page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(BASE, { waitUntil: "networkidle" });
await page.locator("section[aria-label='Spatial system tour'] .sticky").waitFor();
// The navigator arrives once the reader has moved off the very top.
await page.mouse.move(Math.round(W / 2), Math.round(H / 2));
await page.mouse.wheel(0, 200);
await page.waitForTimeout(800);

const geometry = await page.evaluate(() => {
  const spacer = document.querySelector("[data-route-spacer]");
  return {
    tourStart: Math.round(window.scrollY + spacer.getBoundingClientRect().top),
    spacerHeight: spacer.offsetHeight,
    viewportHeight: window.innerHeight,
    documentHeight: document.documentElement.scrollHeight,
  };
});

async function trace(run) {
  await page.evaluate(() => {
    window.__navTrace = [];
    window.__navT0 = performance.now();
    const tick = () => {
      window.__navTrace.push([
        Math.round(performance.now() - window.__navT0),
        Math.round(window.scrollY),
      ]);
      if (window.__navTrace.length < 300) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await run();
  await page.waitForTimeout(2600);
  return page.evaluate(() => window.__navTrace ?? []);
}

function summarise(frames) {
  const positions = frames.map(([, y]) => y);
  const moves = positions.filter((y, i) => i > 0 && y !== positions[i - 1]).length;
  const settledAt = (() => {
    const last = positions[positions.length - 1];
    for (let i = positions.length - 1; i > 0; i -= 1)
      if (positions[i - 1] !== last) return frames[i][0];
    return 0;
  })();
  return {
    from: positions[0],
    to: positions[positions.length - 1],
    movingFrames: moves,
    settledAfterMs: settledAt,
    // A teleport changes position once; a journey changes it many times.
    teleport: moves <= 1,
  };
}

const runs = [];
for (const station of STATIONS) {
  const frames = await trace(async () => {
    await page.locator(`[data-nav-station="${station}"]`).click();
  });
  const readout = await page.locator("[data-nav-readout]").getAttribute("data-nav-readout");
  runs.push({
    station,
    readoutAfter: readout,
    arrived: readout === station,
    ...summarise(frames),
    framesCount: frames.length,
    frames: frames.slice(0, KEPT_FRAMES),
  });
}

// Free scroll after a navigation: the reader must be able to carry straight on.
// Measured from a station in the middle of the journey -- after the finale
// there is no document left to scroll, so ending there would measure the end
// of the page rather than the navigator.
await page.locator(`[data-nav-station="kivilcim"]`).click();
await page.waitForTimeout(2200);
await page.mouse.move(Math.round(W / 2), Math.round(H / 2));
const beforeWheel = await page.evaluate(() => window.scrollY);
for (let i = 0; i < 6; i += 1) await page.mouse.wheel(0, 240);
await page.waitForTimeout(900);
const afterWheel = await page.evaluate(() => window.scrollY);

const report = {
  generatedBy: "tests/tools/route-navigation-probe.mjs",
  base: BASE,
  viewport: `${W}x${H}`,
  geometry,
  runs,
  freeScrollAfterNavigation: {
    before: beforeWheel,
    after: afterWheel,
    resumed: afterWheel > beforeWheel,
  },
  consoleErrors: errors.length,
};

mkdirSync(path.dirname(path.resolve(OUT)), { recursive: true });
writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log(
  `${W}x${H}: ${runs.filter((run) => run.arrived).length}/${runs.length} arrived, ` +
    `teleports ${runs.filter((run) => run.teleport).length}, ` +
    `free scroll resumed ${report.freeScrollAfterNavigation.resumed}, ` +
    `console errors ${errors.length} -> ${OUT}`,
);
await browser.close();
