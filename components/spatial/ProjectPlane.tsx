"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { planeShift, sceneTravelDirection } from "@/lib/spatial/planeChoreography";
import { PLANE_DISTANT, type SceneId, type WorldPoint } from "@/lib/spatial/scenes";
import {
  cameraPosition,
  sceneApproach,
  sceneFocusProgress,
  sceneProximity,
} from "@/lib/spatial/sceneRoute";

// Spatial Portfolio V6.8 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §28). THE PROJECT FIELD PLANES.
//
// WHAT WAS LOST, AND WHY THIS IS NOT THE DELETED FILLER COMING BACK
//
// Through V6.6 the travel space carried seven soft-paper DENSITY rectangles,
// authored at arbitrary progress values. The V6.7 audit deleted all seven as
// filler, and for five of them that judgement stands: they were scattered along
// the route to keep empty frames from reading as empty.
//
// But two of them happened to sit near the project scenes, and deleting those
// removed something real by accident: the second depth plane a project composition
// was read against. V6.5-era Kivilcim was measurably stronger than V6.7's because
// the pale plane behind it had ITS OWN world position -- the project slid across
// it as the camera travelled, the overlap changed frame by frame, and that
// relative motion is what made the scene read as a place rather than a layout.
// The human review of V6.8 names this exact regression.
//
// So this brings the plane back AS WHAT IT ACTUALLY WAS: one field per project
// scene, on the DISTANT parallax plane, placed so that it is deliberately
// misregistered with the media -- never a rectangle behind an image. The
// difference from the deleted DENSITY fields is semantic and behavioural:
//
//   - each plane belongs to a SCENE, not to a progress value: it is the field the
//     project stands in, placed by the same `rate x cameraPosition(focus) +
//     offset` derivation every other parallax mark uses;
//   - it MOVES relative to its project (0.62 vs 1.0 camera rate), so the overlap
//     between plane and media changes continuously across the scene's whole
//     window -- the depth is enacted, not asserted;
//   - its presence follows the scene's own acquisition: it registers as the
//     camera arrives (sceneProximity) and quietens once the scene is passed, the
//     same behaviour every registration mark in the world already has.
//
// Nothing is drawn ON the plane -- no border, no corner, no label. It is a tonal
// field, one step off the paper, and the composition does the talking.

/**
 * The scene's own measure: identical to SCENE_WIDTH in scenes.ts. The plane is
 * sized and offset in FRACTIONS of this, not in raw vw/vh, and that difference
 * is what the final remediation pass fixed. Scene content is px-capped at
 * 1180px, so on the owner's real ~2552px-CSS display (seen in the review
 * screencast) a vw-authored plane grew to 1.9x its scene's media, drifted off
 * every registration the composition was tuned to at 1440, and read as exactly
 * the "random pale rectangle behind content" the plane exists to not be. In
 * scene units the plane:media relationship is the SAME GEOMETRY at 1024, 1440
 * and 2552 -- the whole composition scales as one object until the cap, then
 * holds together as one object above it.
 */
const SCENE_UNIT = "min(84vw, 1180px)";

type ProjectPlaneProps = {
  /** The scene whose field this is. */
  scene: SceneId;
  /** Offset of the plane's top-left from the camera anchor point at the moment
   *  the scene is exactly framed, as FRACTIONS of the scene measure. */
  offset: WorldPoint;
  /** Size as fractions of the scene measure. Sized and offset so the media
   *  always breaks at least one of the plane's edges at focus -- the two must
   *  never share bounds or nest, so they can never read as a frame and its
   *  picture. */
  width: number;
  height: number;
  progress: MotionValue<number>;
  /** V7: the plane exists on the mobile world plane too (rate 1); the
   *  choreography and proximity must then read the mobile route. */
  mobile?: boolean;
};

export function ProjectPlane({
  scene,
  offset,
  width,
  height,
  progress,
  mobile = false,
}: ProjectPlaneProps) {
  // Same derivation as every parallax mark: place it where this plane's
  // coordinate space puts the scene's focal frame, plus the authored offset --
  // the camera term stays in the plane's own vw/vh space, the offset is in the
  // scene's px-capped space. On mobile the plane rides the world plane (rate
  // 1) and the mobile route supplies the camera term.
  const rate = mobile ? 1 : PLANE_DISTANT;
  const camera = cameraPosition(sceneFocusProgress(scene, mobile), mobile);

  // V7 — THE SUPPORTING-PLANE GRAMMAR (see lib/spatial/planeChoreography.ts).
  // One signed displacement along the route's own local bearing: the plane
  // enters slightly before its foreground, registers exactly at focus, and
  // trails progressively on exit. The direction is derived from the curve at
  // this scene's focus, so the grammar follows the route wherever it bends.
  const direction = sceneTravelDirection(scene, mobile);
  const choreographyX = useTransform(progress, (value) => {
    const shift = planeShift(sceneApproach(scene, value, mobile), direction);
    return `${shift.xVw}vw`;
  });
  const choreographyY = useTransform(progress, (value) => {
    const shift = planeShift(sceneApproach(scene, value, mobile), direction);
    return `${shift.yVh}vh`;
  });

  // The field registers as the system acquires its scene: faint on approach,
  // fullest exactly at focus, quiet again once passed. Derived from the same
  // proximity signal the registration ticks use, so the whole scene's grammar
  // agrees about when it is being looked at.
  const presence = useTransform(progress, (value) => {
    const near = sceneProximity(scene, value, mobile);
    // The presence decays to ZERO outside the scene's own proximity window.
    //
    // It used to floor at 0.14 ("a whisper, not an orphaned rectangle"), and that
    // floor was never free: `sceneProximity` returns exactly 0 once the camera is
    // past a scene's reach, so a floored plane stayed faintly painted through the
    // ENTIRE journey -- including inside the frozen Kivilcim frame, where the
    // DropSpot plane was measured still on at 0.140. The DropSpot plane's x offset
    // was then pushed 0.14 -> 0.21 specifically to dodge that intrusion, at the
    // cost of 82px of its own ground; i.e. one plane's placement was being decided
    // by another plane's leak rather than by its own composition.
    //
    // Removing the floor is strictly safer and changes nothing where it matters:
    // at focus `near` is 1, so 0.66 * 1 == the old 0.14 + 0.52 * 1 == 0.66, exactly
    // as before. Only the out-of-window tail changes, and it changes to nothing.
    return 0.66 * Math.max(0, near);
  });

  return (
    <motion.span
      aria-hidden="true"
      data-project-plane={scene}
      className="absolute block bg-soft-paper"
      style={{
        left: `calc(${camera.x * rate}vw + ${offset.x} * ${SCENE_UNIT})`,
        top: `calc(${camera.y * rate}vh + ${offset.y} * ${SCENE_UNIT})`,
        width: `calc(${width} * ${SCENE_UNIT})`,
        height: `calc(${height} * ${SCENE_UNIT})`,
        opacity: presence,
        x: choreographyX,
        y: choreographyY,
      }}
    />
  );
}
