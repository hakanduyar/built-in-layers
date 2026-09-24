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
  // V13 (Fable gate, finding B): 0.51 -> 0.40. The floor only has to keep a
  // small evidence group on a real plinth; at 0.51 it was the reason the two
  // shallow compositions carried a blank field below their evidence.
  minHeight: 0.4,
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
  const top = clamp(
    visual.y * policy.topWeight + visual.height * policy.heightWeight,
    policy.minTop,
    policy.maxTop,
  );
  // V13 (Fable gate, finding B) -- THE GROUND'S LOWER EDGE IS ANCHORED TO THE
  // EVIDENCE. The previous derivation sized the ground from the evidence's
  // height alone (`height + 2 * blockPadding`) while `top` was clamped to its
  // floor for every shallow composition, so the whole surplus landed BELOW the
  // group: measured on the production build at focus, Kıvılcım's and
  // JointLedger's grounds ran 153 / 184 / 177 / 213 / 213 px past their
  // evidence at 1366 / 1440 / 1536 / 1920 / 2560, and trailed off-frame as a
  // blank beige field (260 px at early-exit, 1536x864). Deriving the height
  // from where the group actually ends keeps the top edge's lead exactly as it
  // was and puts one block padding under the evidence instead of a field.
  const bottom = visual.y + visual.height + policy.blockPadding;
  const height = clamp(bottom - top, policy.minHeight, policy.maxHeight);

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
  // V13: the foundation composition is now a one-line title over a
  // nine-column plate | three-column detail row; measured at focus on the
  // production build (0 / 0.227 / 0.742 / 0.504 of the scene width at 1440,
  // 1536, 1920 and 2560; y 0.233 and height 0.506 at 1366's 1147px scene).
  "software-factory": { x: 0, y: 0.23, width: 0.74, height: 0.5 },
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
