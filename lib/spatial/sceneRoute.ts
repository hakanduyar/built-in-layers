// Spatial Portfolio V3 (feature/spatial-portfolio-v3, not merged to main --
// see docs/DESIGN_SYSTEM.md §18). Pure route/camera math, no JSX, no
// "use client" -- unit-testable in isolation (tests/unit/spatial-route.test.ts).
//
// Preserved from V1/V2 (proven, deliberately not rewritten for novelty):
// normalized 0..1 progress, desktop/mobile coordinate separation, scene
// dwell, and the binding collision semantics -- the camera never eases past
// the wall and never reverses off it; it stops dead, then jumps
// discontinuously. That discontinuity is the reposition.
//
// New in V3: the reposition lands on a SECOND ROUTE rather than on a parked
// end-state. Route one descends left-to-right through the evidence region;
// route two climbs back up and to the right through the thinking region.
// Everything below that could silently degrade into "straight down" -- a
// route leg with no horizontal component, or a second route that merely
// repeats the first slope -- is asserted against in the unit suite.

import {
  BREAK_COVER_START,
  BREAK_CUT,
  BREAK_REVEAL_END,
  COLLISION_MOBILE_WORLD,
  COLLISION_PROGRESS,
  COLLISION_WORLD,
  ROUTE_ONE_IDS,
  ROUTE_TWO_IDS,
  VW_PER_VH,
  sceneAnchor,
  sceneById,
  type SceneId,
  type WorldPoint,
} from "@/lib/spatial/scenes";

export type { SceneId, WorldPoint };

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPoint(a: WorldPoint, b: WorldPoint, t: number): WorldPoint {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

/** Camera accelerates away from a scene and decelerates into the next one --
 *  the difference between "arriving somewhere" and V1's constant-velocity
 *  drift past things. */
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/** Smootherstep. Sits near 0 (and near 1) for longer than easeInOut, so the
 *  origin scene stays readable well into the leg -- the "gentle first travel
 *  phase" the hero needs so it is discovered to be part of a world rather
 *  than snatched out of frame (§13). */
function easeGentle(t: number): number {
  return t * t * t * (t * (6 * t - 15) + 10);
}

/** The wall approach deliberately does NOT decelerate: the camera keeps
 *  building speed and is stopped by the wall, not by easing. */
function easeIn(t: number): number {
  return t * t;
}

/**
 * Walks a route's scenes: dwell inside each hold window, eased travel
 * between them. Returns null once progress is past the last scene's hold,
 * leaving the caller to decide what happens beyond the route.
 */
function travelAlong(
  ids: readonly SceneId[],
  progress: number,
  mobile: boolean,
): WorldPoint | null {
  for (const [index, id] of ids.entries()) {
    const scene = sceneById(id);
    if (progress <= scene.holdUntil) return sceneAnchor(id, mobile);

    const nextId = ids[index + 1];
    if (!nextId) return null;

    const next = sceneById(nextId);
    if (progress <= next.focus) {
      const t = (progress - scene.holdUntil) / (next.focus - scene.holdUntil);
      const ease = scene.travelEase === "gentle" ? easeGentle : easeInOut;
      return lerpPoint(sceneAnchor(id, mobile), sceneAnchor(nextId, mobile), ease(t));
    }
  }
  return null;
}

/**
 * Camera world-position at a given scroll progress.
 *
 * route one: hero -> kivilcim -> dropspot -> tail -> accelerate into the
 * wall -> hold dead at the wall -> (discontinuous jump at the cut) ->
 * route two: reorient -> approach -> handoff.
 */
export function cameraPosition(progress: number, mobile = false): WorldPoint {
  const p = clamp01(progress);

  if (p >= BREAK_CUT) {
    // Past the cut the camera is on route two immediately -- it never
    // interpolates from the wall. No bounce, no fly-back, no smoothed
    // return, and no parked end-state either: a new diagonal starts here.
    return travelAlong(ROUTE_TWO_IDS, p, mobile) ?? sceneAnchor("handoff", mobile);
  }

  const onRouteOne = travelAlong(ROUTE_ONE_IDS, p, mobile);
  if (onRouteOne) return onRouteOne;

  const wall = mobile ? COLLISION_MOBILE_WORLD : COLLISION_WORLD;
  const tail = sceneById("tail");
  if (p <= COLLISION_PROGRESS) {
    const t = (p - tail.holdUntil) / (COLLISION_PROGRESS - tail.holdUntil);
    return lerpPoint(sceneAnchor("tail", mobile), wall, easeIn(t));
  }
  // Stopped dead at the wall for the impact + cover window.
  return wall;
}

/** Which scene currently owns the camera, or the camera-only collision event. */
export function currentSceneId(progress: number): SceneId | "collision" {
  const p = clamp01(progress);
  const ids = p >= BREAK_CUT ? ROUTE_TWO_IDS : ROUTE_ONE_IDS;
  if (p >= COLLISION_PROGRESS && p < BREAK_CUT) return "collision";

  for (const [index, id] of ids.entries()) {
    const scene = sceneById(id);
    if (p <= scene.holdUntil) return id;
    const nextId = ids[index + 1];
    if (!nextId) break;
    if (p <= sceneById(nextId).focus) {
      // Mid-travel belongs to whichever scene the camera is closer to.
      const midpoint = (scene.holdUntil + sceneById(nextId).focus) / 2;
      return p < midpoint ? id : nextId;
    }
  }
  return ids[ids.length - 1]!;
}

/** True only while the camera is stopped dead at the wall. */
export function isImpact(progress: number): boolean {
  const p = clamp01(progress);
  return p >= COLLISION_PROGRESS && p < BREAK_CUT;
}

/**
 * Rising 0..1 tension as the camera accelerates into the wall. Drives the
 * things that make the collision specific to this system rather than a
 * generic transition: the coordinate rules converging on the boundary, and
 * the expressive word compressing toward it.
 */
export function approachTension(progress: number): number {
  const p = clamp01(progress);
  const tailHold = sceneById("tail").holdUntil;
  if (p <= tailHold) return 0;
  if (p >= COLLISION_PROGRESS) return 1;
  return (p - tailHold) / (COLLISION_PROGRESS - tailHold);
}

/**
 * Horizontal offset of the break's base ink field, in percent of its own
 * width: +100 = parked off-screen right, 0 = fully covering, -100 = swept
 * off left. Linear on purpose -- every rail (below) runs a faster curve, so
 * this field is the last thing to close and guarantees full cover at the cut
 * even though the rails are what the eye actually reads.
 */
export function breakWipeOffset(progress: number): number {
  const p = clamp01(progress);
  if (p <= BREAK_COVER_START) return 100;
  if (p >= BREAK_REVEAL_END) return -100;
  if (p <= BREAK_CUT) {
    const t = (p - BREAK_COVER_START) / (BREAK_CUT - BREAK_COVER_START);
    return lerp(100, 0, t);
  }
  const t = (p - BREAK_CUT) / (BREAK_REVEAL_END - BREAK_CUT);
  return lerp(0, -100, t);
}

/**
 * Horizontal offset of one break rail, in percent of its own width.
 *
 * Two things make this the world's own grammar rather than a slideshow
 * wipe: rails alternate the side they close from (even from the right, odd
 * from the left, so the coordinate system converges rather than sweeps), and
 * each runs a different power curve so they arrive unevenly, like alignment
 * snapping shut. Every curve passes through exactly 0 at BREAK_CUT, so the
 * route's discontinuity is still never witnessed through a gap.
 */
export function breakBandOffset(progress: number, index: number): number {
  const p = clamp01(progress);
  const direction = index % 2 === 0 ? 1 : -1;
  // Deterministic, non-monotonic spread across 1.35..2.31 -- adjacent rails
  // never share an arrival rate, and the sequence does not read as a ramp.
  const speed = 1.35 + ((index * 3) % 4) * 0.32;

  if (p <= BREAK_COVER_START) return direction * 100;
  if (p >= BREAK_REVEAL_END) return -direction * 100;
  if (p <= BREAK_CUT) {
    const t = (p - BREAK_COVER_START) / (BREAK_CUT - BREAK_COVER_START);
    return direction * 100 * (1 - t) ** speed;
  }
  const t = (p - BREAK_CUT) / (BREAK_REVEAL_END - BREAK_CUT);
  return -direction * 100 * t ** speed;
}

/** Whether the break is on screen at all (skip rendering otherwise). */
export function isBreakActive(progress: number): boolean {
  const p = clamp01(progress);
  return p > BREAK_COVER_START && p < BREAK_REVEAL_END;
}

/** True once the reposition has happened -- i.e. the camera is on route two. */
export function hasRepositioned(progress: number): boolean {
  return clamp01(progress) >= BREAK_CUT;
}

export type RouteLeg = {
  from: WorldPoint;
  to: WorldPoint;
  /** Progress at which the camera leaves `from` and arrives at `to`. */
  fromProgress: number;
  toProgress: number;
  route: 1 | 2;
};

/**
 * The route as travelled, leg by leg. The world-grammar layer draws its
 * rails straight from this, so the orientation marks in the empty travel
 * space are derived from the actual camera path and cannot describe a route
 * the camera does not take.
 */
export function routeLegs(mobile = false): RouteLeg[] {
  const legs: RouteLeg[] = [];

  const push = (ids: readonly SceneId[], route: 1 | 2) => {
    for (const [index, id] of ids.entries()) {
      const nextId = ids[index + 1];
      if (!nextId) break;
      legs.push({
        from: sceneAnchor(id, mobile),
        to: sceneAnchor(nextId, mobile),
        fromProgress: sceneById(id).holdUntil,
        toProgress: sceneById(nextId).focus,
        route,
      });
    }
  };

  push(ROUTE_ONE_IDS, 1);
  legs.push({
    from: sceneAnchor("tail", mobile),
    to: mobile ? COLLISION_MOBILE_WORLD : COLLISION_WORLD,
    fromProgress: sceneById("tail").holdUntil,
    toProgress: COLLISION_PROGRESS,
    route: 1,
  });
  push(ROUTE_TWO_IDS, 2);

  return legs;
}

/**
 * Overall slope of a route in world units (dy/dx). Route one is positive
 * (descending to the right), route two negative (climbing to the right) --
 * the property that stops the post-collision journey from reading as more
 * of the same.
 */
export function routeSlope(route: 1 | 2, mobile = false): number {
  const ids = route === 1 ? ROUTE_ONE_IDS : ROUTE_TWO_IDS;
  const from = sceneAnchor(ids[0]!, mobile);
  const to =
    route === 1
      ? mobile
        ? COLLISION_MOBILE_WORLD
        : COLLISION_WORLD
      : sceneAnchor(ids[ids.length - 1]!, mobile);
  return (to.y - from.y) / (to.x - from.x);
}

/**
 * Screen-space direction the erosion fragments travel, derived from the
 * collision-approach leg rather than art-directed by hand.
 *
 * The camera advances down-and-right into the wall, so on screen the world
 * (and the giant word standing in it) slides up-and-left. Fragments torn off
 * the word are left behind by that motion, i.e. they trail along the exact
 * opposite screen vector. This is what ties the atmosphere to the route
 * instead of merely animating around a word (§18).
 */
export function travelWindVector(): WorldPoint {
  const from = sceneAnchor("tail");
  const to = COLLISION_WORLD;
  const screenX = (to.x - from.x) * VW_PER_VH;
  const screenY = to.y - from.y;
  const length = Math.hypot(screenX, screenY) || 1;
  return { x: screenX / length, y: screenY / length };
}

/**
 * Size of the hero's structural lead-in rule, in vw/vh, so it runs at the
 * same screen angle as the first travel leg. Because both the rule and the
 * world use vw for x and vh for y, matching the angle is simply matching the
 * world delta's ratio -- the hero's composition therefore points exactly
 * where the camera is about to go, and cannot drift if the route moves.
 */
export function heroLeadRule(widthVw: number): { width: number; height: number } {
  const from = sceneAnchor("hero");
  const to = sceneAnchor("kivilcim");
  return { width: widthVw, height: (widthVw * (to.y - from.y)) / (to.x - from.x) };
}
