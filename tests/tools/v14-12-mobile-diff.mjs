// Compare every field; only pixel-sampling fields may differ without a geometry regression.
import { readFileSync, writeFileSync } from "node:fs";
const baseline = "docs/review/v14.11-engineering/mobile-route.json";
const current = "C:/Users/hakan/portfolio-review/v14.12-motion/mobile/metrics/mobile-route.json";
const a = JSON.parse(readFileSync(baseline, "utf8"));
const b = JSON.parse(readFileSync(current, "utf8"));
const differences = [];
function compare(a, b, path = "") {
  if (a === b) return;
  if (a && b && typeof a === "object" && typeof b === "object") {
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)]))
      compare(a[key], b[key], `${path}.${key}`);
  } else
    differences.push({
      path,
      before: a,
      after: b,
      delta: typeof a === "number" && typeof b === "number" ? b - a : null,
    });
}
compare(a, b);
const pixel = (d) => /\.px\.|\.meanPxInkRows\./.test(d.path);
const nonPixelDifferences = differences.filter((d) => !pixel(d));
const summary = {
  baseline,
  current,
  step: b.stepVh,
  viewports: Object.keys(b.viewports),
  nonPixelDifferences,
  pixelDifferences: differences.filter(pixel),
  totalDifferences: differences.length,
};
writeFileSync("docs/review/v14.12-motion/mobile-diff.json", JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (nonPixelDifferences.length) process.exitCode = 1;
