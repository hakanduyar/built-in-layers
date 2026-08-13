// Spatial Portfolio V2 (feature/spatial-portfolio-v2, not merged to main --
// see docs/DESIGN_SYSTEM.md §18). Scene DATA only: where each scene lives in
// the world and when the camera owns it. No JSX, no camera math (that stays
// in sceneRoute.ts, which imports this) -- the separation V1 lacked.
//
// V1's fundamental visual error was that this layer did not exist: there
// were world coordinates but no scenes, so the camera flew across a huge
// canvas containing small floating cards. V2 inverts that: a scene is a
// viewport-scale composition that temporarily OWNS the viewport, and the
// world exists to hold scenes apart, not to be admired for its size.

export type SceneId = "hero" | "kivilcim" | "dropspot" | "tail" | "sceneTwo";

export type WorldPoint = { x: number; y: number };

export type SceneConfig = {
  id: SceneId;
  /** Desktop world anchor, in vw/vh. The camera targets this point. */
  world: WorldPoint;
  /**
   * Mobile world anchor. x is always 0 -- "same world, same scenes,
   * different choreography" (§25): reproducing the desktop diagonal on a
   * 375px screen is exactly what made V1's content feel tiny.
   */
  mobileWorld: WorldPoint;
  /** Progress at which the camera is centred on this scene. */
  focus: number;
  /** Progress until which the camera dwells here, letting the scene be read. */
  holdUntil: number;
};

// Scene block geometry, shared by the camera (for framing) and the scene
// components themselves (for sizing) so the two can never drift apart.
// A scene is deliberately close to viewport-scale: at 1440x900 this is
// 1180x648 CSS px, i.e. ~82% of the viewport width -- inside the 55-85%
// art-direction range the brief sets for major evidence, and roughly 5x
// the linear size of V1's `max-w-sm` (384px) floating cards.
export const SCENE_WIDTH = "min(84vw, 1180px)";
export const SCENE_WIDTH_MOBILE = "92vw";
export const SCENE_MIN_HEIGHT = "72vh";

/** Inset of the world layer inside the sticky viewport, so a focal scene
 *  lands comfortably framed rather than flush against the edges. */
export const CAMERA_INSET = { left: "8vw", top: "14vh" };
export const CAMERA_INSET_MOBILE = { left: "4vw", top: "10vh" };

/**
 * World anchors are spaced so that neighbouring scenes never overlap
 * (V1 shipped a real overlap bug at 375px) while leaving a genuine but
 * short travel gap between them -- roughly 0.4-0.6 viewport of empty world
 * between the trailing edge of one scene and the leading edge of the next.
 * Deltas deliberately vary (steeper, shallower, steeper) rather than
 * repeating one zig-zag angle.
 */
export const SCENES: readonly SceneConfig[] = [
  {
    id: "hero",
    world: { x: 0, y: 0 },
    mobileWorld: { x: 0, y: 0 },
    focus: 0,
    holdUntil: 0.1,
  },
  {
    id: "kivilcim",
    world: { x: 120, y: 86 },
    mobileWorld: { x: 0, y: 128 },
    focus: 0.25,
    holdUntil: 0.35,
  },
  {
    id: "dropspot",
    world: { x: 242, y: 162 },
    mobileWorld: { x: 0, y: 268 },
    focus: 0.5,
    holdUntil: 0.6,
  },
  {
    id: "tail",
    world: { x: 322, y: 244 },
    mobileWorld: { x: 0, y: 392 },
    focus: 0.72,
    holdUntil: 0.76,
  },
  {
    id: "sceneTwo",
    world: { x: 52, y: 392 },
    mobileWorld: { x: 0, y: 560 },
    focus: 0.87,
    holdUntil: 1,
  },
] as const;

export const SCENE_IDS: readonly SceneId[] = SCENES.map((scene) => scene.id);

/**
 * The wall the camera runs into after the tail. A camera-only event, not a
 * scene -- nothing is composed here, which is precisely why hitting it
 * reads as an ending rather than an arrival.
 */
export const COLLISION_WORLD: WorldPoint = { x: 366, y: 286 };
export const COLLISION_MOBILE_WORLD: WorldPoint = { x: 0, y: 470 };

/** Camera reaches the wall and stops dead here. */
export const COLLISION_PROGRESS = 0.82;
/**
 * The scene break. A full-bleed panel wipes across, the route jumps
 * discontinuously behind it, then it wipes away to reveal the new region.
 * V1 made this jump mathematically correct but perceptually a teleport;
 * bridging it with a real wipe is what turns it into an edit.
 */
export const BREAK_COVER_START = 0.845;
export const BREAK_CUT = 0.87;
export const BREAK_REVEAL_END = 0.895;

/**
 * Total scroll distance driving the whole route, in viewport heights.
 * V1 used a flat 600vh spacer that produced enormous dead travel; this is
 * derived from what the five scenes and the break actually need (dwell to
 * read each scene + short travel between them) and is 40% shorter.
 */
export const ROUTE_LENGTH_VH = 360;

export function sceneById(id: SceneId): SceneConfig {
  const scene = SCENES.find((entry) => entry.id === id);
  if (!scene) throw new Error(`unknown scene: ${id}`);
  return scene;
}

export function sceneAnchor(id: SceneId, mobile = false): WorldPoint {
  const scene = sceneById(id);
  return mobile ? scene.mobileWorld : scene.world;
}
