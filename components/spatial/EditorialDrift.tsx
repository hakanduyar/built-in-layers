"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import {
  DRIFT_SETTLE,
  driftLeadRule,
  driftSection,
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
      className="relative w-full overflow-clip [--drift-pad:3vw] [--drift-w:min(92vw,1080px)] lg:[--drift-pad:4vw] lg:[--drift-w:min(78vw,1080px)]"
    >
      {children}
      <DriftSettle />
    </div>
  );
}

function trackX(fraction: number): string {
  return `calc(var(--drift-pad) + ${fraction} * (100vw - 2 * var(--drift-pad) - var(--drift-w)))`;
}

export function DriftBlock({ id, children }: { id: DriftSectionId; children: ReactNode }) {
  const section = driftSection(id);
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // Entry -> exit across the block's own passage through the viewport, so the
  // block reaches its mid position exactly when it is centred and being read.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [trackX(section.entry), trackX(section.exit)]);

  const rule = driftLeadRule(id);

  return (
    <div ref={ref} className="w-full">
      <motion.div
        data-drift-block={id}
        style={{
          width: "var(--drift-w)",
          // Reduced motion keeps the composition and drops the movement (§37):
          // the block simply rests at its mid position, which is still an
          // asymmetric, designed placement rather than a centred column.
          x: reduceMotion ? trackX((section.entry + section.exit) / 2) : x,
        }}
      >
        {/* §29: the block's own direction of travel, stated as structure. The
            tilt is derived from the drift table, so it cannot describe a
            direction the block does not take. */}
        <div
          aria-hidden="true"
          className="mb-8 hidden lg:block"
          style={{ width: `${rule.width}vw`, height: `${Math.abs(rule.height)}vh` }}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full text-line">
            <line
              x1="0"
              y1={rule.height >= 0 ? 0 : 100}
              x2="100"
              y2={rule.height >= 0 ? 100 : 0}
              stroke="currentColor"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

/**
 * The settle (§30's "CTA: recenters and settles"). The CTA itself is the
 * global footer and is not duplicated here; this is the track coming to rest
 * in front of it, so the world stops on a deliberate mark instead of simply
 * running out. Purely structural -- no copy, nothing in the accessibility
 * tree.
 */
function DriftSettle() {
  return (
    <div
      aria-hidden="true"
      className="mt-16 lg:mt-32"
      style={{ marginLeft: trackX(DRIFT_SETTLE), width: "var(--drift-w)" }}
    >
      <div className="flex items-center gap-3">
        <span className="block h-px w-full bg-line" />
        <span className="block h-2 w-2 shrink-0 border-l border-t border-ink" />
      </div>
    </div>
  );
}
