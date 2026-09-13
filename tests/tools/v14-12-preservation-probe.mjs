// Focused production checks for navigation registration, break escape and handoff.
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
const require = createRequire(import.meta.url);
const sharp = require(`${process.cwd()}/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp`);
function geometry(file) {
  const exports = {};
  new Function(
    "exports",
    "require",
    ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
  )(exports, (id) => geometry(`${id.replace("@/", "")}.ts`));
  return exports;
}
const route = geometry("lib/spatial/sceneRoute.ts");
const bulk = "C:/Users/hakan/portfolio-review/v14.12-motion/preservation";
mkdirSync(bulk, { recursive: true });
const result = {};
const browser = await chromium.launch();
for (const [width, height] of [
  [1440, 900],
  [1920, 1080],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
  const cue = () =>
    page.locator("[data-nav-step]").evaluateAll((es) =>
      es.map((e) => ({
        direction: e.dataset.navStep,
        cue: e.dataset.navCue,
        disabled: e.disabled,
        animation: getComputedStyle(e).animationName,
      })),
    );
  const firstCue = await cue();
  await page.evaluate(() => scrollTo(0, 150));
  await page.waitForTimeout(300);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(300);
  const returnedCue = await cue();
  await page.evaluate(() => scrollTo(0, 150));
  await page.waitForTimeout(300);
  const geom = await page.evaluate(() => {
    const s = document.querySelector("[data-route-spacer]");
    return { start: scrollY + s.getBoundingClientRect().top, span: s.offsetHeight - innerHeight };
  });
  const stations = await page
    .locator("[data-nav-station]")
    .evaluateAll((es) => es.map((e) => e.dataset.navStation));
  const visits = [];
  for (const id of stations.filter((id) => id !== "hero")) {
    await page.evaluate(() => {
      window.navFrames = [];
      window.navRecording = true;
      const run = (window.navRun = (window.navRun ?? 0) + 1);
      const t = performance.now();
      const sample = () => {
        if (!window.navRecording || window.navRun !== run) return;
        const id = document.querySelector("[data-nav-readout]")?.dataset.navReadout;
        const scene = document.querySelector(`[data-scene="${id}"]`);
        const e =
          scene?.querySelector("[data-project-ground-source]") ??
          scene?.querySelector('[data-systems-layer="surface"]') ??
          scene?.querySelector("h1,h2,h3,p");
        const r = e?.getBoundingClientRect();
        window.navFrames.push({
          ms: performance.now() - t,
          id,
          rect: r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null,
          inFrame: r ? r.x < innerWidth && r.right > 0 && r.y < innerHeight && r.bottom > 0 : null,
        });
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.locator(`[data-nav-station="${id}"]`).click();
    await page.waitForTimeout(1700);
    const data = await page.evaluate((id) => {
      window.navRecording = false;
      const scene = document.querySelector(`[data-scene="${id}"]`);
      const evidence = [...(scene?.querySelectorAll("[data-project-ground-source]") ?? [])].map(
        (e) => e.getBoundingClientRect(),
      );
      const frame = scene?.querySelector("[data-system-pov]")?.getBoundingClientRect();
      return {
        scroll: scrollY,
        firstNamed: window.navFrames.find((f) => f.id === id),
        allNamedInFrame: window.navFrames.filter((f) => f.rect).every((f) => f.inFrame),
        bracketClearance:
          frame && evidence.length ? frame.right - Math.max(...evidence.map((r) => r.right)) : null,
        trace: window.navFrames,
      };
    }, id);
    writeFileSync(`${bulk}/${width}-nav-${id}.json`, JSON.stringify(data.trace));
    delete data.trace;
    if (documentScene(id))
      data.expectedScroll = geom.start + geom.span * route.sceneFocusProgress(id);
    visits.push({ id, ...data });
  }
  function documentScene(id) {
    return [
      "software-factory",
      "kivilcim",
      "jointledger",
      "dropspot",
      "tail",
      "reorient",
      "approach",
      "handoff",
    ].includes(id);
  }
  const boundary = {};
  for (const dir of [1, -1]) {
    const end = geom.start + geom.span;
    await page.evaluate(
      (y) => scrollTo({ top: y, behavior: "instant" }),
      end + (dir === 1 ? -250 : 1350),
    );
    await page.waitForTimeout(1700);
    const steps = [];
    for (let i = 0; i < 24; i++) {
      const before = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, dir * 400);
      await page.waitForTimeout(100);
      const after = await page.evaluate(() => scrollY);
      steps.push({ before, after, step: after - before });
    }
    boundary[dir === 1 ? "down" : "up"] = steps;
  }
  const escape = {};
  for (const dir of [1, -1]) {
    // A fresh document has no spent break/input state from the navigation sweep.
    await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    const edge = dir === 1 ? route.BREAK_GUARD_FROM : route.BREAK_GUARD_TO;
    await page.evaluate(
      (y) => scrollTo({ top: y, behavior: "instant" }),
      geom.start + geom.span * (edge - dir * 0.002),
    );
    await page.waitForTimeout(1800);
    await page.evaluate(() => {
      window.breakWheels = [];
      window.addEventListener(
        "wheel",
        (e) =>
          queueMicrotask(() =>
            window.breakWheels.push({ delta: e.deltaY, prevented: e.defaultPrevented }),
          ),
        { passive: true },
      );
    });
    // Only real input arms the protected playback; scrollTo intentionally does not.
    await page.mouse.wheel(0, dir * 400);
    await page.waitForTimeout(250);
    await page.mouse.wheel(0, dir * 400);
    await page.waitForTimeout(50);
    const before = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, -dir * 400);
    const samples = [];
    for (let i = 0; i < 8; i++) {
      await page.waitForTimeout(50);
      samples.push(await page.evaluate(() => scrollY));
    }
    escape[dir === 1 ? "forward" : "reverse"] = {
      before,
      samples,
      oppositeDisplacement: samples.at(-1) - before,
      wheels: await page.evaluate(() => window.breakWheels),
    };
  }
  // Fresh document, no prior wheel: park at the actual opaque cut, so the
  // user-input-only stall resolver does not take the screenshot back to paper.
  await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
  await page.evaluate(
    (y) => scrollTo({ top: y, behavior: "instant" }),
    geom.start + geom.span * route.BREAK_CUT,
  );
  await page.waitForTimeout(1700);
  const clip = { x: Math.round(width / 2 - 170), y: 18, width: 340, height: 66 };
  const png = await page.screenshot({ clip, path: `${bulk}/${width}-navigator-ink.png` });
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let brightPixels = 0;
  for (let i = 0; i < data.length; i += info.channels)
    if ((data[i] + data[i + 1] + data[i + 2]) / 3 > 150) brightPixels++;
  result[`${width}x${height}`] = {
    firstCue,
    returnedCue,
    geom,
    visits,
    boundary,
    escape,
    ink: {
      brightPixels,
      clip,
      blend: await page
        .locator("[data-route-navigator]")
        .evaluate((e) => getComputedStyle(e).mixBlendMode),
    },
  };
  writeFileSync("docs/review/v14.12-motion/preservation.json", JSON.stringify(result, null, 2));
  console.log(width, JSON.stringify(result[`${width}x${height}`]));
  await page.close();
}
await browser.close();
