import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
const baseline = "e37e77b";
const files = [
  "lib/spatial/sceneRoute.ts",
  "lib/spatial/scenes.ts",
  "lib/spatial/systemPov.ts",
  "lib/spatial/routeBoundary.ts",
  "lib/spatial/routeNavigation.ts",
  "components/spatial/SceneBreak.tsx",
  "components/spatial/SystemsWord.tsx",
  "components/spatial/SystemPOV.tsx",
  "components/spatial/RouteNavigator.tsx",
  "components/spatial/EditorialDrift.tsx",
  "components/ui/motion/Reveal.tsx",
  "styles/globals.css",
];
const original = (file) => execFileSync("git", ["show", `${baseline}:${file}`]);
const report = {
  baseline,
  files: files.map((file) => {
    const now = readFileSync(file);
    return {
      file,
      unchanged: original(file).equals(now),
      sha256: createHash("sha256").update(now).digest("hex"),
    };
  }),
};
const camera = "components/spatial/SpatialCamera.tsx";
const governor = (s) =>
  s.slice(s.indexOf("function useRouteGovernor("), s.indexOf("export function SpatialCamera("));
report.wheelGovernorByteIdentical =
  governor(original(camera).toString()) === governor(readFileSync(camera, "utf8"));
const filter = "lib/spatial/cameraFilter.ts";
const pacing = (s) =>
  s.slice(
    s.indexOf("/* ---------------------------------------------- scene-break rate limiting */"),
    s.indexOf("export type FilterState"),
  );
report.pacingAndBreakConstantsByteIdentical =
  pacing(original(filter).toString()) === pacing(readFileSync(filter, "utf8"));
writeFileSync("docs/review/v14.12-motion/preserved-files.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (
  report.files.some((f) => !f.unchanged) ||
  !report.wheelGovernorByteIdentical ||
  !report.pacingAndBreakConstantsByteIdentical
)
  process.exitCode = 1;
