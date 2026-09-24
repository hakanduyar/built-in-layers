// Spatial Portfolio V7 (feature/spatial-portfolio-v5, not merged to main).
// THE SUPPORTING-PLANE GRAMMAR — one reusable choreography model for every
// project field plane, owner-specified in three beats:
//
//   ENTRY   the plane enters slightly BEFORE the foreground content. The
//           camera frame travels toward a scene from up-route, so whatever
//           sits nearer the approaching camera crosses into frame first: on
//           approach the plane is displaced BACK along the route's local
//           travel direction — toward the arriving camera — and eases home as
//           the scene resolves.
//   FOCUS   at focus the displacement is exactly zero, so the plane stands on
//           its REGISTERED position — every alignment decision made about a
//           plane's edges holds precisely when the scene is read.
//   EXIT    as the foreground leaves focus the plane lags behind,
//           progressively: the same back-along-route displacement, growing
//           superlinearly with departure, so the foreground visibly leads and
//           its ground visibly trails — a follower, not an attachment.
//
// One signed curve produces all three beats, continuous through zero:
//
//   displacement(approach) =
//     approach <= 0 :  -LEAD * |approach|            (eases in, linear)
//     approach  > 0 :  -LAG  * approach^EXIT_POWER   (falls behind, growing)
//
// negative = back along the local travel direction. Pure math, no JSX; the
// direction is DERIVED from the route at each scene's own focus, so the
// grammar cannot disagree with where the camera actually travels, on desktop
// or on the vertical mobile route.

import { VW_PER_VH, type SceneId } from "@/lib/spatial/scenes";
import { cameraPosition, sceneFocusProgress } from "@/lib/spatial/sceneRoute";

/** How far ahead of the content the plane enters, in vh-equivalent screen
 *  units.
 *
 *  V14 (owner finding B, §7): 8 -> 24. V10 measured the grammar as exact --
 *  lead 55-70px, 0px at focus, trail 96-102px -- and the owner's review of
 *  the same frames was that "the behavior does not read visually". Both were
 *  true: against a 1180px composition a 70px lead is below the threshold at
 *  which a plane reads as ARRIVING rather than as attached. 24 units is ~215px
 *  at the reference viewport: a plane visibly in place before its composition
 *  resolves onto it. */
export const PLANE_LEAD = 24;

/** Peak trailing distance once the scene has fully departed. Roughly twice
 *  the entry lead -- leaving is the half the eye tracks.
 *
 *  V14: 17 -> 56 (~500px at the reference viewport). Release has to be seen
 *  to be believed: the composition lifts off and its ground stays behind by
 *  close to half a scene, so the exit reads as a deliberate departure from a
 *  place rather than as a card sliding out of frame. */
export const PLANE_LAG = 56;

/** Exit growth: >1 so the lag ACCELERATES with departure ("progressively"). */
export const EXIT_POWER = 1.6;

export type PlaneShift = { xVw: number; yVh: number };

/**
 * Unit direction of travel through a scene, in screen space, converted back
 * to (vw, vh) components. Sampled across the focus point on the real curve,
 * so a scene on the bend gets the bend's own bearing.
 */
export function sceneTravelDirection(scene: SceneId, mobile = false): PlaneShift {
  const focus = sceneFocusProgress(scene, mobile);
  const epsilon = 0.012;
  const before = cameraPosition(Math.max(focus - epsilon, 0), mobile);
  const after = cameraPosition(Math.min(focus + epsilon, 1), mobile);
  const dxScreen = (after.x - before.x) * VW_PER_VH;
  const dyScreen = after.y - before.y;
  const length = Math.hypot(dxScreen, dyScreen) || 1;
  return { xVw: dxScreen / length / VW_PER_VH, yVh: dyScreen / length };
}

/**
 * The grammar itself: displacement (in vw/vh) for a signed approach value
 * (-1 arriving … 0 focused … +1 departed).
 */
export function planeShift(
  approach: number,
  direction: PlaneShift,
  lead = PLANE_LEAD,
  lag = PLANE_LAG,
): PlaneShift {
  const clamped = Math.max(-1, Math.min(1, approach));
  const amount = clamped <= 0 ? -lead * Math.abs(clamped) : -lag * Math.pow(clamped, EXIT_POWER);
  return { xVw: direction.xVw * amount, yVh: direction.yVh * amount };
}
