import { describe, expect, it } from "vitest";
import { DRIFT_SECTIONS } from "@/lib/spatial/editorialDrift";
import { SCENE_IDS } from "@/lib/spatial/scenes";
import { sectionIndex } from "@/data/copy";
import {
  ROUTE_STATIONS,
  activeStationIndex,
  coversEveryScene,
  coversEverySection,
  stationIndex,
  stationLabel,
  stepStation,
} from "@/lib/spatial/routeNavigation";

// V14.9: the navigation gate's central promise is that the navigator, the
// PREVIOUS/NEXT controls and the arrow keys all read ONE list. These are the
// contracts that keep that true as the route changes.

describe("the route navigator's list is the page's own journey", () => {
  it("covers every camera scene, in the world's own order", () => {
    // If a scene is added to or removed from the route, this fails until the
    // navigator's list is updated -- which is the point: the list may not
    // silently describe a world that no longer exists.
    expect(coversEveryScene()).toBe(true);
  });

  it("covers every lower-world section, in the drift track's own order", () => {
    expect(coversEverySection()).toBe(true);
  });

  it("is the whole journey and nothing else: nine scenes, four sections, the finale", () => {
    expect(ROUTE_STATIONS).toHaveLength(SCENE_IDS.length + DRIFT_SECTIONS.length + 1);
    expect(ROUTE_STATIONS.filter((station) => station.kind === "finale")).toHaveLength(1);
  });

  it("gives every station a unique id", () => {
    const ids = ROUTE_STATIONS.map((station) => station.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never creates a stop for an animation state", () => {
    // A station must name a real scene, a real drift section, or be the single
    // finale. There is deliberately no way to express "the dwell", "the cut" or
    // any other beat as a destination.
    const sceneIds = new Set<string>(SCENE_IDS);
    const sectionIds = new Set<string>(DRIFT_SECTIONS.map((section) => section.id));
    for (const station of ROUTE_STATIONS) {
      if (station.kind === "scene") {
        expect(station.scene, `${station.id} must name a real scene`).toBeDefined();
        expect(sceneIds.has(station.scene!)).toBe(true);
        expect(station.section).toBeUndefined();
      } else if (station.kind === "section") {
        expect(station.section, `${station.id} must name a real section`).toBeDefined();
        expect(sectionIds.has(station.section!)).toBe(true);
        expect(station.scene).toBeUndefined();
      } else {
        expect(station.scene).toBeUndefined();
        expect(station.section).toBeUndefined();
      }
    }
  });

  it("labels every station with a real, non-empty name", () => {
    for (const station of ROUTE_STATIONS) {
      expect(station.label.trim().length, `${station.id} needs a label`).toBeGreaterThan(0);
    }
  });

  it("numbers only the stations the product already numbers", () => {
    // The four cases carry the acquisition frame's own indices; the four lower
    // sections carry the IA's. The hero, route two's three framework scenes and
    // the finale are not counted -- the same rule the world's station index
    // already applies.
    const indices = Object.fromEntries(
      ROUTE_STATIONS.map((station) => [station.id, station.index]),
    );
    expect(indices["software-factory"]).toBe("01");
    expect(indices["kivilcim"]).toBe("02");
    expect(indices["jointledger"]).toBe("03");
    expect(indices["dropspot"]).toBe("04");
    expect(indices["selected-systems"]).toBe(sectionIndex.selectedSystems);
    expect(indices["how-i-build"]).toBe(sectionIndex.howIBuild);
    expect(indices["field-notes"]).toBe(sectionIndex.fieldNotes);
    expect(indices["about"]).toBe(sectionIndex.about);
    for (const id of ["hero", "tail", "reorient", "approach", "handoff", "finale"]) {
      expect(indices[id], `${id} must not be numbered`).toBeUndefined();
    }
  });

  it("puts the lower world after the whole camera route", () => {
    // The reader meets every scene before any section: a NEXT from the last
    // scene must land in the lower world, never back in the tour.
    const lastScene = Math.max(
      ...ROUTE_STATIONS.map((station, index) => (station.kind === "scene" ? index : -1)),
    );
    const firstSection = ROUTE_STATIONS.findIndex((station) => station.kind === "section");
    expect(firstSection).toBe(lastScene + 1);
    expect(ROUTE_STATIONS[ROUTE_STATIONS.length - 1]!.kind).toBe("finale");
  });
});

describe("stepping through the route", () => {
  it("moves one station at a time in both directions", () => {
    expect(stepStation("tail", 1)?.id).toBe("reorient");
    expect(stepStation("tail", -1)?.id).toBe("dropspot");
    expect(stepStation("handoff", 1)?.id).toBe("selected-systems");
    expect(stepStation("selected-systems", -1)?.id).toBe("handoff");
  });

  it("stops at both ends rather than wrapping", () => {
    const first = ROUTE_STATIONS[0]!;
    const last = ROUTE_STATIONS[ROUTE_STATIONS.length - 1]!;
    expect(stepStation(first.id, -1)).toBeNull();
    expect(stepStation(last.id, 1)).toBeNull();
  });

  it("reports an unknown station rather than guessing at one", () => {
    expect(stationIndex("nope")).toBe(-1);
    expect(stepStation("nope", 1)).toBeNull();
  });
});

describe("the active station follows the document, not the controls", () => {
  const targets = [0, 1000, 2000, 3000];

  it("is the last station the reader has reached", () => {
    expect(activeStationIndex(0, targets, 0)).toBe(0);
    expect(activeStationIndex(999, targets, 0)).toBe(0);
    expect(activeStationIndex(1000, targets, 0)).toBe(1);
    expect(activeStationIndex(2500, targets, 0)).toBe(2);
    expect(activeStationIndex(99999, targets, 0)).toBe(3);
  });

  it("names a station as it arrives, by the lead", () => {
    // With a 300px lead the third station becomes current 300px before its own
    // position, so the readout says what is coming into frame.
    expect(activeStationIndex(1700, targets, 300)).toBe(2);
    expect(activeStationIndex(1699, targets, 300)).toBe(1);
  });

  it("never runs off either end", () => {
    expect(activeStationIndex(-500, targets, 0)).toBe(0);
    expect(activeStationIndex(1e9, targets, 0)).toBe(targets.length - 1);
  });
});

describe("station labels", () => {
  it("uses the project's own real title for a case", () => {
    const kivilcim = ROUTE_STATIONS.find((station) => station.id === "kivilcim")!;
    expect(stationLabel(kivilcim, { kivilcim: "Kıvılcım" })).toBe("Kıvılcım");
  });

  it("falls back to the station's own name when a title is missing", () => {
    const dropspot = ROUTE_STATIONS.find((station) => station.id === "dropspot")!;
    expect(stationLabel(dropspot, {})).toBe(dropspot.label);
  });

  it("derives the world's state words from the approved hero line", () => {
    const tail = ROUTE_STATIONS.find((station) => station.id === "tail")!;
    const reorient = ROUTE_STATIONS.find((station) => station.id === "reorient")!;
    expect(tail.label).toBe("Systems");
    expect(reorient.label).toBe("Underneath");
  });
});
