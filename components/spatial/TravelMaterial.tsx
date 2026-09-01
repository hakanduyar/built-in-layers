import {
  PLANE_DISTANT,
  PLANE_NEAR,
  SCENE_IDS,
  type SceneId,
  type WorldPoint,
} from "@/lib/spatial/scenes";
import { cameraPosition, sceneFocusProgress } from "@/lib/spatial/sceneRoute";
import { worldX, worldY } from "@/lib/spatial/worldFit";

// Spatial Portfolio V4 (feature/spatial-portfolio-v4, not merged to main --
// see docs/DESIGN_SYSTEM.md §18).
//
// V3 answered "what is the travel space made of?" with orientation
// INFORMATION (rails, ticks) and nothing else, and the honest V3 report said
// so: correct, but still visually empty. V4 adds MATERIAL -- and the rule
// (§21) is that every piece derives from the world's own language:
//
//   - oversized cropped typography taken from the REAL title of the scene the
//     camera is heading toward, clipped by its own box so the eye reads
//     letterform edges rather than a legible label;
//   - very low-contrast paper-density fields, giving the travel space tonal
//     variation without introducing a new shape vocabulary;
//   - a few heavy structural rules on the NEAR plane, which sweep past faster
//     than the world -- material in front of the camera, not only behind it,
//     which is what actually sells depth.
//
// PLACEMENT IS DERIVED, NOT AUTHORED. A parallax plane moves at a different
// rate from the world, so a mark placed at world coordinates does not appear
// where those coordinates suggest: an earlier pass positioned each fragment
// relative to its scene's anchor, and at 0.62 rate that put Kıvılcım's
// fragment inside the HERO frame and off-screen by the time the camera
// actually reached Kıvılcım -- exactly backwards, and it read as broken text
// rather than as material. Each mark is now placed at
// `rate x cameraPosition(atProgress) + offset`, which frames it at the
// progress it is meant for, on whatever plane it lives on.
//
// No particles. Everything here is aria-hidden, and every word duplicates
// copy that already exists as real semantic text in the scene it names, so
// the depth planes add no screen-reader content (§36).

type MaterialWord = {
  /** Real scene title, cropped. */
  word: string;
  /** The scene it announces; the fragment is framed on the way there. */
  before?: SceneId;
  /**
   * V6.3: an explicit progress to frame the fragment at, for material that
   * announces something the SceneId vocabulary cannot name -- specifically the
   * exit traverse, whose destination is the lower page rather than a scene.
   * Takes precedence over `before`.
   */
  at?: number;
  /** Where it sits in the frame, in vw/vh from the camera's anchor point. */
  offset?: WorldPoint;
};

type TravelMaterialProps = {
  words: MaterialWord[];
  plane: "distant" | "near";
};

/** Position on a parallax plane that frames a mark at a given progress. */
function planePosition(atProgress: number, rate: number, offset: WorldPoint): WorldPoint {
  const camera = cameraPosition(atProgress);
  return { x: camera.x * rate + offset.x, y: camera.y * rate + offset.y };
}

/**
 * The progress at which a fragment is framed: partway along the leg into the
 * scene it announces, so it is seen during travel and gone on arrival.
 *
 * V9 (§6) FIXED A STALE ORDER, and it was the cause of the owner's "large
 * leftover typography cuts through the project frame".
 *
 * This function used to carry its own hardcoded scene order, written when the
 * tour staged two projects: `["hero", "kivilcim", "dropspot", "tail",
 * "reorient", "approach"]`. V7 inserted Software Factory and JointLedger into
 * the route and never updated it, so any scene missing from that list fell
 * through to `previous = 0` and every fragment was placed against the wrong leg.
 *
 * Measured on the built page, the consequence was exact: the Kıvılcım fragment
 * resolved to progress 0.137 — Software Factory's focus is 0.141 — so an
 * oversized crop of the word "KIVILCIM" was framed directly across the
 * flagship's composition. It read as an accidental collision because it WAS
 * one.
 *
 * The order now comes from `SCENE_IDS`, which is derived from the route itself,
 * so a fragment is always placed on the leg into the scene it names and this
 * cannot go stale again the next time the route changes.
 */
function leadProgress(before: SceneId): number {
  const target = sceneFocusProgress(before);
  const index = SCENE_IDS.indexOf(before);
  const previous = index > 0 ? sceneFocusProgress(SCENE_IDS[index - 1]!) : 0;
  return previous + (target - previous) * 0.55;
}

/**
 * V6.7 (JOB 4) DELETED THE PAPER-DENSITY FIELDS.
 *
 * Seven soft-paper rectangles used to stand here, placed at authored progress
 * values with authored sizes. The brief's test for anything in the lower world is
 * "what does this represent?", and the honest answer was written in this file's own
 * comment: the last two existed because "the terminus frame measured almost
 * literally empty" and "the last frame of the spatial world is not allowed to be
 * blank". That is the definition of filler -- geometry added to occupy space rather
 * than to carry meaning -- and the other five were the same device earlier in the
 * route.
 *
 * They were also actively harmful by V6.6: two of them sat inside the SYSTEMS
 * surface cut's opened region and read as unrelated rectangles behind it, which the
 * V6.6 report listed as a known weakness.
 *
 * Nothing replaces them here. The emptiness they were hiding is answered by things
 * that mean something -- the destination surfaces, the work branch, the route rails
 * and the acquisition states in DestinationSurface -- or it is left as negative
 * space, which is a design element and not a defect.
 */

/** Near-plane rules, framed at the progress where they should sweep past. */
const NEAR_RULES: { at: number; offset: WorldPoint; length: number; vertical?: boolean }[] = [
  { at: 0.08, offset: { x: 30, y: -6 }, length: 52 },
  { at: 0.22, offset: { x: 62, y: 40 }, length: 34, vertical: true },
  { at: 0.4, offset: { x: 10, y: 62 }, length: 58 },
  { at: 0.68, offset: { x: 54, y: 12 }, length: 40, vertical: true },
  { at: 0.86, offset: { x: 20, y: 58 }, length: 50 },
  // The exit traverse, on the near plane: material passing IN FRONT of the camera
  // as it travels, which is what actually sells the leg as movement through space
  // rather than as a long empty pan.
  { at: 0.94, offset: { x: 26, y: 30 }, length: 46 },
  { at: 0.98, offset: { x: 44, y: 8 }, length: 34, vertical: true },
];

export function TravelMaterial({ words, plane }: TravelMaterialProps) {
  if (plane === "near") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0">
        {NEAR_RULES.map((rule, index) => {
          const at = planePosition(rule.at, PLANE_NEAR, rule.offset);
          return (
            <span
              key={index}
              className={`absolute block bg-ink opacity-[0.13] ${rule.vertical ? "w-px" : "h-px"}`}
              style={{
                left: worldX(at.x),
                top: worldY(at.y),
                ...(rule.vertical
                  ? { height: worldY(rule.length) }
                  : { width: worldX(rule.length) }),
              }}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0">
      {words.map(({ word, before, at: explicitAt, offset = { x: 22, y: 30 } }) => {
        const progress = explicitAt ?? (before ? leadProgress(before) : 0);
        const at = planePosition(progress, PLANE_DISTANT, offset);
        return (
          <div
            key={`${before ?? explicitAt}-${word}`}
            className="absolute overflow-hidden"
            // The glyph size and the clip box are CLAMPED, not proportional.
            // Authored at 1440 (15vw = 216px), these fragments scaled linearly
            // with the viewport, and on the owner's real screen (~2552px CSS,
            // seen in the review screencast) the letterforms became 383px slabs
            // whose visible crop reads as smeared bands with no referent -- the
            // review's recurring "render accident" finding. Below ~1466px the
            // clamps never engage and the approved 1440 frames are unchanged;
            // above it the material keeps its 1440 physical scale, which is
            // what "distant material" means -- it does not grow with the frame.
            style={{
              left: worldX(at.x),
              top: worldY(at.y),
              width: "min(52vw, 780px)",
              height: "min(17vh, 165px)",
            }}
          >
            {/* Pushed up out of its own clip box so only the lower third of
                the letterforms shows. Legible as shape, not as a word --
                which is the difference between material and a label. */}
            <span
              data-decorative="depth"
              className="block -translate-y-[58%] whitespace-nowrap font-display text-[min(15vw,220px)] leading-none tracking-[-0.04em] uppercase text-ink opacity-[0.06]"
            >
              {word}
            </span>
          </div>
        );
      })}
    </div>
  );
}
