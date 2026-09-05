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
// V14 (OWNER FINDING B, §7) -- THE PLANE IS A STRETCH OF GROUND, NOT A CARD.
//
// The owner's verdict on what stood here: "beige cards behind projects". The
// verdict is right and the reason is geometric. The field was an axis-aligned
// rectangle, filled in the mat's own soft-paper tone, sized a little larger
// than the evidence and offset a little to one side -- which is the exact
// description of a card's backing. Whatever the choreography did, a rectangle
// slightly behind a rectangle reads as one object with a shadow.
//
// So the plane is now the thing the grammar always described: a piece of
// ground the composition stands on, laid ALONG THE ROUTE.
//
//   ONE CONSTRUCTED EDGE. The up-route end is a real edge: a hairline rule
//   with a registration tick, the edge the composition arrives over. The
//   down-route end is cut square to the route's own bearing and then
//   dissolves toward the next station, so the plane's far boundary is the
//   frame or the paper, never a second parallel edge. A card needs four
//   edges; this has one.
//
//   IT RUNS ON PAST THE COMPOSITION. Half a scene measure further down-route
//   than the evidence, so at focus it leaves the frame on the right: a
//   surface the reader is travelling along, not a mat the project sits on.
//   At zoom-out the four planes read as four stretches of one track.
//
//   IT IS TONE, NOT MATERIAL. 3.5% ink over paper -- a change of ground, one
//   step lighter than the old fill -- so it can never compete with a plate
//   that is itself a soft-paper mat.
//
//   IT ARRIVES AND IT STAYS BEHIND. PLANE_LEAD and PLANE_LAG were raised so the
//   arrive/release choreography is visible against a 1180px composition (see
//   planeChoreography.ts for the measurement that showed 70px did not read).
//
// The fill, the edge and the cut are all static geometry; only `transform` and
// `opacity` animate, exactly as before. Mobile keeps the V13 gate's slab: the
// vertical route has no bearing to lay a plane along, and that composition is
// frozen.

/**
 * The scene's own measure: identical to SCENE_WIDTH in scenes.ts. The plane is
 * sized and offset in FRACTIONS of this, so the plane:composition relationship
 * is the same geometry at 1024, 1440 and 2560.
 */
const SCENE_UNIT = "min(84vw, 1180px)";

/** How far past the composition the ground runs down-route, in scene units. */
const PLANE_RUN_ON = 0.45;
/** How far up-route of the block's own edge the ground begins: the constructed
 *  edge stands clear of the content, ahead of it. */
const PLANE_LEAD_IN = 0.07;

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
  // so no plane can intrude on another scene's frame.
  const presence = useTransform(progress, (value) => {
    const near = sceneProximity(scene, value, mobile);
    return (mobile ? 0.66 : 0.92) * Math.max(0, near);
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

  // The far end is cut square to the route: a line at (bearing + 90deg). Going
  // down the plane's full height moves that edge left by height x cot(bearing
  // + 90deg) in the same scene units, which is the shear of the polygon below.
  const bearing = Math.atan2(direction.yVh, direction.xVw * VW_PER_VH);
  // The ground begins up-route of the whole composition -- PLANE_LEAD_IN before
  // the block's own edge, whichever side the evidence sits -- and runs past it
  // down-route. Its one constructed edge is therefore always OUTSIDE the
  // content it grounds, never a line under a plate.
  const left = -PLANE_LEAD_IN;
  const run = 1 + PLANE_LEAD_IN + PLANE_RUN_ON;
  const shear = Math.max(0, Math.min(run * 0.6, -height / Math.tan(bearing + Math.PI / 2)));
  const cutLeft = ((run - shear) / run) * 100;

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
      {/* The ground: a change of tone, cut square to the route at its far end
          and dissolving toward the next station. */}
      <span
        className="absolute inset-0 block bg-[rgba(22,22,22,0.045)]"
        style={{
          clipPath: `polygon(0 0, 100% 0, ${cutLeft.toFixed(2)}% 100%, 0 100%)`,
          WebkitMaskImage: "linear-gradient(to right, #000 58%, rgba(0,0,0,0) 100%)",
          maskImage: "linear-gradient(to right, #000 58%, rgba(0,0,0,0) 100%)",
        }}
      />
      {/* The constructed edge: the up-route side the composition arrives over. */}
      <span className="absolute bottom-0 left-0 top-0 block w-px bg-ink opacity-30" />
      <span className="absolute left-0 top-0 block h-px w-8 bg-ink opacity-45" />
      <span className="absolute bottom-0 left-0 block h-px w-8 bg-ink opacity-45" />
      {/* The far cut, drawn once as a hairline so the square end reads as an
          end rather than as a fade. */}
      <span
        className="absolute bottom-0 top-0 block w-px origin-top bg-ink opacity-20"
        style={{
          left: "100%",
          transform: `skewX(${((Math.atan2(shear, height) * 180) / Math.PI).toFixed(2)}deg)`,
          transformOrigin: "top left",
        }}
      />
    </motion.span>
  );
}
