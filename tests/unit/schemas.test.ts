import { describe, expect, it } from "vitest";
import {
  ExperimentSchema,
  NoteSchema,
  ProjectFrontmatterSchema,
  SocialLinkSchema,
} from "@/lib/content/schemas";

function validProject(overrides: Record<string, unknown> = {}) {
  return {
    slug: "example",
    title: "Example",
    categoryLabel: "EXAMPLE CATEGORY",
    description: "A valid example project for schema tests.",
    tier: "featured",
    depth: "preview",
    order: 1,
    provenance: "personal",
    aiAssisted: false,
    contribution: "I built this example project.",
    verificationStatus: "partial",
    status: "published",
    phase: "active-development",
    factsCheckedAgainstRepo: false,
    tech: ["React"],
    links: [],
    images: [],
    ...overrides,
  };
}

describe("ProjectFrontmatterSchema", () => {
  it("parses a fully valid project", () => {
    const result = ProjectFrontmatterSchema.safeParse(validProject());
    expect(result.success).toBe(true);
  });

  it("rejects an invalid tier enum value", () => {
    const result = ProjectFrontmatterSchema.safeParse(validProject({ tier: "not-a-real-tier" }));
    expect(result.success).toBe(false);
  });

  it("rejects an invalid status enum value", () => {
    const result = ProjectFrontmatterSchema.safeParse(validProject({ status: "in-review" }));
    expect(result.success).toBe(false);
  });

  it("rejects an invalid verificationStatus enum value", () => {
    const result = ProjectFrontmatterSchema.safeParse(
      validProject({ verificationStatus: "mostly-true" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a project missing a required field", () => {
    const withoutSlug: Record<string, unknown> = validProject();
    delete withoutSlug.slug;
    const result = ProjectFrontmatterSchema.safeParse(withoutSlug);
    expect(result.success).toBe(false);
  });

  it("requires contribution when tier is 'featured'", () => {
    const withoutContribution: Record<string, unknown> = validProject();
    delete withoutContribution.contribution;
    const result = ProjectFrontmatterSchema.safeParse(withoutContribution);
    expect(result.success).toBe(false);
  });

  it("allows a missing contribution when tier is not 'featured'", () => {
    const withoutContribution: Record<string, unknown> = validProject({ tier: "archive" });
    delete withoutContribution.contribution;
    const result = ProjectFrontmatterSchema.safeParse(withoutContribution);
    expect(result.success).toBe(true);
  });

  it("requires layers when depth is 'full'", () => {
    const result = ProjectFrontmatterSchema.safeParse(validProject({ depth: "full" }));
    expect(result.success).toBe(false);
  });

  it("requires layers when depth is 'short'", () => {
    const result = ProjectFrontmatterSchema.safeParse(validProject({ depth: "short" }));
    expect(result.success).toBe(false);
  });

  it("requires at least 3 decisions when depth is 'full'", () => {
    const layers = {
      surface: { summary: "s" },
      flow: { summary: "f" },
      system: { summary: "y" },
    };
    const result = ProjectFrontmatterSchema.safeParse(
      validProject({
        depth: "full",
        layers,
        decisions: [
          {
            id: "d1",
            title: "t",
            context: "c",
            choice: "ch",
            alternatives: [],
            tradeoff: "tr",
          },
        ],
      }),
    );
    expect(result.success).toBe(false);
  });

  it("requires upstream when provenance is 'fork'", () => {
    const result = ProjectFrontmatterSchema.safeParse(validProject({ provenance: "fork" }));
    expect(result.success).toBe(false);
  });

  it("accepts provenance 'fork' with upstream present", () => {
    const result = ProjectFrontmatterSchema.safeParse(
      validProject({
        provenance: "fork",
        upstream: { name: "Upstream", url: "https://example.com", relationship: "forked" },
      }),
    );
    expect(result.success).toBe(true);
  });

  it("requires aiDisclosure when aiAssisted is true", () => {
    const result = ProjectFrontmatterSchema.safeParse(validProject({ aiAssisted: true }));
    expect(result.success).toBe(false);
  });

  it("accepts aiAssisted true with aiDisclosure present", () => {
    const result = ProjectFrontmatterSchema.safeParse(
      validProject({
        aiAssisted: true,
        aiDisclosure: "Drafted with AI assistance, reviewed by hand.",
      }),
    );
    expect(result.success).toBe(true);
  });

  it("allows aiAssisted to be omitted (D-018: optional, no unsupported default)", () => {
    const withoutAiAssisted: Record<string, unknown> = validProject();
    delete withoutAiAssisted.aiAssisted;
    const result = ProjectFrontmatterSchema.safeParse(withoutAiAssisted);
    expect(result.success).toBe(true);
  });

  it("allows phase to be omitted (D-018: optional, no unsupported default)", () => {
    const withoutPhase: Record<string, unknown> = validProject();
    delete withoutPhase.phase;
    const result = ProjectFrontmatterSchema.safeParse(withoutPhase);
    expect(result.success).toBe(true);
  });

  it("still rejects an invalid phase enum value when phase is present", () => {
    const result = ProjectFrontmatterSchema.safeParse(validProject({ phase: "on-hold" }));
    expect(result.success).toBe(false);
  });
});

describe("NoteSchema", () => {
  it("parses a valid note", () => {
    const result = NoteSchema.safeParse({
      title: "An article",
      url: "https://hakanduyar.medium.com/an-article",
      source: "medium",
      category: "Engineering",
      description: "A summary of the article.",
      language: "en",
      verified: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a note with an invalid language enum value", () => {
    const result = NoteSchema.safeParse({
      title: "An article",
      url: "https://hakanduyar.medium.com/an-article",
      source: "medium",
      category: "Engineering",
      description: "A summary of the article.",
      language: "de",
      verified: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("SocialLinkSchema", () => {
  it("parses a valid social link", () => {
    const result = SocialLinkSchema.safeParse({
      label: "GitHub",
      url: "https://github.com/hakanduyar",
      verified: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects verified: false (only literal true is allowed)", () => {
    const result = SocialLinkSchema.safeParse({
      label: "GitHub",
      url: "https://github.com/hakanduyar",
      verified: false,
    });
    expect(result.success).toBe(false);
  });
});

describe("ExperimentSchema", () => {
  it("parses a valid experiment", () => {
    const result = ExperimentSchema.safeParse({
      slug: "example",
      title: "Example",
      description: "An example experiment.",
      status: "idea",
      verified: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid status enum value", () => {
    const result = ExperimentSchema.safeParse({
      slug: "example",
      title: "Example",
      description: "An example experiment.",
      status: "shipped",
      verified: false,
    });
    expect(result.success).toBe(false);
  });
});
