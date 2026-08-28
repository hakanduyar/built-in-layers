"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { SCENE_BREAK_BANDS } from "@/lib/spatial/scenes";
import { breakBandOffset, breakWipeOffset } from "@/lib/spatial/sceneRoute";

// Spatial Portfolio V4 (feature/spatial-portfolio-v4, not merged to main --
// see docs/DESIGN_SYSTEM.md §18).
//
// V2 bridged the route's discontinuity with a single solid ink panel sweeping
// across. It worked -- the teleport became a cut -- but the owner's review
// called it the most conventional device in the prototype, and it was: a
// slideshow wipe, not this world's own grammar.
//
// V3 rebuilds it out of the same rails the world is drawn with. Seven
// horizontal rails close on the frame from ALTERNATING sides, each on a
// different arrival curve, so the coordinate system reads as snapping shut
// rather than being swiped over. The solid field is still there, but it is
// now the slowest, last-closing element -- one part of the break, not the
// whole idea (§4) -- and its only job is to guarantee that the frame is
// genuinely opaque at the exact instant the route jumps.
//
// What this deliberately is not: an explosion, a flash, a colour wash, an
// elastic bounce, or anything with physics.

type SceneBreakProps = {
  progress: MotionValue<number>;
};

export function SceneBreak({ progress }: SceneBreakProps) {
  // The slowest-arriving element of the break, and the one guaranteeing the
  // frame is genuinely opaque through the dwell.
  const fieldX = useTransform(progress, (value) => `${breakWipeOffset(value)}%`);

  return (
    <div
      data-scene-break="true"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    >
      <motion.div className="absolute inset-0 bg-ink" style={{ x: fieldX }}>
        {/* V6.1: the boundary's own section, carried ON the field so it is only
            ever seen while the field is home -- i.e. during the dwell, and
            nowhere else in the journey.
            The V6 collision's fully-covered state was flat, unbroken ink, which
            is what made the whole event read as a transition overlay laid over
            the site rather than as a boundary the world ran into. A handful of
            structural rules inside that ink says instead: this is the inside of
            something. It costs six absolutely-positioned spans, adds no global
            density (it does not exist outside the break), and states nothing --
            there is no label, no readout, no number. */}
        <BoundarySection />
      </motion.div>
      {Array.from({ length: SCENE_BREAK_BANDS }, (_, index) => (
        <BreakRail key={index} index={index} progress={progress} />
      ))}
    </div>
  );
}

/** Fractions of the frame width the boundary's internal rules sit at. Uneven
 *  on purpose: evenly spaced rules read as a ruled grid. */
const SECTION_RULES = [0.17, 0.31, 0.63, 0.82];

function BoundarySection() {
  // Every span carries `aria-hidden` explicitly. It is redundant -- the whole
  // SceneBreak subtree is already hidden -- but the spatial world's convention is
  // that any direct child of a layer inside the sticky frame states it for
  // itself, so a child added later cannot silently reach the a11y tree. It is
  // enforced by tests/e2e/spatial.spec.ts, which counts these spans as children
  // of a depth plane; six of them without it is what caught this.
  return (
    <>
      {SECTION_RULES.map((at, index) => (
        <span
          key={at}
          aria-hidden="true"
          className="absolute top-0 block h-full w-px bg-line"
          style={{ left: `${at * 100}%`, opacity: index % 2 === 0 ? 0.2 : 0.12 }}
        />
      ))}
      {/* One horizontal rule crossing them, and one short signal mark on it --
          the single accent in the whole break, at the contact height. */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-[46%] block h-px w-full bg-line opacity-[0.16]"
      />
      <span
        aria-hidden="true"
        className="absolute left-[31%] top-[46%] block h-px w-[6vw] bg-signal opacity-50"
      />
      {/* V6.2. The dwell is now GUARANTEED to be on screen for ~190ms (see the
          collision guard in cameraFilter.ts), where before a fast scroll could
          reduce it to a frame. A frame of flat ink needed nothing in it; a fifth
          of a second of it does, or the covered state reads as an empty overlay.
          These are the boundary's own section marks -- the converging bundle that
          was tightening on the approach, seen from inside, plus a contact
          registration at the point of impact. Still nothing that states a value. */}
      {CONTACT_BUNDLE.map((offset) => (
        <span
          key={offset}
          aria-hidden="true"
          className="absolute top-[26%] block h-[48%] w-px bg-line"
          style={{ left: `${63 + offset}%`, opacity: 0.22 - Math.abs(offset) * 0.02 }}
        />
      ))}
      {/* The contact registration: a closed corner, the resolved form the world
          uses on route two, already present at the moment the route changes. */}
      <span aria-hidden="true" className="absolute left-[63%] top-[46%] block">
        <span
          className="absolute block h-px w-6 bg-line opacity-50"
          style={{ left: -24, top: 0 }}
        />
        <span
          className="absolute block w-px bg-line opacity-50"
          style={{ left: 0, top: -12, height: 24 }}
        />
      </span>
    </>
  );
}

/** The converging bundle, seen in section: uneven, tightest at the contact. */
const CONTACT_BUNDLE = [-3.4, -1.6, 1.9, 4.2];

function BreakRail({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const x = useTransform(progress, (value) => `${breakBandOffset(value, index)}%`);
  // Even rails close from the right, odd from the left; the leading edge
  // carries the signal hairline so the direction of each rail is readable
  // for the fraction of a second it is in motion.
  const fromRight = index % 2 === 0;

  return (
    <motion.div
      data-break-rail={index}
      className="absolute left-0 w-full bg-ink"
      style={{
        top: `${(index * 100) / SCENE_BREAK_BANDS}%`,
        // Slight overlap between rails so sub-pixel rounding can never leave
        // a paper-coloured seam at full cover.
        height: `${100 / SCENE_BREAK_BANDS + 0.3}%`,
        // V6.2: the leading edge is RAKED, not square.
        //
        // Eleven square-ended full-width bands closing from alternating sides is
        // geometrically a shutter, and that is how it read. Raking each leading
        // edge turns the composite closing edge into a run of interlocking
        // diagonals instead of a comb of rectangles, and it aligns the break's
        // own geometry with the oblique world it belongs to rather than with the
        // screen axes.
        clipPath: fromRight
          ? `polygon(${RAKE}% 0, 100% 0, 100% 100%, 0 100%)`
          : `polygon(0 0, 100% 0, ${100 - RAKE}% 100%, 0 100%)`,
        // The signal hairline runs ALONG the rake. As a border it would have been
        // clipped off by the clip-path, and a vertical border on a raked edge
        // would contradict the shape anyway, so it is part of the fill.
        backgroundImage: `linear-gradient(${fromRight ? 108 : 252}deg, var(--color-signal) 0 2px, var(--color-ink) 2px 100%)`,
        x,
      }}
    />
  );
}

/** Horizontal rake of a rail's leading edge, in percent of frame width. ~63px
 *  at 1440, against an ~82px band height: a clearly readable diagonal. */
const RAKE = 4.4;
