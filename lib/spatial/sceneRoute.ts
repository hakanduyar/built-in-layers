// Spatial Portfolio prototype (feature/spatial-portfolio, not merged to
// main -- see docs/DESIGN_SYSTEM.md §18). Pure route/camera math, no JSX,
// no "use client" -- unit-testable in isolation (tests/unit/spatial-route.test.ts).
//
// Model: a small "world" of named content nodes at fixed coordinates. The
// camera's position is a function of scroll progress (0..1) that
// interpolates smoothly between nodes, hits a "collision" wall past the
// last content node, then -- deliberately, not smoothly -- reposition-jumps
// to a final node in a different region of the world. That discontinuity is
// the mechanical expression of "collision != bounce": the camera does not
// ease, reverse, or spring back onto the same path, it breaks to a new one.

export type RouteId = "hero" | "kivilcim" | "dropspot" | "tail" | "sceneTwo";

export type WorldPoint = { x: number; y: number };

export const ROUTE_ORDER: readonly RouteId[] = ["hero", "kivilcim", "dropspot", "tail", "sceneTwo"];

// World coordinates in vw/vh units, desktop: x and y both increase together
// (a genuine diagonal), until sceneTwo -- which sits back toward the left
// edge at a much larger y, so arriving there reads as a new region, not a
// continuation of the diagonal.
export const DESKTOP_NODE_POSITION: Record<RouteId, WorldPoint> = {
  hero: { x: 0, y: 0 },
  kivilcim: { x: 20, y: 14 },
  dropspot: { x: 40, y: 27 },
  tail: { x: 52, y: 34 },
  sceneTwo: { x: 8, y: 62 },
};

// Mobile: same nodes, same order, same content -- "same world" -- but the
// camera choreography is purely vertical (x stays 0), per the brief's
// "mobile = same world, different camera choreography" requirement. Gaps
// are much larger than desktop's: with no horizontal separation to keep
// neighbors apart, each node needs roughly its own real card height
// (title, description, tech list, figure) worth of clear vertical run so
// adjacent nodes don't visually overlap when one is camera-centered --
// confirmed empirically (an earlier, tighter spacing genuinely overlapped
// in a real browser at 375px, caught by direct screenshot QA).
export const MOBILE_NODE_POSITION: Record<RouteId, WorldPoint> = {
  hero: { x: 0, y: 0 },
  kivilcim: { x: 0, y: 130 },
  dropspot: { x: 0, y: 280 },
  tail: { x: 0, y: 380 },
  sceneTwo: { x: 0, y: 520 },
};

// Progress (0..1) at which the camera is centered exactly on each node.
export const NODE_PROGRESS: Record<RouteId, number> = {
  hero: 0,
  kivilcim: 0.2,
  dropspot: 0.4,
  tail: 0.52,
  sceneTwo: 1,
};

// Camera-only event: not a content node. The route keeps heading past
// "tail" and reaches a wall here.
const DESKTOP_COLLISION_POINT: WorldPoint = { x: 60, y: 40 };
const MOBILE_COLLISION_POINT: WorldPoint = { x: 0, y: 440 };

export const COLLISION_PROGRESS = 0.6;
/** Impact/shake window closes here; the reposition snap happens exactly at this progress. */
export const IMPACT_END_PROGRESS = 0.66;
export const IMPACT_BAND: readonly [number, number] = [COLLISION_PROGRESS, IMPACT_END_PROGRESS];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPoint(a: WorldPoint, b: WorldPoint, t: number): WorldPoint {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

/**
 * Camera world-position at a given scroll progress. Smooth interpolation
 * hero -> kivilcim -> dropspot -> tail -> collision wall; holds at the wall
 * through the impact window; then jumps -- with no interpolation, no
 * easing, no overshoot -- straight to sceneTwo. That jump is intentional:
 * it is the "scene break", not a bug to be smoothed over.
 */
export function cameraPosition(progress: number, mobile = false): WorldPoint {
  const nodes = mobile ? MOBILE_NODE_POSITION : DESKTOP_NODE_POSITION;
  const collision = mobile ? MOBILE_COLLISION_POINT : DESKTOP_COLLISION_POINT;
  const p = clamp01(progress);

  if (p <= NODE_PROGRESS.kivilcim) {
    return lerpPoint(nodes.hero, nodes.kivilcim, p / NODE_PROGRESS.kivilcim);
  }
  if (p <= NODE_PROGRESS.dropspot) {
    const t = (p - NODE_PROGRESS.kivilcim) / (NODE_PROGRESS.dropspot - NODE_PROGRESS.kivilcim);
    return lerpPoint(nodes.kivilcim, nodes.dropspot, t);
  }
  if (p <= NODE_PROGRESS.tail) {
    const t = (p - NODE_PROGRESS.dropspot) / (NODE_PROGRESS.tail - NODE_PROGRESS.dropspot);
    return lerpPoint(nodes.dropspot, nodes.tail, t);
  }
  if (p <= COLLISION_PROGRESS) {
    const t = (p - NODE_PROGRESS.tail) / (COLLISION_PROGRESS - NODE_PROGRESS.tail);
    return lerpPoint(nodes.tail, collision, t);
  }
  if (p < IMPACT_END_PROGRESS) {
    // Impact window: the camera holds at the wall. It does not ease onward
    // and does not reverse toward "tail" -- no bounce.
    return collision;
  }
  return nodes.sceneTwo;
}

/** Which named node/event the camera is currently closest to -- drives the functional mono-label. */
export function currentRouteId(progress: number): RouteId | "collision" {
  const p = clamp01(progress);
  if (p < NODE_PROGRESS.kivilcim) return "hero";
  if (p < NODE_PROGRESS.dropspot) return "kivilcim";
  if (p < NODE_PROGRESS.tail) return "dropspot";
  if (p < COLLISION_PROGRESS) return "tail";
  if (p < IMPACT_END_PROGRESS) return "collision";
  return "sceneTwo";
}

export function isImpact(progress: number): boolean {
  const p = clamp01(progress);
  return p >= IMPACT_BAND[0] && p < IMPACT_BAND[1];
}

/** Fixed placement for a content node's own DOM wrapper -- world coordinates, not camera-relative. */
export function nodePosition(id: RouteId, mobile = false): WorldPoint {
  return mobile ? MOBILE_NODE_POSITION[id] : DESKTOP_NODE_POSITION[id];
}
