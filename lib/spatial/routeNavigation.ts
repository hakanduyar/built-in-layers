import { DRIFT_SECTIONS, type DriftSectionId } from "@/lib/spatial/editorialDrift";
import { SCENE_IDS, type SceneId } from "@/lib/spatial/scenes";
import { footerCtaLabel, heroPrimaryLine, layerDefinitions, sectionIndex } from "@/data/copy";

// V14.9 NAVIGATION GATE -- THE ONE LIST THE NAVIGATOR, THE PREV/NEXT CONTROLS
// AND THE KEYBOARD ALL READ.
//
// The page is two worlds joined by a cut: a governed camera route (nine scenes
// inside one sticky frame, addressed by PROGRESS) and an ordinary document below
// it (four drift sections and the finale, addressed by POSITION). Before this
// gate nothing described the journey as a single ordered sequence -- the world
// knew its scenes, the lower page knew its sections, and no module knew that
// DropSpot is followed by SYSTEMS which is eventually followed by Selected
// systems.
//
// This module is that sequence, and it is deliberately the ONLY place it
// exists. Everything derived from it -- which station is active, what PREVIOUS
// and NEXT mean, what ArrowLeft and ArrowRight do, which tick is filled -- is a
// pure function of this array, so the three controls in the owner's brief cannot
// disagree about where the reader is or where they are going.
//
// WHAT IS AND IS NOT A STATION. Every station is a place the page really goes:
// a scene the camera has a focus progress for, a section the document has an
// element for, or the finale. Nothing here is a beat, a phase, an opacity
// window or any other animation state -- the break, the dwell, the surface
// return and the departure zoom are all things that happen BETWEEN stations,
// and none of them is addressable. That is the brief's "do not create
// navigation stops for minor animation states", enforced by the shape of the
// data rather than by a comment: a station must name a real `SceneId`, a real
// `DriftSectionId`, or the finale, and the unit test asserts that every one of
// them does.
//
// LABELS ARE THE PAGE'S OWN WORDS. Each label is either a string the product
// already ships or a derivation of one, so a label cannot drift from the thing
// it names:
//
//   Surface          layerDefinitions[0].label -- the world's first stratum
//   Systems          the hero line's own transition word, split exactly as
//   Underneath       components/spatial/SpatialExperience.tsx splits it
//   the four cases   the project's real frontmatter title, resolved at render
//   Built in Layers  the label that scene's own SectionHeading carries
//   A larger map     that scene's own sentence, "These are four stops on a
//                    larger map."
//   05..08           the real section headings and the real IA indices
//   Get in touch     footerCtaLabel, without its destination
//
// INDICES ARE ONLY WHERE THE PRODUCT ASSIGNS ONE. The four cases carry 01..04
// because the acquisition frame and the route's stations already number them;
// the four lower sections carry 05..08 because the IA does. The hero, the
// world's three framework scenes and the finale carry none, which is the same
// rule `WorldGrammar`'s station index already states: route two's stops are the
// system's own framework, not cases, and are not counted.

/** The two halves of the approved hero line, split exactly as the world splits
 *  them (`SpatialExperience`), so the world's state words and the navigator's
 *  labels for them are derived from one string and can never disagree. */
const [, systemsClause = "Systems underneath."] = heroPrimaryLine.split(". ");
const [transitionWord = "Systems", orientationWord = "underneath"] = systemsClause
  .replace(/\.$/, "")
  .split(" ");

const capitalise = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

export type RouteStationKind = "scene" | "section" | "finale";

export type RouteStation = {
  /** Stable id, used for `data-route-station` and as the React key. */
  id: string;
  kind: RouteStationKind;
  /** The camera scene this station is, when it is one. */
  scene?: SceneId;
  /** The drift section this station is, when it is one. */
  section?: DriftSectionId;
  /** The index the product already assigns to this station, if it assigns one. */
  index?: string;
  /** The station's own name. Cases resolve their real title at render instead. */
  label: string;
  /** The project whose real frontmatter title labels this station. */
  projectSlug?: string;
};

/**
 * The journey, in the order a reader travels it. The only ordered list of the
 * page's destinations in the codebase.
 */
export const ROUTE_STATIONS: readonly RouteStation[] = [
  { id: "hero", kind: "scene", scene: "hero", label: layerDefinitions[0]!.label },
  {
    id: "software-factory",
    kind: "scene",
    scene: "software-factory",
    index: "01",
    label: "Software Factory",
    projectSlug: "software-factory",
  },
  {
    id: "kivilcim",
    kind: "scene",
    scene: "kivilcim",
    index: "02",
    label: "Kıvılcım",
    projectSlug: "kivilcim",
  },
  {
    id: "jointledger",
    kind: "scene",
    scene: "jointledger",
    index: "03",
    label: "JointLedger",
    projectSlug: "jointledger",
  },
  {
    id: "dropspot",
    kind: "scene",
    scene: "dropspot",
    index: "04",
    label: "DropSpot",
    projectSlug: "dropspot",
  },
  { id: "tail", kind: "scene", scene: "tail", label: capitalise(transitionWord) },
  { id: "reorient", kind: "scene", scene: "reorient", label: capitalise(orientationWord) },
  { id: "approach", kind: "scene", scene: "approach", label: "Built in Layers" },
  { id: "handoff", kind: "scene", scene: "handoff", label: "A larger map" },
  {
    id: "selected-systems",
    kind: "section",
    section: "selected-systems",
    index: sectionIndex.selectedSystems,
    label: "Selected systems",
  },
  {
    id: "how-i-build",
    kind: "section",
    section: "how-i-build",
    index: sectionIndex.howIBuild,
    label: "How I build",
  },
  {
    id: "field-notes",
    kind: "section",
    section: "field-notes",
    index: sectionIndex.fieldNotes,
    label: "Field notes",
  },
  {
    id: "about",
    kind: "section",
    section: "about",
    index: sectionIndex.about,
    label: "About",
  },
  {
    id: "finale",
    kind: "finale",
    label: footerCtaLabel.split(" on ")[0] ?? footerCtaLabel,
  },
] as const;

/** Every scene the camera travels, in route order. Exported for the contract
 *  test that proves the navigator covers the real world and invents nothing. */
export const NAVIGABLE_SCENE_IDS: readonly SceneId[] = ROUTE_STATIONS.filter(
  (station) => station.scene !== undefined,
).map((station) => station.scene!);

export const NAVIGABLE_SECTION_IDS: readonly DriftSectionId[] = ROUTE_STATIONS.filter(
  (station) => station.section !== undefined,
).map((station) => station.section!);

/** The position of a station in the journey, or -1. */
export function stationIndex(id: string): number {
  return ROUTE_STATIONS.findIndex((station) => station.id === id);
}

/**
 * The station one step along the route from `id`, or `null` at either end.
 * `step` is -1 for PREVIOUS and +1 for NEXT; the controls, the keyboard and any
 * future affordance all step through the same array, so they cannot disagree
 * about what "next" means.
 */
export function stepStation(id: string, step: -1 | 1): RouteStation | null {
  const at = stationIndex(id);
  if (at < 0) return null;
  return ROUTE_STATIONS[at + step] ?? null;
}

/** The label a station shows, with the four cases resolved to the project's own
 *  real title. Falls back to the station's own label when a title is missing,
 *  so an unpublished project can never blank the navigator. */
export function stationLabel(station: RouteStation, projectTitles: Record<string, string>): string {
  if (station.projectSlug) return projectTitles[station.projectSlug] ?? station.label;
  return station.label;
}

/**
 * The station the reader is at, given each station's document scroll position.
 * The last station whose target the reader has reached, where "reached" allows
 * a lead of `lead` pixels so a station becomes current as it arrives rather
 * than once it is already leaving. Pure, so the unit test can state the
 * free-scroll contract without a browser.
 */
export function activeStationIndex(
  scrollY: number,
  targets: readonly number[],
  lead: number,
): number {
  let active = 0;
  for (let i = 0; i < targets.length; i += 1) {
    const target = targets[i];
    if (target === undefined) continue;
    if (scrollY + lead >= target) active = i;
  }
  return active;
}

/** Guard used by the contract test: the navigator's scenes are exactly the
 *  world's scenes, in the world's own order. */
export function coversEveryScene(): boolean {
  return (
    NAVIGABLE_SCENE_IDS.length === SCENE_IDS.length &&
    SCENE_IDS.every((id, index) => NAVIGABLE_SCENE_IDS[index] === id)
  );
}

/** Guard used by the contract test: the navigator's sections are exactly the
 *  drift track's sections, in the drift track's own order. */
export function coversEverySection(): boolean {
  return (
    NAVIGABLE_SECTION_IDS.length === DRIFT_SECTIONS.length &&
    DRIFT_SECTIONS.every((section, index) => NAVIGABLE_SECTION_IDS[index] === section.id)
  );
}
