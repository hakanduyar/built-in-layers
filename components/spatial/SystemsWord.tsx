"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { layerDefinitions } from "@/data/copy";
import { routeLegs, routeScreenAngle, sceneFocusProgress } from "@/lib/spatial/sceneRoute";

// Spatial Portfolio V6.6 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §26).
//
// THE PRINCIPLE THAT SURVIVES EVERY PASS: the word is never touched. No mask,
// no clip, no filter, no transform, no opacity change, in any state, at any
// progress -- and it is drawn exactly once. Everything happens to the SURFACE
// behind it, opened along a seam that runs at the camera route's own bearing.
//
// V14 (OWNER FINDING C) -- THE SURFACE THAT OPENS IS THE WHOLE PAGE.
//
// The owner's reading of what V6.6-V11 built here: "large SYSTEMS word +
// rotated gray slab". The baseline frames confirm the cause. The opened region
// was a 9.4em x 6em box behind the word -- 2250 x 1440px at the word's 15rem
// scale -- filled at 5.5% ink. At 100% it is cut by the frame on two sides and
// reads as a half-plane, which was the V6.6 argument; at 80% and below its
// far corners come into view and it is exactly what it is, a large rotated
// rectangle, which at 50% is the single largest object in the world.
//
// So on desktop the construction now spans the FRAME, not the word:
//
//   - the field is 240vw x 200vh, centred on the word, so no corner of the
//     opened region can ever be in view at any viewport or zoom level. The
//     seam is the only constructed edge, at every scale;
//   - the recess is 2.5% ink rather than 5.5%: a change of ground, not a
//     panel. What carries the reveal is the structure, not the tone;
//   - the structure is the site's own: three strata carrying the real
//     layerDefinitions, and THE WHOLE ROUTE drawn as a map (RouteMap,
//     `revealed`) descending through them -- the four stations the reader has
//     just visited, the cut they are about to pass through, and the climb back
//     that route two will make. The thing under the surface of this page is
//     the journey the reader is on, which is a true statement made in the
//     world's own geometry;
//   - UNDERNEATH is then the consequence rather than the next section: the
//     camera lands at the bottom of the map it was just shown, on the SYSTEM
//     stratum, and route two climbs back up through FLOW and SURFACE
//     (WorldGrammar's Strata draws those bands across route two's world).
//
// Mechanically nothing changed: `data-systems-cut` is still the one element
// that moves, it still animates `transform` only, its parent is still rotated
// to SEAM_ANGLE, and the drawing under it holds at most two polylines. Mobile
// keeps the V6.6 box construction the V13 mobile gate froze (SurfaceCut).

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
  /** 1 while the cut should be painted at all, 0 otherwise. Gated on
   *  `visibility` (not opacity -- opacity 0 still paints). */
  active: MotionValue<number> | null;
  /** V14: the frame-spanning construction. Desktop only. */
  wide?: boolean;
};

/* ------------------------------------------------------------------ the seam */

/**
 * The seam's screen angle, in degrees, measured off the camera's own travel across
 * the leg the giant word stands on. Derived at module load, deliberately NOT
 * sampled across the cut.
 */
const SEAM_ANGLE = (() => {
  const tail = sceneFocusProgress("tail");
  return routeScreenAngle(tail - 0.012, tail + 0.012);
})();

/** Where the seam sits, in `em` of the word's own type scale, at each beat. */
const SEAM_START = 3.4;
const SEAM_PERCEPTIBLE = 1.62;
const SEAM_REST = 0.14;

/* ------------------------------------------------- what is under the surface */

/** The route for the compact (mobile) drawing, normalised into its own box. */
const ROUTE_PATH = (() => {
  const legs = routeLegs(false, 8);
  const all = legs.flatMap((leg) => leg.points);
  const minX = Math.min(...all.map((p) => p.x));
  const maxX = Math.max(...all.map((p) => p.x));
  const minY = Math.min(...all.map((p) => p.y));
  const maxY = Math.max(...all.map((p) => p.y));
  const spanX = Math.max(maxX - minX, 1e-6);
  const spanY = Math.max(maxY - minY, 1e-6);
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

export function SystemsWord({ word, opening, active, wide = false }: SystemsWordProps) {
  return (
    <div className="relative inline-block text-[clamp(2.5rem,16vw,15rem)]" aria-hidden="true">
      {/* V14.4 (owner): on desktop the surface is no longer opened. The word
          stands clean and fully readable, and the state change is the black
          cover that follows (SceneBreak) -- SYSTEMS, a decisive black state,
          the underlying system revealed on it, UNDERNEATH. The pale diagonal
          seam, the recess and the strata that stood beneath the word were
          the "weak, arbitrary shapes" the owner rejected. Mobile keeps the
          V6.6 compact cut the V13 gate froze. */}
      {opening !== null && active !== null && !wide && (
        <SurfaceCut opening={opening} active={active} />
      )}
      {/* V14.5 (owner: "restrained straight rules / textual system marks
          beneath SYSTEMS", after f4bdab3): on desktop the three strata stand
          beneath the word as straight rules -- the section the older reveal
          drew, without the seam, the recess or the map. V14.8 (owner): the
          rules carry the classification and the state of each stratum, and
          the descent to SYSTEM. They resolve as the word is acquired and
          hold. */}
      {opening !== null && active !== null && wide && (
        <StructureBeneath opening={opening} active={active} />
      )}
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

/** One process, three beats, shared by both constructions: the seam becomes
 *  perceptible, holds long enough to be read as an edge, then the surface
 *  separates and stays separated. */
function useSeam(opening: MotionValue<number>, active: MotionValue<number>) {
  const seam = useTransform(
    opening,
    [0, 0.16, 0.3, 0.72, 1],
    [SEAM_START, SEAM_PERCEPTIBLE, SEAM_PERCEPTIBLE, SEAM_REST, SEAM_REST],
  );
  const y = useTransform(seam, (value) => `${value}em`);
  const counter = useTransform(seam, (value) => `${-value}em`);
  const structure = useTransform(opening, [0.34, 0.66], [0, 1]);
  const edge = useTransform(opening, [0, 0.1, 0.3, 0.72, 1], [0, 0.55, 0.72, 0.72, 0.44]);
  const visibility = useTransform(active, (value) => (value > 0.5 ? "visible" : "hidden"));
  return { y, counter, structure, edge, visibility };
}

/** Where the strata stand beneath the word, in em of the word's scale. */
const STRUCTURE_TOP_EM = 1.06;
const STRUCTURE_STEP_EM = 0.9;

/**
 * V14.8 (owner: the supporting composition beneath SYSTEMS is too weak) --
 * THE STATE OF EACH STRATUM AT THIS BEAT, in the acquisition frame's own
 * vocabulary. The surface is what the four cases were acquired on, and the
 * word is its acquisition; the two layers beneath it are detected -- known
 * to be there, not yet in frame. The cut then changes the state: on the
 * black (SceneBreak's SystemOnInk) the surface is released and SYSTEM is
 * acquired, which is where UNDERNEATH lands. Never a number, never authored
 * per frame: one word per layer per side of the boundary.
 */
export const STRUCTURE_STATE_ON_PAPER = ["Acquired", "Detected", "Detected"] as const;
/** The same three layers after the cut, on the black: read by SceneBreak. */
export const STRUCTURE_STATE_ON_INK = ["Released", "Detected", "Acquired"] as const;

/**
 * V14.5 -- THE STRUCTURE BENEATH THE WORD (desktop).
 *
 * V14.8 (owner): the same three straight, frame-wide, unrotated rules, now
 * carrying a CLASSIFICATION rather than a name alone. Each rule is a
 * stratum, in section: its index and name in ink, its definition from
 * `layerDefinitions` beside it, and at the word's right edge its state. The
 * rules gain weight with depth, exactly as the system on the black does,
 * so the drawing beneath the word and the drawing on the black are one
 * drawing in two materials. Down the left, from the surface to SYSTEM, the
 * descent: the route ahead in the rail's own AHEAD grammar (dotted), drawn
 * down as the cut approaches -- the one moving mark, and it moves on a
 * compositor transform only. The word itself is never touched.
 */
function StructureBeneath({
  opening,
  active,
}: {
  opening: MotionValue<number>;
  active: MotionValue<number>;
}) {
  const presence = useTransform(opening, [0, 0.3], [0.35, 1]);
  const descent = useTransform(opening, [0.3, 1], [0, 1]);
  const visibility = useTransform(active, (value) => (value > 0.5 ? "visible" : "hidden"));
  return (
    <motion.span
      aria-hidden="true"
      data-systems-structure="true"
      className="pointer-events-none absolute -left-[60vw] -right-[60vw] top-0 -z-10 block"
      style={{ opacity: presence, visibility }}
    >
      {layerDefinitions.map((layer, index) => (
        <span
          key={layer.label}
          data-systems-stratum={layer.label.toLowerCase()}
          className="absolute left-0 right-0 block"
          style={{ top: `${STRUCTURE_TOP_EM + index * STRUCTURE_STEP_EM}em` }}
        >
          <span
            className="absolute left-0 right-0 top-0 block h-px bg-ink"
            style={{ opacity: 0.3 + index * 0.2 }}
          />
          {/* The classification: index, name, definition -- hung off the
              descent, inside the word's left edge. */}
          <span className="absolute left-[calc(60vw+0.06em+1.25rem)] top-[0.06em] flex items-baseline gap-x-5 whitespace-nowrap font-mono text-mono-label tracking-mono-label uppercase">
            <span className="text-ink-muted">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-ink">{layer.label}</span>
            <span className="text-ink-muted">{layer.body}</span>
          </span>
          {/* The state, at the word's right edge. */}
          <span
            data-systems-state={STRUCTURE_STATE_ON_PAPER[index]!.toLowerCase()}
            className="absolute right-[60vw] top-[0.06em] block font-mono text-mono-label tracking-mono-label uppercase text-ink"
          >
            {STRUCTURE_STATE_ON_PAPER[index]}
          </span>
        </span>
      ))}
      {/* THE DESCENT: the route ahead, from the surface down to SYSTEM. */}
      <motion.span
        data-systems-descent="true"
        className="absolute left-[calc(60vw+0.06em)] block w-px origin-top"
        style={{
          top: `${STRUCTURE_TOP_EM}em`,
          height: `${(layerDefinitions.length - 1) * STRUCTURE_STEP_EM}em`,
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(22,22,22,0.7) 0 1.5px, rgba(0,0,0,0) 1.5px 8px)",
          scaleY: descent,
        }}
      />
    </motion.span>
  );
}

/**
 * THE COMPACT CUT (mobile) -- the V6.6 construction, exactly as the V13 mobile
 * gate froze it: a 9.4em x 6em field behind the word, the same seam, the same
 * three beats, three strata and the route drawn through them.
 */
function SurfaceCut({
  opening,
  active,
}: {
  opening: MotionValue<number>;
  active: MotionValue<number>;
}) {
  const { y, counter, structure, edge, visibility } = useSeam(opening, active);

  return (
    <motion.span
      className="pointer-events-none absolute left-1/2 top-1/2 -z-10 block h-[6em] w-[9.4em]"
      style={{ transform: "translate(-50%, -50%)", visibility }}
    >
      <span
        className="absolute left-1/2 top-1/2 block h-px w-[9.8em]"
        style={{ transform: `translate(-50%, -50%) rotate(${SEAM_ANGLE.toFixed(3)}deg)` }}
      >
        <motion.span
          data-systems-cut="true"
          className="absolute left-0 top-0 block h-[3.7em] w-full origin-top overflow-clip"
          style={{ y, willChange: "transform", contain: "paint" }}
        >
          <span className="absolute inset-0 block bg-[rgba(22,22,22,0.055)]" />
          <motion.span className="absolute left-0 right-0 top-0 block" style={{ opacity: edge }}>
            <span className="absolute left-0 right-0 top-0 block h-px bg-ink" />
            <span className="absolute left-0 right-0 top-0 block h-[0.22em] bg-[linear-gradient(to_bottom,rgba(22,22,22,0.17),rgba(22,22,22,0))]" />
          </motion.span>
          <motion.span className="absolute inset-0 block" style={{ y: counter }}>
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

function StructuralLayers() {
  return (
    <span className="absolute inset-0 block">
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
          style={{ top: `${0.42 + index * 0.78}em` }}
        >
          <span
            className="absolute left-0 right-0 top-0 block h-px bg-ink"
            style={{ opacity: 0.22 + index * 0.12 }}
          />
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
