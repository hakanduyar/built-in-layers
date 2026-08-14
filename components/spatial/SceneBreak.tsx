"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { SCENE_BREAK_BANDS } from "@/lib/spatial/scenes";
import { breakBandOffset, breakWipeOffset } from "@/lib/spatial/sceneRoute";

// Spatial Portfolio V3 (feature/spatial-portfolio-v3, not merged to main --
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
  // Linear, therefore always behind the rails -- it finishes closing exactly
  // at the cut and nothing can open a gap before it.
  const fieldX = useTransform(progress, (value) => `${breakWipeOffset(value)}%`);

  return (
    <div
      data-scene-break="true"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    >
      <motion.div className="absolute inset-0 bg-ink" style={{ x: fieldX }} />
      {Array.from({ length: SCENE_BREAK_BANDS }, (_, index) => (
        <BreakRail key={index} index={index} progress={progress} />
      ))}
    </div>
  );
}

function BreakRail({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const x = useTransform(progress, (value) => `${breakBandOffset(value, index)}%`);
  // Even rails close from the right, odd from the left; the leading edge
  // carries the signal hairline so the direction of each rail is readable
  // for the fraction of a second it is in motion.
  const fromRight = index % 2 === 0;

  return (
    <motion.div
      data-break-rail={index}
      className={`absolute left-0 w-full bg-ink border-signal ${fromRight ? "border-l" : "border-r"}`}
      style={{
        top: `${(index * 100) / SCENE_BREAK_BANDS}%`,
        // Slight overlap between rails so sub-pixel rounding can never leave
        // a paper-coloured seam at full cover.
        height: `${100 / SCENE_BREAK_BANDS + 0.3}%`,
        x,
      }}
    />
  );
}
