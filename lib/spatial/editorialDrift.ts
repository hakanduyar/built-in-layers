// Spatial Portfolio V5 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §18). Pure geometry for the lower homepage, no
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
export const DRIFT_SECTIONS: readonly DriftSection[] = [
  { id: "real-life", entry: 0.08, exit: 0.36 },
  { id: "how-i-build", entry: 0.64, exit: 0.2 },
  { id: "field-notes", entry: 0.28, exit: 0.6 },
  { id: "about", entry: 0.54, exit: 0.46 },
] as const;

/** Where the track comes to rest before handing off to the footer CTA. */
export const DRIFT_SETTLE = 0.5;

export function driftSection(id: DriftSectionId): DriftSection {
  const section = DRIFT_SECTIONS.find((entry) => entry.id === id);
  if (!section) throw new Error(`unknown drift section: ${id}`);
  return section;
}

/**
 * The structural rule each block carries above its heading (§29). Its tilt is
 * the section's own direction of travel, so the mark states where the block is
 * going -- the same discipline the hero's lead rule and the world's rails
 * already follow, rather than a decorative diagonal.
 */
export function driftLeadRule(id: DriftSectionId, widthVw = 13): { width: number; height: number } {
  const section = driftSection(id);
  return { width: widthVw, height: (section.exit - section.entry) * 26 };
}

/** Total lateral variation across the whole drift, as a fraction of the track. */
export function driftSpread(): number {
  const positions = DRIFT_SECTIONS.flatMap((section) => [section.entry, section.exit]);
  return Math.max(...positions) - Math.min(...positions);
}
