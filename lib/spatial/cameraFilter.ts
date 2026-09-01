// Spatial Portfolio V5 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §19). Pure filter math, no React, no motion --
// unit-testable in isolation (tests/unit/spatial-filter.test.ts).
//
// WHY THIS REPLACES V4'S SPRING (§7)
//
// V4 filtered raw scroll through one fixed overdamped spring. Measured under
// four real wheel profiles, that behaved well at slow and normal input and
// showed one specific weakness at speed: after the reader stopped scrolling,
// the camera kept travelling. At the trackpad-burst profile the 95th
// percentile coast was 425px and the worst was 726px; at the fast profile the
// 95th percentile was 874px. That is the measurable form of "the camera is
// chasing me", and it is the one thing §7 forbids outright.
//
// The brief's suggested mapping was the opposite (more damping at speed), but
// more damping lengthens coast rather than shortening it -- steady-state lag
// is velocity x time-constant. Measurement therefore points the other way, and
// §7's binding requirement ("the camera must never feel like it is chasing the
// user") is what the tuning follows: the time constant SHRINKS as input speed
// rises. Slow, deliberate scrolling keeps the softer response that dissolves
// discrete wheel notches into continuous motion; a fast flick gets a tighter
// one that settles almost as soon as the fingers stop.
//
// WHY A CASCADED LAG RATHER THAN A SPRING
//
// A spring's configuration cannot be changed per frame without risking
// overshoot, and overshoot is not a cosmetic problem here: the collision cut is
// a threshold on this value, so a value that crossed it and came back would
// make the reposition flicker. V4 solved that by overdamping a fixed spring.
//
// V5 needs a filter whose response can vary per frame and still cannot
// overshoot. Two cascaded first-order lags do exactly that:
//
//   stage1 += (target - stage1) * alpha
//   stage2 += (stage1 - stage2) * alpha,   alpha = 1 - exp(-dt/tau)
//
// Each stage moves a FRACTION of the remaining distance toward its input, so
// it can never pass it, for any alpha in (0,1] and any tau -- including a tau
// that changes every frame. A monotone input therefore produces a monotone
// output, which is a stronger guarantee than V4's overdamping: the cut cannot
// be crossed twice even in principle. Cascading two of them (rather than using
// one) makes the output's VELOCITY continuous too, which is what a single lag
// would lose and what actually dissolves wheel-step edges.

/**
 * Time constant, in ms, of each of the two cascaded stages.
 *
 * V6 tightened both (was 62 / 26). The cascade's effective response is roughly
 * twice one stage, so 48ms per stage is still ~96ms of smoothing -- ample to
 * dissolve a wheel notch -- while removing the slight "the camera is catching
 * up with me" softness that a 124ms cascade had during slow, deliberate
 * reading scrolls. Combined with the flatter velocity profile
 * (FOCUS_SPEED_RATIO), this is what makes small scroll inputs produce visible
 * response everywhere instead of only during travel.
 */
export const TAU_SETTLED_MS = 48;
export const TAU_TIGHT_MS = 22;

/**
 * Scroll speeds, in progress-units per second, between which the filter
 * tightens. Derived from the measured wheel profiles at 1440x900: deliberate
 * reading scrolls sit near 0.05-0.15, and a trackpad flick reaches ~0.5.
 *
 * V6 lowered the lower bound from 0.10 to 0.06 so that a slow, deliberate
 * scroll begins tightening the filter immediately rather than sitting in the
 * fully-settled regime -- the regime where "nothing is happening" was most
 * noticeable.
 */
export const SPEED_SETTLED = 0.06;
export const SPEED_TIGHT = 0.55;

/**
 * How fast the speed estimate is allowed to FALL. Attack is instant so a flick
 * tightens the filter immediately; release is slow so the filter does not
 * loosen again in the middle of settling. Changing tau cannot cause overshoot,
 * so this asymmetry is free -- with a spring blend it would not be.
 */
export const SPEED_RELEASE_MS = 250;

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

/** Per-stage time constant for a given (smoothed) scroll speed. */
export function filterTau(speed: number): number {
  const t = clamp01((Math.abs(speed) - SPEED_SETTLED) / (SPEED_TIGHT - SPEED_SETTLED));
  return TAU_SETTLED_MS + (TAU_TIGHT_MS - TAU_SETTLED_MS) * t;
}

/** One first-order lag step. Never passes `target`, for any dt or tau. */
export function lagStep(current: number, target: number, dtMs: number, tauMs: number): number {
  if (dtMs <= 0) return current;
  return current + (target - current) * (1 - Math.exp(-dtMs / Math.max(tauMs, 1)));
}

/** Speed estimate with instant attack and exponential release. */
export function trackSpeed(previous: number, instant: number, dtMs: number): number {
  const decayed = previous * Math.exp(-Math.max(dtMs, 0) / SPEED_RELEASE_MS);
  return Math.max(Math.abs(instant), decayed);
}

/* ---------------------------------------------- scene-break rate limiting */

/**
 * PLAYBACK DURATION, in ms, of the occlusion cut.
 *
 * THE PROBLEM, which is unchanged and is why this survives V6.4's removals. The
 * break occupies a fixed span of PROGRESS. Progress is its only natural clock, so
 * without this its duration is whatever the reader's scroll speed makes it: under
 * a hard wheel burst the whole event -- close, dwell, open -- crosses in a handful
 * of frames, and the one deliberate transition in the journey is the thing a fast
 * reader never sees.
 *
 * V6.2 bounded it with a MINIMUM: scroll was clamped to a ramp when it ran ahead,
 * and left alone when it ran behind. Measured across burst profiles that produced
 * anything from 50ms to 2.9s, and the cause is the asymmetry itself -- the VISUAL
 * was driven along the ramp unconditionally while SCROLL was only clamped when it
 * ran ahead, so a reader slower than the ramp had the event played at them while
 * their scroll position stayed behind, and release snapped the visual back.
 *
 * V6.3 made the playback SYMMETRIC and therefore fixed: once the threshold is
 * crossed, scroll position IS the ramp -- driven forward if the reader is behind
 * it, held back if they are ahead -- so scroll and the visual it drives can never
 * disagree, and there is nothing to reconcile at release.
 *
 * V6.4 KEEPS THAT MECHANISM AND SHORTENS IT, 1300 -> 950ms. 1300 was sized for a
 * five-phase sequence that no longer exists: approach, impact, closing, dwell,
 * reveal. What is left is three phases and no physics, and an occlusion held for
 * 1.3s stops reading as a cut and starts reading as a pause. At 950ms the phases
 * land at roughly 170 / 165 / 200 / 415ms for lead-in / closing / full black /
 * opening.
 *
 * WHERE IT LIVES: `useSceneBreakEvent` (components/spatial/SpatialCamera.tsx).
 */
export const BREAK_PLAYBACK_MS = 950;

/**
 * How far the reader may scroll BACK, in px, before the playback aborts and hands
 * control straight back. One firm wheel-up. The escape has to be immediate and
 * unconditional -- that is most of what separates a protected event from
 * scroll-jacking.
 */
export const BREAK_ABORT_PX = 90;

/* --------------------------------------------------- the opening glide (V6.8) */

/**
 * Maximum rate, in progress-units per second, at which the camera may move while
 * it is still inside the OPENING GLIDE ZONE (see ENTRY_GLIDE_TO in sceneRoute.ts).
 *
 * WHY THIS EXISTS. The acquisition descent added in V6.7 gave the journey the
 * right OPENING SHAPE -- straight down, then a bend into the diagonal -- but the
 * filter still let wheel velocity set the opening's SPEED. Measured on the built
 * page from the true top: a normal 90px wheel run peaked at 6,881 px/s of world
 * movement with 114px single-frame steps, and a 1400px trackpad fling crossed the
 * ENTIRE opening region in one frame (>520px of world in a single step). The
 * page's first move -- the one moment every visitor sees -- was the least
 * controlled motion on it.
 *
 * The governor bounds d(progress)/dt inside the zone. At this cap the world's
 * opening speed lands between ~420 px/s (early, where the route is slowest) and
 * ~1,000 px/s (committing into the bend) at 1440x900 -- about one viewport per
 * second at its fastest, glide rather than drop. Outside the zone the filter is
 * untouched, so this slows nothing but the departure itself.
 *
 * WHY IT IS NOT SCROLL-JACKING. Scroll position is never written; the reader's
 * position is wherever they put it, instantly. Only the VISUAL's catch-up rate is
 * bounded, and only inside one ~0.07-wide band at the very top of the route --
 * the same distinction the camera filter itself has always drawn between input
 * and presentation. Worst case a fling waits ~0.8s while the camera glides the
 * opening it would otherwise have skipped.
 */
export const GLIDE_MAX_RATE = 0.09;

/**
 * How much of the route past the glide zone the governor uses to RELEASE, as a
 * multiple of the zone's own width, and how much faster the cap is allowed to get
 * by the end of that band.
 *
 * A hard release edge was measured before this existed: the first build capped the
 * zone and nothing after it, and a trackpad fling then jumped 2,183px in the single
 * frame after the governor let go -- the exact lurch the governor exists to
 * prevent, relocated 40vh down the page. The cap therefore ramps: rate x1 inside
 * the zone, rising quadratically to x8 across 1.5 further zone-widths, then
 * uncapped. Past the band a fling behaves exactly as it always has everywhere else
 * on the route; the governor is local to the departure.
 */
export const GLIDE_RELEASE_SPAN = 1.5;
export const GLIDE_RELEASE_GAIN = 8;

/**
 * V7 — THE ROUTE-WIDE CEILING (owner §10). The designed maximum for visual
 * progression ANYWHERE on the route, in progress/second. The entry glide stays
 * tighter (GLIDE_MAX_RATE) and its release band now ramps INTO this ceiling
 * instead of into "uncapped": scrolling may be as slow as the reader likes,
 * but the world can never be played faster than this, in either direction.
 *
 * Sized against the route, not against feel-words: at 0.155/s the six-scene
 * evidence route plus the full second route cannot be traversed in under ~6.5
 * seconds, one scene leg costs a fling ~0.8s instead of a single frame, and
 * the occlusion's own fixed playback (BREAK_PLAYBACK_MS over its band) remains
 * the slowest beat — the ceiling never competes with the cut's choreography.
 */
/**
 * V11 (§11, §14) LOWERED IT 0.155 -> 0.105, and the arithmetic is the whole
 * argument.
 *
 * This is a fraction of the ROUTE per second, so the world speed it actually
 * permits is `ROUTE_MAX_RATE x routeWorldLength` — the route is always traversed
 * in at least `1 / ROUTE_MAX_RATE` seconds no matter how large the world is.
 * V11 grew route one's world from ~880 screen units to ~1420 to buy focus
 * isolation (see SCENES), which at 0.155 would have raised the permitted world
 * speed by 61% — the exact opposite of the owner's standing complaint that
 * scroll still feels too fast.
 *
 *   world speed at the ceiling = 0.155 x  880 = 136 units/s   (V10)
 *                                0.155 x 1420 = 220 units/s   (V11, unfixed)
 *                                0.105 x 1420 = 149 units/s   (V11)
 *
 * So the ceiling comes down with the world's growth, the perceived maximum
 * travel rate stays where it was, and the minimum time to cross the route rises
 * from 6.5s to 9.5s — which is the breathing the larger world was bought for.
 * Page length is unchanged: `ROUTE_LENGTH_VH` is untouched.
 */
export const ROUTE_MAX_RATE = 0.105;

/**
 * V10 (§H3-H5): how far the wheel's intent target may lead the page's real
 * scroll position, in viewport heights, in either direction.
 *
 * WHAT IT FIXES, measured. The governor capped the RATE but nothing capped the
 * DISTANCE, so intent accumulated without limit: 30 wheel notches of 400px at
 * 16ms, then all input stopped, and the page kept travelling by itself for
 * 2827px -- 3.27 viewport heights -- over 5.6 seconds. That is the queued
 * autonomous movement §H3 rules out, and it is what made hard input feel like it
 * blasted through the journey.
 *
 * 0.6 is chosen against the ceiling rather than by taste: at ROUTE_MAX_RATE the
 * governor covers a viewport in ~1.29s, so 0.6vh of lead is ~0.77s of coast --
 * long enough that a fast reader never feels the cap engage during continuous
 * scrolling, short enough that stopping brings the world to rest inside one
 * beat rather than five seconds later, most of a screen further on.
 */
export const INTENT_LEAD_VH = 0.6;

/**
 * One governor step. Returns `proposed` untouched when the movement is entirely
 * past the release band or already inside the rate budget; otherwise advances
 * from `previous` at the capped rate for where the camera currently is, in
 * whichever direction the movement was going -- the opening glides on the way
 * back up, too.
 */
export function glideStep(
  previous: number,
  proposed: number,
  dtMs: number,
  glideUntil: number,
): number {
  if (glideUntil <= 0) return proposed;
  // Rate budget at the camera's CURRENT position: x1 in the entry zone,
  // ramping across the release band — and then, V7, holding at the route-wide
  // ceiling for the REST of the journey instead of releasing to uncapped.
  // The owner's §10 is absolute ("may be slower, never faster"), and the
  // measured failure the old release note records — a fling jumping 2,183px
  // in the frame after the governor let go — is exactly what "uncapped past
  // the band" still permitted everywhere below the opening.
  const releaseEnd = glideUntil * (1 + GLIDE_RELEASE_SPAN);
  const over =
    previous >= releaseEnd ? 1 : Math.max(0, previous - glideUntil) / (releaseEnd - glideUntil);
  const gain = 1 + (GLIDE_RELEASE_GAIN - 1) * over * over;
  const rate = Math.min(GLIDE_MAX_RATE * gain, ROUTE_MAX_RATE);
  const maxStep = rate * (Math.max(dtMs, 0) / 1000);
  const step = proposed - previous;
  if (Math.abs(step) <= maxStep) return proposed;
  return previous + Math.sign(step) * maxStep;
}

export type FilterState = { stage1: number; stage2: number; speed: number };

/**
 * Advances the whole filter one frame. Returned `stage2` is the value every
 * visual in the spatial world reads -- camera, break, erosion, depth, system
 * annotations. Deriving some of them from raw scroll and some from here is
 * what would smear the cut, by letting the panel and the jump disagree about
 * when the cut happened.
 */
export function advanceFilter(
  state: FilterState,
  target: number,
  instantSpeed: number,
  dtMs: number,
): FilterState {
  const speed = trackSpeed(state.speed, instantSpeed, dtMs);
  const tau = filterTau(speed);
  const stage1 = lagStep(state.stage1, target, dtMs, tau);
  const stage2 = lagStep(state.stage2, stage1, dtMs, tau);
  return { stage1, stage2, speed };
}
