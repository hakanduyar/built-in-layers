import { describe, expect, it } from "vitest";
import {
  PROJECT_GROUND_POLICY,
  projectGroundGeometry,
  type ProjectGroundScene,
  type ProjectVisualBounds,
} from "@/lib/spatial/projectGround";

// Measured on the V13 production build at focus (fractions of scene width;
// identical to three decimals at 1440, 1536, 1920 and 2560, and within 0.006
// at 1366, whose scene is 1147px rather than 1180px wide).
const VISUALS: Record<ProjectGroundScene, ProjectVisualBounds> = {
  "software-factory": { x: 0, y: 0.227, width: 0.742, height: 0.504 },
  kivilcim: { x: 0.345, y: 0, width: 0.714, height: 0.472 },
  jointledger: { x: 0, y: 0, width: 0.655, height: 0.435 },
  dropspot: { x: 0, y: 0.186, width: 1, height: 0.525 },
};

describe("project ground geometry", () => {
  it("uses one bounded padding policy for every composition", () => {
    for (const [scene, visual] of Object.entries(VISUALS) as [
      ProjectGroundScene,
      ProjectVisualBounds,
    ][]) {
      const ground = projectGroundGeometry(scene, visual);
      expect(ground.width).toBeGreaterThanOrEqual(PROJECT_GROUND_POLICY.minWidth);
      expect(ground.width).toBeLessThanOrEqual(PROJECT_GROUND_POLICY.maxWidth);
      expect(ground.height).toBeGreaterThanOrEqual(PROJECT_GROUND_POLICY.minHeight);
      expect(ground.height).toBeLessThanOrEqual(PROJECT_GROUND_POLICY.maxHeight);
      expect(ground.offset.y).toBeGreaterThanOrEqual(PROJECT_GROUND_POLICY.minTop);
      expect(ground.offset.y).toBeLessThanOrEqual(PROJECT_GROUND_POLICY.maxTop);
    }
  });

  it("registers the split scene at the start and the other layouts at the end", () => {
    const kivilcim = projectGroundGeometry("kivilcim", VISUALS.kivilcim);
    expect(kivilcim.offset.x).toBe(0);

    for (const scene of ["software-factory", "jointledger", "dropspot"] as const) {
      const ground = projectGroundGeometry(scene, VISUALS[scene]);
      expect(ground.offset.x + ground.width).toBeCloseTo(1, 8);
    }
  });

  it("makes Kıvılcım more generous and DropSpot naturally larger", () => {
    const kivilcim = projectGroundGeometry("kivilcim", VISUALS.kivilcim);
    const dropspot = projectGroundGeometry("dropspot", VISUALS.dropspot);
    expect(kivilcim.width).toBeGreaterThan(0.75);
    expect(kivilcim.height).toBeGreaterThan(0.44);
    expect(dropspot.width).toBeGreaterThan(kivilcim.width);
    expect(dropspot.height).toBeGreaterThan(kivilcim.height);
  });

  it("anchors the ground's lower edge one block padding below the evidence", () => {
    // V13 (Fable gate, finding B): the ground used to be sized from the
    // evidence's height alone, so whenever `top` clamped to its floor the
    // whole surplus landed below the group (153-213px of blank ground under
    // Kıvılcım and JointLedger at focus). The lower edge is now derived from
    // where the evidence ends; the top edge's lead is unchanged.
    for (const scene of ["kivilcim", "jointledger"] as const) {
      const visual = VISUALS[scene];
      const ground = projectGroundGeometry(scene, visual);
      const evidenceBottom = visual.y + visual.height;
      expect(ground.offset.y + ground.height).toBeCloseTo(
        evidenceBottom + PROJECT_GROUND_POLICY.blockPadding,
        8,
      );
      expect(ground.offset.y).toBeLessThan(visual.y + visual.height * 0.5);
    }

    // The two deep compositions -- the full-width stacked DropSpot and the
    // nine-column foundation plate -- reach the height ceiling instead. The
    // ceiling may trim the padding under the evidence (0.047 and 0.042 of the
    // scene width remain, against the 0.05 asked for) but never lifts the
    // ground's lower edge above the evidence.
    for (const scene of ["software-factory", "dropspot"] as const) {
      const visual = VISUALS[scene];
      const ground = projectGroundGeometry(scene, visual);
      const evidenceBottom = visual.y + visual.height;
      expect(ground.height).toBe(PROJECT_GROUND_POLICY.maxHeight);
      expect(ground.offset.y + ground.height).toBeGreaterThan(evidenceBottom + 0.04);
      expect(ground.offset.y + ground.height).toBeLessThanOrEqual(
        evidenceBottom + PROJECT_GROUND_POLICY.blockPadding,
      );
    }
  });

  it("responds to the measured visual group instead of returning a fixed rectangle", () => {
    const small = projectGroundGeometry("jointledger", {
      x: 0,
      y: 0.04,
      width: 0.6,
      height: 0.4,
    });
    const large = projectGroundGeometry("jointledger", {
      x: 0,
      y: 0.2,
      width: 0.82,
      height: 0.5,
    });
    expect(large.width).toBeGreaterThan(small.width);
    expect(large.offset.y).toBeGreaterThan(small.offset.y);
  });
});
