"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { layerDefinitions } from "@/data/copy";
import { SCENE_BREAK_BANDS } from "@/lib/spatial/scenes";
import { breakBandOffset, breakWipeOffset } from "@/lib/spatial/sceneRoute";
import {
  coverOpacity,
  labelPresence,
  landingDrift,
  sectionPresence,
  upperSectionPresence,
} from "@/lib/spatial/surfaceCover";

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
      <SurfaceCover progress={progress} />
      <InkRails progress={progress} />
    </div>
  );
}

/* ---------------------------------------------- desktop: the underside */

/**
 * Where the section's SYSTEM line sits in the frame once the cover has let
 * go: the screen height of UNDERNEATH's own SYSTEM stratum at
 * BREAK_REVEAL_END (measured 48.6vh at 1440x900, 50.3vh at 1920x1080), set
 * between the two so the SURFACE line above it clears the frame top at both.
 */
const SYSTEM_LINE = "49.5%";
/** The reveal's own stratum step (SystemsWord's RevealedStructure, 0.98em),
 *  in em of the SYSTEMS word's scale, so the section at rest is the section
 *  that was just opened -- two hundredths tighter so the SURFACE line and its
 *  name stay inside a 900px frame. */
const STRATA_STEP_EM = 0.96;
/** The SYSTEMS word's type scale: the em the section is drawn in. */
const WORD_SCALE = "clamp(2.5rem, 16vw, 15rem)";
/**
 * The descent's x: registered to UNDERNEATH's depth rail as the cover lets go,
 * fitted to the rail's measured screen position at 1440x900 (24.5vw) and
 * 1920x1080 (33.6vw) through the world fit the boot script publishes. The
 * rail then continues it from the frame's top, in the world.
 */
const DESCENT_X = "calc(47.3vw * var(--world-fit, 1) - 292px)";
/** The stratum labels: the world's own inset from the descent (the anchor's
 *  label offset), so the names sit where UNDERNEATH's SYSTEM label will. */
const LABEL_X = "calc(28vw * var(--world-fit, 1) - 292px)";
/**
 * How far the landing decompresses across the reveal, in world units: at
 * BREAK_REVEAL_START the reorient composition stands this much to the right
 * of where it settles (measured: the depth rail 34.5vw -> 22.7vw at 1440x900,
 * 19.3 world-vw of label inset at both viewports). The section travels the
 * same way. Its 4vh of vertical settle is deliberately NOT mirrored: carried,
 * it lifted the SURFACE line off the frame's top through the whole dwell,
 * and a 4vh drift between two faint lines during a fade is not worth losing
 * the surface for.
 */
const LANDING_DRIFT_VW = 13;

function SurfaceCover({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, coverOpacity);
  const presence = useTransform(progress, sectionPresence);
  const upper = useTransform(progress, upperSectionPresence);
  const drift = useTransform(progress, landingDrift);
  const labels = useTransform(progress, labelPresence);
  const x = useTransform(
    drift,
    (d) => `calc(${(LANDING_DRIFT_VW * d).toFixed(3)}vw * var(--world-fit, 1))`,
  );
  return (
    <motion.div
      data-surface-cover="true"
      aria-hidden="true"
      className="absolute inset-0 hidden bg-paper lg:block"
      style={{ opacity, fontSize: WORD_SCALE }}
    >
      {/* The recess: the same 2.5% ink the opened surface shows under the
          seam and the world lays under route two. Opaque as a pair with the
          paper beneath it, which is what hides the jump. */}
      <span aria-hidden="true" className="absolute inset-0 block bg-[rgba(22,22,22,0.025)]" />
      {/* The section, travelling with the landing as the cover lets go. */}
      <motion.span aria-hidden="true" className="absolute inset-0 block" style={{ x }}>
        {layerDefinitions.map((layer, index) => {
          const depth = layerDefinitions.length - 1 - index;
          const foot = depth === 0;
          return (
            <motion.span
              key={layer.label}
              aria-hidden="true"
              data-cover-stratum={layer.label.toLowerCase()}
              // Overrunning both edges: the section travels with the landing,
              // and a line that stopped at the frame's edge would show where.
              className="absolute -left-[40vw] -right-[40vw] block"
              style={{
                top: `calc(${SYSTEM_LINE} - ${depth * STRATA_STEP_EM}em)`,
                // The SYSTEM line hands over to the world's own as the cover
                // lets go; the strata above it have nothing to hand over to
                // and stay with the field.
                opacity: foot ? presence : upper,
              }}
            >
              <span
                aria-hidden="true"
                className="absolute left-0 right-0 top-0 block h-px bg-ink"
                style={{ opacity: 0.2 + index * 0.12 }}
              />
              <motion.span
                aria-hidden="true"
                className="absolute block font-mono text-mono-label tracking-mono-label uppercase text-ink-muted"
                style={{
                  left: `calc(40vw + ${LABEL_X})`,
                  top: 8,
                  fontSize: "0.6875rem",
                  opacity: labels,
                }}
              >
                {layer.label}
              </motion.span>
            </motion.span>
          );
        })}
        {/* THE DESCENT: from the surface line down to SYSTEM -- UNDERNEATH's
            depth rail, drawn to its foot before the word stands there. */}
        <motion.span
          aria-hidden="true"
          data-cover-descent="true"
          className="absolute block w-px bg-line"
          style={{
            left: DESCENT_X,
            top: `calc(${SYSTEM_LINE} - ${(layerDefinitions.length - 1) * STRATA_STEP_EM}em)`,
            height: `${(layerDefinitions.length - 1) * STRATA_STEP_EM}em`,
            opacity: upper,
          }}
        />
      </motion.span>
    </motion.div>
  );
}

/* ------------------------------------------------- mobile: the V4 rails */

function InkRails({ progress }: { progress: MotionValue<number> }) {
  // The slowest-arriving element of the break, and the one guaranteeing the
  // frame is genuinely opaque through the dwell.
  const fieldX = useTransform(progress, (value) => `${breakWipeOffset(value)}%`);
  return (
    <div aria-hidden="true" className="absolute inset-0 lg:hidden">
      <motion.div className="absolute inset-0 bg-ink" style={{ x: fieldX }}>
        {/* V6.1: the boundary's own section, carried ON the field so it is only
            ever seen while the field is home -- i.e. during the dwell, and
            nowhere else in the journey. */}
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
      <span
        aria-hidden="true"
        className="absolute left-0 top-[46%] block h-px w-full bg-line opacity-[0.16]"
      />
      <span
        aria-hidden="true"
        className="absolute left-[31%] top-[46%] block h-px w-[6vw] bg-signal opacity-50"
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
        // V6.2: the leading edge is RAKED, not square, so the composite closing
        // edge is a run of interlocking diagonals aligned with the oblique
        // world rather than a comb of rectangles on the screen axes.
        clipPath: fromRight
          ? `polygon(${RAKE}% 0, 100% 0, 100% 100%, 0 100%)`
          : `polygon(0 0, 100% 0, ${100 - RAKE}% 100%, 0 100%)`,
        // The signal hairline runs ALONG the rake, as part of the fill.
        backgroundImage: `linear-gradient(${fromRight ? 108 : 252}deg, var(--color-signal) 0 2px, var(--color-ink) 2px 100%)`,
        x,
      }}
    />
  );
}

/** Horizontal rake of a rail's leading edge, in percent of frame width. ~63px
 *  at 1440, against an ~82px band height: a clearly readable diagonal. */
const RAKE = 4.4;
