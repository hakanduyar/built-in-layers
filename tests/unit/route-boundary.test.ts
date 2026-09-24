import { describe, expect, it } from "vitest";
import { boundaryNativeShare } from "@/lib/spatial/routeBoundary";

describe("route/native handoff", () => {
  it("keeps the route governed and releases the ordinary page completely", () => {
    expect(boundaryNativeShare(4500, 400, 4560, 675)).toBe(0);
    expect(boundaryNativeShare(5400, 400, 4560, 675)).toBe(1);
    expect(boundaryNativeShare(5600, -400, 4560, 675)).toBe(1);
  });
  it("changes continuously in either direction across the finite band", () => {
    for (const delta of [400, -400]) {
      let previous = 0;
      for (let y = 4560; y <= 5560; y += 1) {
        const next = boundaryNativeShare(y, delta, 4560, 675);
        expect(next).toBeGreaterThanOrEqual(previous);
        expect(next - previous).toBeLessThan(0.003);
        previous = next;
      }
      expect(previous).toBe(1);
    }
  });
});
