// Gate 2 follow-up: explain the required mobile-route diff and verify that
// removing the new desktop stage classes has no computed effect below lg.
// node tests/tools/timing-spacing-mobile-check.mjs
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";

const base = "docs/review/v14.6-codex-motion/metrics/mobile-route.json";
const candidate = "docs/review/v14.7-codex-timing/metrics/mobile-route.json";
const read = (file) => JSON.parse(readFileSync(file, "utf8"));
const before = read(base),
  after = read(candidate);
const differences = [];
function diff(a, b, path = "") {
  if (a && b && typeof a === "object" && typeof b === "object") {
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)]))
      diff(a[key], b[key], `${path}/${key}`);
  } else if (a !== b) differences.push({ path, before: a, after: b });
}
diff(before, after);
const report = { base, candidate, differences, stageClassControls: [] };
const browser = await chromium.launch();
for (const [width, height] of [
  [320, 568],
  [360, 800],
  [375, 667],
  [390, 844],
  [430, 932],
  [768, 1024],
]) {
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(process.env.PROBE_BASE ?? "http://127.0.0.1:3200", { waitUntil: "networkidle" });
  await page.locator('[data-drift-block="about"] section').waitFor({ state: "attached" });
  const result = await page.evaluate(() => {
    const elements = [...document.body.querySelectorAll("*")];
    const properties = [
      "display",
      "position",
      "flex-direction",
      "justify-content",
      "padding-top",
      "padding-bottom",
      "margin-top",
      "margin-bottom",
      "min-height",
      "opacity",
      "font-family",
      "font-size",
      "line-height",
      "letter-spacing",
      "transform",
    ];
    const snapshot = () =>
      elements.map((el) => {
        const r = el.getBoundingClientRect(),
          s = getComputedStyle(el);
        return JSON.stringify([
          r.x,
          r.y,
          r.width,
          r.height,
          ...properties.map((p) => s.getPropertyValue(p)),
        ]);
      });
    const stage = document.querySelector('[data-drift-block="about"] section');
    const before = snapshot();
    stage.classList.remove("lg:flex", "lg:flex-col", "lg:justify-center");
    // Both snapshots in one task: no animation frame can advance between them.
    const after = snapshot();
    const changed = elements.flatMap((el, i) =>
      before[i] === after[i]
        ? []
        : [
            {
              tag: el.tagName,
              className: el.getAttribute("class"),
              before: before[i],
              after: after[i],
            },
          ],
    );
    return { elementsCompared: elements.length, propertiesPerElement: properties.length, changed };
  });
  report.stageClassControls.push({ width, height, ...result });
  await context.close();
}
await browser.close();
const beforeTiming = read("docs/review/v14.7-codex-timing/metrics/before.json");
const afterTiming = read("docs/review/v14.7-codex-timing/metrics/after.json");
report.desktopRouteUnchanged = beforeTiming.viewports.every((v, i) =>
  ["geometry", "focus", "anchors"].every(
    (key) => JSON.stringify(v[key]) === JSON.stringify(afterTiming.viewports[i][key]),
  ),
);
report.mobileGeometryUnchanged = Object.keys(before.viewports).every((key) => {
  const a = before.viewports[key],
    b = after.viewports[key];
  return (
    ["docHeight", "sectionTop", "spacerHeight", "focus", "focusSteps", "tourTargets"].every(
      (field) => JSON.stringify(a.summary[field]) === JSON.stringify(b.summary[field]),
    ) &&
    a.frames.every((frame, i) =>
      ["y", "yVh", "scenes"].every(
        (field) => JSON.stringify(frame[field]) === JSON.stringify(b.frames[i][field]),
      ),
    )
  );
});
writeFileSync(
  "docs/review/v14.7-codex-timing/metrics/parity.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
if (
  !report.desktopRouteUnchanged ||
  !report.mobileGeometryUnchanged ||
  report.stageClassControls.some((v) => v.changed.length)
)
  process.exitCode = 1;
