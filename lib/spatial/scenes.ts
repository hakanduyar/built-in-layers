// Spatial Portfolio V3 (feature/spatial-portfolio-v3, not merged to main --
// see docs/DESIGN_SYSTEM.md §18). Scene DATA only: where each scene lives in
// the world and when the camera owns it. No JSX, no camera math (that stays
// in sceneRoute.ts, which imports this).
//
// V2 established the scene layer and fixed V1's scale failure. V3's subject
// is CHOREOGRAPHY: V2 collided, repositioned, and then simply parked -- the
// spatial world effectively ended at the break and the page fell into
// ordinary vertical flow. V3 gives the world TWO routes: a descending
// right-diagonal through the evidence region, and -- after the break -- a
// genuinely new ascending right-diagonal back up through the thinking
// region. Both axes move on both routes; the slopes differ in sign and
// magnitude, so the second route can never read as a continuation of the
// first.

export type SceneId =
  "hero" | "kivilcim" | "dropspot" | "tail" | "reorient" | "approach" | "handoff";

export type WorldPoint = { x: number; y: number };

/**
 * Easing of the leg LEAVING this scene.
 * `gentle` holds the origin scene in frame noticeably longer before the
 * camera commits -- used for hero->kivilcim so the first movement reveals
 * that the hero was part of a larger world instead of yanking it away (§13).
 */
export type TravelEase = "gentle" | "standard";

export type SceneConfig = {
  id: SceneId;
  /** Desktop world anchor, in vw/vh. The camera targets this point. */
  world: WorldPoint;
  /**
   * Mobile world anchor. x is always 0 -- "same world, different camera
   * choreography" (§17): a large post-collision diagonal at 375px costs
   * readability and buys nothing, so mobile keeps the same scenes and the
   * same break on a single vertical axis.
   */
  mobileWorld: WorldPoint;
  /** Progress at which the camera is centred on this scene. */
  focus: number;
  /** Progress until which the camera dwells here, letting the scene be read. */
  holdUntil: number;
  travelEase?: TravelEase;
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
 * into a single screen-space direction. World geometry is deliberately
 * expressed in mixed units so scenes stay proportional to the viewport, but
 * anything that has to point ALONG the route on screen -- the hero's lead-in
 * rule, the erosion wind -- needs one ratio. 1.6 is 1440x900 exactly, and is
 * close enough across the common desktop range that no direction inverts.
 */
export const VW_PER_VH = 1.6;

/**
 * ROUTE ONE -- the evidence region. Descends left-to-right: the camera is
 * working its way down and across a surface. Deltas deliberately vary
 * (shallower, shallower still, steeper) rather than repeating one angle.
 *
 * ROUTE TWO -- the thinking region, reached only through the break. Starts
 * far to the LEFT and far BELOW everything on route one (the world's deepest
 * point, which is what "underneath" labels) and climbs back up and to the
 * right. Both legs rise, so every route-two slope is negative where every
 * route-one slope is positive.
 *
 * Dwell windows are tuned per scene, not set to one convenient constant
 * (§14): the hero opens calmly, Kıvılcım needs long enough to read a title
 * and an architecture diagram, DropSpot holds longest because a real product
 * screenshot is the strongest evidence on the route and deserves the time,
 * and the tail is a deliberately brief beat before the wall.
 */
export const SCENES: readonly SceneConfig[] = [
  {
    id: "hero",
    world: { x: 0, y: 0 },
    mobileWorld: { x: 0, y: 0 },
    focus: 0,
    holdUntil: 0.115,
    travelEase: "gentle",
  },
  {
    id: "kivilcim",
    world: { x: 120, y: 86 },
    mobileWorld: { x: 0, y: 128 },
    focus: 0.225,
    holdUntil: 0.335,
  },
  {
    id: "dropspot",
    world: { x: 242, y: 162 },
    mobileWorld: { x: 0, y: 268 },
    focus: 0.425,
    holdUntil: 0.56,
  },
  {
    id: "tail",
    world: { x: 322, y: 244 },
    mobileWorld: { x: 0, y: 392 },
    focus: 0.635,
    holdUntil: 0.665,
  },
  {
    id: "reorient",
    world: { x: -14, y: 452 },
    mobileWorld: { x: 0, y: 620 },
    focus: 0.75,
    holdUntil: 0.8,
  },
  {
    id: "approach",
    world: { x: 132, y: 386 },
    mobileWorld: { x: 0, y: 748 },
    focus: 0.87,
    holdUntil: 0.93,
  },
  {
    id: "handoff",
    world: { x: 264, y: 348 },
    mobileWorld: { x: 0, y: 872 },
    focus: 0.965,
    holdUntil: 1,
  },
] as const;

export const SCENE_IDS: readonly SceneId[] = SCENES.map((scene) => scene.id);

/** Scenes the camera physically travels between on each route. The break is
 *  the only way from one list to the other. */
export const ROUTE_ONE_IDS = ["hero", "kivilcim", "dropspot", "tail"] as const;
export const ROUTE_TWO_IDS = ["reorient", "approach", "handoff"] as const;

/**
 * The wall route one runs into. A camera-only event, not a scene -- nothing
 * is composed here, which is precisely why hitting it reads as an ending
 * rather than an arrival.
 */
// Deliberately close to the tail anchor: the collision is the camera being
// STOPPED, not the camera arriving somewhere else, so the tail composition
// must still hold the frame when it happens. An earlier pass put the wall
// 44vw/42vh out and the giant word had slid almost entirely off the left
// edge by the impact -- the frame was 80% empty paper and read as a debug
// screen rather than a composed moment (caught by screenshot review).
export const COLLISION_WORLD: WorldPoint = { x: 352, y: 268 };
export const COLLISION_MOBILE_WORLD: WorldPoint = { x: 0, y: 470 };

/**
 * How far past the stopping point the visible boundary is drawn. The camera
 * stops at COLLISION_WORLD; the rule marking the edge of the coordinate
 * system sits ahead of it, inside the frame, so the impact has something to
 * happen against instead of against empty paper. Tuned so the boundary sits
 * just clear of the eroding word's trailing edge at full stop.
 */
export const WALL_MARKER_OFFSET = 46;

/** Camera reaches the wall and stops dead here. */
export const COLLISION_PROGRESS = 0.7;
/**
 * The scene break. Rails slam shut across the viewport, the route jumps
 * discontinuously behind them at the cut, then they part in the opposite
 * direction to reveal the new region.
 */
export const BREAK_COVER_START = 0.725;
export const BREAK_CUT = 0.75;
export const BREAK_REVEAL_END = 0.775;

/** Horizontal rails the break is built from. Odd count so no single seam
 *  runs through the middle of the frame. */
export const SCENE_BREAK_BANDS = 7;

/**
 * Total scroll distance driving the whole route, in viewport heights.
 * V1 used a flat 600vh spacer with enormous dead travel; V2 cut it to 360vh
 * but had almost nothing after the break. V3 spends the extra 60vh entirely
 * on the second route (three more beats and two more travel legs) and is
 * still 30% shorter than V1.
 */
export const ROUTE_LENGTH_VH = 420;

export function sceneById(id: SceneId): SceneConfig {
  const scene = SCENES.find((entry) => entry.id === id);
  if (!scene) throw new Error(`unknown scene: ${id}`);
  return scene;
}

export function sceneAnchor(id: SceneId, mobile = false): WorldPoint {
  const scene = sceneById(id);
  return mobile ? scene.mobileWorld : scene.world;
}
