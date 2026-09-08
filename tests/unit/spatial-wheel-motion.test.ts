import { describe, expect, it } from "vitest";
import { wheelMotionStep } from "@/lib/spatial/wheelMotion";

describe("desktop wheel delivery", () => {
  it("eases an isolated notch in and out without changing its reach", () => {
    for (const budget of [8, 26]) {
      let y = 0;
      const steps: number[] = [];
      for (let frame = 1; frame <= 120 && y < 120; frame++) {
        const next = Math.round(y + wheelMotionStep(120 - y, budget, 16.7, frame * 16.7));
        steps.push(next - y);
        y = next;
      }
      expect(y).toBe(120);
      expect(steps[0]).toBeLessThan(Math.max(...steps));
      expect(steps.at(-1)).toBeLessThan(Math.max(...steps));
      expect(Math.max(...steps)).toBeLessThanOrEqual(budget);
      expect(steps.length).toBeGreaterThan(120 / budget);
    }
  });

  it("obeys the rate budget and cannot overshoot in either direction at different frame rates", () => {
    for (const dt of [8.3, 16.7, 17]) {
      for (const remaining of [-540, -120, -0.25, 0, 0.25, 120, 540]) {
        const budget = (472.5 * dt) / 1000;
        const step = wheelMotionStep(remaining, budget, dt, 100);
        expect(Math.abs(step)).toBeLessThanOrEqual(Math.min(budget, Math.abs(remaining)));
        expect(Math.sign(step)).toBe(Math.sign(remaining));
      }
    }
  });

  it("reverses on the first frame and retains the sustained ceiling", () => {
    expect(wheelMotionStep(-120, 8, 16.7, 16.7)).toBeLessThan(0);
    expect(wheelMotionStep(540, 8, 16.7, 100)).toBe(8);
    expect(wheelMotionStep(-540, 8, 16.7, 100)).toBe(-8);
    expect(wheelMotionStep(120, 8, 0, 100)).toBe(0);
  });
});
