"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { focusProximity, routeScreenAngle } from "@/lib/spatial/sceneRoute";
import { worldX, worldY } from "@/lib/spatial/worldFit";

// Spatial Portfolio V6 (feature/spatial-portfolio-v5 branch, not merged --
// see docs/DESIGN_SYSTEM.md §20).
//
// TWO PROBLEMS, ONE LAYER
//
// 1. MOTION (§20.1). Every other moving thing in the world is driven by the
//    CAMERA, and the camera deliberately slows to 0.42 of average at a scene.
//    So during a focus zone almost nothing on screen answers the wheel, which
//    is what "not much is happening" actually was. This layer is driven by RAW
//    PROGRESS instead -- strictly linear, strictly monotone -- so some part of
//    the world always responds to scroll, at every point in the journey, no
//    matter what the camera is doing. It is the world's pulse rather than its
//    geometry.
//
// 2. ART DIRECTION (§20.4). It is also where the Person-of-Interest-inspired
//    systemic language lives: a sparse field of registration marks, long route
//    vectors aligned to the real route, and one structured annotation cluster.
//    The impression to create is that something has surveyed this space and
//    left its working marks on it -- acquisition, mapping, latent structure --
//    NOT a heads-up display.
//
// WHY IT CANNOT BECOME NOISE
//
// Everything here is between 3% and 7% opacity, hairline-weight, and built from
// four mark types only. There is no panel, no readout, no glyph that resolves
// into a word, and nothing follows the pointer. The layer is `aria-hidden` in
// its entirety and carries no information that is not already stated in real
// text elsewhere -- it is texture with a reason, and if it ever reads as a HUD
// the correct fix is to lower the opacities, not to add explanatory chrome.

type SystemFieldProps = {
  /** Filtered scroll progress. Drives the linear drift. */
  progress: MotionValue<number>;
  /** Route-one and route-two focal progresses, for vector alignment. */
  routeOne: [number, number];
  routeTwo: [number, number];
};

/**
 * Total linear travel of the layer across the whole route, in vw/vh. Small on
 * purpose: this is a backdrop that is always moving, not a parallax plane. Big
 * enough that the movement is perceptible against the frame edge, small enough
 * that the marks never streak.
 */
const FIELD_DRIFT_VW = 22;
const FIELD_DRIFT_VH = 16;

/** Deterministic pseudo-random in [0,1). Same seeded-hash convention as the
 *  erosion debris -- never Math.random(), so the field is identical on every
 *  visit and in every screenshot. */
function seeded(index: number): number {
  const value = Math.sin(index * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

/**
 * Registration marks. Placed across a band a little larger than the viewport in
 * both directions, so that at any drift offset a handful are in frame and none
 * is ever seen entering from nowhere.
 *
 * Deliberately NOT a grid: a regular lattice reads as graph paper, which is a
 * different (and much more generic) idea than "a system has registered points
 * in this space". The seeded jitter is what makes it read as surveyed rather
 * than as ruled.
 */
const MARK_COUNT = 26;

const MARKS = Array.from({ length: MARK_COUNT }, (_, i) => {
  const seedX = seeded(i * 3 + 1);
  const seedY = seeded(i * 5 + 2);
  const seedKind = seeded(i * 7 + 3);
  return {
    // Spread across roughly 1.4 viewports in each axis, offset negative so the
    // band already covers the frame before any drift has happened.
    x: -18 + seedX * 138,
    y: -14 + seedY * 130,
    // Three quarters are plain crosses; the rest carry a short index bar, so
    // the field has two densities rather than one repeated stamp.
    indexed: seedKind > 0.74,
    size: 7 + seeded(i * 11 + 5) * 5,
  };
});

export function SystemField({ progress, routeOne, routeTwo }: SystemFieldProps) {
  // Strictly linear in raw progress. This is the whole point: it cannot have a
  // dead zone, because it has no easing, no focus profile and no spline.
  const x = useTransform(progress, [0, 1], [worldX(0), worldX(-FIELD_DRIFT_VW)]);
  const y = useTransform(progress, [0, 1], [worldY(0), worldY(-FIELD_DRIFT_VH)]);

  // V6.1 PERCEPTION (§16). The field RECEDES when the system has something in
  // frame, and is at full presence in open travel. Nothing is added: the same 26
  // marks and 2 vectors now carry a hierarchy, so environmental structure reads
  // as background noise the system suppresses once it is looking at something
  // real. This is the cheapest possible way to make the page feel like it
  // notices -- one multiplier on a layer that already exists.
  const attention = useTransform(progress, (value) => 1 - 0.66 * focusProximity(value));

  const angleOne = routeScreenAngle(routeOne[0], routeOne[1]);
  const angleTwo = routeScreenAngle(routeTwo[0], routeTwo[1]);

  return (
    <motion.div
      aria-hidden="true"
      data-system-field="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ x, y, opacity: attention }}
    >
      {MARKS.map((mark, index) => (
        <span
          key={index}
          // Redundant against the layer's own aria-hidden, but the spatial
          // world's convention is that every direct child of a non-world plane
          // carries it explicitly -- enforced by tests/e2e/spatial.spec.ts, so
          // that a child added later cannot silently reach the a11y tree.
          aria-hidden="true"
          className="absolute block text-ink opacity-[0.07]"
          style={{ left: worldX(mark.x), top: worldY(mark.y) }}
        >
          <span
            className="absolute block bg-ink"
            style={{ width: mark.size, height: 1, left: -mark.size / 2, top: 0 }}
          />
          <span
            className="absolute block bg-ink"
            style={{ width: 1, height: mark.size, left: 0, top: -mark.size / 2 }}
          />
          {mark.indexed && (
            <span
              className="absolute block bg-ink"
              style={{ width: mark.size * 1.6, height: 2, left: mark.size, top: -1 }}
            />
          )}
        </span>
      ))}

      {/* Long route vectors, aligned to the REAL route angles rather than to an
          authored diagonal, so the latent structure in the background agrees
          with the path the camera actually takes. Two only. */}
      <RouteVector angle={angleOne} left={-10} top={26} length={132} />
      <RouteVector angle={angleTwo} left={-6} top={78} length={118} />

      {/* V6.1 REMOVED the annotation cluster that stood here.
          It was a stack of bars and rules described in V6 as "structured,
          deliberately unreadable" -- which is precisely §17's prohibition: an
          annotation that visually implies information without having a
          structural reason to. Decorative registration marks are fine because
          they are legibly decorative; a cluster arranged to look like a readout
          is pseudo-information, and the honest fix is deletion rather than
          softening. Nothing replaced it: the field is one mark type sparser. */}
    </motion.div>
  );
}

/**
 * A single long vector: one hairline with regular cross-ticks along it. Reads as
 * a surveyed line of travel. No arrowhead anywhere -- an arrowhead is what turns
 * a vector into an icon.
 */
function RouteVector({
  angle,
  left,
  top,
  length,
}: {
  angle: number;
  left: number;
  top: number;
  length: number;
}) {
  const ticks = 7;
  return (
    <span
      aria-hidden="true"
      className="absolute block"
      style={{
        left: worldX(left),
        top: worldY(top),
        width: worldX(length),
        transform: `rotate(${angle.toFixed(2)}deg)`,
        transformOrigin: "0 50%",
      }}
    >
      <span className="absolute left-0 top-0 block h-px w-full bg-ink opacity-[0.06]" />
      {Array.from({ length: ticks }, (_, i) => (
        <span
          key={i}
          className="absolute block bg-ink opacity-[0.07]"
          style={{ left: `${((i + 1) / (ticks + 1)) * 100}%`, top: -3, width: 1, height: 7 }}
        />
      ))}
    </span>
  );
}
