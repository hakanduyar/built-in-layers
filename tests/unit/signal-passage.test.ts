import { describe, expect, it } from "vitest";
import { sceneFocusProgress } from "@/lib/spatial/sceneRoute";
import { projectTour, ramp, signalPhase } from "@/lib/spatial/signalPhase";

describe("inter-project exposures", () => {
  it("leaves both project reading positions clear and crosses the intervening leg", () => {
    for (const [i, source] of projectTour.entries()) {
      const target = projectTour[i + 1];
      if (!target) continue;
      const phase = (v: number) => signalPhase(v, false, source, target);
      const from = sceneFocusProgress(source);
      const to = sceneFocusProgress(target);
      expect(phase(from)).toBeLessThan(0);
      expect(phase((from + to) / 2)).toBeGreaterThan(0);
      expect(phase((from + to) / 2)).toBeLessThan(1);
      expect(phase(to)).toBeGreaterThan(1);
    }
  });

  it("holds the final image registration before the exposure clears", () => {
    expect(ramp(0.68, 0.97, 0.67)).toBe(0);
    expect(ramp(0.68, 0.97, 0.82)).toBeGreaterThan(0);
    expect(ramp(0.68, 0.97, 0.98)).toBe(1);
  });
});
