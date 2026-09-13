// Derive motion readability and reversal metrics from saved browser frames.
import { readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";
// Execute only the repository's pure geometry modules, without bundling the app.
const modules = new Map();
function geometry(file) {
  if (modules.has(file)) return modules.get(file);
  const exports = {};
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function("exports", "require", code)(exports, (id) => geometry(`${id.replace("@/", "")}.ts`));
  modules.set(file, exports);
  return exports;
}
const { cameraPosition } = geometry("lib/spatial/sceneRoute.ts");
const { worldFit, WORLD_REFERENCE } = geometry("lib/spatial/worldFit.ts");
const phase = process.env.PROBE_PHASE ?? "before";
const root = "docs/review/v14.12-motion";
const report = JSON.parse(readFileSync(`${root}/${phase}.json`, "utf8"));
const bulk = `C:/Users/hakan/portfolio-review/v14.12-motion/${phase}`;
const round = (n) => Math.round(n * 100) / 100;
for (const [viewport, value] of Object.entries(report)) {
  const [width, height] = viewport.split("x").map(Number);
  for (const [name, c] of Object.entries(value.cases)) {
    const { frames: f, events } = JSON.parse(readFileSync(`${bulk}/${width}-${name}.json`, "utf8"));
    const n = (a) => a.nodes.find((x) => x.id === c.subject);
    let stop = 0;
    for (let i = 1; i < f.length; i++) if (Math.abs(f[i].scroll - f[i - 1].scroll) > 0.1) stop = i;
    const distance = (a) => Math.hypot(n(a).x - n(f.at(-1)).x, n(a).y - n(f.at(-1)).y);
    let settled = distance(f[stop]) > 1 ? stop + 1 : stop;
    for (let i = stop + 1; i < f.length; i++) if (distance(f[i]) > 1) settled = i + 1;
    c.cameraTailMs = round(f[Math.min(settled, f.length - 1)].ms - f[stop].ms);
    const visible = (a) => {
      const r = n(a);
      return r.opacity >= 0.8 && r.x < width && r.x + r.w > 0 && r.y < height && r.y + r.h > 0;
    };
    let visibleTail = 0,
      tailExposure = 0,
      peak = 0;
    for (let i = 1; i < f.length; i++) {
      if (f[i].ms > c.documentStopMs + 0.05 && visible(f[i])) {
        visibleTail += Math.hypot(n(f[i]).x - n(f[i - 1]).x, n(f[i]).y - n(f[i - 1]).y);
        if (f[i].ms <= c.documentStopMs + c.cameraTailMs) tailExposure += f[i].ms - f[i - 1].ms;
      }
      for (let j = i - 1; j >= 0; j--) {
        const dt = f[i].ms - f[j].ms;
        if (dt > 140) break;
        if (dt >= 80) peak = Math.max(peak, (Math.abs(f[i].scroll - f[j].scroll) / dt) * 1000);
      }
    }
    c.readability = {
      definition:
        "Path travelled by >=0.8-opacity evidence intersecting viewport after document stop; and time it remains >1px from final position.",
      visibleTailPx: round(visibleTail),
      unsettledVisibleMs: round(tailExposure),
    };
    if (name !== "lower-native") {
      const p = (a) => (a.scroll - value.geom.start) / value.geom.span;
      const end = cameraPosition(p(f.at(-1)));
      const scale = worldFit(width, height);
      const ux = (Math.min(width, WORLD_REFERENCE.width) / 100) * scale;
      const uy = (Math.min(height, WORLD_REFERENCE.height) / 100) * scale;
      const errors = f
        .filter((a) => a.ms <= c.documentStopMs && visible(a))
        .map((a) => {
          const at = cameraPosition(p(a));
          const idealX = n(f.at(-1)).x + (end.x - at.x) * ux;
          const idealY = n(f.at(-1)).y + (end.y - at.y) * uy;
          return Math.hypot(n(a).x - idealX, n(a).y - idealY);
        })
        .sort((a, b) => a - b);
      c.readability.trackingErrorP95Px = errors.length
        ? round(errors[Math.floor(errors.length * 0.95)])
        : null;
      c.readability.trackingSamples = errors.length;
      c.readability.trackingDefinition =
        "P95 evidence displacement from the unfiltered route position during document motion, using unchanged cameraPosition/worldFit and final settled evidence as the anchor; opacity >=0.8 and viewport intersection required. Null means no qualifying samples.";
    }
    c.documentPeak80to140msPxS = round(peak);
    const speeds = f
      .slice(1)
      .flatMap((a, i) => {
        const b = f[i],
          dt = a.ms - b.ms;
        return a.ms <= c.documentStopMs + 0.05 &&
          visible(a) &&
          Math.abs(a.scroll - b.scroll) > 0.1 &&
          dt > 0
          ? [(Math.hypot(n(a).x - n(b).x, n(a).y - n(b).y) / dt) * 1000]
          : [];
      })
      .sort((a, b) => a - b);
    c.visibleSubjectP95SpeedPxS = speeds.length
      ? round(speeds[Math.floor(speeds.length * 0.95)])
      : null;
    c.speedDefinition =
      "P95 during document-moving frames only, visible evidence at opacity >=0.8; null if none.";
    if (name === "reverse-during-input") {
      const event = events.at(-1).ms;
      const i = f.findIndex((a) => a.ms >= event);
      const firstReverse = f.findIndex((a, j) => j > i && a.scroll < f[j - 1].scroll);
      const cameraReverse = f.findIndex(
        (a, j) => j >= firstReverse && j > 0 && n(a).x > n(f[j - 1]).x + 0.01,
      );
      let wrong = 0;
      for (let j = firstReverse; j <= cameraReverse; j++)
        if (j > 0) wrong += Math.max(0, n(f[j - 1]).x - n(f[j]).x);
      c.reversal = {
        documentResponseMs: round(f[firstReverse].ms - event),
        cameraResponseMs: round(f[cameraReverse].ms - event),
        cameraFramesAfterDocument: cameraReverse - firstReverse,
        wrongWayHorizontalPx: round(wrong),
      };
      c.reversal.deliveryFrameResidualPx = round(
        Math.max(0, n(f[firstReverse - 1]).x - n(f[firstReverse]).x),
      );
      c.reversal.wrongWayAfterNextFramePx = round(
        f
          .slice(firstReverse + 1)
          .reduce((sum, a, j) => sum + Math.max(0, n(f[firstReverse + j]).x - n(a).x), 0),
      );
    }
    if (name === "lower-native") {
      // This route-only subject is offscreen in the lower world: do not call its
      // hidden catch-up a readability problem. Measure native document steps.
      c.offscreenCameraMetric = true;
      c.documentSteps = f
        .slice(1)
        .map((a, i) => a.scroll - f[i].scroll)
        .filter((x) => x !== 0);
      c.nativeExtraPx = round(
        c.documentSteps.reduce((a, b) => a + b, 0) - events.reduce((a, b) => a + b.delta, 0),
      );
    }
  }
}
writeFileSync(`${root}/${phase}.json`, JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    Object.fromEntries(
      Object.entries(report).map(([v, r]) => [
        v,
        Object.fromEntries(
          Object.entries(r.cases).map(([k, c]) => [
            k,
            {
              tailPx: c.cameraTailPx,
              tailMs: c.cameraTailMs,
              readability: c.readability,
              reversal: c.reversal,
              nativeExtraPx: c.nativeExtraPx,
            },
          ]),
        ),
      ]),
    ),
    null,
    2,
  ),
);
