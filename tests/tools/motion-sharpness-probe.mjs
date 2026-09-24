// Final desktop gate: compare direct browser stills at rest and while the camera
// is translating, and prove neither text nor image ancestors acquire scale/filter.
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const BASE = process.env.PROBE_BASE ?? "http://localhost:3000";
const OUT = process.env.PROBE_OUT ?? "docs/review/v12-codex-gate/metrics";
const SHOTS = process.env.SHOT_OUT ?? "docs/review/v12-codex-gate/sharpness";
const VIEWPORTS = (process.env.PROBE_VIEWPORTS ?? "1366x768,1536x864,1920x1080,2560x1440")
  .split(",")
  .map((value) => value.split("x").map(Number));
const FOCUS = JSON.parse(
  readFileSync(
    process.env.FOCUS_FILE ?? "docs/review/v11-desktop-freeze/metrics/route-focus.json",
    "utf8",
  ),
).desktop;
mkdirSync(OUT, { recursive: true });
mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch();
const report = { viewports: {} };

for (const [width, height] of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page
    .locator("section[aria-label='Spatial system tour'] .sticky")
    .waitFor({ state: "attached", timeout: 30000 });
  const range = await page.evaluate(() => {
    const section = document.querySelector("section[aria-label='Spatial system tour']");
    const spacer = section.querySelector(":scope > div");
    const start = section.getBoundingClientRect().top + window.scrollY;
    return { start, end: start + spacer.getBoundingClientRect().height - window.innerHeight };
  });
  await page.evaluate(
    ({ range, focus }) => window.scrollTo(0, range.start + (range.end - range.start) * focus),
    { range, focus: FOCUS.kivilcim },
  );
  await page.waitForFunction(
    () => {
      const scene = document.querySelector('[data-scene="kivilcim"]');
      const key = scene ? Math.round(scene.getBoundingClientRect().top) : "missing";
      window.__sharpHits = window.__sharpKey === key ? (window.__sharpHits ?? 0) + 1 : 0;
      window.__sharpKey = key;
      return window.__sharpHits >= 4;
    },
    null,
    { timeout: 30000, polling: 90 },
  );

  const measure = () =>
    page.evaluate(() => {
      const scene = document.querySelector('[data-scene="kivilcim"]');
      const heading = scene.querySelector("h3");
      const image = scene.querySelector("img");
      const chain = (element) => {
        let scaleX = 1;
        let scaleY = 1;
        const exceptions = [];
        for (
          let node = element;
          node && node !== document.documentElement;
          node = node.parentElement
        ) {
          const style = getComputedStyle(node);
          const match = /matrix\(([^)]+)\)/.exec(style.transform);
          if (match) {
            const matrix = match[1].split(",").map(Number);
            scaleX *= Math.hypot(matrix[0], matrix[1]);
            scaleY *= Math.hypot(matrix[2], matrix[3]);
          }
          if (style.filter !== "none") exceptions.push(`filter:${style.filter}`);
        }
        return { scaleX: +scaleX.toFixed(4), scaleY: +scaleY.toFixed(4), exceptions };
      };
      return {
        top: scene.getBoundingClientRect().top,
        heading: chain(heading),
        image: chain(image),
      };
    });

  const atRest = await measure();
  await page.screenshot({ path: `${SHOTS}/${width}x${height}--stationary.png` });
  await page.mouse.wheel(0, 1400);
  await page.waitForTimeout(34);
  const movingA = await measure();
  await page.waitForTimeout(34);
  const movingB = await measure();
  await page.screenshot({ path: `${SHOTS}/${width}x${height}--moving.png` });
  report.viewports[`${width}x${height}`] = {
    atRest,
    moving: movingB,
    movedPxAcross34ms: +Math.abs(movingB.top - movingA.top).toFixed(2),
    consoleErrors: errors,
  };
  await context.close();
}

writeFileSync(`${OUT}/motion-sharpness.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 1));
await browser.close();
