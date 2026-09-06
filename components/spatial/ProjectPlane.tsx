"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { planeShift, sceneTravelDirection } from "@/lib/spatial/planeChoreography";
import { PLANE_DISTANT, VW_PER_VH, type SceneId } from "@/lib/spatial/scenes";
import type { ProjectGroundGeometry } from "@/lib/spatial/projectGround";
import {
  cameraPosition,
  sceneApproach,
  sceneFocusProgress,
  sceneProximity,
} from "@/lib/spatial/sceneRoute";
import { worldX, worldY } from "@/lib/spatial/worldFit";

// Spatial Portfolio V6.8 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §28). THE PROJECT FIELD PLANES.
//
// Each project scene stands in its own field, on the DISTANT parallax plane, so
// the project slides across it as the camera travels: the depth is enacted,
// not asserted. Its presence follows the scene's own acquisition and its
// position runs the supporting-plane grammar (lib/spatial/planeChoreography.ts):
// enters before the foreground, registers exactly at focus, trails on exit.
//
// V14 (OWNER FINDING B, §7) made the plane a stretch of ground laid along the
// route -- one constructed edge, cut square to the bearing, dissolving down-
// route -- instead of an axis-aligned mat behind the evidence.
//
// V14.1 (OWNER §7, again: it "can STILL read like a large pale background
// card") -- THE GROUND IS DRAWN, NOT FILLED.
//
// The V14 note claimed "a card needs four edges; this has one", and the frames
// disagreed: a filled region has as many edges as its silhouette, so a filled
// parallelogram with one decorated side was still a pale panel -- most
// visibly in the empty middle of every transition, where the departing scene
// had left and the arriving one had not yet come, and the only thing in frame
// was a large pale rectangle sliding by. Its tone was also the plate's own mat
// tone, so the plate dissolved into it instead of standing on it.
//
// So the ground is now structure in section, in the world's own vocabulary of
// hairlines and ticks, and its fill is gone:
//
//   THE DATUM. The up-route edge, exactly as before: a vertical hairline with
//   two registration ticks, standing clear of the composition, at the point
//   the composition arrives over. It is the first thing the camera meets and
//   it resolves as the station does -- opacity with proximity.
//
//   THE FLOOR. A level hairline at the datum's foot, running under the
//   evidence and on past it down-route, then cut square to the route's bearing
//   and ended. This is what the composition stands on. It is DRAWN BY
//   ACQUISITION: as proximity rises the floor extends from the datum outward
//   (a compositor-only scaleX on a hairline -- no text, no layout), so
//   DETECTED shows an edge, ACQUIRED lays the ground, FOCUSED has the whole
//   tread under the composition, and RELEASED leaves the floor behind for a
//   moment before it lets go. Acquisition is now a change of what is drawn,
//   not a change of opacity on a slab.
//
//   THE TREAD. Between datum and cut, a wedge of tone under the floor line
//   only -- three per cent ink from the floor down, dissolving within a few
//   viewport-hundredths -- so the floor reads as the top of ground rather than
//   as a rule floating in paper. Nothing is filled above the floor: the
//   composition stands on the ground, it is not backed by it.
//
// The datum, the floor and the cut are static geometry; only `transform` and
// `opacity` animate. Mobile keeps the V13 gate's slab: the vertical route has
// no bearing to lay a floor along, and that composition is frozen.

/**
 * The scene's own measure: identical to SCENE_WIDTH in scenes.ts. The ground is
 * sized and offset in FRACTIONS of this, so the ground:composition relationship
 * is the same geometry at 1024, 1440 and 2560.
 */
const SCENE_UNIT = "min(84vw, 1180px)";

/** How far past the composition the floor runs down-route, in scene units. */
const PLANE_RUN_ON = 0.45;
/** How far up-route of the block's own edge the datum stands. */
const PLANE_LEAD_IN = 0.07;
/** The tread's depth below the floor line, in scene units. */
const TREAD_DEPTH = 0.09;
/**
 * How far above the ground box's foot the floor is drawn, in scene units. The
 * ground policy (lib/spatial/projectGround.ts, frozen at D-028) pads the box
 * 0.05 below the measured evidence, which was right for a slab and is a gap
 * for a floor: measured on the V14.1 iteration-five frames the plate hung
 * 40-53px above the line at 1366-1440. Lifting the drawn floor by 0.02 puts
 * it 7-18px under the composition's own bracket feet at every review
 * viewport, so the composition stands on it. The policy itself is untouched.
 */
const FLOOR_LIFT = 0.02;

type ProjectPlaneProps = {
  scene: SceneId;
  /** Geometry derived from this scene's measured evidence group through the
   *  shared project-ground policy. Fractions of the scene measure. */
  geometry: ProjectGroundGeometry;
  progress: MotionValue<number>;
  /** V7: the plane exists on the mobile world plane too (rate 1); the
   *  choreography and proximity must then read the mobile route. */
  mobile?: boolean;
};

export function ProjectPlane({ scene, geometry, progress, mobile = false }: ProjectPlaneProps) {
  const { offset, width, height } = geometry;
  const rate = mobile ? 1 : PLANE_DISTANT;
  const camera = cameraPosition(sceneFocusProgress(scene, mobile), mobile);

  const direction = sceneTravelDirection(scene, mobile);
  const choreographyX = useTransform(progress, (value) => {
    const shift = planeShift(sceneApproach(scene, value, mobile), direction);
    return worldX(shift.xVw);
  });
  const choreographyY = useTransform(progress, (value) => {
    const shift = planeShift(sceneApproach(scene, value, mobile), direction);
    return worldY(shift.yVh);
  });

  // Presence decays to exactly zero outside the scene's own proximity window,
  // so no ground can intrude on another scene's frame.
  const presence = useTransform(progress, (value) => {
    const near = sceneProximity(scene, value, mobile);
    return (mobile ? 0.66 : 1) * Math.max(0, near);
  });
  // The floor is LAID as the scene is acquired: nothing at detection, the
  // whole tread by the time the composition is framed, and it stays laid
  // while the scene recedes so release leaves ground behind, not a hole.
  const laid = useTransform(progress, (value) => {
    const a = sceneApproach(scene, value, mobile);
    if (a <= -0.95) return 0;
    if (a <= -0.3) return (a + 0.95) / 0.65;
    return 1;
  });

  if (mobile) {
    return (
      <motion.span
        aria-hidden="true"
        data-project-plane={scene}
        className="absolute block bg-soft-paper"
        style={{
          left: `calc(${worldX(camera.x * rate)} + ${offset.x} * ${SCENE_UNIT})`,
          top: `calc(${worldY(camera.y * rate)} + ${offset.y} * ${SCENE_UNIT})`,
          width: `calc(${width} * ${SCENE_UNIT})`,
          height: `calc(${height} * ${SCENE_UNIT})`,
          opacity: presence,
          x: choreographyX,
          y: choreographyY,
        }}
      />
    );
  }

  // The far end is cut square to the route: a line at (bearing + 90deg). Over
  // the tread's depth that edge moves left by depth x cot(bearing + 90deg) in
  // the same scene units, which is the skew of the cut below.
  const bearing = Math.atan2(direction.yVh, direction.xVw * VW_PER_VH);
  const left = -PLANE_LEAD_IN;
  const run = 1 + PLANE_LEAD_IN + PLANE_RUN_ON;
  const cutSkewDeg = (Math.atan2(1, Math.tan(bearing + Math.PI / 2)) * 180) / Math.PI;

  return (
    <motion.span
      aria-hidden="true"
      data-project-plane={scene}
      className="pointer-events-none absolute block"
      style={{
        left: `calc(${worldX(camera.x * rate)} + ${left} * ${SCENE_UNIT})`,
        top: `calc(${worldY(camera.y * rate)} + ${offset.y} * ${SCENE_UNIT})`,
        width: `calc(${run} * ${SCENE_UNIT})`,
        height: `calc(${height} * ${SCENE_UNIT})`,
        opacity: presence,
        x: choreographyX,
        y: choreographyY,
      }}
    >
      {/* THE DATUM: the constructed up-route edge, with its two registration
          ticks. The first thing the camera meets. */}
      <span
        className="absolute left-0 top-0 block w-px bg-ink opacity-40"
        style={{ bottom: `calc(${FLOOR_LIFT} * ${SCENE_UNIT})` }}
      />
      <span className="absolute left-0 top-0 block h-px w-8 bg-ink opacity-50" />
      <span
        className="absolute left-0 block h-px w-8 bg-ink opacity-50"
        style={{ bottom: `calc(${FLOOR_LIFT} * ${SCENE_UNIT})` }}
      />

      {/* THE FLOOR AND THE TREAD, laid from the datum outward as the scene is
          acquired. One transform on the pair; the hairline and the wedge are
          static drawings under it. */}
      <motion.span
        data-project-floor={scene}
        // The floor line is the datum's foot, FLOOR_LIFT above the box's
        // bottom, and the tread hangs below it. (Placed inside the box with
        // bottom-0 the line sat one tread-depth up, crossing every plate's
        // caption row -- iteration-four frames, all three review viewports.)
        className="absolute left-0 block w-full origin-left"
        style={{
          top: `calc(100% - ${FLOOR_LIFT} * ${SCENE_UNIT})`,
          height: `calc(${TREAD_DEPTH} * ${SCENE_UNIT})`,
          scaleX: laid,
        }}
      >
        <span className="absolute left-0 right-0 top-0 block h-px bg-ink opacity-45" />
        <span
          className="absolute inset-0 block bg-[rgba(22,22,22,0.03)]"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, #000, rgba(0,0,0,0) 100%), linear-gradient(to right, #000 62%, rgba(0,0,0,0) 100%)",
            WebkitMaskComposite: "source-in",
            maskImage:
              "linear-gradient(to bottom, #000, rgba(0,0,0,0) 100%), linear-gradient(to right, #000 62%, rgba(0,0,0,0) 100%)",
            maskComposite: "intersect",
          }}
        />
        {/* The far cut: the floor ends square to the route, as a hairline. */}
        <span
          className="absolute right-0 top-0 block h-full w-px origin-top bg-ink opacity-35"
          style={{ transform: `skewX(${cutSkewDeg.toFixed(2)}deg)` }}
        />
      </motion.span>
    </motion.span>
  );
}
