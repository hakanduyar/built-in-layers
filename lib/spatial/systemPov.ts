// Spatial Portfolio V5 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §18). Pure data derivation, no JSX -- what the
// observing system is allowed to say about a scene, and when.
//
// THE RULE THIS FILE EXISTS TO ENFORCE (§2, §12)
//
// The system layer must never fabricate. There is no slug -> data table here,
// no invented confidence score, no coordinate presented as fact, no timestamp.
// Every value it can display is read off the project's own validated
// frontmatter (lib/content/schemas.ts) and humanised for display, and a field
// that does not exist simply produces no row.
//
// It also must not duplicate what the scene already says (§12). The scene
// renders title, category, description, tech and the asset's honest D-019
// caption; the system therefore reads the two things the scene does NOT show
// and that mean something to a reader:
//
//   LAYER  -- which of Surface / Flow / System the lead evidence belongs to.
//             This is the site's own framework, stated about real content.
//   PHASE  -- the project's real lifecycle state.
//
// Both are genuinely useful, so they are exposed to assistive technology as a
// real definition list rather than hidden as decoration (§44). The brackets,
// hairline and case index around them are pure orientation and are hidden.

import type { ProjectFrontmatter } from "@/lib/content/schemas";
import { BREAK_CUT, BREAK_REVEAL_END, isImpact } from "@/lib/spatial/sceneRoute";

/**
 * The one asset a scene leads with, chosen entirely from the asset's own
 * registered metadata -- never a hard-coded filename or slug lookup. Real
 * photographic evidence outranks a diagram; failing that, the system-layer
 * diagram is the most load-bearing thing a project can show at this scale;
 * failing that, whatever is registered first.
 *
 * Lives here rather than in the scene component because the system annotation
 * and the scene must agree on which asset is the lead one -- two copies of
 * this rule could drift apart and label the wrong layer.
 */
export function representativeAsset(project: ProjectFrontmatter) {
  return (
    project.images.find((image) => image.assetType === "real-screenshot") ??
    project.images.find((image) => image.layer === "system") ??
    project.images[0]
  );
}

/** "active-development" -> "Active development". Display only; the stored
 *  value is the schema enum and is never rewritten. */
function humanise(value: string): string {
  const spaced = value.replace(/-/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export type SystemAnnotationRow = { label: string; value: string };

export type SystemAnnotation = {
  /** Route index, e.g. "01". Presentation ordering, not a fact about the work. */
  index: string;
  rows: SystemAnnotationRow[];
};

/**
 * What the system is allowed to display about one project scene. At most two
 * rows by construction: §11's budget is one identifier plus one small
 * metadata cluster, and the project is the hero, not the readout.
 */
export function systemAnnotation(project: ProjectFrontmatter, index: string): SystemAnnotation {
  const asset = representativeAsset(project);
  const rows: SystemAnnotationRow[] = [];

  if (asset?.layer) rows.push({ label: "Layer", value: humanise(asset.layer) });
  // Optional in the schema (D-018) precisely because no approved source states
  // it for every project. Absent means absent -- never guessed.
  if (project.phase) rows.push({ label: "Phase", value: humanise(project.phase) });

  return { index, rows };
}

/* ------------------------------------------------- transition vocabulary */

// §32: three transition types for the whole world, reused everywhere, rather
// than a new effect per moment. These names are internal -- none of them is
// ever rendered as text (§8, §14).
//
//   ACQUISITION    a scene is approached, framed, classified, released
//   MATERIAL SHIFT the expressive word's coating erodes to the system beneath
//   REORIENTATION  the collision, the cut, and the world's new state

/** Where a scene stands relative to the camera: -1 ahead, 0 framed, +1 past. */
export type SceneState = "idle" | "approaching" | "focused" | "departing";

export function sceneState(signedApproach: number): SceneState {
  if (signedApproach <= -0.62) return "idle";
  if (signedApproach < -0.16) return "approaching";
  if (signedApproach <= 0.16) return "focused";
  return "departing";
}

export type WorldState = "travelling" | "collision" | "reorienting";

export function worldState(progress: number): WorldState {
  if (isImpact(progress)) return "collision";
  if (progress >= BREAK_CUT && progress < BREAK_REVEAL_END) return "reorienting";
  return "travelling";
}

/** True once the world's grammar has tightened, i.e. after the reposition
 *  (§25). One state transition inside one design system -- not a second theme. */
export function isResolvedState(progress: number): boolean {
  return progress >= BREAK_CUT;
}
