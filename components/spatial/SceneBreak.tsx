"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { layerDefinitions } from "@/data/copy";
import { SCENE_BREAK_BANDS } from "@/lib/spatial/scenes";
import {
  BREAK_COVER_CLOSED,
  BREAK_REVEAL_START,
  breakBandOffset,
  breakWipeOffset,
} from "@/lib/spatial/sceneRoute";

// Spatial Portfolio V4 (feature/spatial-portfolio-v4, not merged to main --
// see docs/DESIGN_SYSTEM.md §18).
//
// V2 bridged the route's discontinuity with a single solid ink panel sweeping
// across. It worked -- the teleport became a cut -- but the owner's review
// called it the most conventional device in the prototype, and it was: a
// slideshow wipe, not this world's own grammar.
//
// V3 rebuilt it out of the same rails the world is drawn with: seven
// horizontal rails closing on the frame from alternating sides over a solid
// field whose only job was to guarantee the frame is genuinely opaque at the
// instant the route jumps.
//
// V14.2 GATE B (owner): on desktop the ink is gone. The owner's reading of the
// V4-V14.1 sequence was that the black read as a render glitch rather than
// as the world structurally opening, broke SYSTEMS' momentum, and was worse
// in reverse. The frame is now covered by THE UNDERSIDE OF THE SURFACE
// (lib/spatial/surfaceCover.ts): the recess -- the 2.5%-ink ground the SYSTEMS
// seam is already opening onto, and the ground route two then travels --
// in the frame's own space, carrying the section the reveal drew at rest:
// the three strata with their names and the descent to SYSTEM, the line
// UNDERNEATH then stands on. Same timing, same opacity contract, same
// guaranteed dwell; different material, and therefore no wipe -- a plane of
// the ground's own tone has no edge worth drawing, so it arrives as a fade
// while the world's seam finishes rising past the frame.
//
// Mobile keeps the V4 rails exactly as the V13 mobile gate froze them: the
// composition below `lg` is not reopened by this gate.

type SceneBreakProps = {
  progress: MotionValue<number>;
};

export function SceneBreak({ progress }: SceneBreakProps) {
  return (
    <div
      data-scene-break="true"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    >
      <InkRails progress={progress} />
    </div>
  );
}

/* ------------------------------------------ the system, on the black */

/**
 * V14.5 (owner: restore the older interlocking black transition). The rails
 * are back on desktop -- black planes closing into the frame from
 * alternating sides over the base field (lib/spatial/sceneRoute.ts: the
 * protected timing, untouched). What the covered frame carries is the
 * UNDERLYING SYSTEM, drawn on the field in paper: the three strata with their
 * names and the descent to SYSTEM, the line UNDERNEATH then stands on. The
 * SYSTEM line sits where UNDERNEATH's own stratum arrives (measured 48.6vh /
 * 50.3vh at 1440 / 1920), the step is the word's own stratum step, and the
 * descent stands where UNDERNEATH's depth rail will (fitted through the
 * world fit the boot script publishes). It stands ABOVE the rails and is
 * present only through the dwell -- from the moment every rail is home to
 * the moment the first lets go -- so it is seen on solid black and never
 * over a moving plane. Desktop only; the mobile field keeps the V13
 * boundary section.
 */
const SYSTEM_LINE = "49.5%";
const STRATA_STEP_EM = 0.96;
const WORD_SCALE = "clamp(2.5rem, 16vw, 15rem)";
const DESCENT_X = "calc(47.3vw * var(--world-fit, 1) - 292px)";
const LABEL_X = "calc(28vw * var(--world-fit, 1) - 292px)";

function SystemOnInk({ progress }: { progress: MotionValue<number> }) {
  const dwell = useTransform(progress, (value) =>
    value >= BREAK_COVER_CLOSED && value <= BREAK_REVEAL_START ? 1 : 0,
  );
  return (
    <motion.span
      aria-hidden="true"
      data-cover-system="true"
      className="absolute inset-0 hidden lg:block"
      style={{ fontSize: WORD_SCALE, opacity: dwell }}
    >
      {layerDefinitions.map((layer, index) => {
        const depth = layerDefinitions.length - 1 - index;
        return (
          <span
            key={layer.label}
            aria-hidden="true"
            data-cover-stratum={layer.label.toLowerCase()}
            className="absolute left-0 right-0 block"
            style={{ top: `calc(${SYSTEM_LINE} - ${depth * STRATA_STEP_EM}em)` }}
          >
            <span
              aria-hidden="true"
              className="absolute left-0 right-0 top-0 block h-px bg-paper"
              style={{ opacity: 0.3 + index * 0.2 }}
            />
            <span
              aria-hidden="true"
              className="absolute block font-mono text-mono-label tracking-mono-label uppercase text-paper"
              style={{ left: LABEL_X, top: 8, opacity: 0.85 }}
            >
              {layer.label}
            </span>
          </span>
        );
      })}
      <span
        aria-hidden="true"
        data-cover-descent="true"
        className="absolute block w-px bg-paper opacity-60"
        style={{
          left: DESCENT_X,
          top: `calc(${SYSTEM_LINE} - ${(layerDefinitions.length - 1) * STRATA_STEP_EM}em)`,
          height: `${(layerDefinitions.length - 1) * STRATA_STEP_EM}em`,
        }}
      />
    </motion.span>
  );
}

/* ------------------------------------------------------------ the rails */

function InkRails({ progress }: { progress: MotionValue<number> }) {
  // The slowest-arriving element of the break, and the one guaranteeing the
  // frame is genuinely opaque through the dwell.
  const fieldX = useTransform(progress, (value) => `${breakWipeOffset(value)}%`);
  return (
    // V14.5: the rails run on every viewport again. Below `lg` the field
    // carries the V13 boundary section; at `lg` it carries the system.
    <div aria-hidden="true" className="absolute inset-0">
      <motion.div className="absolute inset-0 bg-ink" style={{ x: fieldX }}>
        {/* V6.1: the boundary's own section, carried ON the field so it is only
            ever seen while the field is home -- i.e. during the dwell, and
            nowhere else in the journey. */}
        <span aria-hidden="true" className="absolute inset-0 block lg:hidden">
          <BoundarySection />
        </span>
      </motion.div>
      {Array.from({ length: SCENE_BREAK_BANDS }, (_, index) => (
        <BreakRail key={index} index={index} progress={progress} />
      ))}
      <SystemOnInk progress={progress} />
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
      <span
        aria-hidden="true"
        className="absolute left-0 top-[46%] block h-px w-full bg-line opacity-[0.16]"
      />
      <span
        aria-hidden="true"
        className="absolute left-[31%] top-[46%] block h-px w-[6vw] bg-line opacity-50"
      />
      {CONTACT_BUNDLE.map((offset) => (
        <span
          key={offset}
          aria-hidden="true"
          className="absolute top-[26%] block h-[48%] w-px bg-line"
          style={{ left: `${63 + offset}%`, opacity: 0.22 - Math.abs(offset) * 0.02 }}
        />
      ))}
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
  // carries a paper-toned hairline so the direction of each rail is readable
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
        // V6.2: the leading edge is RAKED, not square, so the composite closing
        // edge is a run of interlocking diagonals aligned with the oblique
        // world rather than a comb of rectangles on the screen axes.
        clipPath: fromRight
          ? `polygon(${RAKE}% 0, 100% 0, 100% 100%, 0 100%)`
          : `polygon(0 0, 100% 0, ${100 - RAKE}% 100%, 0 100%)`,
        // The hairline runs ALONG the rake, as part of the fill (V14.3 Gate D:
        // the line token, not signal -- no orange anywhere in the portfolio).
        backgroundImage: `linear-gradient(${fromRight ? 108 : 252}deg, var(--color-line) 0 2px, var(--color-ink) 2px 100%)`,
        x,
      }}
    />
  );
}

/** Horizontal rake of a rail's leading edge, in percent of frame width. ~63px
 *  at 1440, against an ~82px band height: a clearly readable diagonal. */
const RAKE = 4.4;
