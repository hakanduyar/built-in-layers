import { describe, expect, it } from "vitest";
import { sceneFocusProgress } from "@/lib/spatial/sceneRoute";
import { ramp, signalPhase } from "@/lib/spatial/signalPhase";

describe("the JointLedger to DropSpot exposure", () => {
  it("leaves both project reading positions clear and crosses the intervening leg", () => {
    const from = sceneFocusProgress("jointledger");
    const to = sceneFocusProgress("dropspot");
    expect(signalPhase(from)).toBeLessThan(0);
    expect(signalPhase((from + to) / 2)).toBeGreaterThan(0);
    expect(signalPhase((from + to) / 2)).toBeLessThan(1);
    expect(signalPhase(to)).toBeGreaterThan(1);
  });

  it("holds the final image registration before the exposure clears", () => {
    expect(ramp(0.68, 0.97, 0.67)).toBe(0);
    expect(ramp(0.68, 0.97, 0.82)).toBeGreaterThan(0);
    expect(ramp(0.68, 0.97, 0.98)).toBe(1);
  });
});
