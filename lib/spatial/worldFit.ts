// Spatial Portfolio V8 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §33). Pure viewport math, no JSX -- unit-testable in
// isolation (tests/unit/spatial-world-fit.test.ts).
//
// THE WORLD-FIT SYSTEM, and the measurement that made it necessary.
//
// The owner's report was that the site "looks visually strong on the large work
// display" but "appears excessively large" on a 1918x864 home laptop. Measured
// across the whole desktop matrix on the built page (docs/review/v8-responsive/
// baseline/measurements.json), the cause is not aspect ratio, not typography and
// not any single component -- it is that THE WORLD HAD NO HEIGHT AXIS AT ALL.
//
// Every input to a scene's size is width-derived or absolute:
//
//   SCENE_WIDTH            min(84vw, 1180px)  -- vw, then a px cap
//   --text-display-xl      clamp(3rem, 8vw, 6.5rem)
//   the hero's own h1      clamp(3rem, 10.5vw, 9.5rem)
//   project evidence       a fraction of the block it sits in
//
// so above ~1405px of viewport width the block saturates at its 1180px cap and
// the whole composition becomes A FIXED NUMBER OF PIXELS TALL. Measured, the
// Software Factory scene is 793px tall at 1440, 1536, 1600 and 1920 -- identical
// to the pixel. The frame it has to fit, meanwhile, is `100vh`. So the ratio the
// eye actually reads is 793 / viewportHeight, and nothing in the system knew:
//
//   2560x1440   0.719    framed, air around it        <- the display owner approved
//   1920x1080   0.734    framed
//   1600x900    0.881    tight
//   1440x900    0.881    tight
//   1918x864    0.919    tight            <- the owner's laptop
//   1536x864    0.919    tight
//   1366x768    1.092    DOES NOT FIT
//
// The right-hand column is the complaint, quantified: the same composition reads
// 52 percentage points larger relative to its frame on the laptop than on the
// work display. And the last two rows are not a matter of taste -- at 1366x768
// the flagship scene is 145px TALLER THAN THE VIEWPORT and is clipped, with
// DropSpot clipped by 129px. Every one of those viewports reported zero
// horizontal overflow, which is exactly why an overflow matrix never found it.
//
// THE FIX IS ONE NUMBER, APPLIED ONCE. Not per-component media queries, not
// smaller fonts, not shrunken screenshots: the whole world already hangs off a
// single shared transformed parent (the depth planes need one), so the missing
// axis can be supplied there, as a scale, and every plane, scene, rule, plate
// and piece of typography stays exactly as relational to every other as it was
// authored. That is the difference between fitting a composition into a frame
// and letting components shrink independently.

/**
 * The viewport this world is composed for.
 *
 * WIDTH is 1440: the design viewport the route geometry itself is authored
 * against (VW_PER_VH = 1.6 is 1440x900 exactly), and the width at which
 * SCENE_WIDTH's 84vw and its 1180px cap very nearly meet.
 *
 * HEIGHT is 1040 rather than 900, and that is the one number here chosen from
 * measurement rather than inherited. It is the frame height at which the
 * composition's own 793-839px demand sits at the proportion the owner approved
 * on the large display (~0.72-0.76 of the frame, with air around it). Anchoring
 * the reference at 900 instead would have declared the already-tight 1440x900
 * rendering to be correct and left the laptop only 4% smaller -- i.e. it would
 * have preserved the defect and called it the reference.
 *
 * 1040 rather than a round 1000 for one measured reason: at 1000 the whole
 * matrix came inside its frame except Software Factory at 1366x768, which was
 * still clipped by 13px. That scene is the tallest composition in the world
 * (a 1143px-wide block at that viewport wraps taller than the 1180px-capped one
 * everywhere else), so it is the binding constraint, and the reference is set
 * where the binding constraint actually clears.
 */
export const WORLD_REFERENCE = { width: 1440, height: 1040 } as const;

/**
 * Floor on the fit, so the world can never scale itself into illegibility.
 *
 * At 0.74 the smallest body copy in the spatial layer (--text-body, 16px) still
 * renders at 11.8px and its labels at 9.6px, which is the point at which
 * shrinking further would trade an accessibility property for a compositional
 * one. Reached only below ~740px of viewport height on desktop, which in
 * practice is a browser window less than half the height of the screen it is on.
 */
export const WORLD_FIT_MIN = 0.74;

/**
 * The world never scales UP. Above the reference viewport the composition keeps
 * the size it was designed at and the extra room becomes visible world instead
 * -- see WORLD_UNIT below, which is the other half of that decision.
 */
export const WORLD_FIT_MAX = 1;

/**
 * Width below which the fit starts responding to the horizontal axis too.
 *
 * Deliberately BELOW the reference width, and this is the subtle part. The
 * world's content already has a width response -- `84vw`, and every display size
 * is a `clamp(rem, vw, rem)` -- so folding viewport width into the fit at 1440
 * would count the same axis twice and shrink narrow windows by the square of
 * their narrowness. At 1280 the width term is inert at every viewport in the
 * owner's matrix and binds only in a genuinely narrow desktop window, where the
 * vw-sized content has run out of room to give.
 */
export const WORLD_FIT_WIDTH_REFERENCE = 1280;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * The world's scale for a given CSS viewport, from BOTH axes.
 *
 * `min()` of the two ratios is what makes this an aspect response without
 * naming aspect ratio: whichever axis the viewport is shorter in, relative to
 * the composition, is the axis that governs. A wide-but-short laptop is
 * therefore governed by its height and is NOT treated as a large desktop merely
 * because its width is high, which is the owner's §8 in one expression.
 */
export function worldFit(width: number, height: number): number {
  const byHeight = height / WORLD_REFERENCE.height;
  const byWidth = width / WORLD_FIT_WIDTH_REFERENCE;
  return clamp(Math.min(byHeight, byWidth), WORLD_FIT_MIN, WORLD_FIT_MAX);
}

/**
 * THE WORLD'S OWN UNIT -- the other half of the responsive model, and the answer
 * to a second, separate owner complaint (§10): zooming the page out does not
 * feel like the whole world shrinking into view, it feels like the active scene
 * is the only thing that exists.
 *
 * That percept has a precise cause, and it is not the scale. Above ~1440px of
 * width the world's CONTENT is already px-fixed -- the scene block caps at
 * 1180px, every display size caps at a rem maximum -- but the world's GEOMETRY
 * is not: scene anchors are placed in `vw`/`vh`, so the DISTANCE between two
 * scenes grows in exact proportion to the frame. Widen the window, or zoom out,
 * and the neighbours retreat exactly as fast as the room to see them arrives.
 * One scene in frame at 1440, one scene in frame at 2560, one scene in frame at
 * 50% zoom -- by construction, at every size.
 *
 * So the world gets a unit that stops growing at the reference viewport. Below
 * it, this is exactly `1vw`/`1vh` and nothing changes; above it, the world holds
 * the metrics it was composed at and the extra viewport becomes MORE WORLD.
 *
 * Emitted as CSS rather than computed in JS on purpose: `min()` re-resolves on
 * resize, on zoom and on a device-pixel-ratio change with no listener, no
 * re-render and no hydration mismatch to get wrong.
 *
 * This governs POSITION ONLY -- where the camera and the scenes sit. It is
 * deliberately not applied to content size: shrinking the compositions on a
 * large display to reveal their neighbours would be the "unnecessarily
 * miniaturize everything" §9 rules out. The scenes keep the size they were
 * approved at; they simply stop drifting apart.
 */
export const WORLD_UNIT = {
  x: `min(1vw, ${WORLD_REFERENCE.width / 100}px)`,
  y: `min(1vh, ${WORLD_REFERENCE.height / 100}px)`,
} as const;

/** World x (in route `vw` units) as a CSS length in the world's own unit. */
export function worldX(vw: number): string {
  return `calc(${vw} * var(--world-vw))`;
}

/** World y (in route `vh` units) as a CSS length in the world's own unit. */
export function worldY(vh: number): string {
  return `calc(${vh} * var(--world-vh))`;
}
