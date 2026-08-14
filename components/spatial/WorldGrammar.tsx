"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import {
  COLLISION_MOBILE_WORLD,
  COLLISION_WORLD,
  SCENE_IDS,
  WALL_MARKER_OFFSET,
  sceneAnchor,
  type WorldPoint,
} from "@/lib/spatial/scenes";
import { routeLegs } from "@/lib/spatial/sceneRoute";

// Spatial Portfolio V4 (feature/spatial-portfolio-v4, not merged to main --
// see docs/DESIGN_SYSTEM.md §18).
//
// V2's honest remaining weakness was that the space between scenes was
// empty: pacing was right, but there was nothing out there to tell you where
// you had come from or where you were going. This layer answers that WITHOUT
// filling the world with particles or drawing a grid (§10). It is a sparse
// orientation system built from four kinds of mark only:
//
//   1. leg rails       -- the actual camera path, drawn from routeLegs() so
//                         the marks can never describe a route the camera
//                         does not take. Route two is dashed and signal-
//                         coloured, so "you are on a different route now" is
//                         legible without a label.
//   2. residue         -- a rail brightens once the camera has travelled it,
//                         so the path behind you is more present than the
//                         path ahead (§11).
//   3. registration    -- one corner tick per scene anchor, sitting outside
//                         the scene block so it reads as a world coordinate
//                         rather than scene content.
//   4. wall boundary   -- the edge of the coordinate system, with three
//                         rules that CONVERGE on it as the approach tension
//                         rises. This is the collision's own grammar (§4):
//                         the rails tighten before the camera is stopped.
//
// Every mark here is decorative and aria-hidden (§24). Nothing in this file
// carries information that is not already stated in real semantic text.

type WorldGrammarProps = {
  progress: MotionValue<number>;
  /** 0..1 approach tension; drives the boundary rules converging. */
  tension: MotionValue<number>;
  mobile: boolean;
};

export function WorldGrammar({ progress, tension, mobile }: WorldGrammarProps) {
  const legs = routeLegs(mobile);
  const wall = mobile ? COLLISION_MOBILE_WORLD : COLLISION_WORLD;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0">
      {legs.map((leg, index) => (
        <RouteRail key={index} leg={leg} progress={progress} />
      ))}

      {SCENE_IDS.map((id) => (
        <RegistrationTick key={id} at={sceneAnchor(id, mobile)} />
      ))}

      <WallBoundary at={wall} tension={tension} mobile={mobile} />
    </div>
  );
}

/**
 * One travel leg, drawn as a POLYLINE sampled from the camera curve itself
 * rather than as a straight chord between anchors. V4's route is a spline, so
 * a straight rail would diverge from the path it claims to describe; sampling
 * keeps the world's orientation system literally true.
 *
 * `preserveAspectRatio="none"` lets the box stretch to the leg's exact
 * (non-uniform: vw by vh) geometry, and `non-scaling-stroke` keeps the line a
 * hairline regardless of that stretch.
 */
function RouteRail({
  leg,
  progress,
}: {
  leg: ReturnType<typeof routeLegs>[number];
  progress: MotionValue<number>;
}) {
  // Route residue: faint ahead of the camera, brighter once travelled.
  const opacity = useTransform(
    progress,
    [leg.fromProgress, leg.toProgress],
    leg.route === 1 ? [0.08, 0.2] : [0.18, 0.4],
  );

  const xs = leg.points.map((point) => point.x);
  const ys = leg.points.map((point) => point.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  const width = Math.max(...xs) - left;
  const height = Math.max(...ys) - top;
  const tone = leg.route === 1 ? "text-ink" : "text-signal";

  // Mobile legs are purely vertical, so there is no diagonal to draw and the
  // zero-width SVG box would collapse. The same rail becomes a plain
  // vertical hairline -- same grammar, different choreography.
  if (width < 1) {
    return (
      <motion.div
        className={`absolute w-px ${leg.route === 1 ? "bg-ink" : "bg-signal"}`}
        style={{ left: `${left}vw`, top: `${top}vh`, height: `${height}vh`, opacity }}
      />
    );
  }

  const points = leg.points
    .map((point) => `${((point.x - left) / width) * 100},${((point.y - top) / height) * 100}`)
    .join(" ");

  return (
    <motion.svg
      className={`absolute ${tone}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        left: `${left}vw`,
        top: `${top}vh`,
        width: `${width}vw`,
        height: `${height}vh`,
        opacity,
      }}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
        strokeDasharray={leg.route === 2 ? "7 9" : undefined}
      />
    </motion.svg>
  );
}

/** A single corner tick registering a scene's anchor in the world. Offset up
 *  and left of the scene block so it never sits on top of scene content. */
function RegistrationTick({ at }: { at: WorldPoint }) {
  return (
    <div
      className="absolute opacity-30"
      style={{ left: `${at.x - 1.6}vw`, top: `${at.y - 4.5}vh` }}
    >
      <span className="absolute left-0 top-0 block h-px w-7 bg-ink" />
      <span className="absolute left-0 top-0 block h-7 w-px bg-ink" />
    </div>
  );
}

/** Distances of the three converging rules from the boundary, at zero
 *  tension. They compress onto it as the camera runs out of room. */
const CONVERGING_RULES = [34, 21, 11];

/**
 * They stop just short of collapsing into a single line. Fully collapsing
 * them left nothing but one hairline at the moment of impact -- the tension
 * was legible only while it was building, and the frame it built to was
 * empty. A tight residual bundle is the image the collision needs.
 */
const CONVERGED_FRACTION = 0.13;

function WallBoundary({
  at,
  tension,
  mobile,
}: {
  at: WorldPoint;
  tension: MotionValue<number>;
  mobile: boolean;
}) {
  // On mobile the route is vertical, so the boundary is a horizontal edge
  // ahead of the camera rather than a vertical one to its right.
  // Deliberately taller/wider than the viewport and centred past the camera,
  // so the boundary runs off both edges of the frame. A rule that ends
  // inside the frame reads as an object standing there; the collision needs
  // it to read as an edge the world simply stops at.
  const boundary = mobile
    ? { left: at.x - 24, top: at.y + 26 }
    : { left: at.x + WALL_MARKER_OFFSET, top: at.y - 62 };

  return (
    <div className="absolute" style={{ left: `${boundary.left}vw`, top: `${boundary.top}vh` }}>
      <span
        className={
          mobile ? "absolute block h-px w-[140vw] bg-ink" : "absolute block h-[180vh] w-px bg-ink"
        }
      />
      {CONVERGING_RULES.map((offset, index) => (
        <ConvergingRule key={index} offset={offset} tension={tension} mobile={mobile} />
      ))}
    </div>
  );
}

function ConvergingRule({
  offset,
  tension,
  mobile,
}: {
  offset: number;
  tension: MotionValue<number>;
  mobile: boolean;
}) {
  // The world's own coordinate rules tightening onto the boundary as the
  // camera runs out of room -- driven straight off scroll, never React state.
  const unit = mobile ? "vh" : "vw";
  const shift = useTransform(
    tension,
    [0, 1],
    [`-${offset}${unit}`, `-${(offset * CONVERGED_FRACTION).toFixed(2)}${unit}`],
  );
  const opacity = useTransform(tension, [0, 0.35, 1], [0, 0.16, 0.45]);

  return (
    <motion.span
      className={
        mobile ? "absolute block h-px w-[140vw] bg-ink" : "absolute block h-[180vh] w-px bg-ink"
      }
      style={mobile ? { y: shift, opacity } : { x: shift, opacity }}
    />
  );
}
