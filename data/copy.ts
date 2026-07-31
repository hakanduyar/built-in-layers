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

// PROJECT_SPEC.md §11 "Real-life products heading" seed, verbatim.
export const builtForRealLifeSubheading =
  'Some products begin with a brief. Others begin with: "I actually need this."';

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
  notesPrefix: "Selected writing will be linked here soon. In the meantime:",
  aboutPrefix: "A fuller introduction is coming here. In the meantime, get in touch on",
  realLife: "Personal, real-life products will appear here once they're ready to share.",
};

export const notFoundCopy = {
  heading: "Page not found",
  body: "This page doesn't exist, or the link is out of date.",
};
