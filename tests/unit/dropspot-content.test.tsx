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
import { getProjectBySlug, getProjectIndexBody, getProjectLayers } from "@/lib/content/work";

// Real content, not a fixture — this is TASK-006's DropSpot entry itself.
// Published under D-019 (docs/DECISIONS.md): text and repository claims are
// verified against a direct read of dropspot-backend/src (not the README
// alone), and the four project images are honestly labelled
// verified-diagram/provisional-illustration assets rather than real
// screenshots.
const CONTENT_DIR = path.join(process.cwd(), "content/work/dropspot");

function readRaw(file: string): string {
  return fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
}

describe("DropSpot real content — schema", () => {
  const { data, content } = matter(readRaw("index.mdx"));
  const parsed = ProjectFrontmatterSchema.safeParse(data);

  it("parses against the real schema", () => {
    expect(parsed.success).toBe(true);
  });

  it("is published and verified under D-019", () => {
    if (!parsed.success) return;
    expect(parsed.data.status).toBe("published");
    expect(parsed.data.verificationStatus).toBe("verified");
    expect(parsed.data.factsCheckedAgainstRepo).toBe(true);
  });

  it("is depth 'short', ordered second per D-016 (order: 2)", () => {
    if (!parsed.success) return;
    expect(parsed.data.tier).toBe("featured");
    expect(parsed.data.depth).toBe("short");
    expect(parsed.data.order).toBe(2);
  });

  it("does not assert an unverified aiAssisted claim (field omitted, not invented)", () => {
    // No repository evidence of AI-assisted development either way was
    // found during the audit — aiAssisted stays unset (schema-optional,
    // D-018 precedent) rather than being filled with a guessed value.
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

  it("does not claim the repository's CI workflow ever actually ran (it's misplaced, never picked up by GitHub Actions)", () => {
    if (!parsed.success) return;
    const rendered = JSON.stringify(parsed.data).toLowerCase();
    expect(rendered).not.toMatch(/ci (passes|passing|is green)/);
  });

  it("body contains no [CONTENT REQUIRED marker", () => {
    expect(containsContentRequiredMarker(content)).toBe(false);
  });
});

describe("DropSpot real content — no CONTENT REQUIRED marker anywhere", () => {
  it("frontmatter and all four MDX files are marker-free", () => {
    const files = ["index.mdx", "surface.mdx", "flow.mdx", "system.mdx"];
    for (const file of files) {
      const raw = readRaw(file);
      expect(containsContentRequiredMarker(raw)).toBe(false);
    }
  });
});

describe("DropSpot real content — required section headings (depth: short)", () => {
  it("index.mdx has all 3 required headings (Constraints is optional for short depth and is also present)", () => {
    const { content } = matter(readRaw("index.mdx"));
    const errors = checkRequiredSectionHeadings("dropspot", "short", content);
    expect(errors).toEqual([]);
    expect(content).toContain("## One-minute summary");
    expect(content).toContain("## Why it exists");
    expect(content).toContain("## Reflection");
  });
});

describe("DropSpot real content — layer-meaning gate", () => {
  it("all three layers are >= 400 chars and pairwise <= 60% similar", () => {
    const errors = checkLayerMeaning("dropspot", {
      surface: readRaw("surface.mdx"),
      flow: readRaw("flow.mdx"),
      system: readRaw("system.mdx"),
    });
    expect(errors).toEqual([]);
  });
});

describe("DropSpot real content — publication-gate pass (live, published)", () => {
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

describe("DropSpot real content — Surface/Flow/System load in order with distinct content", () => {
  it("getProjectLayers returns compiled, ordered, distinct layers", async () => {
    const layers = await getProjectLayers("dropspot");
    expect(layers).not.toBeNull();
    if (!layers) return;

    const surfaceHtml = renderToStaticMarkup(layers.surface);
    const flowHtml = renderToStaticMarkup(layers.flow);
    const systemHtml = renderToStaticMarkup(layers.system);

    expect(surfaceHtml).toContain("status badge");
    expect(flowHtml).toContain("idempotent");
    expect(systemHtml).toContain("FOR UPDATE");

    // Genuinely distinct — the System layer's core technical vocabulary
    // does not leak into Surface, which is a different kind of claim. (Both
    // layers legitimately mention "route guard" from different angles — the
    // frontend's own guard vs. the backend's independent enforcement of the
    // same boundary — so that phrase isn't a useful distinctness signal.)
    expect(surfaceHtml).not.toContain("FOR UPDATE");
    expect(systemHtml).not.toContain("status badge");
  });

  it("all 7 D-019 Figures render with honest, non-empty alt text and no placeholder reference", async () => {
    const layers = await getProjectLayers("dropspot");
    expect(layers).not.toBeNull();
    if (!layers) return;

    const surfaceHtml = renderToStaticMarkup(layers.surface);
    const flowHtml = renderToStaticMarkup(layers.flow);
    const systemHtml = renderToStaticMarkup(layers.system);
    const combined = surfaceHtml + flowHtml + systemHtml;

    // Surface: 3 real screenshots showing 3 distinct interface areas.
    expect(surfaceHtml).toContain("browse-drops.webp");
    expect(surfaceHtml).toContain("drop-detail.webp");
    expect(surfaceHtml).toContain("admin-panel.webp");
    // Flow: the one real state screenshot, paired with the flow diagram.
    expect(flowHtml).toContain("waitlist-joined.webp");
    expect(flowHtml).toContain("core-flow-diagram.svg");
    // System: the two deep technical diagrams.
    expect(systemHtml).toContain("claim-transaction-diagram.svg");
    expect(systemHtml).toContain("priority-score-diagram.svg");

    // The provisional screens-map.svg was removed once real screenshots
    // covered its core purpose — must not linger anywhere.
    expect(combined).not.toContain("screens-map.svg");
    expect(combined).not.toContain("placeholder-asset-pending.svg");
    expect(combined.toLowerCase()).not.toContain('alt=""');
  });

  it("real-screenshot Figures never carry a 'not a screenshot' denial (they genuinely are screenshots)", async () => {
    const layers = await getProjectLayers("dropspot");
    expect(layers).not.toBeNull();
    if (!layers) return;

    // Surface holds only real screenshots (no diagrams), so the denial
    // phrase must not appear anywhere in it at all.
    const surfaceHtml = renderToStaticMarkup(layers.surface);
    expect(surfaceHtml.toLowerCase()).not.toContain("not a product screenshot");

    // Flow mixes one real screenshot with the flow diagram — check the
    // screenshot's own caption specifically, not the whole layer (the
    // diagram's caption legitimately carries the denial).
    const flowHtml = renderToStaticMarkup(layers.flow);
    const waitlistFigureMatch = flowHtml.match(
      /<img src="\/images\/projects\/dropspot\/waitlist-joined\.webp"[^>]*\/>(?:\s*<figcaption[^>]*>([^<]*)<\/figcaption>)?/,
    );
    expect(waitlistFigureMatch, "expected to find the waitlist-joined Figure").not.toBeNull();
    expect((waitlistFigureMatch?.[1] ?? "").toLowerCase()).not.toContain("not a");
  });

  it("diagram Figures still carry the honest diagram/illustration denial", async () => {
    const layers = await getProjectLayers("dropspot");
    expect(layers).not.toBeNull();
    if (!layers) return;

    const flowHtml = renderToStaticMarkup(layers.flow);
    const systemHtml = renderToStaticMarkup(layers.system);
    expect(flowHtml).toContain("Verified flow diagram, not a product screenshot.");
    expect(systemHtml).toContain("Verified architecture diagram, not a product screenshot.");
  });
});

describe("DropSpot real content — genuine semantic rendering of the full template", () => {
  it("renders hero, the 3 depth:short required sections, 3 layers, and >=3 decisions through the real components", async () => {
    const project = getProjectBySlug("dropspot");
    expect(project).toBeDefined();
    if (!project) return;

    const indexBody = getProjectIndexBody("dropspot");
    expect(indexBody).toBeDefined();
    const indexContent = indexBody ? await compileProjectMDX(indexBody) : null;

    const layers = await getProjectLayers("dropspot");
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

    expect(heroHtml).toContain("DropSpot");
    for (const heading of ["One-minute summary", "Why it exists", "Reflection"]) {
      const match = bodyHtml.match(new RegExp(`<h2 class="([^"]*)">${heading}</h2>`));
      expect(match, `expected a styled <h2> for "${heading}"`).not.toBeNull();
      expect(match?.[1]).toContain("text-heading-l");
    }
    expect(surfaceHtml).toContain(">Surface<");
    expect(flowHtml).toContain(">Flow<");
    expect(systemHtml).toContain(">System<");
    expect(decisionsHtml).toContain(
      "Row-level database locking instead of an application-level queue",
    );
    expect(decisionsHtml).toContain("A deployment-unique seed for priority-score coefficients");

    // nextSlug points at the published Professional Systems preview — never
    // at the still-draft JointLedger, and never at a route that would 404.
    expect(project.nextSlug).toBe("professional-systems");
  });
});
