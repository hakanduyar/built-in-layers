// Spatial Portfolio V2 (feature/spatial-portfolio-v2, not merged to main --
// see docs/DESIGN_SYSTEM.md §18). Pure route/camera math, no JSX, no
// "use client" -- unit-testable in isolation (tests/unit/spatial-route.test.ts).
//
// Preserved from V1 (proven, deliberately not rewritten for novelty):
// normalized 0..1 progress, desktop/mobile coordinate separation, and the
// binding collision semantics -- the camera never eases past the wall and
// never reverses off it; it stops dead, then jumps discontinuously. That
// discontinuity is the reposition.
//
// Rebuilt for V2: the camera no longer interpolates between arbitrary
// points. It moves between SCENES (lib/spatial/scenes.ts), dwelling at each
// one so the scene can actually be read before the camera leaves, and the
// jump is now paired with a perceptual break window (see breakWipeOffset)
// so it reads as a cut rather than a teleport.

import {
  BREAK_COVER_START,
  BREAK_CUT,
  BREAK_REVEAL_END,
  COLLISION_MOBILE_WORLD,
  COLLISION_PROGRESS,
  COLLISION_WORLD,
  sceneAnchor,
  sceneById,
  type SceneConfig,
  type SceneId,
  type WorldPoint,
} from "@/lib/spatial/scenes";

export type { SceneId, WorldPoint };

/** Scenes the camera physically travels between, in route order. `sceneTwo`
 *  is deliberately absent: it is reached only by the reposition jump. */
const TRAVEL_SCENES: readonly SceneConfig[] = (
  ["hero", "kivilcim", "dropspot", "tail"] as const
).map((id) => sceneById(id));

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

/** The wall approach deliberately does NOT decelerate: the camera keeps
 *  building speed and is stopped by the wall, not by easing. */
function easeIn(t: number): number {
  return t * t;
}

/**
 * Camera world-position at a given scroll progress:
 * dwell at hero -> travel -> dwell at Kıvılcım -> travel -> dwell at
 * DropSpot -> travel -> tail -> accelerate into the wall -> hold dead at
 * the wall -> (discontinuous jump) -> sceneTwo.
 */
export function cameraPosition(progress: number, mobile = false): WorldPoint {
  const p = clamp01(progress);
  const wall = mobile ? COLLISION_MOBILE_WORLD : COLLISION_WORLD;

  // Past the cut the camera is simply AT sceneTwo. It never interpolates
  // from the wall -- no bounce, no fly-back, no smoothed return.
  if (p >= BREAK_CUT) return sceneAnchor("sceneTwo", mobile);

  for (const [index, scene] of TRAVEL_SCENES.entries()) {
    // Dwell: the scene owns the viewport and the camera holds still.
    if (p <= scene.holdUntil) return sceneAnchor(scene.id, mobile);

    const next = TRAVEL_SCENES[index + 1];

    if (next) {
      if (p <= next.focus) {
        const t = (p - scene.holdUntil) / (next.focus - scene.holdUntil);
        return lerpPoint(sceneAnchor(scene.id, mobile), sceneAnchor(next.id, mobile), easeInOut(t));
      }
      continue;
    }

    // Last composed scene (the tail): accelerate into the wall.
    if (p <= COLLISION_PROGRESS) {
      const t = (p - scene.holdUntil) / (COLLISION_PROGRESS - scene.holdUntil);
      return lerpPoint(sceneAnchor(scene.id, mobile), wall, easeIn(t));
    }
    // Stopped dead at the wall for the impact + cover window.
    return wall;
  }

  return sceneAnchor("hero", mobile);
}

/** Which scene currently owns the camera, or the camera-only collision event. */
export function currentSceneId(progress: number): SceneId | "collision" {
  const p = clamp01(progress);
  if (p >= BREAK_CUT) return "sceneTwo";
  if (p >= COLLISION_PROGRESS) return "collision";

  for (const [index, scene] of TRAVEL_SCENES.entries()) {
    if (p <= scene.holdUntil) return scene.id;
    const next = TRAVEL_SCENES[index + 1];
    if (next && p <= next.focus) {
      // Mid-travel belongs to whichever scene the camera is closer to.
      const midpoint = (scene.holdUntil + next.focus) / 2;
      return p < midpoint ? scene.id : next.id;
    }
  }
  return "tail";
}

/** True only while the camera is stopped dead at the wall. */
export function isImpact(progress: number): boolean {
  const p = clamp01(progress);
  return p >= COLLISION_PROGRESS && p < BREAK_CUT;
}

/**
 * Rising 0..1 tension as the camera accelerates into the wall, so the tail
 * composition can visually compress before the hit instead of the impact
 * arriving unannounced.
 */
export function approachTension(progress: number): number {
  const p = clamp01(progress);
  const tailHold = sceneById("tail").holdUntil;
  if (p <= tailHold) return 0;
  if (p >= COLLISION_PROGRESS) return 1;
  return (p - tailHold) / (COLLISION_PROGRESS - tailHold);
}

/**
 * Horizontal offset of the scene-break panel, in percent of its own width:
 * +100 = parked off-screen right (inactive), 0 = fully covering the
 * viewport (the instant the route cuts), -100 = swept off to the left,
 * revealing the new region. The route's discontinuity happens at BREAK_CUT,
 * exactly when this reads 0 -- so the jump is never actually witnessed.
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

/** Whether the break panel is on screen at all (skip rendering otherwise). */
export function isBreakActive(progress: number): boolean {
  const p = clamp01(progress);
  return p > BREAK_COVER_START && p < BREAK_REVEAL_END;
}

/** True once the reposition has happened -- drives the orientation cue. */
export function hasRepositioned(progress: number): boolean {
  return clamp01(progress) >= BREAK_CUT;
}
