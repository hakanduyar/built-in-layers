import { writeFileSync } from "node:fs";
import { it } from "vitest";
import { SCENE_IDS } from "@/lib/spatial/scenes";
import {
  BREAK_CUT,
  COLLISION_PROGRESS,
  averageCameraSpeed,
  cameraSpeed,
  routeLegs,
  sceneFocusProgress,
} from "@/lib/spatial/sceneRoute";

it("dump", () => {
  const legs = routeLegs();
  const bounds = [...new Set(legs.flatMap((l) => [l.fromProgress, l.toProgress]))].sort(
    (a, b) => a - b,
  );
  const average = averageCameraSpeed();
  const focus = Object.fromEntries(
    SCENE_IDS.map((id) => [id, +sceneFocusProgress(id).toFixed(4)]),
  );
  // normalised in-segment speed profile, per segment
  const profiles = legs.map((leg) => {
    const w = leg.toProgress - leg.fromProgress;
    const at = (t: number) => cameraSpeed(leg.fromProgress + w * t) / average;
    return [0, 0.25, 0.5, 0.75, 1].map((t) => +at(t).toFixed(3));
  });
  const speeds: number[] = [];
  for (let p = 0; p <= 1; p += 0.002) {
    if (p >= COLLISION_PROGRESS && p < BREAK_CUT) continue;
    speeds.push(cameraSpeed(p) / average);
  }
  writeFileSync(
    process.env.DUMP_TO ?? "/tmp/dump.json",
    JSON.stringify({
        bounds: bounds.map((b) => +b.toFixed(4)),
        collision: +COLLISION_PROGRESS.toFixed(4),
        cut: +BREAK_CUT.toFixed(4),
        focus,
        profiles,
        band: {
          min: +Math.min(...speeds).toFixed(3),
          max: +Math.max(...speeds).toFixed(3),
          ratio: +(Math.max(...speeds) / Math.min(...speeds)).toFixed(2),
        },
      }),
  );
});
