// Project ground geometry is derived from the composition it supports.
//
// A previous implementation authored four independent rectangles directly in
// SpatialCamera. That made every correction a coordinate-tuning exercise and,
// more importantly, let the ground drift away from the evidence when a project
// composition changed. The source bounds below are measured from real DOM
// elements (figures and evidence groups) and fed through one policy.

export type ProjectGroundScene = "software-factory" | "kivilcim" | "jointledger" | "dropspot";

export type ProjectVisualBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ProjectGroundGeometry = {
  offset: { x: number; y: number };
  width: number;
  height: number;
};

/** Mobile keeps one restrained, non-parallax registration for every project. */
export const MOBILE_PROJECT_GROUND_GEOMETRY: ProjectGroundGeometry = {
  offset: { x: 0.08, y: 0.24 },
  width: 0.92,
  height: 0.52,
};

/** One deliberate padding/registration policy for every project. */
export const PROJECT_GROUND_POLICY = {
  inlinePadding: 0.06,
  blockPadding: 0.05,
  minWidth: 0.78,
  maxWidth: 0.96,
  minHeight: 0.51,
  maxHeight: 0.58,
  minTop: 0.08,
  maxTop: 0.22,
  topWeight: 0.65,
  heightWeight: 0.1,
} as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function registersAtStart(scene: ProjectGroundScene): boolean {
  // Kıvılcım is the route's split composition: identity left, evidence right.
  // Its support opens from the identity edge. Foundation, counter and stacked
  // compositions resolve against the opposite edge.
  return scene === "kivilcim";
}

export function projectGroundGeometry(
  scene: ProjectGroundScene,
  visual: ProjectVisualBounds,
): ProjectGroundGeometry {
  const policy = PROJECT_GROUND_POLICY;
  const width = clamp(visual.width + policy.inlinePadding * 2, policy.minWidth, policy.maxWidth);
  const height = clamp(visual.height + policy.blockPadding * 2, policy.minHeight, policy.maxHeight);
  const top = clamp(
    visual.y * policy.topWeight + visual.height * policy.heightWeight,
    policy.minTop,
    policy.maxTop,
  );

  return {
    offset: { x: registersAtStart(scene) ? 0 : 1 - width, y: top },
    width,
    height,
  };
}

/**
 * First-paint estimates use the same derivation as runtime geometry. A layout
 * effect replaces these with measured DOM bounds before the first useful frame;
 * these values only prevent an unregistered flash during hydration/no-JS.
 */
export const PROJECT_GROUND_FALLBACK_VISUALS: Record<ProjectGroundScene, ProjectVisualBounds> = {
  "software-factory": { x: 0, y: 0.33, width: 0.76, height: 0.51 },
  kivilcim: { x: 0.34, y: 0.05, width: 0.75, height: 0.45 },
  jointledger: { x: 0, y: 0.05, width: 0.67, height: 0.42 },
  dropspot: { x: 0, y: 0.23, width: 1, height: 0.52 },
};

export const PROJECT_GROUND_SCENES = Object.keys(
  PROJECT_GROUND_FALLBACK_VISUALS,
) as ProjectGroundScene[];

export function fallbackProjectGroundGeometries(): Record<
  ProjectGroundScene,
  ProjectGroundGeometry
> {
  return Object.fromEntries(
    PROJECT_GROUND_SCENES.map((scene) => [
      scene,
      projectGroundGeometry(scene, PROJECT_GROUND_FALLBACK_VISUALS[scene]),
    ]),
  ) as Record<ProjectGroundScene, ProjectGroundGeometry>;
}
