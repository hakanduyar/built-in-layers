// CLAUDE.md §4: owner name and primary positioning, verbatim.
export const homeWordmark = "Hakan Duyar";
export const homePositioning = "Frontend & Product Engineer";

// CLAUDE.md §4 "Primary line" / PROJECT_SPEC.md §11 hero seed, verbatim.
export const heroPrimaryLine = "Interfaces on the surface. Systems underneath.";

// CLAUDE.md §4 "Supporting statement" / PROJECT_SPEC.md §11 "Supporting
// statement" seed, verbatim. Rendered in the editorial serif `statement`
// role (DESIGN_SYSTEM §3) as its own IA section (PROJECT_SPEC §7 item 3),
// distinct from the hero primary line above.
export const positioningStatement =
  "I design clear interfaces and build the systems that make them work.";

// TASK-003 instruction, verbatim: the three-layer framework's one-line
// definitions for the homepage's static (non-interactive) explainer.
export const layerDefinitions = [
  { label: "Surface", body: "interface and interaction" },
  { label: "Flow", body: "behavior, states, and user journeys" },
  { label: "System", body: "architecture, data, and constraints" },
] as const;

// PROJECT_SPEC.md §11 "Selected work heading" seed, verbatim.
export const selectedSystemsSubheading = "Not just what they look like — how they actually work.";

// V6.3: the heading itself, promoted out of the section component so the spatial
// world's travel material can announce the region it is travelling toward using
// the page's own words rather than a retyped copy of them. Used by
// components/sections/BuiltForRealLife.tsx and by the exit traverse's distant-plane
// fragment in components/spatial/SpatialExperience.tsx.
export const builtForRealLifeHeading = "Built for real life";

// V6.4: the same promotion for How I Build, for the same reason -- the exit
// traverse now foreshadows both sections (§4B, §4C) and neither preview may
// contain a retyped string.
export const howIBuildHeading = "How I build";

/**
 * V6.4: the IA index each homepage section renders in its own SectionHeading.
 *
 * Promoted here because the spatial world's destination surfaces show the index
 * alongside the heading -- "05 / BUILT FOR REAL LIFE" -- and a preview whose
 * number silently disagreed with the section it is previewing would be exactly the
 * kind of pseudo-data the brief forbids. Only the two foreshadowed sections are
 * listed; the rest keep their literals until something else needs them.
 */
export const sectionIndex = {
  builtForRealLife: "05",
  howIBuild: "06",
} as const;

/**
 * V6.4: how the site refers to the Work index in prose. Used by the handoff
 * scene's real sentence and by the work-route branch's terminus, so the branch
 * names the destination in the page's own words rather than inventing a label.
 */
export const workIndexLabel = "Work index";

// PROJECT_SPEC.md §11 "Real-life products heading" seed, verbatim.
export const builtForRealLifeSubheading =
  "Some products begin with a brief. Others begin with: \u201cI actually need this.\u201d";

// Authored voice copy (no literal pre-approved seed exists for this IA
// section) -- each principle is grounded in an already-approved document
// statement, not an invented claim. See docs/PROGRESS.md TASK-003 entry for
// the source of each.
export const howIBuildPrinciples = [
  {
    title: "Interfaces are built on systems",
    body: "What's visible is only half the work — the underlying data, permissions, and flow decide whether it holds up.",
  },
  {
    title: "Constraints are material",
    body: "Permissions, offline behavior, and real data shape the interface, not the other way around.",
  },
  {
    title: "Honest by default",
    body: "Unfinished work says so, plainly, instead of pretending to be done.",
  },
  {
    title: "Every element has a job",
    body: "Nothing on the page is there just to look good — decoration without a role gets removed.",
  },
] as const;

// PROJECT_SPEC.md §11 contact seed copy, refined for sentence case
// (display styling applies the approved uppercase treatment).
export const footerCtaHeading = "Have a complex product?";
export const footerCtaSubline = "Let's make it feel simple.";
export const footerCtaLabel = "Get in touch on LinkedIn";

// D-009 approved pending copy for Lab and Notes (exact wording). The Work
// and About stubs are not covered by D-009 and use an honest, non-fabricated
// one-liner instead. `realLife` follows the same honest-pending convention
// for the homepage's "Built for real life" section, which has no published
// or draft real-life-tier project yet (TASK-003).
export const pendingCopy = {
  work: "Selected engineering work is being prepared for publication here.",
  lab: "The lab is where small experiments will live. Nothing is published here yet — honestly.",
  // V6.8 (§9): reworded from "Selected writing will be linked here soon. In the
  // meantime:" -- a sentence that self-described the section as a placeholder,
  // which no visual device could overcome. The new line states the same truth
  // as a present fact rather than a promise.
  notesPrefix: "Writing currently lives externally:",
  aboutPrefix: "A fuller introduction is coming here. In the meantime, get in touch on",
  realLife: "Personal, real-life products will appear here once they're ready to share.",
};

export const notFoundCopy = {
  heading: "Page not found",
  body: "This page doesn't exist, or the link is out of date.",
};
