import { describe, expect, it } from "vitest";
import {
  PROJECT_GROUND_POLICY,
  projectGroundGeometry,
  type ProjectGroundScene,
  type ProjectVisualBounds,
} from "@/lib/spatial/projectGround";

const VISUALS: Record<ProjectGroundScene, ProjectVisualBounds> = {
  "software-factory": { x: 0, y: 0.34, width: 0.66, height: 0.5 },
  kivilcim: { x: 0.34, y: 0.05, width: 0.75, height: 0.45 },
  jointledger: { x: 0, y: 0.05, width: 0.67, height: 0.42 },
  dropspot: { x: 0, y: 0.23, width: 1, height: 0.52 },
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
    expect(kivilcim.height).toBeGreaterThan(0.49);
    expect(dropspot.width).toBeGreaterThan(kivilcim.width);
    expect(dropspot.height).toBeGreaterThan(kivilcim.height);
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
