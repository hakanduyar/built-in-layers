// Spatial Portfolio V5 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §19). Pure geometry for the lower homepage, no
// JSX -- unit-testable in isolation (tests/unit/spatial-drift.test.ts).
//
// THE PROBLEM THIS SOLVES (§26)
//
// V4's world ended at the handoff and the page then dropped into ordinary
// straight-down scrolling. The owner rejected that: after a journey with
// physics, a hard switch to a static column reads as the site giving up.
//
// EDITORIAL DRIFT is the answer, and it is deliberately NOT a second spatial
// tour. Semantic order is untouched -- every section stays exactly where it
// was in the document -- and the only thing that moves is where each block
// sits across the page as it passes through the viewport. Vertical progress
// is still ordinary scrolling; the horizontal component is what carries the
// world's physics into the lower page.
//
// DETERMINISTIC, NOT RANDOM (§31). There is no Math.random() here and no
// per-visit variation. "Unpredictable" means visually non-obvious, and it is
// achieved by giving each section a different entry and exit position and a
// different sign of travel -- a fixed table, testable and stable across
// visits, history and screenshots.

export type DriftSectionId = "real-life" | "how-i-build" | "field-notes" | "about";

/**
 * V6.1 (§21): each section's own spatial relationship to the route, not just its
 * x-offset.
 *
 * V6's four sections differed ONLY in entry/exit fraction. Same wrapper, same
 * width, same depth, same lead rule, alternating sides -- which is structurally
 * "one template plus an offset", and is exactly why the lower page still read as
 * sections arranged beside a timeline rather than as surfaces encountered along a
 * route.
 *
 *   plate    the first stable surface after the transition -- full presence,
 *            the widest measure, sitting square in the world
 *   wide     a broader structured plane the route runs alongside
 *   distant  set back: narrower measure, lighter marks, further from the eye
 *   near     returns toward the foreground as the journey resolves
 *
 * `depth` is the one number those words reduce to: 0 is the world plane, negative
 * is set back, positive is forward. It drives measure width and the weight of the
 * section's own structural marks -- NOT the text colour, which stays at full
 * contrast in every section (§22, and basic readability).
 */
export type DriftPlane = "plate" | "wide" | "distant" | "near";

export type DriftSection = {
  id: DriftSectionId;
  /**
   * Where the block sits across the drift track when it ENTERS the viewport
   * and when it LEAVES it, as a fraction of the free horizontal space:
   * 0 is hard left, 1 is hard right. Expressing it as a fraction of the free
   * space rather than in vw is what makes overflow impossible at any viewport
   * width -- the block can never be asked to go somewhere it does not fit.
   */
  entry: number;
  exit: number;
  plane: DriftPlane;
  /** -1..+1. Set back / forward relative to the world plane. */
  depth: number;
};

/**
 * §30's conceptual roles, tuned against the real sections:
 *
 *   Built for Real Life  gentle arrival, drifting right out of the world's
 *                        exit position
 *   How I Build          the route bends hard left, and this is the widest
 *                        composition of the four
 *   Field Notes          returns right, on a smaller amplitude
 *   About                quieter, nearly horizontal
 *
 * The CTA is the global footer and is not a drift block; the track settles
 * back to centre in the connector after About (see DRIFT_SETTLE).
 */
/**
 * V6 WIDENED EVERY AMPLITUDE. The owner's verdict on V5 was that after the
 * collision the world "becomes too close to a normal downward page" -- and at
 * V5's fractions the largest block travelled 107px across a whole viewport of
 * scrolling, a slope of about 6 degrees. That is not an oblique world; it is a
 * column with a slight lean.
 *
 * The fractions below span 0.04-0.78 of the track (V5: 0.08-0.64) and, combined
 * with the narrower block width in EditorialDrift, roughly double the real
 * lateral travel. Paired with DRIFT_ROUTE (the visible oblique spine the blocks
 * are registered to), the lower page reads as continuing the route rather than
 * abandoning it.
 */
export const DRIFT_SECTIONS: readonly DriftSection[] = [
  { id: "real-life", entry: 0.04, exit: 0.4, plane: "plate", depth: 0 },
  { id: "how-i-build", entry: 0.78, exit: 0.18, plane: "wide", depth: -0.25 },
  { id: "field-notes", entry: 0.26, exit: 0.68, plane: "distant", depth: -0.7 },
  { id: "about", entry: 0.58, exit: 0.42, plane: "near", depth: 0.55 },
] as const;

/**
 * Measure width for a section, as a multiplier on the track's `--drift-w`.
 * Distance reads as a narrower column and proximity as a wider one, which is the
 * same cue the spatial world above uses (scenes resolve in scale as the camera
 * arrives) rather than a second, unrelated depth language.
 *
 * Bounded tightly: text has to stay comfortable to read in every section (§22),
 * so this is a few percent, not a dramatic zoom.
 */
export function driftMeasure(id: DriftSectionId): number {
  const { depth } = driftSection(id);
  return 1 + depth * 0.07;
}

/** Weight of a section's own structural marks -- lighter when set back. */
export function driftMarkOpacity(id: DriftSectionId): number {
  const { depth } = driftSection(id);
  return +(0.5 + depth * 0.22).toFixed(3);
}

/**
 * V6.2 (§15): the SURFACE each section stands on.
 *
 * V6.1 gave the four sections different widths and mark weights, which made them
 * measurably distinct but not spatially distinct -- they were still four blocks
 * floating on the page beside a line. A plate gives each one an actual surface:
 * a leading edge it sits on, a corner that registers it in the world, and a
 * vertical interval before it that says how far the route travelled to get there.
 *
 * `lead` is the plate's top edge as a fraction of the block width, so a set-back
 * plane shows less of its own surface (foreshortening, without fake 3D).
 * `gapVh` is the interval BEFORE the section: uneven, so the four are encountered
 * at different distances rather than on a regular rhythm, which is most of what
 * made the sequence read as a timeline.
 */
/** V6.8: the plate VISUAL was deleted (see DriftBlock); what survives is the
 *  approach interval before each section, which was always the meaningful half. */
/** FABLE GATE 1 (Q3) added `seamRem`: where the section's field (driftField)
 *  opens beneath the section's display typography, in rem from the top of the
 *  block. Authored per section but registered to measurement, the same class
 *  of value as gapVh: three sections set their display line's bottom at an
 *  identical measured 246px, so 16rem (256px) puts the seam ~10px into the
 *  whitespace under it; About's two-line display name reaches 333px, so its
 *  seam sits at 21.5rem for the same ~11px clearance. The seam must never
 *  cross a line of text — that is the rule the numbers serve. */
export type DriftPlate = { gapVh: number; seamRem: number };

const PLATES: Record<DriftSectionId, DriftPlate> = {
  // The first stable surface after the transition: shows its full edge, square on.
  //
  // V6.3 raised its approach interval from 6vh to 26vh (§5). The spatial world now
  // ends on a long down-and-right traverse rather than stopping at `handoff`, and
  // a 6vh gap after that put a section heading roughly half a screen below the
  // last frame of a journey -- so the traverse handed straight into ordinary
  // document logic and the extra distance bought nothing. 26vh is the arrival: the
  // spine runs on alone through it, and the first surface is ENCOUNTERED at the end
  // of a travel interval rather than being the next thing in the scroll.
  //
  // V6.5 BRINGS IT BACK DOWN, 26vh -> 12vh, because the premise of the V6.3 raise
  // has been removed. 26vh was the arrival interval for a world that ENDED ON
  // EMPTY TRAVEL: the last frame of the traverse had nothing in it, so distance
  // after it was the only thing separating the journey from the next heading.
  // V6.5's route terminates framing the How I Build destination (see
  // DestinationSurface), so the world now hands over from a composed frame, and
  // the interval is back to being breathing room rather than a substitute for
  // content. Measured, the 26vh was the last third of a 1560px run in which the
  // rendered frame averaged 2.2% ink.
  //
  // 12vh, not 6: it is still the arrival, and it is still where the spine runs on
  // alone. §5 asks for the excess removed, not for the negative space eliminated.
  "real-life": { gapVh: 5, seamRem: 16 },
  // A broader plane the route runs alongside.
  "how-i-build": { gapVh: 22, seamRem: 16 },
  // Set back and further away: the least of its surface visible.
  //
  // V6.5: 34vh -> 20vh. This was the SECOND-largest dead run on the measured page
  // (1320px, 3.7% mean ink) and the largest one outside the spatial section. The
  // sections either side of it are left exactly as they are (§7) -- only the
  // interval between them is trimmed, which is the part that carried no
  // information.
  // V6.6: 20vh -> 14vh. NOT part of JOB 3 -- the hand-over this pass was asked to
  // fix is upstream of here and is measured separately -- but once the hand-over
  // was solved this became the page's longest thin stretch, and trimming one
  // approach interval is the same class of change V6.5 made (34 -> 20) rather than
  // a redesign of either section. Judgement, and it is worth stating plainly: the
  // frames here are SPARSE, not empty. Field Notes is a short section by design
  // and the metric's ink threshold does not distinguish the two.
  "field-notes": { gapVh: 14, seamRem: 16 },
  // Returning toward the foreground as the journey resolves.
  about: { gapVh: 14, seamRem: 21.5 },
};

export function driftPlate(id: DriftSectionId): DriftPlate {
  return PLATES[id];
}

/* ------------------------------------------------------- section fields */

/**
 * FABLE GATE 1 (Q3). THE SECTION'S GROUND.
 *
 * The gate's question was what makes the lower page belong to the same system
 * as the top, through structure and behaviour. The answer chosen: the same
 * thing that makes the top read as a world — no composition up there is a
 * single surface. Evidence stands on a project plane; the expressive word
 * opens over its trace; the route runs through fields. The lower sections were
 * the only compositions in the whole journey drawn on bare paper, and that —
 * not a missing mark — is why they read as weaker: they are FLAT in a site
 * whose identity is depth.
 *
 * So each drift section now stands in its own field: one soft-paper surface,
 * the exact material and presence language of `ProjectPlane`. Nothing is drawn
 * on it, and its geometry is DERIVED from the section's own entry/exit table,
 * not authored per section.
 *
 * The field is the section's sweep envelope — from the leftmost position the
 * block's own entry/exit table ever gives it to the rightmost, plus the
 * block's measure: the strip of track this section actually travels, made
 * visible as the ground it travels across. The block slides visibly along its
 * field as it passes through the viewport — the same enacted (not asserted)
 * depth the project planes carry. A section that drifts far owns a wide
 * ground; a quiet one, a narrow ground.
 *
 * De-nesting happens on the VERTICAL axis, and where it happens was iterated
 * against real frames, not reasoned into: an envelope CONTAINS the block at
 * every scroll position, so with a naive top edge the section sat inside a
 * pale rectangle — the frame-and-picture nesting the plane grammar forbids.
 * A horizontal near-edge cut was tried next and rejected on sight: it ran the
 * field's edge straight through the running text of every section's body
 * column. The seam the fields settled on is typographic: the field's top edge
 * sits in the whitespace just below the display heading's baseline (every
 * section places that baseline at the same internal offset, measured), so the
 * register and the heading — the section's structure — overhang the ground,
 * the body stands on it, and the edge never crosses a line of text. The same
 * relationship the world's evidence has to its plane: structure breaks the
 * top bound, ground runs on below the bottom. Distinct from the V6.7-deleted
 * density rectangles for exactly the reason ProjectPlane is: it belongs to a
 * section, registers to that section's real geometry, and its behaviour
 * states the relationship.
 */
export function driftField(id: DriftSectionId): { left: number; span: number } {
  const section = driftSection(id);
  return {
    left: Math.min(section.entry, section.exit),
    span: Math.abs(section.exit - section.entry),
  };
}

/**
 * Field presence, from the section's depth. The world's project planes peak at
 * 0.66; the plate section (depth 0) matches them exactly — one grammar — and
 * the others state their distance through the same channel the marks and
 * measures already use. Forward of the world plane means nearer, so more
 * present, never less.
 */
export function driftFieldOpacity(id: DriftSectionId): number {
  const { depth } = driftSection(id);
  return +(0.66 + depth * 0.15).toFixed(3);
}

/** Where the track comes to rest before handing off to the footer CTA. */
export const DRIFT_SETTLE = 0.5;

export function driftSection(id: DriftSectionId): DriftSection {
  const section = DRIFT_SECTIONS.find((entry) => entry.id === id);
  if (!section) throw new Error(`unknown drift section: ${id}`);
  return section;
}

/** Total lateral variation across the whole drift, as a fraction of the track. */
export function driftSpread(): number {
  const positions = DRIFT_SECTIONS.flatMap((section) => [section.entry, section.exit]);
  return Math.max(...positions) - Math.min(...positions);
}

/* ------------------------------------------------------- the oblique spine */

export type DriftRouteStop = {
  /** Vertical position through the drift region, 0 (top) to 1 (bottom). */
  at: number;
  /** Lateral position as the same free-space fraction the blocks use. */
  fraction: number;
  /** Which section this stop belongs to, or the closing settle. */
  owner: DriftSectionId | "settle";
  /** The owning section's depth, carried onto the stop (V6.1). */
  depth: number;
};

/**
 * V6 (§20.2). THE VISIBLE ROUTE THROUGH THE LOWER PAGE.
 *
 * Widening the blocks' lateral travel was necessary but not sufficient: a block
 * that has moved is still just a block that has moved. What makes the lower page
 * read as *the same world* is that the route itself is drawn, and the blocks are
 * visibly registered to it — the spine bends where they bend, because it is
 * generated from the very same table they are positioned by.
 *
 * Two stops per section (its entry and its exit) plus the closing settle. The
 * result is a continuous oblique zigzag descending the page: calmer than the
 * spatial route above it, unmistakably the continuation of it.
 *
 * Expressed in the same free-space fraction as the blocks, so a stop at fraction
 * `f` lands exactly on the left edge of a block at fraction `f` — at every
 * viewport width, with no second coordinate system to keep in sync.
 */
const SECTION_BAND = 0.225;
const SETTLE_AT = 0.97;

export function driftRoute(): DriftRouteStop[] {
  const stops: DriftRouteStop[] = [];
  DRIFT_SECTIONS.forEach((section, index) => {
    const top = index * SECTION_BAND;
    const depth = section.depth;
    stops.push({ at: top + 0.045, fraction: section.entry, owner: section.id, depth });
    stops.push({ at: top + 0.18, fraction: section.exit, owner: section.id, depth });
  });
  // The route's last coordinate before the finale takes over. Forward of the
  // world plane, because the journey is resolving toward the viewer.
  stops.push({ at: SETTLE_AT, fraction: DRIFT_SETTLE, owner: "settle", depth: 0.55 });
  return stops;
}

/**
 * V6.1 (§20): the spine split into FOREGROUND and BACKGROUND runs.
 *
 * V6 drew one flat polyline at one depth behind everything, with a mark at every
 * stop -- structurally a vertical timeline, which is the exact thing §19/§20 want
 * avoided. Splitting it by the depth of the section each run belongs to means the
 * route sometimes passes behind a content plane and sometimes comes in front of
 * it, so it reads as a line travelling THROUGH a space rather than as a rail
 * drawn beside a list.
 *
 * A run is foreground when the section it belongs to is forward of the world
 * plane. Consecutive stops at the same sign form one run, and runs share their
 * boundary stop so the line stays visually continuous across a depth change --
 * the route never breaks, it only changes which side of the content it is on.
 */
export function driftRouteRuns(): { foreground: boolean; stops: DriftRouteStop[] }[] {
  const stops = driftRoute();
  const runs: { foreground: boolean; stops: DriftRouteStop[] }[] = [];
  for (const stop of stops) {
    const foreground = stop.depth > 0;
    const current = runs[runs.length - 1];
    if (!current || current.foreground !== foreground) {
      // Carry the previous run's last stop into the new one, so the two runs
      // meet rather than leaving a gap at the depth change.
      const previous = current?.stops[current.stops.length - 1];
      runs.push({ foreground, stops: previous ? [previous, stop] : [stop] });
    } else {
      current.stops.push(stop);
    }
  }
  return runs.filter((run) => run.stops.length > 1);
}
