"use client";

import { motion } from "motion/react";
import { PLANE_DISTANT } from "@/lib/spatial/scenes";
import { cameraPosition, routeScreenAngle } from "@/lib/spatial/sceneRoute";
import { worldX, worldY } from "@/lib/spatial/worldFit";

// Spatial Portfolio V5 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §19). Directional architecture (§22-24).
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
//     into the cut, one after it. Nothing behind a scene.
//
// V6.4 REMOVED §24's COMPRESSION, which tightened the first field's spacing and
// contrast as `approachTension` rose. It was a statement about a wall -- "the
// route is running out of room" -- and there is no wall now. What is left is what
// the field was always for: two pieces of environmental architecture that say
// which way the space runs.

type DirectionalFieldProps = {
  /** Progress the field is framed at. Placement is derived from this. */
  at: number;
  /** Progress pair the field's angle is taken from. */
  along: [number, number];
  /** Offset within the frame, in vw/vh. */
  offset: { x: number; y: number };
  /** Repetitions receding away from the viewer. */
  count?: number;
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
        left: worldX(left),
        top: worldY(top),
        width: worldX(CHEVRON_W),
        transform: `rotate(${angle.toFixed(2)}deg)`,
        transformOrigin: "50% 0",
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <Chevron key={index} index={index} count={count} baseOpacity={opacity} />
      ))}
    </div>
  );
}

function Chevron({
  index,
  count,
  baseOpacity,
}: {
  index: number;
  count: number;
  baseOpacity: number;
}) {
  // Perspective-like spacing: each repetition is closer to the last, smaller,
  // fainter and softer, so the field recedes instead of tiling.
  const depth = index / Math.max(count - 1, 1);
  const spacing = 26 * (1 - 0.42 * depth);
  const scale = 1 - 0.17 * depth;
  // V6 softened the whole stack: blur starts at 3px rather than 1px and reaches
  // 9px at the back. The V5 review read these as heavy -- a sharp 14px stroke
  // at 9% is a visible band, and a visible band across the frame competes with
  // the content it is supposed to sit behind. Blurring harder pushes them back
  // into atmosphere while keeping the directional read.
  const blur = (3 + depth * 6).toFixed(1);
  const opacity = baseOpacity * (1 - 0.55 * depth);

  return (
    <motion.svg
      className="absolute left-1/2 -translate-x-1/2 text-ink"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        width: worldX(CHEVRON_W * scale),
        height: worldY(CHEVRON_H * scale),
        y: worldY(index * spacing),
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
