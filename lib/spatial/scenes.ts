// Spatial Portfolio V4 (feature/spatial-portfolio-v4, not merged to main --
// see docs/DESIGN_SYSTEM.md §18). Scene DATA only: where each scene lives in
// the world. No JSX, no camera math, and -- new in V4 -- no authored
// progress values either.
//
// V3 authored `focus` and `holdUntil` per scene, which made scene focus a
// literal zero-velocity camera plateau. Measured under natural wheel input,
// V3's camera resolved to 29 distinct positions across 900 frames, its median
// response was 0.00 camera px per scroll px, and 1276px of scrolling could
// pass with the camera moving under 8px -- then burst at 24x the local rate.
// That is the stop/go the owner reported.
//
// In V4 progress is DERIVED from route geometry (see sceneRoute.ts): each
// segment is allocated scroll in proportion to how far it travels plus a
// fixed reading allowance, and focus is expressed as a velocity minimum
// rather than a stop. Anchors below stay authoritative -- the camera curve
// still passes exactly through every one of them.

export type SceneId =
  "hero" | "kivilcim" | "dropspot" | "tail" | "reorient" | "approach" | "handoff";

export type WorldPoint = { x: number; y: number };

export type SceneConfig = {
  id: SceneId;
  /** Desktop world anchor, in vw/vh. The camera curve passes through this. */
  world: WorldPoint;
  /**
   * Mobile world anchor. x is always 0 -- "same world, different camera
   * choreography": a large diagonal at 375px costs readability and buys
   * nothing, and aggressive parallax there risks motion sickness.
   */
  mobileWorld: WorldPoint;
};

// Scene block geometry, shared by the camera (for framing) and the scene
// components themselves (for sizing) so the two can never drift apart.
export const SCENE_WIDTH = "min(84vw, 1180px)";
export const SCENE_WIDTH_MOBILE = "92vw";
export const SCENE_MIN_HEIGHT = "72vh";

/** Inset of the world layer inside the sticky viewport, so a focal scene
 *  lands comfortably framed rather than flush against the edges. */
export const CAMERA_INSET = { left: "8vw", top: "14vh" };
export const CAMERA_INSET_MOBILE = { left: "4vw", top: "10vh" };

/**
 * Nominal viewport aspect used to convert world units (vw for x, vh for y)
 * into one screen-space measure. Route geometry is deliberately expressed in
 * mixed units so scenes stay proportional to the viewport, but anything that
 * measures DISTANCE along the route -- which is now what allocates scroll --
 * needs a single ratio. 1.6 is 1440x900 exactly.
 */
export const VW_PER_VH = 1.6;

/**
 * ROUTE ONE -- the evidence region, descending left-to-right.
 * ROUTE TWO -- the thinking region, reached only through the break, starting
 * at the world's deepest and left-most point and climbing back up and right.
 *
 * Unchanged from V3: the route was reviewed as correct, and §6 of the V4
 * brief requires the curve to still travel through these scenes.
 */
export const SCENES: readonly SceneConfig[] = [
  { id: "hero", world: { x: 0, y: 0 }, mobileWorld: { x: 0, y: 0 } },
  { id: "kivilcim", world: { x: 120, y: 86 }, mobileWorld: { x: 0, y: 128 } },
  { id: "dropspot", world: { x: 242, y: 162 }, mobileWorld: { x: 0, y: 268 } },
  { id: "tail", world: { x: 322, y: 244 }, mobileWorld: { x: 0, y: 392 } },
  { id: "reorient", world: { x: -14, y: 452 }, mobileWorld: { x: 0, y: 620 } },
  { id: "approach", world: { x: 132, y: 386 }, mobileWorld: { x: 0, y: 748 } },
  { id: "handoff", world: { x: 264, y: 348 }, mobileWorld: { x: 0, y: 872 } },
] as const;

export const SCENE_IDS: readonly SceneId[] = SCENES.map((scene) => scene.id);

export const ROUTE_ONE_IDS = ["hero", "kivilcim", "dropspot", "tail"] as const;
export const ROUTE_TWO_IDS = ["reorient", "approach", "handoff"] as const;

/** The wall route one runs into. A camera-only event, not a scene. */
export const COLLISION_WORLD: WorldPoint = { x: 352, y: 268 };
export const COLLISION_MOBILE_WORLD: WorldPoint = { x: 0, y: 470 };

/** How far past the stopping point the visible boundary is drawn. */
export const WALL_MARKER_OFFSET = 46;

/**
 * Progress spent stopped dead at the wall. THE ONE PLACE in V4 where the
 * camera is deliberately stationary while scroll continues -- it is the
 * impact, and it is short.
 */
export const IMPACT_WINDOW = 0.045;
/** Break panel timing, relative to the cut. */
export const BREAK_COVER_LEAD = 0.024;
export const BREAK_REVEAL_TAIL = 0.026;

/** Horizontal rails the break is built from. */
export const SCENE_BREAK_BANDS = 7;

/**
 * Reading allowance added to every segment's scroll weight, in vh-equivalent
 * screen units. This is what buys time at a scene now that no scene parks the
 * camera: a segment gets scroll proportional to (distance travelled +
 * allowance), and the velocity profile spends that allowance at the two ends,
 * where a scene is framed.
 */
export const FOCUS_ALLOWANCE = 74;

/**
 * Camera speed at a scene, as a fraction of the route's average speed.
 * The brief's conceptual range is 0.12-0.30 against a normal travel of 1.0;
 * this sits inside it, and the mid-segment peak lands near 1.35x average, so
 * the whole journey moves within roughly a 5x band instead of V3's 0x-to-20x.
 */
export const FOCUS_SPEED_RATIO = 0.26;

/**
 * Total scroll driving the route, in viewport heights. Lower than V3's 420vh
 * on purpose (§24): with literal dwell removed, scroll no longer has to be
 * spent standing still, so the same reading time costs less distance.
 */
export const ROUTE_LENGTH_VH = 340;

/**
 * Depth planes (§12). The middle plane is the world itself and is pinned at
 * exactly 1.0 on purpose: the route rails, registration ticks and wall
 * boundary are DERIVED from the camera path, so parallaxing them would make
 * the world's own orientation system point at the wrong place. Depth is
 * therefore built around that plane -- material behind it, material in front
 * of it -- rather than by sliding it.
 */
export const PLANE_DISTANT = 0.62;
export const PLANE_WORLD = 1;
export const PLANE_NEAR = 1.13;

/** Scale a scene resolves through as the camera arrives (§15). A few percent. */
export const SCENE_SCALE_FAR = 0.972;
export const SCENE_SCALE_FOCUS = 1;

export function sceneById(id: SceneId): SceneConfig {
  const scene = SCENES.find((entry) => entry.id === id);
  if (!scene) throw new Error(`unknown scene: ${id}`);
  return scene;
}

export function sceneAnchor(id: SceneId, mobile = false): WorldPoint {
  const scene = sceneById(id);
  return mobile ? scene.mobileWorld : scene.world;
}

/** Distance between two world points in one screen measure (vh-equivalents). */
export function screenDistance(a: WorldPoint, b: WorldPoint): number {
  return Math.hypot((b.x - a.x) * VW_PER_VH, b.y - a.y);
}
