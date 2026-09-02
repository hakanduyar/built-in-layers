import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CaseStudyHero } from "@/components/project/CaseStudyHero";
import { DecisionList } from "@/components/project/DecisionList";
import { LayerSection } from "@/components/project/LayerSection";
import { compileProjectMDX } from "@/lib/content/mdx";
import { ProjectFrontmatterSchema } from "@/lib/content/schemas";
import {
  checkLayerMeaning,
  checkRequiredSectionHeadings,
  containsContentRequiredMarker,
  validatePublicationGates,
} from "@/lib/content/validate";
import {
  getCaseStudyNeighbours,
  getProjectBySlug,
  getProjectIndexBody,
  getProjectLayers,
} from "@/lib/content/work";

// Real content, not a fixture — this is TASK-005's Kıvılcım entry itself.
// Published under D-019 (docs/DECISIONS.md): text and repository claims are
// verified, and the four project images are honestly labelled
// verified-diagram/provisional-illustration assets rather than real
// screenshots, which do not exist yet.
const CONTENT_DIR = path.join(process.cwd(), "content/work/kivilcim");

function readRaw(file: string): string {
  return fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
}

describe("Kıvılcım real content — schema", () => {
  const { data, content } = matter(readRaw("index.mdx"));
  const parsed = ProjectFrontmatterSchema.safeParse(data);

  it("parses against the real schema", () => {
    expect(parsed.success).toBe(true);
  });

  it("is published and verified under D-019 (Hakan's explicit, dated decision)", () => {
    if (!parsed.success) return;
    expect(parsed.data.status).toBe("published");
    expect(parsed.data.verificationStatus).toBe("verified");
    expect(parsed.data.factsCheckedAgainstRepo).toBe(true);
  });

  it("is ordered before Professional Systems per D-016 (order: 1)", () => {
    if (!parsed.success) return;
    expect(parsed.data.tier).toBe("featured");
    expect(parsed.data.depth).toBe("full");
    expect(parsed.data.order).toBe(1);
  });

  it("declares AI assistance and carries a non-empty AI disclosure", () => {
    if (!parsed.success) return;
    expect(parsed.data.aiAssisted).toBe(true);
    expect(parsed.data.aiDisclosure).toBeTruthy();
    expect(parsed.data.aiDisclosure).not.toContain("[CONTENT REQUIRED");
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

  it("does not claim Recharts (rejected by the repository audit — unimplemented)", () => {
    if (!parsed.success) return;
    const rendered = JSON.stringify(parsed.data).toLowerCase();
    expect(rendered).not.toContain("recharts");
  });

  it("body contains no [CONTENT REQUIRED marker", () => {
    expect(containsContentRequiredMarker(content)).toBe(false);
  });
});

describe("Kıvılcım real content — no CONTENT REQUIRED marker anywhere", () => {
  it("frontmatter and all four MDX files are marker-free", () => {
    const files = ["index.mdx", "surface.mdx", "flow.mdx", "system.mdx"];
    for (const file of files) {
      const raw = readRaw(file);
      expect(containsContentRequiredMarker(raw)).toBe(false);
    }
  });
});

describe("Kıvılcım real content — required section headings (depth: full)", () => {
  it("index.mdx has all 5 required headings", () => {
    const { content } = matter(readRaw("index.mdx"));
    const errors = checkRequiredSectionHeadings("kivilcim", "full", content);
    expect(errors).toEqual([]);
  });
});

describe("Kıvılcım real content — layer-meaning gate", () => {
  it("all three layers are >= 400 chars and pairwise <= 60% similar", () => {
    const errors = checkLayerMeaning("kivilcim", {
      surface: readRaw("surface.mdx"),
      flow: readRaw("flow.mdx"),
      system: readRaw("system.mdx"),
    });
    expect(errors).toEqual([]);
  });
});

describe("Kıvılcım real content — publication-gate pass (live, published)", () => {
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

describe("Kıvılcım real content — Surface/Flow/System load in order with distinct content", () => {
  it("getProjectLayers returns compiled, ordered, distinct layers", async () => {
    // getProjectLayers does not gate on publish status, so this proves real
    // rendering without requiring the project to be public.
    const layers = await getProjectLayers("kivilcim");
    expect(layers).not.toBeNull();
    if (!layers) return;

    const surfaceHtml = renderToStaticMarkup(layers.surface);
    const flowHtml = renderToStaticMarkup(layers.flow);
    const systemHtml = renderToStaticMarkup(layers.system);

    expect(surfaceHtml).toContain("bottom navigation");
    expect(flowHtml).toContain("Capture");
    expect(systemHtml).toContain("IndexedDB");

    // Genuinely distinct — no layer's rendered text leaks into another's.
    expect(surfaceHtml).not.toContain("IndexedDB");
    expect(systemHtml).not.toContain("bottom navigation");
  });

  it("surface layer's product-areas-map Figure has honest, non-empty alt text (D-019)", async () => {
    const layers = await getProjectLayers("kivilcim");
    expect(layers).not.toBeNull();
    if (!layers) return;

    const surfaceHtml = renderToStaticMarkup(layers.surface);
    expect(surfaceHtml).toContain("product-areas-map.svg");
    expect(surfaceHtml).toMatch(/alt="Diagram of Kıvılcım.{1,10}s five product areas[^"]*"/);
    expect(surfaceHtml).not.toContain("placeholder-asset-pending.svg");
  });
});

describe("Kıvılcım real content — genuine semantic rendering of the full template", () => {
  it("renders hero, all 5 narrative sections, 3 layers, and >=3 decisions through the real components", async () => {
    const project = getProjectBySlug("kivilcim");
    expect(project).toBeDefined();
    if (!project) return;

    const indexBody = getProjectIndexBody("kivilcim");
    expect(indexBody).toBeDefined();
    const indexContent = indexBody ? await compileProjectMDX(indexBody) : null;

    const layers = await getProjectLayers("kivilcim");
    expect(layers).not.toBeNull();
    if (!layers) return;

    expect(project.decisions).toBeDefined();
    if (!project.decisions) return;
    expect(project.decisions.length).toBeGreaterThanOrEqual(3);

    const heroHtml = renderToStaticMarkup(<CaseStudyHero project={project} />);
    const bodyHtml = indexContent ? renderToStaticMarkup(<>{indexContent}</>) : "";
    const surfaceHtml = renderToStaticMarkup(
      <LayerSection label="Surface">{layers.surface}</LayerSection>,
    );
    const flowHtml = renderToStaticMarkup(<LayerSection label="Flow">{layers.flow}</LayerSection>);
    const systemHtml = renderToStaticMarkup(
      <LayerSection label="System">{layers.system}</LayerSection>,
    );
    const decisionsHtml = renderToStaticMarkup(<DecisionList decisions={project.decisions} />);

    expect(heroHtml).toContain("Kıvılcım");
    // Real headings render through the production intrinsic-element mapping
    // (lib/content/mdx.tsx) — not just present as text, but as genuinely
    // styled h2 elements, proving the shared TASK-004 template gap found in
    // the TASK-005 review is fixed for this content.
    for (const heading of [
      "One-minute summary",
      "Why it exists",
      "Constraints",
      "Evolution",
      "Reflection",
    ]) {
      const match = bodyHtml.match(new RegExp(`<h2 class="([^"]*)">${heading}</h2>`));
      expect(match, `expected a styled <h2> for "${heading}"`).not.toBeNull();
      expect(match?.[1]).toContain("text-heading-l");
    }
    expect(surfaceHtml).toContain(">Surface<");
    expect(flowHtml).toContain(">Flow<");
    expect(systemHtml).toContain(">System<");
    expect(decisionsHtml).toContain("Local-first storage instead of a mandatory backend");
    expect(decisionsHtml).toContain("Routines as their own table, not an extension of Habits");

    // D-027: neighbours are derived from the global `order` sequence.
    // Kıvılcım is order 1 and the first case-study destination, so it has
    // no previous and JointLedger (order 2) follows it.
    const { previous, next } = getCaseStudyNeighbours(project.slug);
    expect(previous).toBeUndefined();
    expect(next?.slug).toBe("jointledger");
  });
});
