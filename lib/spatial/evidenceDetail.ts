// V14.1 (owner §9, evidence legibility) -- THE ACQUIRED DETAIL.
//
// Software Factory, Kıvılcım and JointLedger stage 1600×1000-unit diagrams at
// a nine-column measure, which puts their body labels at 8-11 CSS px: proof
// that reads as a thumbnail of a document. The owner's brief rules out scaling
// every diagram up and rules out inventing anything, and lists what is
// allowed: focus a meaningful subsystem, crop to the relevant evidence, make
// one fragment dominant and subordinate the rest.
//
// So each of those scenes now frames the SUBSYSTEM that is its argument -- a
// window cut from the same registered asset, in the asset's own units, at the
// scale the window earns -- and keeps the whole drawing one INSPECT away. The
// window's name is the diagram's OWN heading for that region (present in the
// SVG's text), never a new claim; the caption states that a detail is shown.
//
// This is presentation geometry keyed by asset path, not content: nothing here
// adds a fact to a project, and a project whose lead asset has no entry renders
// exactly as before (DropSpot's real screenshots stay whole, per the owner's
// V7 decision).

export type EvidenceWindow = {
  /** The region shown, in the asset's intrinsic units. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** The diagram's own name for this region, as printed in the drawing. */
  label: string;
};

const WINDOWS: Record<string, EvidenceWindow> = {
  // The gated path is the whole argument; the integration mandate beneath it
  // is fine print that reads at full width in the inspector.
  "/images/projects/software-factory/factory-loop-diagram.svg": {
    x: 32,
    y: 112,
    width: 1488,
    height: 464,
    label: "The delivery loop",
  },
  // Everything the app needs lives on the device: the on-device box is the
  // claim; the optional external request beside it is context, in the inspector.
  "/images/projects/kivilcim/local-first-architecture.svg": {
    // The window's right edge sits exactly at 944, the right border of the
    // inner layer rows: the dashed arrow toward the optional external request
    // starts there, so any edge further right shows a stub of it.
    x: 44,
    y: 262,
    width: 900,
    height: 538,
    label: "On-device — no mandatory backend",
  },
  // The relationship the shared ledger is built on. The third table, which
  // the diagram itself marks as having no code behind it yet, reads whole in
  // the inspector.
  "/images/projects/jointledger/book-data-model-diagram.svg": {
    x: 120,
    y: 240,
    width: 1380,
    height: 720,
    label: "Book, BookMember, BookInvitation",
  },
};

export function evidenceWindow(src: string): EvidenceWindow | null {
  return WINDOWS[src] ?? null;
}
