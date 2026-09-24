import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ProjectFrontmatterSchema } from "@/lib/content/schemas";
import { checkUniqueOrder } from "@/lib/content/validate";
import {
  getCaseStudyNeighbours,
  getProjectBySlug,
  getPublishedProjects,
  isCaseStudyDestination,
} from "@/lib/content/work";

const FIXTURES = path.join(process.cwd(), "tests/fixtures/content");
const GOOD = path.join(FIXTURES, "work");
const CONTENT = path.join(process.cwd(), "content/work");

/**
 * D-027 — the global ordering contract and the navigation derived from it.
 *
 * These tests exist because two orderings of the same five projects
 * previously disagreed: `order` said one thing and a hand-authored
 * `nextSlug` chain said another. The contract is now that `order` is the
 * single global sequence and navigation is derived from it, so the failure
 * mode is structurally impossible rather than merely corrected.
 */
describe("global ordering contract (D-027)", () => {
  it("assigns every published project a unique order", () => {
    expect(checkUniqueOrder(getPublishedProjects())).toEqual([]);
  });

  it("fails the build when two published projects share an order", () => {
    const errors = checkUniqueOrder([
      { slug: "b", order: 1 },
      { slug: "a", order: 1 },
      { slug: "c", order: 2 },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0]?.rule).toContain("order 1 is used by more than one published project");
    // Both colliding slugs are named, alphabetically, so the message is
    // deterministic and actionable rather than naming an arbitrary winner.
    expect(errors[0]?.rule).toContain("a, b");
    expect(errors[0]?.slug).toBe("a");
  });

  it("reports every colliding order, not just the first", () => {
    const errors = checkUniqueOrder([
      { slug: "a", order: 1 },
      { slug: "b", order: 1 },
      { slug: "c", order: 5 },
      { slug: "d", order: 5 },
    ]);

    expect(errors.map((error) => error.rule.match(/order (\d+)/)?.[1])).toEqual(["1", "5"]);
  });

  it("fails the loader, not just the checker, when published orders collide", () => {
    // Integration cover for the wiring, not the predicate: proving
    // checkUniqueOrder returns errors is worthless if getPublishedProjects
    // never calls it. Two fixture entries deliberately share order 7.
    const DUPLICATE = path.join(process.cwd(), "tests/fixtures/content/work-duplicate-order");
    expect(() => getPublishedProjects(DUPLICATE)).toThrow(/order 7 is used by more than one/);
    expect(() => getPublishedProjects(DUPLICATE)).toThrow(/one, two/);
  });

  it("sorts published projects into the owner-declared global order", () => {
    // Owner decision 2026-09-02, consistent with D-021.
    expect(getPublishedProjects().map((project) => project.slug)).toEqual([
      "software-factory",
      "kivilcim",
      "jointledger",
      "dropspot",
      "professional-systems",
    ]);
  });

  it("orders globally rather than tier-first", () => {
    const orders = getPublishedProjects().map((project) => project.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
});

describe("case-study destinations", () => {
  it("counts full and short depth as destinations, and preview as not", () => {
    expect(isCaseStudyDestination(getProjectBySlug("kivilcim")!)).toBe(true);
    expect(isCaseStudyDestination(getProjectBySlug("dropspot")!)).toBe(true);
    // The flagship is still preview depth, so it is deliberately not a
    // destination yet — recorded in docs/CONTENT_GAPS.md. It joins the
    // sequence automatically when its depth rises, with no code change.
    expect(isCaseStudyDestination(getProjectBySlug("software-factory")!)).toBe(false);
    expect(isCaseStudyDestination(getProjectBySlug("professional-systems")!)).toBe(false);
  });
});

describe("derived case-study navigation", () => {
  // Each getCaseStudyNeighbours call re-runs the publication gates, measured
  // at ~1.2s (checkLayerMeaning compares every layer body pairwise). The two
  // budgets below are raised for that real cost. No assertion is relaxed.
  it("derives both directions from one sequence, with open boundaries", { timeout: 30000 }, () => {
    const kivilcim = getCaseStudyNeighbours("kivilcim");
    expect(kivilcim.previous).toBeUndefined();
    expect(kivilcim.next?.slug).toBe("jointledger");

    const jointledger = getCaseStudyNeighbours("jointledger");
    expect(jointledger.previous?.slug).toBe("kivilcim");
    expect(jointledger.next?.slug).toBe("dropspot");

    const dropspot = getCaseStudyNeighbours("dropspot");
    expect(dropspot.previous?.slug).toBe("jointledger");
    expect(dropspot.next).toBeUndefined();
  });

  it("never wraps around from the last destination to the first", () => {
    const last = getCaseStudyNeighbours("dropspot");
    expect(last.next).toBeUndefined();
  });

  it("gives no neighbours to a project that is not a destination", () => {
    // A preview index has no position in the case-study sequence, so
    // offering it one would invent a relationship that does not exist.
    expect(getCaseStudyNeighbours("professional-systems")).toEqual({
      previous: undefined,
      next: undefined,
    });
    expect(getCaseStudyNeighbours("software-factory")).toEqual({
      previous: undefined,
      next: undefined,
    });
  });

  it("gives no neighbours to an unknown slug", () => {
    expect(getCaseStudyNeighbours("does-not-exist")).toEqual({
      previous: undefined,
      next: undefined,
    });
  });

  it("is mutually consistent: every next's previous points back", { timeout: 30000 }, () => {
    for (const project of getPublishedProjects().filter(isCaseStudyDestination)) {
      const { next } = getCaseStudyNeighbours(project.slug);
      if (!next) continue;
      expect(getCaseStudyNeighbours(next.slug).previous?.slug).toBe(project.slug);
    }
  });

  it("holds the same contract on the fixture set", () => {
    // delta-full is the only full/short entry there, so it is a lone
    // destination with no neighbours in either direction.
    expect(getCaseStudyNeighbours("delta-full", GOOD)).toEqual({
      previous: undefined,
      next: undefined,
    });
  });
});

describe("nextSlug is gone and cannot return", () => {
  it("is absent from every project and fixture entry", () => {
    const dirs = [CONTENT, GOOD].flatMap((root) =>
      fs
        .readdirSync(root, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(root, entry.name, "index.mdx")),
    );

    expect(dirs.length).toBeGreaterThan(0);
    for (const file of dirs) {
      expect(fs.readFileSync(file, "utf8")).not.toMatch(/^nextSlug:/m);
    }
  });

  it("is not carried through the schema even if a file reintroduced it", () => {
    // Zod strips unknown keys rather than rejecting them, so a stale
    // `nextSlug` would parse silently. It cannot reach the rendered page —
    // this pins that behaviour so the guard above stays the real defence.
    const source = getProjectBySlug("kivilcim")!;
    const parsed = ProjectFrontmatterSchema.parse({ ...source, nextSlug: "dropspot" });
    expect(parsed).not.toHaveProperty("nextSlug");
  });
});
