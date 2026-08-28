"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { layerDefinitions } from "@/data/copy";
import { routeLegs, routeScreenAngle, sceneFocusProgress } from "@/lib/spatial/sceneRoute";

// Spatial Portfolio V6.6 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §26). Rebuilds the V6.5 mechanism.
//
// WHY V6.5 FAILED, stated as geometry rather than as taste
//
// V6.5 got the important half right and kept it: the word is never touched, and
// everything happens behind it. What it got wrong is what the "behind" was. It was
// an axis-aligned rectangle -- a vertical edge sweeping horizontally between a
// horizontal top and a horizontal bottom -- filled with `--color-line` and ruled
// with horizontal strata. Every edge in it was parallel to the viewport, and
// nothing in it was parallel to anything else on the page.
//
// A four-sided axis-aligned tonal panel behind type is a card. That is not a
// stylistic misjudgement that could be tuned away with a different grey; it is what
// the shape means. The owner read it as a HUD/debug panel because that is what it
// was.
//
// WHAT V6.6 DOES INSTEAD: A SECTION CUT IN THE PAGE ITSELF
//
// There is no panel, no rectangle, and no object placed behind the word. The page
// surface is opened along a SEAM, and the seam runs at the camera route's own
// screen bearing at this point in the journey (~33 degrees, read from
// `routeScreenAngle` at module load, not authored). Below the seam the surface is
// gone and the structural layer under it is visible; above the seam the page is
// exactly the page.
//
// Three consequences, and they are the whole design:
//
//   1. THE OPENED REGION IS A HALF-PLANE, NOT A SHAPE. It has ONE constructed edge
//      -- the seam. Its other boundaries are the edges of the viewport, which is
//      what makes it read as the page having been opened rather than as something
//      lying on the page. There is nothing to perceive as a card because there is
//      no second edge to close one.
//
//   2. THE SEAM IS PARALLEL TO THE JOURNEY. Because it runs along the route's own
//      bearing, it is the plane the camera is travelling in. It is not a diagonal
//      chosen to look dynamic; if the route is ever re-aimed the seam re-aims with
//      it, and it cannot describe an angle the world does not have.
//
//   3. WHAT IS UNDERNEATH IS THE SITE'S OWN ARCHITECTURE. Three strata carrying the
//      real `layerDefinitions` labels -- SURFACE / FLOW / SYSTEM -- with the real
//      camera route from `routeLegs()` descending through them. That is the exact
//      framework the scene after the occlusion (UNDERNEATH) and the scene after
//      that (Built in Layers) go on to state in full prose, so this frame is
//      literally the preparation for them rather than an illustration of nothing.
//
// The strata are horizontal and the seam is not, so the strata are CUT BY THE SEAM
// -- they emerge from under its edge and stop against it. That truncation is the
// single most useful detail in the composition: it is what a section through
// layered material actually looks like, and it is impossible to read as a panel
// because a panel's contents do not get sliced by its own boundary.
//
// THE WORD IS STILL COMPLETELY UNTOUCHED. No mask, no clip, no filter, no
// transform, no opacity change, in any state, at any progress -- and it is drawn
// exactly once. The e2e suite asserts all five properties. The seam passes BEHIND
// it, so the letterforms interrupt the cut, which is the occlusion cue that makes
// the surface read as being in front.
//
// PERFORMANCE. V6.5 animated a `clip-path` string, which is a style-recalc and
// paint property; measured across a scripted scroll of the whole route, V6.5 spent
// 274.9ms in style recalculation over 389 recalcs. V6.6 animates nothing but
// `transform` and `opacity`: the opened region translates perpendicular to its own
// seam, and the structure counter-translates by the same amount so it stays put
// while the aperture grows. No string-valued style is produced per frame.

type SystemsWordProps = {
  /** The word. Decorative: always aria-hidden, and the sentence it comes from is
   *  stated in real semantic copy in the hero. */
  word: string;
  /**
   * 0..1 across the opening. `null` under reduced motion / before hydration, where
   * the word still renders at full scale as a real compositional element and the
   * page surface is simply never opened.
   */
  opening: MotionValue<number> | null;
  /**
   * 1 while the cut should be painted at all, 0 otherwise.
   *
   * V6.6, AND IT IS A MEASURED FIX RATHER THAN A TIDINESS ONE. The first V6.6 build
   * left the cut mounted and painted for the whole route. It is a large rotated
   * layer -- ~2400 x 1200px -- carrying a tone, a gradient, an SVG and three rows of
   * type, and the world plane drags it across the screen on every frame of the
   * journey whether or not it is doing anything. Measured against V6.5 over an
   * identical scripted scroll, that cost 27 extra frames over 32ms and took p95
   * frame time from 16.8ms to 33.3ms -- and bucketing the frame gaps by scroll
   * position put the jank at y1500-2499, which is the occlusion and UNDERNEATH,
   * nowhere near the word. The layer was expensive simply for existing.
   *
   * Gating it on `visibility` (not opacity -- opacity 0 still paints) removes it
   * from the paint tree everywhere except its own window.
   */
  active: MotionValue<number> | null;
};

/* ------------------------------------------------------------------ the seam */

/**
 * The seam's screen angle, in degrees, measured off the camera's own travel across
 * the leg the giant word stands on.
 *
 * Derived at module load, exactly as the hero's lead rule and the work branch's
 * divergence are derived. Sampled across a short span of real travel rather than
 * between two anchors, and deliberately NOT sampled across the cut -- the route is
 * discontinuous there, and a bearing taken across a discontinuity is meaningless
 * (it reads 159 degrees, which is the chord between two unrelated points).
 */
const SEAM_ANGLE = (() => {
  const tail = sceneFocusProgress("tail");
  return routeScreenAngle(tail - 0.012, tail + 0.012);
})();

/**
 * Where the seam sits, in `em` of the word's own type scale, at each beat. Positive
 * is further down the page, i.e. less of the surface opened.
 *
 * `em` rather than percent or vh so the whole construction scales with the
 * letterforms it is cut around: at any viewport the seam crosses the word in the
 * same place relative to the letters.
 */
const SEAM_START = 3.4;
const SEAM_PERCEPTIBLE = 1.62;
const SEAM_REST = 0.14;

/* ------------------------------------------------- what is under the surface */

/** The route, normalised into the structure's own box, so the line under the
 *  surface is the real camera path and cannot drift from it.
 *
 *  8 samples per leg, not 14. A paired A/B (see docs/DESIGN_SYSTEM.md §26.5)
 *  measured the V6.6 layers costing a consistently positive amount of style recalc
 *  in every one of six alternating rounds, so everything here that could be made
 *  cheaper without changing what is drawn, was: this polyline is stretched through
 *  a `preserveAspectRatio="none"` box with non-scaling strokes, and at 14 samples
 *  it carried ~126 vertices for a line that reads as three gentle bends. */
const ROUTE_PATH = (() => {
  const legs = routeLegs(false, 8);
  const all = legs.flatMap((leg) => leg.points);
  const minX = Math.min(...all.map((p) => p.x));
  const maxX = Math.max(...all.map((p) => p.x));
  const minY = Math.min(...all.map((p) => p.y));
  const maxY = Math.max(...all.map((p) => p.y));
  const spanX = Math.max(maxX - minX, 1e-6);
  const spanY = Math.max(maxY - minY, 1e-6);
  // Mapped into a 1000 x 300 viewBox. The route is much taller than it is wide, so
  // it is placed explicitly rather than stretched to fit: `preserveAspectRatio` is
  // "none" on the element so the box can match the strata band exactly, and a
  // proportional fit would then render the verticals several times heavier.
  // ONE POLYLINE PER ROUTE, not one per leg. The legs of a route are contiguous, so
  // concatenating them changes nothing that is drawn -- and it takes this drawing
  // from 9 SVG children to 2. That matters twice over: it is less to raster, and
  // the world's standing "sparse orientation structure" contract counts polylines
  // inside the sticky frame (tests/e2e/spatial.spec.ts). Nine extra vertices-only
  // children pushed the page's total from 19 to 28 and tripped a bound that exists
  // to stop this world turning into a visible grid. The bound was right; the drawing
  // was wasteful.
  const place = (p: { x: number; y: number }) => {
    const x = 40 + ((p.x - minX) / spanX) * 920;
    const y = 12 + ((p.y - minY) / spanY) * 276;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };
  return ([1, 2] as const).map((route) => ({
    route,
    points: legs
      .filter((leg) => leg.route === route)
      .flatMap((leg) => leg.points)
      .map(place)
      .join(" "),
  }));
})();

/* ------------------------------------------------------------- the component */

export function SystemsWord({ word, opening, active }: SystemsWordProps) {
  return (
    // The scene's type scale lives on this wrapper, not on the word span, so the
    // seam is positioned in `em` of the real letterforms and stays in registration
    // with them at every viewport.
    // The clamp floor is viewport-driven rather than a fixed rem: a single
    // unbreakable word cannot wrap, so a rem-based minimum overflowed the 320px
    // viewport by ~14px in the linear fallback.
    <div className="relative inline-block text-[clamp(2.5rem,16vw,15rem)]" aria-hidden="true">
      {opening !== null && active !== null && <SurfaceCut opening={opening} active={active} />}
      {/* THE SURFACE. A plain span of ink. No mask, no clip, no filter, no
          transform, no opacity -- in any state, at any progress. */}
      <span data-systems-layer="surface" className={`${WORD_CLASS} relative text-ink`}>
        {word}
      </span>
    </div>
  );
}

// The vertical padding is load-bearing, not spacing: with leading of 0.82 the
// letterforms reach past the line box, and the seam is positioned against this
// element's box.
const WORD_CLASS = "block py-[0.07em] font-display leading-[0.82] tracking-[-0.03em] uppercase";

/**
 * THE CUT.
 *
 * Nesting, and why each level exists -- every one of them is load-bearing and none
 * of them animates anything but `transform` or `opacity`:
 *
 *   field    unrotated, centred on the word, `-z-10`. Just a coordinate space.
 *   seam     a zero-height strip rotated to SEAM_ANGLE. Static. Its top edge IS
 *            the seam line, so everything below inherits the correct angle for
 *            free and no per-frame trigonometry happens anywhere.
 *   opened   the half-plane below the seam, with `overflow-clip`. This is the
 *            element that MOVES: translating it along its own local y is exactly
 *            a translation perpendicular to the seam on screen, which is what
 *            "the surface is opened" means physically.
 *   hold     counter-translates by the same amount, so the structure inside stays
 *            still in world terms while the aperture grows over it. Without this
 *            the structure slides in with the edge and the whole thing reads as a
 *            panel arriving rather than as a surface being removed -- which is the
 *            single mistake that made V6.5 read as an object.
 *   layers   counter-rotated, so the strata are horizontal on screen while the
 *            seam is not, and are therefore cut by it.
 */
function SurfaceCut({
  opening,
  active,
}: {
  opening: MotionValue<number>;
  active: MotionValue<number>;
}) {
  // One process, three beats: the seam becomes perceptible, holds long enough to be
  // read as an edge, then the surface separates and stays separated.
  const seam = useTransform(
    opening,
    [0, 0.16, 0.3, 0.72, 1],
    [SEAM_START, SEAM_PERCEPTIBLE, SEAM_PERCEPTIBLE, SEAM_REST, SEAM_REST],
  );
  const y = useTransform(seam, (value) => `${value}em`);
  const counter = useTransform(seam, (value) => `${-value}em`);
  // The structure resolves after the surface has visibly opened, never with it: an
  // opening that arrives already full of content reads as a reveal animation, one
  // that opens and then resolves reads as something being uncovered.
  const structure = useTransform(opening, [0.34, 0.66], [0, 1]);
  // The cut edge is strongest while the surface is actually separating, and settles
  // back to a quiet registration line once it is open. It never disappears -- the
  // edge of the material is a permanent fact of the composition, not an event.
  const edge = useTransform(opening, [0, 0.1, 0.3, 0.72, 1], [0, 0.55, 0.72, 0.72, 0.44]);

  // `visibility`, not `opacity`: an opacity-0 layer is still painted, and painting
  // is the entire cost being removed here. Motion switches it discretely.
  const visibility = useTransform(active, (value) => (value > 0.5 ? "visible" : "hidden"));

  return (
    <motion.span
      className="pointer-events-none absolute left-1/2 top-1/2 -z-10 block h-[6em] w-[9.4em]"
      style={{ transform: "translate(-50%, -50%)", visibility }}
    >
      {/* The seam's own frame. Rotated once, statically. */}
      <span
        className="absolute left-1/2 top-1/2 block h-px w-[9.8em]"
        style={{ transform: `translate(-50%, -50%) rotate(${SEAM_ANGLE.toFixed(3)}deg)` }}
      >
        <motion.span
          data-systems-cut="true"
          className="absolute left-0 top-0 block h-[3.7em] w-full origin-top overflow-clip"
          // `contain: paint` bounds the invalidation to this box, and `will-change`
          // asks for a compositor layer so the seam's travel is a composite rather
          // than a repaint of a 2400x1200 rotated region.
          style={{ y, willChange: "transform", contain: "paint" }}
        >
          {/* The opened surface. A recess, not a fill: 5.5% ink over paper is about
              one step of tone -- enough to say "this is behind" and far too little
              to read as a plate. The V6.5 panel was `--color-line`, roughly seven
              times this contrast, which is most of why it read as an object. */}
          <span className="absolute inset-0 block bg-[rgba(22,22,22,0.055)]" />

          {/* THE CUT EDGE. The one place any real contrast is spent. A hairline of
              ink for the cut itself, and a short gradient under it for the
              thickness of the sheet that was opened -- the cue that makes this a
              material with an edge rather than a change of colour. */}
          <motion.span className="absolute left-0 right-0 top-0 block" style={{ opacity: edge }}>
            <span className="absolute left-0 right-0 top-0 block h-px bg-ink" />
            <span className="absolute left-0 right-0 top-0 block h-[0.22em] bg-[linear-gradient(to_bottom,rgba(22,22,22,0.17),rgba(22,22,22,0))]" />
          </motion.span>

          {/* Counter-translated: the structure does not move while the surface
              opens over it. */}
          <motion.span className="absolute inset-0 block" style={{ y: counter }}>
            {/* Counter-rotated about the seam's own midpoint, so the strata hang
                horizontally off the cut and are truncated by it. */}
            <motion.span
              className="absolute left-1/2 top-0 block h-[2.6em] w-[9.6em] origin-top"
              style={{
                transform: `translateX(-50%) rotate(${(-SEAM_ANGLE).toFixed(3)}deg)`,
                opacity: structure,
              }}
            >
              <StructuralLayers />
            </motion.span>
          </motion.span>
        </motion.span>
      </span>
    </motion.span>
  );
}

/**
 * WHAT THE OPENED SURFACE SHOWS.
 *
 * Nothing here is authored decoration. The three strata are the site's own
 * `layerDefinitions` -- the same three terms the Built in Layers scene defines in a
 * real `<dl>` two scenes later, and the same three the reposition's depth rail
 * registers -- and the line descending through them is the real camera route.
 *
 * So the reading is exact rather than atmospheric: under the surface of this page
 * there are three layers, and the journey the reader is on runs down through them.
 * That is a true statement about the site, made in the site's own words, at the
 * moment immediately before the page says it out loud.
 *
 * The labels are `aria-hidden` with the rest of this component, and each term
 * appears as real semantic content exactly once, in the Built in Layers definition
 * list. Nothing is duplicated into the accessibility tree.
 */
function StructuralLayers() {
  return (
    <span className="absolute inset-0 block">
      {/* The route, drawn across the full band so it crosses every stratum. */}
      <svg
        className="absolute inset-0 h-full w-full text-ink"
        viewBox="0 0 1000 300"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {ROUTE_PATH.map((leg, index) => (
          <polyline
            key={index}
            points={leg.points}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            strokeDasharray={leg.route === 2 ? "6 8" : undefined}
            opacity={leg.route === 2 ? 0.5 : 0.62}
          />
        ))}
      </svg>

      {layerDefinitions.map((layer, index) => (
        <span
          key={layer.label}
          className="absolute left-0 right-0 block"
          // Evenly through the band. The spacing is the only authored number in
          // the drawing and it is doing typographic work, not describing anything.
          // Tight enough that all three strata are inside the frame together: at
          // 1.06em the third sat ~600px below the seam and fell off the bottom, so
          // the section showed two layers of a three-layer framework.
          style={{ top: `${0.42 + index * 0.78}em` }}
        >
          <span
            className="absolute left-0 right-0 top-0 block h-px bg-ink"
            // Deeper strata are drawn heavier. The one cue in the drawing that is
            // not literal: it is how a section marks the load-bearing layer, and it
            // happens to be true of this framework's own argument.
            style={{ opacity: 0.22 + index * 0.12 }}
          />
          {/* Anchored to the WORD, not to the drawing's own box. The rules run the
              full width of the opened surface because strata do; the labels have to
              land where the reader is already looking, which is the left edge of the
              letterforms. Centring them with the rules put them ~1100px off-frame. */}
          <span className="absolute left-[calc(50%-2.2em)] top-[0.1em] block font-mono text-mono-label tracking-mono-label uppercase text-ink-muted">
            {layer.label}
          </span>
        </span>
      ))}
    </span>
  );
}

/** Exported for the unit test that asserts the seam is derived from the route
 *  rather than authored, and for the artifact scripts that label captures. */
export const SYSTEMS_SEAM_ANGLE = SEAM_ANGLE;
