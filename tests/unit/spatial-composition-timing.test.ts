import { describe, expect, it } from "vitest";
import { sceneApproach, sceneFocusProgress } from "@/lib/spatial/sceneRoute";
import { SCENE_IDS } from "@/lib/spatial/scenes";
import {
  sceneCompositionPresence,
  scenePresence,
  systemsWordPresence,
} from "@/lib/spatial/systemPov";

describe("desktop composition reading windows", () => {
  it("gives UNDERNEATH the reference scene's full hold and completed release", () => {
    const reorient = sceneFocusProgress("reorient");
    const approach = sceneFocusProgress("approach");
    for (let px = 0; px <= 300; px += 1) {
      expect(sceneCompositionPresence("reorient", reorient + px / 4500)).toBeCloseTo(
        sceneCompositionPresence("approach", approach + px / 4500),
        10,
      );
    }
    expect(sceneCompositionPresence("reorient", reorient + 80 / 4500)).toBe(1);
    expect(sceneCompositionPresence("reorient", reorient + 270 / 4500)).toBe(0.34);
  });

  it("acquires four-stops halfway through its incoming leg and retains its release", () => {
    const focus = sceneFocusProgress("handoff");
    const incoming = focus - sceneFocusProgress("approach");
    expect(sceneCompositionPresence("handoff", focus - incoming * 0.51)).toBeLessThan(1);
    expect(sceneCompositionPresence("handoff", focus - incoming * 0.49)).toBe(1);
    for (let p = focus; p <= 1; p += 0.001) {
      expect(sceneCompositionPresence("handoff", p)).toBe(
        scenePresence(sceneApproach("handoff", p)),
      );
    }
  });

  it("preserves every mobile curve, SYSTEMS, and other desktop compositions", () => {
    for (const mobile of [false, true]) {
      for (const id of SCENE_IDS) {
        for (let step = 0; step <= 1000; step += 1) {
          const p = step / 1000;
          if (
            !mobile &&
            ((id === "reorient" && p > sceneFocusProgress(id)) ||
              (id === "handoff" && p < sceneFocusProgress(id)))
          )
            continue;
          const a = sceneApproach(id, p, mobile);
          expect(sceneCompositionPresence(id, p, mobile)).toBe(
            id === "tail" ? systemsWordPresence(a, mobile) : scenePresence(a, mobile),
          );
        }
      }
    }
  });
});
