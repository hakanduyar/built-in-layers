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

/** Time constant, in ms, of each of the two cascaded stages. */
export const TAU_SETTLED_MS = 62;
export const TAU_TIGHT_MS = 26;

/**
 * Scroll speeds, in progress-units per second, between which the filter
 * tightens. Derived from the measured wheel profiles at 1440x900: deliberate
 * reading scrolls sit near 0.05-0.15, and a trackpad flick reaches ~0.5.
 */
export const SPEED_SETTLED = 0.1;
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
