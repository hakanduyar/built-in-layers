// Spatial Portfolio V5 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §19). Pure data derivation, no JSX -- what the
// observing system is allowed to say about a scene, and when. Unit-testable in
// isolation (tests/unit/spatial-system-pov.test.ts).
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
import { BREAK_COVER_START, BREAK_CUT, BREAK_REVEAL_END } from "@/lib/spatial/sceneRoute";

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
//   INSPECTION     the expressive word is sectioned, and the system beneath it
//                  is briefly visible through the cut (V6.4; was MATERIAL SHIFT,
//                  where the word's coating eroded away)
//   REORIENTATION  the occlusion cut and the world's new state

/** Where a scene stands relative to the camera: -1 ahead, 0 framed, +1 past. */
export type SceneState = "idle" | "approaching" | "focused" | "departing";

export function sceneState(signedApproach: number): SceneState {
  if (signedApproach <= -0.62) return "idle";
  if (signedApproach < -0.16) return "approaching";
  if (signedApproach <= 0.16) return "focused";
  return "departing";
}

/**
 * V14 (owner finding B) -- HOW PRESENT A SCENE'S COMPOSITION IS, from the same
 * signed approach the acquisition frame reads. The state progression the brief
 * asks for -- detected, acquired, focused, understood, released -- needs the
 * composition itself to behave, not only the marks around it. On the accepted
 * baseline a scene's content was at full presence from the instant its edge
 * crossed the frame to the instant it left, so a title entered the viewport
 * clipped mid-word at full ink and an outgoing project stayed as loud as the
 * one arriving.
 *
 *   detected    approach <= -0.66      0.45  the station and the plane lead;
 *                                           the composition is there, muted
 *   acquired    -0.66 -> -0.38         -> 1  resolves to full as it enters
 *   focused     -0.38 -> +0.2          1     read
 *   released    +0.2 -> +0.6           -> 0.34  recedes as it leaves
 *
 * The floors are deliberate and they are what keeps this a zoom-out asset
 * rather than a liability: at 50% zoom four scenes share a frame, and a scene
 * two stations away must still be legible as a place on the map -- dimmer than
 * the one in focus, never gone. Opacity only; no scale touches text (§22).
 */
export function scenePresence(signedApproach: number, mobile = false): number {
  const a = Math.max(-1, Math.min(1, signedApproach));
  // The mobile composition is the V13 gate's and V14.1 does not reopen it: below
  // lg the V14 curve stands exactly as it was.
  if (mobile) {
    if (a < -0.35) return 0.4 + 0.6 * Math.max(0, (a + 1) / 0.65);
    if (a <= 0.25) return 1;
    return 1 - 0.55 * Math.min(1, (a - 0.25) / 0.65);
  }
  // V14.1 (owner §6: "acquisition sometimes reading as translation rather
  // than a state change"; "release sometimes feeling unfinished"). V14's curve
  // rose from 0.4 across the whole approach, so a half-visible title at the
  // frame edge was already near full presence and nothing ever CHANGED --
  // the scene simply slid in. Now DETECTED holds at a third, ACQUIRED is one
  // brisk rise as the block clears the frame edge (-0.42 to -0.14), FOCUSED
  // holds, and RELEASED sets the composition down to a third by +0.6 so the
  // departing scene is quiet before its successor is acquired. The far value
  // is what a neighbour reads at zoom-out: present as topology, not as a
  // competing composition.
  // V14.3 Gate E (owner: "fully clear only near the middle of the
  // viewport"): the rise is moved forward by a quarter of the approach and
  // DETECTED sits at 0.45 rather than a third -- first visible slightly
  // muted, fully readable after a short travel, never waiting for focus.
  // RELEASED is unchanged: departure still sets the composition down.
  if (a < -0.66) return 0.45;
  if (a < -0.38) return 0.45 + 0.55 * ((a + 0.66) / 0.28);
  if (a <= 0.2) return 1;
  if (a < 0.6) return 1 - 0.66 * ((a - 0.2) / 0.4);
  return 0.34;
}

/**
 * V14.4 (owner: "SYSTEMS becomes fully clear EARLIER -- when it reaches the
 * viewport centre it must already have been fully readable for some
 * distance"). The word is the one composition that is a single state
 * change rather than a scene to be read, so it is detected brighter and
 * acquired a full step ahead of the project scenes: 0.6 while far, full by
 * approach -0.55 (a scene reaches full at -0.38), then the same release.
 */
export function systemsWordPresence(signedApproach: number, mobile = false): number {
  if (mobile) return scenePresence(signedApproach, mobile);
  const a = Math.max(-1, Math.min(1, signedApproach));
  // V14.5 (owner, after f4bdab3): a very short, slightly muted entrance,
  // then fully clear well before focus -- 0.72 while far, full by -0.88.
  if (a < -0.88) return 0.72 + 0.28 * ((a + 1) / 0.12);
  // Held at full until the black state has already taken the frame: the
  // word never fades into grey ahead of the cover -- the cover is the cut.
  if (a <= 0.55) return 1;
  return scenePresence(a, mobile);
}

/**
 * V6.4 renamed the middle state `collision` -> `occluded`, and moved where it
 * begins. It used to mean "the camera is being held at the wall"; it now means
 * "the surfaces are closing over the world", which is both what actually happens
 * and the only thing this type was ever read for.
 */
export type WorldState = "travelling" | "occluded" | "reorienting";

export function worldState(progress: number): WorldState {
  if (progress >= BREAK_COVER_START && progress < BREAK_CUT) return "occluded";
  if (progress >= BREAK_CUT && progress < BREAK_REVEAL_END) return "reorienting";
  return "travelling";
}

/** True once the world's grammar has tightened, i.e. after the reposition
 *  (§25). One state transition inside one design system -- not a second theme. */
export function isResolvedState(progress: number): boolean {
  return progress >= BREAK_CUT;
}
