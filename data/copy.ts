// Chrome and shell copy only. Source strings use natural case; `uppercase`
// utility classes apply the visual case transform at render time so screen
// readers receive normal-case text (DESIGN_SYSTEM §3 case rules).

export const homeWordmark = "Hakan Duyar";
export const homePositioning = "Frontend & Product Engineer";

// PROJECT_SPEC §11 contact copy seed, verbatim in meaning.
export const footerCtaHeading = "Have a complex product?";
export const footerCtaSubline = "Let's make it feel simple.";
export const footerCtaLabel = "Get in touch on LinkedIn";

// Pending-state copy. Lab and Notes prefixes are exact D-009 wording.
// Work and About have no approved D-009 text; these are brief, honest,
// non-inventive shell lines pending Hakan's review.
export const pendingCopy = {
  work: "Selected engineering work is being prepared for publication here.",
  lab: "The lab is where small experiments will live. Nothing is published here yet — honestly.",
  notesPrefix: "Selected writing will be linked here soon. In the meantime:",
  about: "A fuller introduction is coming here — for now, the essentials live on",
};

export const notFoundCopy = {
  heading: "Page not found",
  body: "This page doesn't exist, or the link is out of date.",
};
