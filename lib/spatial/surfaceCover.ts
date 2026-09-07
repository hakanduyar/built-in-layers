import {
  BREAK_COVER_CLOSED,
  BREAK_COVER_START,
  BREAK_REVEAL_END,
  BREAK_REVEAL_START,
} from "@/lib/spatial/sceneRoute";

// V14.2 GATE B -- THE COVER IS THE UNDERSIDE OF THE SURFACE.
//
// The route's one discontinuity still has to happen behind an opaque frame,
// on exactly the timing the scroll system protects (BREAK_COVER_START ..
// BREAK_REVEAL_END, with the dwell either side of the cut fully covered --
// lib/spatial/sceneRoute.ts, untouched). What changed is the MATERIAL of the
// cover, and therefore its motion.
//
// V4's cover was ink: eleven raked rails snapping shut from alternating sides
// over a solid field. On the owner's review it read as a render glitch rather
// than as the world opening, and worse in reverse, where a black block
// interrupted a return. The world already has an opening: the SYSTEMS surface
// is cut along the route's bearing and the camera descends through the cut
// into the recess -- the 2.5%-ink ground that route two then travels. So the
// cover is now that ground, in the frame's own space: the same tone as the
// recess the world is already showing under the seam, carrying the section
// the reveal drew (three strata and the descent to SYSTEM) at rest. It
// arrives as a tone-matched fade rather than a wipe, because a plane of the
// same material as the ground beneath it has no edge worth drawing; what the
// reader watches is the world's own seam finishing its rise, then the
// structure standing still, then UNDERNEATH standing on the same SYSTEM line.
//
// The functions are pure and progress-driven, like every other visual in the
// world, and they honour the same contract the rails did: fully opaque from
// BREAK_COVER_CLOSED to BREAK_REVEAL_START, nothing outside the cover window.

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/**
 * Opacity of the cover field, 0..1. Exactly 1 through the dwell (the cut is
 * genuinely unwitnessed), a smooth rise over the closing, a smooth fall over
 * the reveal, and exactly 0 outside the window.
 */
export function coverOpacity(progress: number): number {
  const p = clamp01(progress);
  if (p <= BREAK_COVER_START || p >= BREAK_REVEAL_END) return 0;
  // V14.4: DECISIVE. The black state arrives within the first 40% of the
  // closing window and leaves within the last 40% of the reveal, holding
  // through the dwell between -- a state change with a clear edge in time,
  // not a slow fade. Same window, same contract, steeper curve.
  if (p < BREAK_COVER_CLOSED) {
    return smooth((p - BREAK_COVER_START) / ((BREAK_COVER_CLOSED - BREAK_COVER_START) * DECISIVE));
  }
  if (p <= BREAK_REVEAL_START) return 1;
  const u = (p - BREAK_REVEAL_START) / (BREAK_REVEAL_END - BREAK_REVEAL_START);
  return 1 - smooth((u - (1 - DECISIVE)) / DECISIVE);
}

/** The fraction of each half of the cover window the black state takes to
 *  arrive or leave. */
const DECISIVE = 0.4;

/**
 * Presence of the section's upper strata (SURFACE, FLOW) and the descent:
 * they lag the field in like the rest of the section, but on the way out
 * they stay with the field. The world has no SURFACE or FLOW line in the
 * landing frame (at world scale both are above it), so nothing doubles, and
 * UNDERNEATH is read standing at the foot of a section that is still there
 * as the camera settles -- the consequence, not the next heading.
 */
export function upperSectionPresence(progress: number): number {
  const p = clamp01(progress);
  if (p < BREAK_COVER_CLOSED) return sectionPresence(p);
  return coverOpacity(p);
}

/**
 * The landing's own drift, 1..0 across the reveal and 1 everywhere before it:
 * the section the cover carries is the landing's geometry, and the landing
 * decompresses toward its focus while the cover lets go, so the section
 * travels with it -- the same distance, in the same direction -- rather than
 * standing still while the world moves under it.
 */
export function landingDrift(progress: number): number {
  const p = clamp01(progress);
  if (p <= BREAK_REVEAL_START) return 1;
  if (p >= BREAK_REVEAL_END) return 0;
  return 1 - (p - BREAK_REVEAL_START) / (BREAK_REVEAL_END - BREAK_REVEAL_START);
}

/**
 * Presence of the stratum LABELS, 0..1: in with the section, out ahead of
 * everything else. The world's own SYSTEM label arrives under the cover's as
 * it lets go, and two words on one spot read as a smudge, so the cover's
 * names are gone within the first quarter of the reveal.
 */
export function labelPresence(progress: number): number {
  const p = clamp01(progress);
  if (p < BREAK_COVER_CLOSED) return sectionPresence(p);
  if (p <= BREAK_REVEAL_START) return 1;
  const openSpan = BREAK_REVEAL_END - BREAK_REVEAL_START;
  return 1 - smooth((p - BREAK_REVEAL_START) / (openSpan * 0.25));
}

/**
 * Presence of the SYSTEM stratum drawn ON the field, 0..1. It lags the field on the
 * way in and leads it on the way out, so the structure is read against a
 * ground that is already there, and lets go before the ground does -- the
 * strata come to rest, then UNDERNEATH takes over the SYSTEM line.
 */
export function sectionPresence(progress: number): number {
  const p = clamp01(progress);
  if (p <= BREAK_COVER_START || p >= BREAK_REVEAL_END) return 0;
  const closeSpan = BREAK_COVER_CLOSED - BREAK_COVER_START;
  const openSpan = BREAK_REVEAL_END - BREAK_REVEAL_START;
  if (p < BREAK_COVER_CLOSED) {
    return smooth((p - BREAK_COVER_START - closeSpan * 0.35) / (closeSpan * 0.65));
  }
  if (p <= BREAK_REVEAL_START) return 1;
  return 1 - smooth((p - BREAK_REVEAL_START) / (openSpan * 0.7));
}
