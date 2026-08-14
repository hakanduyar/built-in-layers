"use client";

import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { PLANE_DISTANT } from "@/lib/spatial/scenes";
import { cameraPosition, routeScreenAngle } from "@/lib/spatial/sceneRoute";

// Spatial Portfolio V5 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §18). Directional architecture (§22-24).
//
// The reference is environmental wayfinding -- the very large chevron-like
// structures that recede down a concourse and tell you which way the space
// runs -- NOT arrow icons. That distinction is what every rule below defends:
//
//   - the forms are enormous and cropped by the frame, so no single one is
//     ever seen whole;
//   - they are drawn as open hairline Vs, never filled, never with a shaft or
//     a head, so nothing resolves into an icon;
//   - they sit on the DISTANT plane, at 6-10% opacity, with the farther
//     repetitions blurred;
//   - their angle is DERIVED from the route (routeScreenAngle), so they point
//     where the camera is actually going and cannot drift out of agreement
//     with it;
//   - there are exactly two fields in the whole journey (§23): one in the run
//     at the collision, one after the reposition. Nothing behind a scene.
//
// §24: as the collision approaches, the pre-collision field COMPRESSES -- the
// spacing between repetitions tightens and the whole field firms up slightly.
// It does not crash, break apart, or collide with anything; the route is
// simply running out of room, and the architecture says so before the wall
// does.

type DirectionalFieldProps = {
  /** Progress the field is framed at. Placement is derived from this. */
  at: number;
  /** Progress pair the field's angle is taken from. */
  along: [number, number];
  /** Offset within the frame, in vw/vh. */
  offset: { x: number; y: number };
  /** Repetitions receding away from the viewer. */
  count?: number;
  /** Drives §24's compression. Omit for the post-reposition field. */
  tension?: MotionValue<number>;
  /** Base opacity of the nearest repetition. */
  opacity?: number;
};

/** Width/height of one chevron, in vw/vh. Deliberately larger than the frame. */
const CHEVRON_W = 86;
const CHEVRON_H = 34;

export function DirectionalField({
  at,
  along,
  offset,
  count = 5,
  tension,
  opacity = 0.09,
}: DirectionalFieldProps) {
  // Same derivation as the travel material: a mark on a parallax plane does
  // not appear where its world coordinates suggest, so it is placed at
  // rate x cameraPosition(at) + offset, which frames it at the progress it is
  // meant for.
  const camera = cameraPosition(at);
  // The wrapper is exactly one chevron wide and is placed by its own centre,
  // so `offset` lands the top-centre of the receding stack at a predictable
  // point in the frame and the rotation pivots there rather than swinging the
  // whole field off-screen.
  const left = camera.x * PLANE_DISTANT + offset.x - CHEVRON_W / 2;
  const top = camera.y * PLANE_DISTANT + offset.y;
  const angle = routeScreenAngle(along[0], along[1]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{
        left: `${left}vw`,
        top: `${top}vh`,
        width: `${CHEVRON_W}vw`,
        transform: `rotate(${angle.toFixed(2)}deg)`,
        transformOrigin: "50% 0",
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <Chevron
          key={index}
          index={index}
          count={count}
          tension={tension}
          baseOpacity={opacity}
        />
      ))}
    </div>
  );
}

function Chevron({
  index,
  count,
  tension,
  baseOpacity,
}: {
  index: number;
  count: number;
  tension?: MotionValue<number>;
  baseOpacity: number;
}) {
  // Perspective-like spacing: each repetition is closer to the last, smaller,
  // fainter and softer, so the field recedes instead of tiling.
  const depth = index / Math.max(count - 1, 1);
  const spacing = 26 * (1 - 0.42 * depth);
  const scale = 1 - 0.17 * depth;
  const blur = (1 + depth * 3.4).toFixed(1);
  const fade = baseOpacity * (1 - 0.55 * depth);

  // A constant stand-in for the field that has no tension input, so the hooks
  // below run unconditionally and both fields share one code path.
  const still = useMotionValue(0);
  const source = tension ?? still;

  // §24. Spacing tightens and contrast firms as the route runs out of room.
  const y = useTransform(
    source,
    [0, 1],
    [`${(index * spacing).toFixed(2)}vh`, `${(index * spacing * 0.52).toFixed(2)}vh`],
  );
  const opacity = useTransform(source, [0, 1], [fade, fade * 1.5]);

  return (
    <motion.svg
      className="absolute left-1/2 -translate-x-1/2 text-ink"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        width: `${CHEVRON_W * scale}vw`,
        height: `${CHEVRON_H * scale}vh`,
        y,
        opacity,
        filter: `blur(${blur}px)`,
      }}
    >
      <polyline
        points="0,0 50,86 100,0"
        fill="none"
        stroke="currentColor"
        // Heavy on purpose. These are structures, not lines: at hairline
        // weight across 86vw they read as stray threads rather than as
        // architecture, which is exactly the failure §22 warns about from the
        // other direction.
        strokeWidth={14}
        vectorEffect="non-scaling-stroke"
      />
    </motion.svg>
  );
}
