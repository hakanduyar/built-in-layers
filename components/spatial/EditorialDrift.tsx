"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionStyle } from "motion/react";
import {
  DRIFT_SETTLE,
  driftMeasure,
  driftPlate,
  driftRouteRuns,
  driftSection,
  type DriftRouteStop,
  type DriftSectionId,
} from "@/lib/spatial/editorialDrift";

// Spatial Portfolio V5 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §19). §26-31.
//
// The lower homepage keeps its exact semantic order and its exact content.
// What changes is that each section is a BLOCK ON A TRACK rather than a
// centred column, and where it sits on that track depends on how far it has
// travelled through the viewport.
//
// WHY THE POSITION IS A FRACTION, NOT A DISTANCE
//
// Everything is expressed as a fraction of the free space between the track's
// padding and the block's own width:
//
//   x = pad + f x (100vw - 2·pad - blockWidth)
//
// so for any f in [0,1] the block is inside the track BY CONSTRUCTION, at
// every viewport width. There is no width at which drift can push content off
// the page, which matters because the alternative -- translating a
// container-width section by a fixed vw amount -- overflows on exactly the
// viewports nobody screenshots. It also makes §36 fall out for free: the free
// space at 375px is a few dozen pixels, so mobile drift is inherently minimal
// without a single media query in the motion code.
//
// WHY NO SCROLL FILTER HERE
//
// The spatial camera filters raw scroll because its wheel-step edges are
// visible at that amplitude. Drift moves a block by single-digit vw across a
// whole viewport of scrolling, so the per-notch increment is well under a
// pixel and there is nothing to dissolve. Adding a second rAF filter per
// section would cost more than it could possibly smooth.

type EditorialDriftProps = { children: ReactNode };

/**
 * The track. Holds the two custom properties every block's position is derived
 * from, so the width used for layout and the width used in the transform can
 * never disagree.
 */
export function EditorialDrift({ children }: EditorialDriftProps) {
  return (
    <div
      data-editorial-drift="true"
      // V6 narrowed the desktop block from 78vw/1080px to 72vw/1020px. That is
      // not a typographic change for its own sake -- it is what creates the free
      // space the widened drift fractions spend. At 1440px it takes the track's
      // free width from 245px to 305px, and combined with the wider fractions
      // roughly doubles real lateral travel.
      className="relative w-full overflow-clip [--drift-pad:3vw] [--drift-w:min(92vw,1020px)] lg:[--drift-pad:4vw] lg:[--drift-w:min(72vw,1020px)]"
    >
      {/* V6.1: the spine now runs at two depths. The background runs sit behind
          the content planes; the foreground run comes in front of them, so the
          route reads as travelling through the space rather than as a rail drawn
          beside a list of sections (§20). */}
      <DriftRoute layer="background" />
      <div className="relative">{children}</div>
      <DriftRoute layer="foreground" />
      <DriftSettle />
    </div>
  );
}

/**
 * V6 (§20.2): the route made visible.
 *
 * The container is exactly the track's FREE width -- `100vw - 2·pad - blockWidth`
 * -- positioned at the track's padding. Inside that box a fraction `f` is simply
 * `f × 100%`, and because the blocks are positioned by `pad + f × (that same
 * width)`, a stop at `f` lands precisely on the left edge of a block at `f`. One
 * coordinate system, no drift between the spine and the thing it describes, at
 * every viewport width.
 *
 * Desktop only, and at 14% opacity: on a phone the blocks barely move laterally,
 * so a spine would describe a route that is not really there.
 */
function DriftRoute({ layer }: { layer: "background" | "foreground" }) {
  const foreground = layer === "foreground";
  const runs = driftRouteRuns().filter((run) => run.foreground === foreground);
  if (runs.length === 0) return null;

  // Registration marks belong to the run that owns them, so a mark in front of
  // the content is drawn with the foreground run and never duplicated.
  const marks: DriftRouteStop[] = runs.flatMap((run) => run.stops);

  return (
    <div
      aria-hidden="true"
      // Only the background run carries the test hook, so the existing
      // "spine exists / is absent on mobile" checks keep measuring one element.
      data-drift-route={foreground ? undefined : "true"}
      data-drift-route-layer={layer}
      className={`pointer-events-none absolute bottom-0 top-0 hidden lg:block ${
        foreground ? "z-10" : ""
      }`}
      style={{
        left: "var(--drift-pad)",
        width: "calc(100vw - 2 * var(--drift-pad) - var(--drift-w))",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full text-ink"
      >
        {runs.map((run, index) => (
          <polyline
            key={index}
            points={run.stops.map((stop) => `${stop.fraction * 100},${stop.at * 100}`).join(" ")}
            fill="none"
            stroke="currentColor"
            // A run in front of the content is drawn lighter and thinner than one
            // behind it: coming forward must not mean shouting over the text.
            strokeWidth={foreground ? 1 : 1}
            strokeOpacity={foreground ? 0.1 : 0.15}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {/* A registration mark at every stop: the system has measured this route,
          not merely drawn it. Two strokes each, the same vocabulary the world
          above uses for a scene anchor. */}
      {marks.map((stop, index) => (
        <span
          key={index}
          className="absolute block"
          style={{
            left: `${stop.fraction * 100}%`,
            top: `${stop.at * 100}%`,
            opacity: foreground ? 0.18 : 0.26,
          }}
        >
          <span className="absolute block h-px w-3 bg-ink" style={{ left: -6, top: 0 }} />
          <span className="absolute block w-px bg-ink" style={{ left: 0, top: -5, height: 10 }} />
        </span>
      ))}
    </div>
  );
}

function trackX(fraction: number): string {
  return `calc(var(--drift-pad) + ${fraction} * (100vw - 2 * var(--drift-pad) - var(--drift-w)))`;
}

export function DriftBlock({ id, children }: { id: DriftSectionId; children: ReactNode }) {
  const section = driftSection(id);
  const plate = driftPlate(id);
  const ref = useRef<HTMLDivElement>(null);
  // Entry -> exit across the block's own passage through the viewport, so the
  // block reaches its mid position exactly when it is centred and being read.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // The travelling position. There is NO reduced-motion branch here: the block
  // always binds this value, so server and client always agree, and the parked
  // state is applied by a `prefers-reduced-motion` rule in styles/globals.css
  // against the `--drift-parked` constant published below.
  //
  // It used to be `x: reduceMotion ? parked : x`, which is only correct while
  // `useReducedMotion()` is already true on the FIRST render -- and that is exactly
  // what produced a hydration failure, since the server cannot know the preference.
  // Settling the preference after hydration fixed the mismatch but opened a timing
  // window in which the block was still bound to the scroll; under parallel test
  // load tests/e2e/spatial-v5.spec.ts measured 91.44px of travel through it. CSS
  // has neither problem.
  const x = useTransform(scrollYProgress, [0, 1], [trackX(section.entry), trackX(section.exit)]);

  // V6.8 (JOB 3) DELETED TWO MARKS THAT STOOD HERE, and the test was the brief's
  // own: can a viewer perceive what the element represents without reading the
  // source?
  //
  //   - THE LEAD RULE: a tilted hairline whose angle encoded the block's direction
  //     of lateral travel. Nobody can read "tilt = drift direction" off a lone
  //     diagonal; in every review capture it read as a stray line wandering near
  //     the section. Represented something, communicated nothing. Deleted, along
  //     with driftLeadRule() and its unit tests.
  //   - THE PLATE: a long top rule with a corner tick above each block. Since the
  //     V6.7 completion pass every lower section carries a SystemNode register --
  //     the same corner vocabulary, attached to the section itself -- so the plate
  //     had become a second, unanchored copy of the same statement floating above
  //     the first. Deleted; the register stays, and driftPlate() now carries only
  //     the approach interval.
  //
  // The drift MOTION, the spine, its stops and the terminus all remain: they are
  // the route the blocks actually take.

  return (
    <div ref={ref} className="w-full" style={{ paddingTop: `${plate.gapVh}vh` }}>
      <motion.div
        data-drift-block={id}
        data-drift-plane={section.plane}
        style={
          {
            // V6.1 (§21): each section holds its own measure, derived from its
            // depth. The four blocks are no longer one width with four offsets.
            //
            // The `min()` is load-bearing, not defensive styling: a multiplier above
            // 1 (the `near` plane) applied to a block already at 92vw would push
            // past the viewport on a phone, where the track's free space is only a
            // few pixels. Bounding it against the padded viewport makes overflow
            // impossible at every width by construction -- the same discipline the
            // free-space fraction uses for x.
            width: `min(calc(var(--drift-w) * ${driftMeasure(id)}), calc(100vw - 2 * var(--drift-pad)))`,
            // Reduced motion keeps the composition and drops the movement (§37):
            // the block rests at its mid position -- still an asymmetric, designed
            // placement rather than a centred column. Read only by the media query in
            // styles/globals.css; identical on server and client, so it can never
            // cause a mismatch.
            "--drift-parked": trackX((section.entry + section.exit) / 2),
            x,
          } as MotionStyle
        }
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * ROUTE TERMINATION (V6.1, §25). The CTA itself is the global footer and is not
 * duplicated here; this is the route arriving at its last coordinate and
 * resolving, so the spatial system ENDS rather than stopping because the sections
 * ran out.
 *
 * V6 closed with a single hairline and a 2x2 corner mark, which read as a rule
 * above a footer. The sequence now is: the route approaches, reaches a final
 * registration point, the geometry stabilises into a closed bracket, and a short
 * vertical hands off downward into the CTA that follows.
 *
 * Abstract by construction. §25 forbids "END OF LINE" and every other fake
 * operational label, so completion is stated only in geometry: the marks close,
 * where every other registration mark on the page stays open.
 */
function DriftSettle() {
  return (
    <div
      aria-hidden="true"
      data-drift-terminus="true"
      className="mt-16 lg:mt-32"
      style={{ marginLeft: trackX(DRIFT_SETTLE), width: "var(--drift-w)" }}
    >
      <div className="flex items-center gap-4">
        {/* The route's last run in, thinning as it arrives. */}
        <span className="block h-px w-full bg-line" />
        {/* The terminal mark: a CLOSED rectangle of four strokes, against the
            open two-stroke corner used everywhere else. Closure is the whole
            statement. */}
        <span className="relative block h-3 w-3 shrink-0 border border-ink opacity-70">
          <span className="absolute inset-[3px] block bg-ink opacity-60" />
        </span>
      </div>
      {/* Handoff downward: the world stops travelling laterally and points at
          what comes next. */}
      <span className="mt-3 block h-10 w-px bg-line opacity-70 lg:h-16" />
    </div>
  );
}
