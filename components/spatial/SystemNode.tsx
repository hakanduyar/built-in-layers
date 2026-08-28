"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

// Spatial Portfolio V6.7 completion pass (feature/spatial-portfolio-v5, not merged
// to main -- see docs/DESIGN_SYSTEM.md §27).
//
// THE PROBLEM THIS EXISTS TO SOLVE
//
// Every V6.x report ended with the same admission: the page is strong through
// SYSTEMS -> BLACK -> UNDERNEATH and then the quality drops. The reason was never
// that the lower sections were badly typeset. It was that they were a DIFFERENT
// KIND OF OBJECT. Above the hand-over, everything is a coordinate in a world the
// system is navigating -- it has a position, a registration mark, and an
// acquisition state that changes as the camera closes. Below it, each section was
// an index number, a rule and an <h2>: page furniture.
//
// So this is not a decorative frame. It is the same behaviour the spatial world's
// destination surfaces already have, applied to the real sections:
//
//   1. REGISTRATION. The closed corner -- horizontal arm, vertical arm, inset
//      second mark -- which is the world's own RESOLVED form, the one route two's
//      anchors and the work branch's terminus both carry. A section wearing it is
//      declaring itself a coordinate rather than a block.
//
//   2. ACQUISITION STATE. Detected -> Acquired -> Resolved, driven by the
//      section's own real distance from the viewport centre. This is the same
//      vocabulary and the same three states the distant destination plates use, so
//      a reader who watched "05 / DETECTED" resolve across the diagonal meets the
//      identical language when the real section arrives. It is derived from
//      scroll geometry, never authored, and it describes something true: how much
//      of this section the reader can actually see.
//
//   3. THE SPINE. One vertical rule down the section's leading edge, whose
//      opacity tracks the same value. It is the route continuing through the
//      section -- the reason the lower page reads as travelled rather than
//      scrolled.
//
// WHAT IT DELIBERATELY IS NOT: a card, a panel, a bordered box, a HUD, or a
// container with a background. It contributes three hairlines and two words. All
// of it is aria-hidden; the section's own heading remains the only accessible
// statement of what it is.

export type SystemNodeProps = {
  /** The section's real IA index, exactly as the section renders it. */
  index: string;
  /** The section's real label. */
  label: string;
  children: ReactNode;
  /**
   * Right-hand register instead of left. Used where the drift track already
   * carries the block to the right of the measure, so the node's edge stays on
   * the side the route is actually on.
   */
  align?: "left" | "right";
};

/** The system's three words for how well it currently knows a surface. Shared
 *  verbatim with the spatial world's destination plates. */
const STATE: string[] = ["Detected", "Acquired", "Resolved"];

export function SystemNode({ index, label, children, align = "left" }: SystemNodeProps) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  // The section's own passage through the viewport -- the same signal DriftBlock
  // uses, so the node and the plate it sits on can never disagree about where the
  // section is.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // Acquisition rises as the section enters and holds once it owns the frame. It
  // does NOT fall away again on exit: a destination the system has resolved stays
  // resolved -- reverting would say the page forgot, which is not true and reads
  // as flicker on the way past.
  const acquired = useTransform(scrollYProgress, [0.06, 0.3, 0.52], [0, 1, 2]);
  const stateLabel = useTransform<number, string>(
    acquired,
    (v) => STATE[Math.min(2, Math.max(0, Math.round(v)))]!,
  );
  const presence = useTransform(scrollYProgress, [0.04, 0.34], [0.28, 1]);
  // Hoisted: every derived opacity is a hook, so none of them may live inside a
  // JSX expression or behind a conditional.
  const spineOpacity = useTransform(presence, (v) => 0.1 + v * 0.22);
  const armOpacity = useTransform(presence, (v) => 0.2 + v * 0.45);
  const insetOpacity = useTransform(presence, (v) => 0.12 + v * 0.28);
  const stateOpacity = useTransform(presence, (v) => 0.35 + v * 0.45);

  const edge = align === "right" ? "right-0" : "left-0";
  const pad = align === "right" ? "pr-6 lg:pr-8" : "pl-6 lg:pl-8";
  const markInset = align === "right" ? "right-1.5" : "left-1.5";

  return (
    <section ref={ref} className="relative mt-16 lg:mt-32">
      {/* THE SPINE. One rule, the section's full height, on the edge the route is
          on. This is the single element that makes the lower page read as one
          continuous journey rather than five stacked documents. */}
      <motion.span
        aria-hidden="true"
        className={`absolute top-0 hidden h-full w-px bg-ink lg:block ${edge}`}
        style={{ opacity: reduceMotion ? 0.22 : spineOpacity }}
      />

      {/* THE REGISTER. The world's resolved corner form, and the state the system
          is currently in with respect to this section. */}
      <div aria-hidden="true" className={`relative ${pad}`}>
        <motion.span
          className={`absolute top-0 block h-px w-10 bg-ink ${edge}`}
          style={{ opacity: reduceMotion ? 0.5 : armOpacity }}
        />
        <motion.span
          className={`absolute top-1.5 block h-px w-3 bg-ink ${markInset}`}
          style={{ opacity: reduceMotion ? 0.3 : insetOpacity }}
        />
        <div className="flex items-baseline gap-4 pt-4">
          <span className="font-mono text-mono-label tracking-mono-label uppercase text-ink-muted">
            {index} / {label}
          </span>
          {!reduceMotion && (
            <motion.span
              data-node-state
              className="font-mono text-mono-label tracking-mono-label uppercase text-ink-muted"
              style={{ opacity: stateOpacity }}
            >
              {stateLabel}
            </motion.span>
          )}
        </div>
      </div>

      <div className={pad}>{children}</div>
    </section>
  );
}
