import { describe, expect, it } from "vitest";
import type { ProjectFrontmatter } from "@/lib/content/schemas";
import {
  LAYER_MAX_SIMILARITY,
  LAYER_MIN_LENGTH,
  checkLayerMeaning,
  checkRequiredSectionHeadings,
  containsContentRequiredMarker,
  extractH2Headings,
  formatGateError,
  similarity,
  stripMarkup,
  validatePublicationGates,
} from "@/lib/content/validate";

const SURFACE_TEXT =
  "Surface work here means the visible interface: grid layout, responsive breakpoints across four widths, a small type scale reused everywhere, and keyboard-reachable controls. Every interactive element carries a visible focus ring and a minimum touch target of forty-four pixels. Color pairs were checked against contrast ratios before shipping. Card compositions favor asymmetric placement over centered, equal-width grids, echoing the project's editorial visual language.";
const FLOW_TEXT =
  "A visitor arrives, browses without an account, and only registers at checkout. Empty states explain what will appear once data exists rather than showing a blank screen. Every form validates inline, field by field, instead of failing silently on submit. When a network request stalls, a timeout message offers a retry action. Successful actions confirm themselves visibly so a user is never left wondering whether something actually happened.";
const SYSTEM_TEXT =
  "Requests hit a small API layer backed by a relational database with row-level locking around anything involving limited stock. Background jobs run outside the request cycle so page responses stay fast. Deployment happens through a container image built on every merge to the main branch, with environment configuration injected at runtime rather than baked into the image. Nothing here talks directly to a browser; all browser communication goes through the API layer.";

const FULL_BODY_WITH_HEADINGS = [
  "## One-minute summary",
  "Fixture one-minute summary.",
  "",
  "## Why it exists",
  "Fixture why-it-exists narrative.",
  "",
  "## Constraints",
  "Fixture constraints narrative.",
  "",
  "## Evolution",
  "Fixture evolution narrative.",
  "",
  "## Reflection",
  "Fixture reflection narrative.",
].join("\n");

const SHORT_BODY_WITH_HEADINGS = [
  "## One-minute summary",
  "Fixture one-minute summary.",
  "",
  "## Why it exists",
  "Fixture why-it-exists narrative.",
  "",
  "## Reflection",
  "Fixture reflection narrative.",
].join("\n");

function baseProject(overrides: Partial<ProjectFrontmatter> = {}): ProjectFrontmatter {
  return {
    slug: "example",
    title: "Example",
    categoryLabel: "EXAMPLE",
    description: "An example project.",
    tier: "featured",
    depth: "preview",
    order: 1,
    provenance: "personal",
    aiAssisted: false,
    contribution: "I built this.",
    verificationStatus: "partial",
    status: "published",
    phase: "active-development",
    factsCheckedAgainstRepo: false,
    tech: [],
    links: [],
    images: [],
    ...overrides,
  } as ProjectFrontmatter;
}

describe("containsContentRequiredMarker", () => {
  it("detects the marker", () => {
    expect(containsContentRequiredMarker("plain text [CONTENT REQUIRED: x] more text")).toBe(true);
  });

  it("returns false for text without the marker", () => {
    expect(containsContentRequiredMarker("nothing pending here")).toBe(false);
  });
});

describe("formatGateError", () => {
  it("identifies the project, file, and rule", () => {
    expect(formatGateError({ slug: "kivilcim", file: "index.mdx", rule: "some rule" })).toBe(
      "kivilcim (index.mdx): some rule",
    );
  });
});

describe("stripMarkup", () => {
  it("removes headings, bold, italics, inline code, and links", () => {
    expect(stripMarkup("## Heading\n**bold** *italic* `code` [text](https://example.com)")).toBe(
      "Heading bold italic code text",
    );
  });
});

describe("similarity", () => {
  it("returns 1 for identical strings", () => {
    expect(similarity("same text", "same text")).toBe(1);
  });

  it("returns a low value for genuinely different prose", () => {
    expect(similarity(SURFACE_TEXT, SYSTEM_TEXT)).toBeLessThan(LAYER_MAX_SIMILARITY);
  });

  it("returns a high value for near-duplicate prose", () => {
    const nearDuplicate = SURFACE_TEXT.replace("controls", "buttons");
    expect(similarity(SURFACE_TEXT, nearDuplicate)).toBeGreaterThan(LAYER_MAX_SIMILARITY);
  });
});

describe("checkLayerMeaning", () => {
  it("passes for three sufficiently long, distinct layer bodies", () => {
    const errors = checkLayerMeaning("example", {
      surface: SURFACE_TEXT,
      flow: FLOW_TEXT,
      system: SYSTEM_TEXT,
    });
    expect(errors).toEqual([]);
  });

  it("fails when a layer body is shorter than the minimum length", () => {
    const errors = checkLayerMeaning("example", {
      surface: "Too short.",
      flow: FLOW_TEXT,
      system: SYSTEM_TEXT,
    });
    expect(errors.some((e) => e.file === "surface.mdx")).toBe(true);
    expect(stripMarkup("Too short.").length).toBeLessThan(LAYER_MIN_LENGTH);
  });

  it("fails when two layer bodies are near-duplicates", () => {
    const nearDuplicateFlow = SURFACE_TEXT.replace("controls", "buttons");
    const errors = checkLayerMeaning("example", {
      surface: SURFACE_TEXT,
      flow: nearDuplicateFlow,
      system: SYSTEM_TEXT,
    });
    expect(errors.some((e) => e.file.includes("surface.mdx") && e.file.includes("flow.mdx"))).toBe(
      true,
    );
  });
});

describe("extractH2Headings", () => {
  it("extracts h2 headings only, not h1 or h3", () => {
    expect(extractH2Headings("# H1\n## One-minute summary\n### H3\n## Reflection")).toEqual([
      "One-minute summary",
      "Reflection",
    ]);
  });

  it("returns an empty array when there are no h2 headings", () => {
    expect(extractH2Headings("Plain paragraph text with no headings.")).toEqual([]);
  });
});

describe("checkRequiredSectionHeadings", () => {
  it("requires nothing for depth 'preview' (description field only, per CONTENT_MODEL §3)", () => {
    expect(checkRequiredSectionHeadings("example", "preview", "")).toEqual([]);
  });

  it("requires nothing for depth 'none'", () => {
    expect(checkRequiredSectionHeadings("example", "none", "")).toEqual([]);
  });

  it("passes depth 'full' when all five required headings are present", () => {
    expect(checkRequiredSectionHeadings("example", "full", FULL_BODY_WITH_HEADINGS)).toEqual([]);
  });

  it("fails depth 'full' when a required heading (Constraints) is missing", () => {
    const bodyMissingConstraints = FULL_BODY_WITH_HEADINGS.replace(
      "## Constraints\nFixture constraints narrative.\n\n",
      "",
    );
    const errors = checkRequiredSectionHeadings("example", "full", bodyMissingConstraints);
    expect(errors.some((e) => e.rule.includes('"Constraints"'))).toBe(true);
  });

  it("passes depth 'short' when its three required headings are present", () => {
    expect(checkRequiredSectionHeadings("example", "short", SHORT_BODY_WITH_HEADINGS)).toEqual([]);
  });

  it("fails depth 'short' when Reflection is missing", () => {
    const bodyMissingReflection = SHORT_BODY_WITH_HEADINGS.replace(
      "\n\n## Reflection\nFixture reflection narrative.",
      "",
    );
    const errors = checkRequiredSectionHeadings("example", "short", bodyMissingReflection);
    expect(errors.some((e) => e.rule.includes('"Reflection"'))).toBe(true);
  });

  it("does not require Surface/Flow/System or Decisions headings (sourced elsewhere per CONTENT_MODEL §3)", () => {
    // FULL_BODY_WITH_HEADINGS deliberately has no "## Surface"/"## Decisions"
    // headings — those come from layer files and frontmatter, not index.mdx.
    expect(checkRequiredSectionHeadings("example", "full", FULL_BODY_WITH_HEADINGS)).toEqual([]);
  });
});

describe("validatePublicationGates", () => {
  it("fails a published project whose body contains a [CONTENT REQUIRED marker", () => {
    const errors = validatePublicationGates({
      project: baseProject(),
      indexBody: "Some text with [CONTENT REQUIRED: x] inside it.",
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.rule).toContain("CONTENT REQUIRED");
  });

  it("fails a published project whose frontmatter contains a [CONTENT REQUIRED marker", () => {
    const errors = validatePublicationGates({
      project: baseProject({
        provenance: "fork",
        upstream: { name: "X", url: "[CONTENT REQUIRED: url]", relationship: "forked" },
      }),
      indexBody: "Clean body text.",
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("passes a published preview project with no marker", () => {
    const errors = validatePublicationGates({
      project: baseProject(),
      indexBody: "Clean body text with no markers.",
    });
    expect(errors).toEqual([]);
  });

  it("always fails when verificationStatus is 'do-not-publish', regardless of other fields", () => {
    const errors = validatePublicationGates({
      project: baseProject({ verificationStatus: "do-not-publish" }),
      indexBody: "Clean body text.",
    });
    expect(errors.some((e) => e.rule.includes("do-not-publish"))).toBe(true);
  });

  it("fails depth 'full' when verificationStatus is not 'verified'", () => {
    const errors = validatePublicationGates({
      project: baseProject({
        depth: "full",
        verificationStatus: "partial",
        factsCheckedAgainstRepo: true,
      }),
      indexBody: FULL_BODY_WITH_HEADINGS,
      layerBodies: { surface: SURFACE_TEXT, flow: FLOW_TEXT, system: SYSTEM_TEXT },
    });
    expect(errors.some((e) => e.rule.includes("verified"))).toBe(true);
  });

  it("fails depth 'full' when factsCheckedAgainstRepo is false", () => {
    const errors = validatePublicationGates({
      project: baseProject({
        depth: "full",
        verificationStatus: "verified",
        factsCheckedAgainstRepo: false,
      }),
      indexBody: FULL_BODY_WITH_HEADINGS,
      layerBodies: { surface: SURFACE_TEXT, flow: FLOW_TEXT, system: SYSTEM_TEXT },
    });
    expect(errors.some((e) => e.rule.includes("factsCheckedAgainstRepo"))).toBe(true);
  });

  it("fails depth 'full' or 'short' when layer bodies are missing entirely", () => {
    const errors = validatePublicationGates({
      project: baseProject({
        depth: "full",
        verificationStatus: "verified",
        factsCheckedAgainstRepo: true,
      }),
      indexBody: FULL_BODY_WITH_HEADINGS,
    });
    expect(errors.some((e) => e.rule.includes("all three layer files"))).toBe(true);
  });

  it("fails depth 'full' when a required section heading is missing from index.mdx", () => {
    const errors = validatePublicationGates({
      project: baseProject({
        depth: "full",
        verificationStatus: "verified",
        factsCheckedAgainstRepo: true,
      }),
      indexBody: "Clean body text with no section headings at all.",
      layerBodies: { surface: SURFACE_TEXT, flow: FLOW_TEXT, system: SYSTEM_TEXT },
    });
    expect(errors.some((e) => e.rule.includes("required section heading"))).toBe(true);
  });

  it("passes depth 'full' with verified status, audited facts, complete headings, and valid distinct layers", () => {
    const errors = validatePublicationGates({
      project: baseProject({
        depth: "full",
        verificationStatus: "verified",
        factsCheckedAgainstRepo: true,
      }),
      indexBody: FULL_BODY_WITH_HEADINGS,
      layerBodies: { surface: SURFACE_TEXT, flow: FLOW_TEXT, system: SYSTEM_TEXT },
    });
    expect(errors).toEqual([]);
  });

  it("does not require section headings for a published preview-depth project", () => {
    const errors = validatePublicationGates({
      project: baseProject(),
      indexBody: "A short preview body with no narrative sections at all.",
    });
    expect(errors).toEqual([]);
  });
});
