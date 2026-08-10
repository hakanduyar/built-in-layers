import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CaseStudyHero } from "@/components/project/CaseStudyHero";
import { DecisionList } from "@/components/project/DecisionList";
import { LayerSection } from "@/components/project/LayerSection";
import { NextProject } from "@/components/project/NextProject";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectFrontmatterSchema } from "@/lib/content/schemas";
import {
  checkLayerMeaning,
  checkRequiredSectionHeadings,
  containsContentRequiredMarker,
  validatePublicationGates,
} from "@/lib/content/validate";
import { getProjectBySlug, getProjectIndexBody, getProjectLayers } from "@/lib/content/work";

// Real content, not a fixture — this is the JointLedger publication pass's
// entry itself. Published under D-019/CONTENT_MODEL §9: repository claims
// are verified against a direct read of both hakanduyar/jointledger (main
// and the unmerged feature/shared-family-book branch) and upstream
// mayswind/ezbookkeeping, not README text alone.
const CONTENT_DIR = path.join(process.cwd(), "content/work/jointledger");

function readRaw(file: string): string {
  return fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
}

describe("JointLedger real content — schema", () => {
  const { data, content } = matter(readRaw("index.mdx"));
  const parsed = ProjectFrontmatterSchema.safeParse(data);

  it("parses against the real schema", () => {
    expect(parsed.success).toBe(true);
  });

  it("is published and verified, depth short, ordered third per D-016 (order: 3)", () => {
    if (!parsed.success) return;
    expect(parsed.data.status).toBe("published");
    expect(parsed.data.verificationStatus).toBe("verified");
    expect(parsed.data.factsCheckedAgainstRepo).toBe(true);
    expect(parsed.data.tier).toBe("featured");
    expect(parsed.data.depth).toBe("short");
    expect(parsed.data.order).toBe(3);
  });

  it("provenance is 'fork' with a real, non-empty upstream disclosure", () => {
    if (!parsed.success) return;
    expect(parsed.data.provenance).toBe("fork");
    expect(parsed.data.upstream?.name).toBe("ezBookkeeping");
    expect(parsed.data.upstream?.url).toBe("https://github.com/mayswind/ezbookkeeping");
    expect(parsed.data.upstream?.relationship.length).toBeGreaterThan(40);
  });

  it("does not assert an unverified aiAssisted claim (field omitted, not invented)", () => {
    // No repository evidence of AI-assisted development either way was
    // found during the audit — aiAssisted stays unset (schema-optional,
    // D-018 precedent), the same pattern already established for DropSpot.
    if (!parsed.success) return;
    expect(parsed.data.aiAssisted).toBeUndefined();
  });

  it("has at least 3 real decisions, each with a non-empty alternatives list", () => {
    if (!parsed.success) return;
    expect(parsed.data.decisions?.length ?? 0).toBeGreaterThanOrEqual(3);
    for (const decision of parsed.data.decisions ?? []) {
      expect(decision.alternatives.length).toBeGreaterThan(0);
      expect(decision.context.length).toBeGreaterThan(0);
      expect(decision.tradeoff.length).toBeGreaterThan(0);
    }
  });

  it("does not claim transactions are book-scoped, or that an invitation flow exists", () => {
    if (!parsed.success) return;
    const rendered = JSON.stringify(parsed.data).toLowerCase();
    // The audit's single most important finding: transactions still filter
    // by uid, not bookId; invitations are schema-only. The content must not
    // accidentally overclaim either as working.
    expect(rendered).not.toMatch(/transactions are (book-scoped|shared)/);
    expect(rendered).not.toMatch(/invite (a|your) (family|partner|member)/);
  });

  it("does not claim Hakan wrote ezBookkeeping's own transaction engine or interface", () => {
    if (!parsed.success) return;
    const contribution = parsed.data.contribution ?? "";
    expect(contribution.toLowerCase()).toMatch(/did not write|not.*transaction engine/);
  });

  it("body contains no [CONTENT REQUIRED marker", () => {
    expect(containsContentRequiredMarker(content)).toBe(false);
  });
});

describe("JointLedger real content — no CONTENT REQUIRED marker anywhere", () => {
  it("frontmatter and all four MDX files are marker-free", () => {
    const files = ["index.mdx", "surface.mdx", "flow.mdx", "system.mdx"];
    for (const file of files) {
      const raw = readRaw(file);
      expect(containsContentRequiredMarker(raw)).toBe(false);
    }
  });
});

describe("JointLedger real content — required section headings (depth: short)", () => {
  it("index.mdx has all 3 required headings, plus the optional Constraints", () => {
    const { content } = matter(readRaw("index.mdx"));
    const errors = checkRequiredSectionHeadings("jointledger", "short", content);
    expect(errors).toEqual([]);
    expect(content).toContain("## One-minute summary");
    expect(content).toContain("## Why it exists");
    expect(content).toContain("## Constraints");
    expect(content).toContain("## Reflection");
  });
});

describe("JointLedger real content — layer-meaning gate", () => {
  it("all three layers are >= 400 chars and pairwise <= 60% similar", () => {
    const errors = checkLayerMeaning("jointledger", {
      surface: readRaw("surface.mdx"),
      flow: readRaw("flow.mdx"),
      system: readRaw("system.mdx"),
    });
    expect(errors).toEqual([]);
  });
});

describe("JointLedger real content — publication-gate pass (live, published)", () => {
  it("passes every publication gate against the real, live published/verified content", () => {
    const { data, content } = matter(readRaw("index.mdx"));
    const parsed = ProjectFrontmatterSchema.parse(data);

    const errors = validatePublicationGates({
      project: parsed,
      indexBody: content,
      layerBodies: {
        surface: readRaw("surface.mdx"),
        flow: readRaw("flow.mdx"),
        system: readRaw("system.mdx"),
      },
    });
    expect(errors).toEqual([]);
  });
});

describe("JointLedger real content — Surface/Flow/System load in order with distinct content", () => {
  it("getProjectLayers returns compiled, ordered, distinct layers", async () => {
    const layers = await getProjectLayers("jointledger");
    expect(layers).not.toBeNull();
    if (!layers) return;

    const surfaceHtml = renderToStaticMarkup(layers.surface);
    const flowHtml = renderToStaticMarkup(layers.flow);
    const systemHtml = renderToStaticMarkup(layers.system);

    expect(surfaceHtml).toContain("screen for screen");
    expect(flowHtml).toContain("last remaining owner");
    expect(systemHtml).toContain("CheckBookPermission");

    // Genuinely distinct — System's core technical vocabulary does not leak
    // into Surface, a different kind of claim.
    expect(surfaceHtml).not.toContain("CheckBookPermission");
    expect(systemHtml).not.toContain("screen for screen");
  });

  it("all 4 D-019 diagram Figures render with honest, non-empty alt text and no placeholder reference", async () => {
    const layers = await getProjectLayers("jointledger");
    expect(layers).not.toBeNull();
    if (!layers) return;

    const surfaceHtml = renderToStaticMarkup(layers.surface);
    const flowHtml = renderToStaticMarkup(layers.flow);
    const systemHtml = renderToStaticMarkup(layers.system);
    const combined = surfaceHtml + flowHtml + systemHtml;

    expect(surfaceHtml).toContain("upstream-extension-map.svg");
    expect(flowHtml).toContain("personal-book-backfill-flow.svg");
    expect(systemHtml).toContain("book-data-model-diagram.svg");
    expect(systemHtml).toContain("book-scoped-authorization-diagram.svg");
    expect(combined).not.toContain("placeholder-asset-pending.svg");
    expect(combined.toLowerCase()).not.toContain('alt=""');
    expect(combined).toContain("Verified");
    expect(combined.toLowerCase()).not.toContain("screenshot of");
  });
});

describe("JointLedger real content — upstream disclosure renders, not buried in metadata", () => {
  it("CaseStudyHero renders a visible fork disclosure linking to the real ezBookkeeping repository", () => {
    const project = getProjectBySlug("jointledger");
    expect(project).toBeDefined();
    if (!project) return;

    const heroHtml = renderToStaticMarkup(<CaseStudyHero project={project} />);
    expect(heroHtml).toContain("fork");
    expect(heroHtml).toContain("ezBookkeeping");
    expect(heroHtml).toContain("https://github.com/mayswind/ezbookkeeping");
  });

  it("ProjectCard (used on / and /work listings) also renders the fork disclosure", () => {
    const project = getProjectBySlug("jointledger");
    expect(project).toBeDefined();
    if (!project) return;

    const cardHtml = renderToStaticMarkup(<ProjectCard project={project} />);
    expect(cardHtml).toContain("ezBookkeeping");
  });

  it("a project with no upstream field renders no fork disclosure at all", () => {
    const project = getProjectBySlug("dropspot");
    expect(project).toBeDefined();
    if (!project) return;

    const heroHtml = renderToStaticMarkup(<CaseStudyHero project={project} />);
    const cardHtml = renderToStaticMarkup(<ProjectCard project={project} />);
    expect(heroHtml.toLowerCase()).not.toContain("fork of");
    expect(cardHtml.toLowerCase()).not.toContain("fork of");
  });
});

describe("JointLedger real content — genuine semantic rendering of the full template", () => {
  it("hero, three layers, decisions, and next-project link all render through the real production components", async () => {
    const project = getProjectBySlug("jointledger");
    expect(project).toBeDefined();
    if (!project) return;

    const indexBody = getProjectIndexBody("jointledger");
    expect(indexBody).toBeDefined();

    const layers = await getProjectLayers("jointledger");
    expect(layers).not.toBeNull();
    if (!layers) return;

    expect(project.decisions).toBeDefined();
    if (!project.decisions) return;

    const heroHtml = renderToStaticMarkup(<CaseStudyHero project={project} />);
    const surfaceHtml = renderToStaticMarkup(
      <LayerSection label="Surface">{layers.surface}</LayerSection>,
    );
    const flowHtml = renderToStaticMarkup(<LayerSection label="Flow">{layers.flow}</LayerSection>);
    const systemHtml = renderToStaticMarkup(
      <LayerSection label="System">{layers.system}</LayerSection>,
    );
    const decisionsHtml = renderToStaticMarkup(<DecisionList decisions={project.decisions} />);

    expect(heroHtml).toContain("JointLedger");
    expect(heroHtml).toContain("text-heading-l");
    expect(surfaceHtml).toContain(">Surface<");
    expect(flowHtml).toContain(">Flow<");
    expect(systemHtml).toContain(">System<");
    expect(decisionsHtml).toContain("Personal books use the owner");
    expect(decisionsHtml).toContain("own user id as the book id");

    // Kıvılcım -> DropSpot -> JointLedger -> Professional Systems: JointLedger
    // must point at the genuinely-public Professional Systems, never at a
    // draft or nonexistent route.
    expect(project.nextSlug).toBe("professional-systems");
    const nextProject = getProjectBySlug(project.nextSlug ?? "");
    expect(nextProject).toBeDefined();
    if (!nextProject) return;
    expect(nextProject.status).toBe("published");
    const nextHtml = renderToStaticMarkup(<NextProject project={nextProject} />);
    expect(nextHtml).toContain("Professional Systems");
  });
});
