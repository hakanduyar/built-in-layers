"use client";

import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { MonoLabel } from "@/components/ui/MonoLabel";
import type { SystemAnnotation, SystemAnnotationRow } from "@/lib/spatial/systemPov";

// Spatial Portfolio V5 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §19). The ACQUISITION half of the V5 transition
// vocabulary (§32).
//
// WHAT THIS IS NOT
//
// Not a HUD. There is no always-visible panel, no telemetry, no status feed,
// no code rain, no reticle following the pointer. Nothing here renders unless
// the camera is approaching the scene it belongs to, and at its fullest the
// whole layer is: four corner brackets, one hairline, one case index, and two
// lines of real metadata -- §11's exact budget. The project is the hero; this
// is the system noticing it.
//
// THE LIFECYCLE (§10)
//
// Driven by the SIGNED approach value, so the three phases genuinely differ:
//
//   approaching  sparse corner geometry appears -- the frame, nothing in it
//   focused      the case index, then the classification, resolve inside it
//   departing    the classification goes first, and the brackets shorten to
//                stubs before fading, so the frame dissolves toward the route
//                residue rather than switching off
//
// Under reduced motion and before hydration the `approach` prop is null and a
// constant stands in for it, so the frame is simply drawn in its resolved
// state: a composition rather than an animation (§37).
//
// ACCESSIBILITY (§44). The metadata rows carry real, non-duplicated project
// facts -- which layer the lead evidence belongs to, and the project's real
// phase -- so they are exposed as a definition list. The brackets, hairline
// and case index are orientation marks and are hidden.

type SystemPOVProps = {
  annotation: SystemAnnotation;
  /** -1 ahead, 0 framed, +1 past. `null` renders the resolved state, static. */
  approach: MotionValue<number> | null;
  /** Mobile keeps two corners and one row (§36). */
  compact?: boolean;
  /** After the reposition the world's marks tighten (§25). */
  resolved?: boolean;
};

/** How far outside the scene block the brackets sit. */
const BRACKET_INSET = -14;

export function SystemPOV({
  annotation,
  approach,
  compact = false,
  resolved = false,
}: SystemPOVProps) {
  // A constant stand-in keeps the hook order identical in the static tree, so
  // the pre-hydration -> enhanced swap can never reorder hooks.
  const still = useMotionValue(0);
  const state = approach ?? still;
  const animated = approach !== null;

  const corners = compact ? COMPACT_CORNERS : CORNERS;
  const rows = compact ? annotation.rows.slice(0, 1) : annotation.rows;

  return (
    <div
      data-system-pov="true"
      className="pointer-events-none absolute"
      style={{
        left: BRACKET_INSET,
        right: BRACKET_INSET,
        top: BRACKET_INSET,
        bottom: BRACKET_INSET,
      }}
    >
      {corners.map((corner) => (
        <Bracket
          key={corner.key}
          corner={corner}
          state={state}
          animated={animated}
          resolved={resolved}
        />
      ))}
      {/* V6 (§20.4): one graduated scale along the frame's lower edge, arriving
          with the classification. It is the difference between a frame drawn
          around a thing and a frame MEASURING a thing -- the cheapest honest way
          to read as acquisition rather than as decoration. Desktop only: at
          375px it would crowd the composition it is supposed to be observing. */}
      {!compact && <MeasureScale state={state} animated={animated} />}
      <Cluster
        index={annotation.index}
        rows={rows}
        state={state}
        animated={animated}
        resolved={resolved}
      />
    </div>
  );
}

/* --------------------------------------------------------------- brackets */

type Corner = {
  key: string;
  box: string;
  arm: string;
  origin: string;
  /** The corners the camera leaves behind hold on marginally longer. */
  trailing: boolean;
};

const CORNERS: Corner[] = [
  {
    key: "tl",
    box: "left-0 top-0",
    arm: "left-0 top-0",
    origin: "origin-top-left",
    trailing: false,
  },
  {
    key: "tr",
    box: "right-0 top-0",
    arm: "right-0 top-0",
    origin: "origin-top-right",
    trailing: true,
  },
  {
    key: "bl",
    box: "left-0 bottom-0",
    arm: "left-0 bottom-0",
    origin: "origin-bottom-left",
    trailing: false,
  },
  {
    key: "br",
    box: "right-0 bottom-0",
    arm: "right-0 bottom-0",
    origin: "origin-bottom-right",
    trailing: true,
  },
];

const COMPACT_CORNERS = CORNERS.filter((corner) => corner.key === "tl" || corner.key === "br");

function Bracket({
  corner,
  state,
  animated,
  resolved,
}: {
  corner: Corner;
  state: MotionValue<number>;
  animated: boolean;
  resolved: boolean;
}) {
  // Resolved marks are a shade more present and a shade larger after the
  // reposition (§25): the same grammar held more strictly, not a new theme.
  const peak = resolved ? 0.6 : 0.46;
  const size = resolved ? 26 : 22;

  const opacity = useTransform(
    state,
    [-1, -0.55, -0.12, 0.12, corner.trailing ? 0.72 : 0.5, 1],
    [0, 0.14, peak, peak, 0.1, 0],
  );
  const scale = useTransform(state, [-1, 0, 1], [0.55, 1, 0.28]);

  return (
    <motion.span
      aria-hidden="true"
      data-system-bracket={corner.key}
      className={`absolute block ${corner.box} ${corner.origin}`}
      style={
        animated
          ? { width: size, height: size, opacity, scaleX: scale, scaleY: scale }
          : { width: size, height: size, opacity: peak }
      }
    >
      <span className={`absolute block h-px w-full bg-ink ${corner.arm}`} />
      <span className={`absolute block h-full w-px bg-ink ${corner.arm}`} />
    </motion.span>
  );
}

/**
 * A graduated scale on the frame's lower edge: one hairline, ticks of two
 * lengths, no numbers. Numbers would be fabricated data (§19.11's "no fake
 * telemetry"); graduation alone carries the meaning, which is that the frame is
 * an instrument rather than an ornament.
 */
function MeasureScale({ state, animated }: { state: MotionValue<number>; animated: boolean }) {
  // Arrives with the classification and leaves before it, so the frame is never
  // left measuring a scene the camera has already released.
  const opacity = useTransform(state, [-0.4, -0.08, 0.14, 0.34], [0, 0.34, 0.34, 0]);
  const TICKS = 13;

  return (
    <motion.span
      aria-hidden="true"
      className="absolute bottom-0 left-1/2 block h-2 w-[26%] -translate-x-1/2"
      style={animated ? { opacity } : { opacity: 0.3 }}
    >
      <span className="absolute bottom-0 left-0 block h-px w-full bg-ink" />
      {Array.from({ length: TICKS }, (_, i) => (
        <span
          key={i}
          className="absolute bottom-0 block w-px bg-ink"
          style={{ left: `${(i / (TICKS - 1)) * 100}%`, height: i % 4 === 0 ? 8 : 4 }}
        />
      ))}
    </motion.span>
  );
}

/* ---------------------------------------------------------------- cluster */

function Cluster({
  index,
  rows,
  state,
  animated,
  resolved,
}: {
  index: string;
  rows: SystemAnnotationRow[];
  state: MotionValue<number>;
  animated: boolean;
  resolved: boolean;
}) {
  const indexOpacity = useTransform(state, [-0.7, -0.32, 0.34, 0.68], [0, 1, 1, 0]);
  const rowsOpacity = useTransform(state, [-0.42, -0.1, 0.16, 0.4], [0, 1, 1, 0]);
  const slide = useTransform(state, [-0.42, 0], [8, 0]);

  return (
    <div className="absolute -top-1 left-0 max-w-[22rem] -translate-y-full pl-1">
      <motion.div
        aria-hidden="true"
        className="flex items-center gap-2"
        style={animated ? { opacity: indexOpacity } : undefined}
      >
        {/* The single signal accent this layer is allowed (§11). Decorative,
            so --signal's 2.9:1 is permitted (DESIGN_SYSTEM §2). */}
        <span className="block h-px w-3 bg-signal" />
        <MonoLabel className="text-ink-muted">Case {index}</MonoLabel>
      </motion.div>

      {rows.length > 0 && (
        <motion.dl
          className={`mt-1.5 flex flex-wrap gap-x-5 gap-y-0.5 pt-1.5 ${
            resolved ? "border-t border-ink" : "border-t border-line"
          }`}
          style={animated ? { opacity: rowsOpacity, y: slide } : undefined}
        >
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline gap-2">
              <dt className="font-mono text-mono-meta tracking-mono-meta uppercase text-ink-muted">
                {row.label}
              </dt>
              <dd className="font-mono text-mono-meta tracking-mono-meta text-ink">{row.value}</dd>
            </div>
          ))}
        </motion.dl>
      )}
    </div>
  );
}
