import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DRIFT_SECTIONS,
  DRIFT_SETTLE,
  driftLeadRule,
  driftSection,
  driftSpread,
  type DriftSectionId,
} from "@/lib/spatial/editorialDrift";

// Spatial Portfolio V5 (feature/spatial-portfolio-v5, not merged to main).
//
// Editorial Drift exists because the owner rejected the lower homepage dropping
// into ordinary straight-down scrolling the moment the spatial route ends. The
// binding constraints on it are unusual, so they are what is tested:
//
//   1. It is DETERMINISTIC. "Unpredictable" was specified to mean visually
//      non-obvious, NOT nondeterministic. Nothing may vary per visit, which is
//      what keeps history, screenshots and E2E runs stable.
//   2. It never changes SEMANTIC ORDER. The drift is a horizontal composition
//      device; the document order of the four sections is untouched.
//   3. It cannot overflow at any viewport width -- guaranteed by expressing
//      position as a fraction of free space rather than as a vw distance.
//
// The proof that a BROWSER actually interpolates the resulting calc() values
// belongs in the E2E suite, not here: these are the pure-geometry contracts.

const ROOT = process.cwd();

/** Source with comments removed, so a rule mentioned in prose is not mistaken
 *  for a rule broken in code. */
function codeOf(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

describe("the drift table is a fixed, deterministic composition", () => {
  it("exposes the four lower-homepage sections", () => {
    expect(DRIFT_SECTIONS).toHaveLength(4);
    expect(DRIFT_SECTIONS.map((section) => section.id)).toEqual([
      "real-life",
      "how-i-build",
      "field-notes",
      "about",
    ]);
  });

  it("returns identical values on every call", () => {
    const once = DRIFT_SECTIONS.map((section) => driftSection(section.id));
    const twice = DRIFT_SECTIONS.map((section) => driftSection(section.id));
    expect(once).toEqual(twice);
    expect(DRIFT_SETTLE).toBe(DRIFT_SETTLE);
  });

  it("uses no runtime nondeterminism anywhere in the spatial layer", () => {
    // The route, the drift and the erosion debris must all be reproducible.
    // ErosionWord deliberately uses a seeded sin-based hash instead, so the
    // scan is for the forbidden source of randomness specifically.
    const sources = [
      "lib/spatial/editorialDrift.ts",
      "lib/spatial/sceneRoute.ts",
      "lib/spatial/cameraFilter.ts",
      "lib/spatial/systemPov.ts",
      "lib/spatial/scenes.ts",
      "components/spatial/EditorialDrift.tsx",
      "components/spatial/ErosionWord.tsx",
      "components/spatial/DirectionalField.tsx",
      "components/spatial/SystemPOV.tsx",
    ];
    for (const source of sources) {
      const code = codeOf(source);
      expect(code, `${source} must not use Math.random()`).not.toMatch(/Math\s*\.\s*random/);
      expect(code, `${source} must not vary by wall-clock time`).not.toMatch(
        /Date\s*\.\s*now|new\s+Date\s*\(/,
      );
    }
  });

  it("rejects an unknown section rather than inventing a position", () => {
    expect(() => driftSection("nope" as DriftSectionId)).toThrow(/unknown drift section/);
  });
});

describe("drift geometry cannot overflow at any viewport width", () => {
  it("keeps every entry and exit inside the free-space fraction [0,1]", () => {
    // x = pad + f x (100vw - 2·pad - blockWidth). For any f in [0,1] the block
    // is inside the track BY CONSTRUCTION, at every width -- which is the whole
    // reason position is a fraction rather than a vw distance.
    for (const section of DRIFT_SECTIONS) {
      expect(section.entry).toBeGreaterThanOrEqual(0);
      expect(section.entry).toBeLessThanOrEqual(1);
      expect(section.exit).toBeGreaterThanOrEqual(0);
      expect(section.exit).toBeLessThanOrEqual(1);
    }
    expect(DRIFT_SETTLE).toBeGreaterThanOrEqual(0);
    expect(DRIFT_SETTLE).toBeLessThanOrEqual(1);
  });

  it("keeps the midpoint each block rests at under reduced motion in range too", () => {
    // Reduced motion parks the block at its mid position, which must be as
    // safe as the endpoints (§37 keeps the composition, drops the movement).
    for (const section of DRIFT_SECTIONS) {
      const mid = (section.entry + section.exit) / 2;
      expect(mid).toBeGreaterThanOrEqual(0);
      expect(mid).toBeLessThanOrEqual(1);
    }
  });
});

describe("every section genuinely drifts, and not all the same way", () => {
  it("moves each block by a usable amount", () => {
    for (const section of DRIFT_SECTIONS) {
      const travel = Math.abs(section.exit - section.entry);
      expect(travel, `${section.id} must actually travel`).toBeGreaterThan(0.05);
    }
  });

  it("travels in both directions across the four sections", () => {
    // A single shared direction would read as the whole page leaning, which is
    // the "just translate the old sections sideways" failure this replaces.
    const directions = DRIFT_SECTIONS.map((section) => Math.sign(section.exit - section.entry));
    expect(directions).toContain(1);
    expect(directions).toContain(-1);
  });

  it("varies amplitude rather than repeating one motion", () => {
    const travels = DRIFT_SECTIONS.map((section) =>
      Number(Math.abs(section.exit - section.entry).toFixed(4)),
    );
    expect(new Set(travels).size).toBeGreaterThan(1);
  });

  it("stays restrained — this is drift, not a second spatial tour", () => {
    // The owner's constraint: continue the world's physics, but lower
    // amplitude and readable. A spread near 1 would mean blocks slamming
    // between the track's hard edges.
    expect(driftSpread()).toBeGreaterThan(0.2);
    expect(driftSpread()).toBeLessThan(0.85);
  });

  it("never starts a section exactly where the previous one ended", () => {
    // Consecutive blocks sharing a position would read as a straight column
    // again for that stretch.
    for (let i = 1; i < DRIFT_SECTIONS.length; i += 1) {
      expect(DRIFT_SECTIONS[i]!.entry).not.toBeCloseTo(DRIFT_SECTIONS[i - 1]!.exit, 3);
    }
  });
});

describe("the lead rule states the block's own direction of travel", () => {
  it("tilts with the sign of the section's travel", () => {
    for (const section of DRIFT_SECTIONS) {
      const rule = driftLeadRule(section.id);
      expect(Math.sign(rule.height)).toBe(Math.sign(section.exit - section.entry));
    }
  });

  it("scales with how far the block travels", () => {
    const byTravel = [...DRIFT_SECTIONS].sort(
      (a, b) => Math.abs(a.exit - a.entry) - Math.abs(b.exit - b.entry),
    );
    const smallest = Math.abs(driftLeadRule(byTravel[0]!.id).height);
    const largest = Math.abs(driftLeadRule(byTravel[byTravel.length - 1]!.id).height);
    expect(largest).toBeGreaterThan(smallest);
  });

  it("respects a caller-supplied width without changing the tilt", () => {
    expect(driftLeadRule("about", 20).width).toBe(20);
    expect(driftLeadRule("about", 20).height).toBeCloseTo(driftLeadRule("about").height, 12);
  });
});

describe("the track settles before handing off to the footer CTA", () => {
  it("comes to rest at the centre of the track", () => {
    expect(DRIFT_SETTLE).toBeCloseTo(0.5, 12);
  });

  it("settles somewhere the last section is not already sitting", () => {
    // "Recenters and settles" has to be a visible move, or the world simply
    // runs out instead of stopping on a deliberate mark.
    const last = DRIFT_SECTIONS[DRIFT_SECTIONS.length - 1]!;
    expect(Math.abs(DRIFT_SETTLE - last.exit)).toBeGreaterThan(0.02);
  });
});

describe("semantic document order is untouched by the drift", () => {
  it("matches the order the homepage actually renders", () => {
    // The drift must never be able to reorder the page. This reads the real
    // homepage rather than restating the expected order, so a future edit to
    // either side cannot silently drift out of agreement with the other.
    const page = readFileSync(join(ROOT, "app/page.tsx"), "utf8");
    const rendered = [...page.matchAll(/<DriftBlock\s+id="([a-z-]+)"/g)].map((match) => match[1]);
    expect(rendered).toEqual(DRIFT_SECTIONS.map((section) => section.id));
  });

  it("gives every rendered block a real entry in the table", () => {
    const page = readFileSync(join(ROOT, "app/page.tsx"), "utf8");
    for (const [, id] of page.matchAll(/<DriftBlock\s+id="([a-z-]+)"/g)) {
      expect(() => driftSection(id as DriftSectionId)).not.toThrow();
    }
  });
});
