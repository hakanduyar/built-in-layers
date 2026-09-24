import { describe, expect, it } from "vitest";

import { CAMERA_INSET_MOBILE, sceneAnchor } from "@/lib/spatial/scenes";
import {
  MOBILE_WORLD_REFERENCE_HEIGHT,
  MOBILE_WORLD_UNIT_FLOOR,
  WORLD_UNIT_MOBILE,
  mobileWorldUnitPx,
} from "@/lib/spatial/worldFit";

// V13 mobile gate (M3): the mobile world unit. The CSS string is what the
// browser resolves; `mobileWorldUnitPx` is its JS twin, and these contracts
// hold the two together and pin the one property the cap must never cost.

/** The mobile project scenes' label overhangs its frame's top edge by this
 *  many CSS px at every audited width (measured on the built page,
 *  docs/review/v13-mobile-gate: -58px at 320, 375, 390, 430 and 768). */
const LABEL_OVERHANG_PX = 58;

/** Widths below `lg` render the mobile route; these are the phone and tablet
 *  heights the V13 gate audited plus the tallest portrait frames in common use. */
const MOBILE_HEIGHTS = [
  568, 640, 667, 700, 740, 812, 844, 896, 915, 932, 956, 1024, 1180, 1280, 1366,
];

describe("mobile world unit", () => {
  it("is the viewport unit on the phones the route was composed on", () => {
    for (const height of [568, 600, 640, 667, MOBILE_WORLD_REFERENCE_HEIGHT]) {
      expect(mobileWorldUnitPx(height)).toBeCloseTo(height / 100, 6);
    }
  });

  it("holds at the reference phone's unit on taller phones", () => {
    expect(mobileWorldUnitPx(740)).toBe(MOBILE_WORLD_REFERENCE_HEIGHT / 100);
    expect(mobileWorldUnitPx(844)).toBe(MOBILE_WORLD_REFERENCE_HEIGHT / 100);
    expect(mobileWorldUnitPx(896)).toBe(MOBILE_WORLD_REFERENCE_HEIGHT / 100);
  });

  it("never densifies a frame by more than the floor allows", () => {
    for (const height of MOBILE_HEIGHTS) {
      expect(mobileWorldUnitPx(height)).toBeGreaterThanOrEqual(
        (MOBILE_WORLD_UNIT_FLOOR * height) / 100,
      );
      expect(mobileWorldUnitPx(height)).toBeLessThanOrEqual(height / 100);
    }
  });

  it("keeps the next project's label outside the frame at every focus (one scene per frame)", () => {
    const step = sceneAnchor("kivilcim", true).y - sceneAnchor("software-factory", true).y;
    const insetVh = Number.parseFloat(CAMERA_INSET_MOBILE.top);
    expect(step).toBeGreaterThan(0);
    expect(insetVh).toBeGreaterThan(0);
    for (const height of MOBILE_HEIGHTS) {
      const unit = mobileWorldUnitPx(height);
      const nextLabelTop = (insetVh / 100) * height + step * unit - LABEL_OVERHANG_PX;
      // At least a mono label's line (~13px) of clearance, at every height.
      expect(nextLabelTop, `label clearance at ${height}px`).toBeGreaterThanOrEqual(height + 13);
    }
  });

  it("emits the same rule as CSS", () => {
    expect(WORLD_UNIT_MOBILE.x).toBe("1vw");
    expect(WORLD_UNIT_MOBILE.y).toBe(
      `max(${MOBILE_WORLD_UNIT_FLOOR}vh, min(1vh, ${MOBILE_WORLD_REFERENCE_HEIGHT / 100}px))`,
    );
  });
});
