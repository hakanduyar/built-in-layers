import { describe, expect, test } from "vitest";
import {
  BREAK_COVER_CLOSED,
  BREAK_COVER_START,
  BREAK_CUT,
  BREAK_REVEAL_END,
  BREAK_REVEAL_START,
} from "@/lib/spatial/sceneRoute";
import {
  coverOpacity,
  labelPresence,
  landingDrift,
  sectionPresence,
  upperSectionPresence,
} from "@/lib/spatial/surfaceCover";

// V14.2 Gate B: the cover changed material, not contract. These mirror the
// checks spatial-route.test.ts makes of the rails' offsets: fully opaque
// through the dwell, absent outside the window, monotone on each side.
describe("the surface cover (V14.2 Gate B)", () => {
  test("is absent outside the cover window", () => {
    expect(coverOpacity(0)).toBe(0);
    expect(coverOpacity(BREAK_COVER_START)).toBe(0);
    expect(coverOpacity(BREAK_REVEAL_END)).toBe(0);
    expect(coverOpacity(1)).toBe(0);
    expect(sectionPresence(BREAK_COVER_START)).toBe(0);
    expect(sectionPresence(BREAK_REVEAL_END)).toBe(0);
  });

  test("is fully opaque through the whole dwell, so the cut is never witnessed", () => {
    for (let p = BREAK_COVER_CLOSED; p <= BREAK_REVEAL_START; p += 0.0005) {
      expect(coverOpacity(p), `cover not opaque at ${p.toFixed(4)}`).toBe(1);
    }
    expect(coverOpacity(BREAK_CUT)).toBe(1);
    expect(sectionPresence(BREAK_CUT)).toBe(1);
  });

  test("rises monotonically over the closing and falls monotonically over the reveal", () => {
    let last = 0;
    for (let p = BREAK_COVER_START; p <= BREAK_COVER_CLOSED; p += 0.0005) {
      const v = coverOpacity(p);
      expect(v).toBeGreaterThanOrEqual(last);
      last = v;
    }
    last = 1;
    for (let p = BREAK_REVEAL_START; p <= BREAK_REVEAL_END; p += 0.0005) {
      const v = coverOpacity(p);
      expect(v).toBeLessThanOrEqual(last);
      last = v;
    }
  });

  test("the upper strata stay with the field on the way out; the landing drift is 1 until the reveal", () => {
    for (let p = BREAK_REVEAL_START; p <= BREAK_REVEAL_END; p += 0.0005) {
      expect(upperSectionPresence(p)).toBeCloseTo(coverOpacity(p), 9);
    }
    for (let p = BREAK_COVER_START; p < BREAK_COVER_CLOSED; p += 0.0005) {
      expect(upperSectionPresence(p)).toBeCloseTo(sectionPresence(p), 9);
    }
    // The labels are gone within the first quarter of the reveal, ahead of
    // the SYSTEM line they name.
    const quarterIn = BREAK_REVEAL_START + (BREAK_REVEAL_END - BREAK_REVEAL_START) * 0.26;
    expect(labelPresence(quarterIn)).toBe(0);
    expect(labelPresence(BREAK_CUT)).toBe(1);
    for (let p = BREAK_REVEAL_START; p <= BREAK_REVEAL_END; p += 0.0005) {
      expect(labelPresence(p)).toBeLessThanOrEqual(sectionPresence(p) + 1e-9);
    }
    expect(landingDrift(0)).toBe(1);
    expect(landingDrift(BREAK_CUT)).toBe(1);
    expect(landingDrift(BREAK_REVEAL_START)).toBe(1);
    expect(landingDrift(BREAK_REVEAL_END)).toBe(0);
    expect(landingDrift(1)).toBe(0);
    let last = 1;
    for (let p = BREAK_REVEAL_START; p <= BREAK_REVEAL_END; p += 0.0005) {
      const v = landingDrift(p);
      expect(v).toBeLessThanOrEqual(last);
      last = v;
    }
  });

  test("the section lags the field in and leads it out, and never exceeds it", () => {
    for (let p = BREAK_COVER_START; p <= BREAK_REVEAL_END; p += 0.0005) {
      expect(sectionPresence(p)).toBeLessThanOrEqual(coverOpacity(p) + 1e-9);
    }
    const midClose = BREAK_COVER_START + (BREAK_COVER_CLOSED - BREAK_COVER_START) * 0.4;
    expect(sectionPresence(midClose)).toBeLessThan(coverOpacity(midClose));
    const midOpen = BREAK_REVEAL_START + (BREAK_REVEAL_END - BREAK_REVEAL_START) * 0.6;
    expect(sectionPresence(midOpen)).toBeLessThan(coverOpacity(midOpen));
  });
});
