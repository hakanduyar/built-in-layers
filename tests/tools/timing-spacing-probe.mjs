// Gate 2: settled Chromium composition opacity, text-entry and About geometry.
// PROBE_BASE=http://127.0.0.1:3200 node tests/tools/timing-spacing-probe.mjs --out <file>
// Text ink means browser Range line boxes (not raster glyph contours); rules excluded.
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import vm from "node:vm";

// Read the current pure TS route, without copying its constants into evidence.
const cache = new Map();
function sourceModule(file) {
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(
    code,
    {
      exports,
      require: (id) => sourceModule(path.resolve(id.replace("@/", "") + ".ts")),
    },
    { filename: file },
  );
  return exports;
}
const route = sourceModule(path.resolve("lib/spatial/sceneRoute.ts"));
const scenes = sourceModule(path.resolve("lib/spatial/scenes.ts"));
const filter = sourceModule(path.resolve("lib/spatial/cameraFilter.ts"));
const out = process.argv[process.argv.indexOf("--out") + 1];
if (!process.argv.includes("--out")) throw new Error("Pass --out to avoid overwriting evidence");
const browser = await chromium.launch();
const results = {
  methodology:
    "Integer scroll-pixel binary search; computed composition opacity, exact full=1 and floor<=0.340001. Each sample waits for camera transform stability. Entry is first intersecting text Range line box. About ink uses visible text Range boxes, excluding decorative rules. Primary position centres the stage in the viewport.",
  viewports: [],
};
for (const [width, height] of [
  [1440, 900],
  [1920, 1080],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(process.env.PROBE_BASE ?? "http://127.0.0.1:3200", { waitUntil: "networkidle" });
  await page.locator("[data-camera-plane='world']").waitFor({ state: "attached" });
  await page.evaluate(() => document.fonts.ready);
  const geometry = await page.evaluate(() => {
    const tour = document.querySelector("section[aria-label='Spatial system tour']");
    const routeStart = tour.getBoundingClientRect().top + scrollY;
    const routeSpan = tour.firstElementChild.getBoundingClientRect().height - innerHeight;
    return { routeStart, routeEnd: routeStart + routeSpan, routeSpan };
  });
  const focus = Object.fromEntries(
    scenes.SCENE_IDS.map((id) => [id, route.sceneFocusProgress(id)]),
  );
  const anchors = Object.fromEntries(scenes.SCENE_IDS.map((id) => [id, scenes.sceneAnchor(id)]));
  geometry.leadCapPx = height * filter.INTENT_LEAD_VH;
  async function park(y) {
    await page.evaluate((y) => {
      scrollTo(0, y);
      window.__timingStable = { key: "", count: 0 };
    }, y);
    await page.waitForTimeout(100);
    await page.waitForFunction(
      () => {
        const key =
          scrollY +
          ":" +
          getComputedStyle(document.querySelector("[data-camera-plane='world']")).transform;
        const s = window.__timingStable;
        s.count = s.key === key ? s.count + 1 : 0;
        s.key = key;
        return s.count >= 5;
      },
      null,
      { polling: 60, timeout: 15000 },
    );
  }
  async function sample(id, y) {
    await park(y);
    return page.evaluate((id) => {
      const el = document.querySelector(`[data-scene="${id}"] > div > div`);
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let visible = false;
      while (walker.nextNode()) {
        if (!walker.currentNode.textContent.trim()) continue;
        const r = document.createRange();
        r.selectNodeContents(walker.currentNode);
        for (const b of r.getClientRects()) {
          if (
            b.width &&
            b.height &&
            b.right > 0 &&
            b.left < innerWidth &&
            b.bottom > 0 &&
            b.top < innerHeight
          )
            visible = true;
        }
      }
      return { scrollY, opacity: Number(getComputedStyle(el).opacity), textOnScreen: visible };
    }, id);
  }
  async function first(id, lo, hi, predicate) {
    lo = Math.floor(lo);
    hi = Math.ceil(hi);
    if (predicate(await sample(id, lo))) throw new Error(`${id}: lower bracket already true`);
    if (!predicate(await sample(id, hi))) throw new Error(`${id}: upper bracket false`);
    while (hi - lo > 1) {
      const mid = Math.floor((hi + lo) / 2);
      if (predicate(await sample(id, mid))) hi = mid;
      else lo = mid;
    }
    return { previous: await sample(id, lo), first: await sample(id, hi) };
  }
  const y = (p) => geometry.routeStart + geometry.routeSpan * p;
  const release = {};
  for (const id of process.argv.includes("--layout-only") ? [] : ["reorient", "approach"]) {
    const reach = 0.00001 / route.sceneApproach(id, focus[id] + 0.00001);
    const start = await first(
      id,
      y(focus[id]),
      y(Math.min(1, focus[id] + 0.07)),
      (s) => s.opacity < 1,
    );
    const end = await first(
      id,
      y(focus[id]),
      y(Math.min(1, focus[id] + 0.08)),
      (s) => s.opacity <= 0.340001,
    );
    const adjacentSegmentWidths = route
      .routeLegs()
      .filter(
        (s) =>
          Math.abs(s.fromProgress - focus[id]) < 1e-9 || Math.abs(s.toProgress - focus[id]) < 1e-9,
      )
      .map((s) => (s.toProgress - s.fromProgress) * geometry.routeSpan);
    release[id] = {
      focusProgress: focus[id],
      adjacentSegmentWidths,
      reachProgress: reach,
      reachScrollPx: reach * geometry.routeSpan,
      start,
      end,
      fullHoldAfterFocusPx: start.previous.scrollY - y(focus[id]),
      fullToFloorPx: end.first.scrollY - start.previous.scrollY,
    };
  }
  let acquisition;
  if (!process.argv.includes("--layout-only")) {
    const entry = await first(
      "handoff",
      y(focus.approach),
      y(focus.handoff),
      (s) => s.textOnScreen,
    );
    const full = await first(
      "handoff",
      y(focus.approach),
      y(focus.handoff),
      (s) => s.opacity === 1,
    );
    acquisition = { entry, full, entryToFullPx: full.first.scrollY - entry.first.scrollY };
  }
  await park(geometry.routeEnd);
  const primaryY = await page.evaluate(() => {
    const r = document.querySelector('[data-drift-block="about"] section').getBoundingClientRect();
    return Math.round(scrollY + r.top + r.height / 2 - innerHeight / 2);
  });
  await park(primaryY);
  await page.waitForTimeout(800);
  const about = await page.evaluate(() => {
    const stage = document.querySelector('[data-drift-block="about"] section');
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, height: r.height };
    };
    function ink(el) {
      const boxes = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const n = walker.currentNode;
        if (
          !n.textContent.trim() ||
          n.parentElement.closest(".sr-only") ||
          !n.parentElement.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
        )
          continue;
        const range = document.createRange();
        range.selectNodeContents(n);
        for (const r of range.getClientRects()) if (r.width && r.height) boxes.push(r);
      }
      return {
        top: Math.min(...boxes.map((r) => r.top)),
        bottom: Math.max(...boxes.map((r) => r.bottom)),
      };
    }
    const b = box(stage),
      text = ink(stage),
      style = getComputedStyle(stage);
    const field = document.querySelector('[data-drift-block="field-notes"]');
    const finale = document.querySelector(".spatial-finale");
    return {
      scrollY,
      stage: b,
      marginTop: parseFloat(style.marginTop),
      marginBottom: parseFloat(style.marginBottom),
      firstInkFromTop: text.top - b.top,
      lastInkToBottom: b.bottom - text.bottom,
      text,
      fieldNotes: box(field),
      fieldNotesInk: ink(field),
      finale: box(finale),
      finaleInk: ink(finale),
      footer: box(document.querySelector("footer")),
      documentHeight: document.documentElement.scrollHeight,
    };
  });
  results.viewports.push({ width, height, geometry, focus, anchors, release, acquisition, about });
  console.log(JSON.stringify(results.viewports.at(-1)));
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(results, null, 2) + "\n");
  await page.close();
}
await browser.close();
