import { describe, expect, it } from "vitest";
import type { ProjectFrontmatter } from "@/lib/content/schemas";
import { BREAK_COVER_START, BREAK_CUT, BREAK_REVEAL_END } from "@/lib/spatial/sceneRoute";
import {
  isResolvedState,
  representativeAsset,
  sceneState,
  systemAnnotation,
  worldState,
} from "@/lib/spatial/systemPov";

// Spatial Portfolio V5 (feature/spatial-portfolio-v5, not merged to main).
//
// The System POV layer is the one place in the whole portfolio where a
// "surveillance intelligence" reading could turn into fabricated content, so
// the honesty rules are tested as hard contracts rather than trusted to review:
//
//   - every displayed value is read off the project's own validated frontmatter
//   - a field that does not exist produces NO ROW (never a guess, never "n/a",
//     never an invented confidence score, coordinate, status or timestamp)
//   - there is no slug -> fact table anywhere; identity cannot conjure data
//
// CLAUDE.md §11 forbids fabricated project facts outright, and D-018 is the
// reason `phase` is optional in the first place. These tests are what keeps a
// future "the panel looks empty, let's fill it" change honest.

function project(overrides: Partial<ProjectFrontmatter> = {}): ProjectFrontmatter {
  return {
    slug: "example",
    title: "Example",
    categoryLabel: "Example systems",
    description: "An example project used only as a test fixture.",
    tier: "featured",
    depth: "preview",
    order: 1,
    provenance: "personal",
    verificationStatus: "verified",
    status: "published",
    factsCheckedAgainstRepo: true,
    tech: ["TypeScript"],
    links: [],
    images: [],
    ...overrides,
  } as ProjectFrontmatter;
}

const realScreenshot = {
  src: "/images/projects/example/shot.webp",
  alt: "A real screenshot",
  assetType: "real-screenshot",
  layer: "flow",
} as const;

const systemDiagram = {
  src: "/images/projects/example/system.svg",
  alt: "A verified system diagram",
  assetType: "verified-diagram",
  layer: "system",
} as const;

const surfaceIllustration = {
  src: "/images/projects/example/surface.svg",
  alt: "A provisional illustration",
  assetType: "provisional-illustration",
  layer: "surface",
} as const;

describe("representativeAsset picks the lead evidence from real metadata", () => {
  it("prefers a real screenshot over anything else", () => {
    const asset = representativeAsset(
      project({ images: [surfaceIllustration, systemDiagram, realScreenshot] }),
    );
    expect(asset).toBe(realScreenshot);
  });

  it("falls back to the system-layer asset when there is no photograph", () => {
    const asset = representativeAsset(project({ images: [surfaceIllustration, systemDiagram] }));
    expect(asset).toBe(systemDiagram);
  });

  it("falls back to whatever is registered first", () => {
    const asset = representativeAsset(project({ images: [surfaceIllustration] }));
    expect(asset).toBe(surfaceIllustration);
  });

  it("returns nothing rather than inventing an asset", () => {
    expect(representativeAsset(project({ images: [] }))).toBeUndefined();
  });

  it("chooses by registered metadata, never by filename or slug", () => {
    // Same assets, different slug and different filenames: the choice must not
    // move. A slug -> asset table is exactly the shortcut this forbids.
    const a = representativeAsset(
      project({ slug: "kivilcim", images: [surfaceIllustration, systemDiagram] }),
    );
    const b = representativeAsset(
      project({
        slug: "totally-different",
        images: [
          { ...surfaceIllustration, src: "/images/x/a.svg" },
          { ...systemDiagram, src: "/images/x/b.svg" },
        ],
      }),
    );
    expect(a?.layer).toBe("system");
    expect(b?.layer).toBe("system");
  });
});

describe("systemAnnotation emits only facts the project actually carries", () => {
  it("states the lead evidence's layer and the project's real phase", () => {
    const annotation = systemAnnotation(
      project({ images: [systemDiagram], phase: "active-development" }),
      "01",
    );
    expect(annotation.index).toBe("01");
    expect(annotation.rows).toEqual([
      { label: "Layer", value: "System" },
      { label: "Phase", value: "Active development" },
    ]);
  });

  it("omits Phase entirely when no approved value exists (D-018)", () => {
    // The failure this prevents: filling the gap with "Unknown", "—", or a
    // guessed lifecycle state. Absent must mean absent.
    const annotation = systemAnnotation(project({ images: [systemDiagram] }), "02");
    expect(annotation.rows.map((row) => row.label)).toEqual(["Layer"]);
    expect(JSON.stringify(annotation)).not.toMatch(/unknown|n\/a|tbd|pending/i);
  });

  it("omits Layer when the lead asset has no registered layer", () => {
    const annotation = systemAnnotation(
      project({ images: [{ ...realScreenshot, layer: undefined }] }),
      "03",
    );
    expect(annotation.rows.map((row) => row.label)).toEqual([]);
  });

  it("produces no rows at all for a project with no assets and no phase", () => {
    const annotation = systemAnnotation(project({ images: [] }), "04");
    expect(annotation.rows).toEqual([]);
    expect(annotation.index).toBe("04");
  });

  it("never exceeds the two-row budget", () => {
    // §11's budget: one identifier plus one small metadata cluster. The project
    // is the hero; a growing readout is how this becomes a dashboard.
    const annotation = systemAnnotation(
      project({
        images: [realScreenshot, systemDiagram, surfaceIllustration],
        phase: "usable",
      }),
      "05",
    );
    expect(annotation.rows.length).toBeLessThanOrEqual(2);
  });

  it("humanises for display without rewriting the stored enum", () => {
    const source = project({ images: [systemDiagram], phase: "active-development" });
    const annotation = systemAnnotation(source, "06");
    expect(annotation.rows).toContainEqual({ label: "Phase", value: "Active development" });
    expect(source.phase).toBe("active-development");
  });

  it("derives every emitted value from the input — nothing is authored here", () => {
    const source = project({ images: [systemDiagram], phase: "paused" });
    const annotation = systemAnnotation(source, "07");
    const permitted = new Set(["System", "Paused"]);
    for (const row of annotation.rows) {
      expect(permitted.has(row.value), `unexpected value ${row.value}`).toBe(true);
    }
  });

  it("emits no fabricated telemetry vocabulary", () => {
    const annotation = systemAnnotation(
      project({ images: [realScreenshot], phase: "archived" }),
      "08",
    );
    const rendered = JSON.stringify(annotation);
    for (const forbidden of [
      /\d+\s*%/,
      /confidence/i,
      /acquired/i,
      /granted/i,
      /recalculat/i,
      /scanning/i,
      /threat/i,
      /\blat\b|\blon\b/i,
    ]) {
      expect(rendered, `must not contain ${forbidden}`).not.toMatch(forbidden);
    }
  });

  it("is deterministic and identity-blind", () => {
    // Two projects differing ONLY in slug and title must annotate identically.
    const images = [systemDiagram];
    const a = systemAnnotation(project({ slug: "a", title: "A", images, phase: "usable" }), "09");
    const b = systemAnnotation(project({ slug: "b", title: "B", images, phase: "usable" }), "09");
    expect(a).toEqual(b);
  });
});

describe("the acquisition lifecycle maps cleanly onto approach", () => {
  it("names each phase of the approach", () => {
    expect(sceneState(-1)).toBe("idle");
    expect(sceneState(-0.4)).toBe("approaching");
    expect(sceneState(0)).toBe("focused");
    expect(sceneState(0.5)).toBe("departing");
  });

  it("moves through the phases in order and never skips backwards", () => {
    const order = ["idle", "approaching", "focused", "departing"];
    let highest = 0;
    for (let approach = -1; approach <= 1; approach += 0.01) {
      const index = order.indexOf(sceneState(approach));
      expect(index).toBeGreaterThanOrEqual(highest);
      highest = index;
    }
    expect(highest).toBe(3);
  });

  it("reaches every phase somewhere on the approach", () => {
    const seen = new Set<string>();
    for (let approach = -1; approach <= 1; approach += 0.005) seen.add(sceneState(approach));
    expect([...seen].sort()).toEqual(["approaching", "departing", "focused", "idle"]);
  });

  it("keeps the focused window centred on the anchor", () => {
    expect(sceneState(-0.16)).toBe("focused");
    expect(sceneState(0.16)).toBe("focused");
    expect(sceneState(-0.17)).toBe("approaching");
    expect(sceneState(0.17)).toBe("departing");
  });
});

describe("world state follows the real route constants", () => {
  // V6.4 RENAMED THIS STATE, `collision` -> `occluded`, and moved where it starts.
  //
  // It used to mean "the camera is being held at the wall", which was a real
  // window of progress (IMPACT_WINDOW) in which the world did not advance. There
  // is no such window now: the camera travels straight through to the cut. The
  // state that remains is the one this type was actually read for -- the surfaces
  // are closing over the world -- so it now begins where they begin to close.
  it("reports occluded while the surfaces are closing, before the cut", () => {
    expect(worldState(BREAK_COVER_START + 1e-6)).toBe("occluded");
    expect(worldState(BREAK_COVER_START - 1e-6)).toBe("travelling");
  });

  it("reports reorienting between the cut and the end of the reveal", () => {
    expect(worldState(BREAK_CUT)).toBe("reorienting");
    expect(worldState((BREAK_CUT + BREAK_REVEAL_END) / 2)).toBe("reorienting");
  });

  it("reports travelling before the occlusion and after the reveal", () => {
    expect(worldState(0.1)).toBe("travelling");
    expect(worldState(Math.min(BREAK_REVEAL_END + 0.01, 1))).toBe("travelling");
  });

  it("resolves the world's grammar exactly at the cut, and stays resolved", () => {
    expect(isResolvedState(BREAK_CUT - 1e-6)).toBe(false);
    expect(isResolvedState(BREAK_CUT)).toBe(true);
    expect(isResolvedState(1)).toBe(true);
  });

  it("never leaves a progress value without a state", () => {
    for (let p = 0; p <= 1; p += 0.002) {
      expect(["travelling", "occluded", "reorienting"]).toContain(worldState(p));
    }
  });
});
