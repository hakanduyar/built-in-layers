import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CaseStudyHero } from "@/components/project/CaseStudyHero";
import { DecisionList } from "@/components/project/DecisionList";
import { LayerSection } from "@/components/project/LayerSection";
import { ProjectNeighbours } from "@/components/project/ProjectNeighbours";
import { compileProjectMDX } from "@/lib/content/mdx";
import {
  getAllProjects,
  getCaseStudyNeighbours,
  getProjectBySlug,
  getProjectIndexBody,
  getProjectLayers,
  getProjectsByTier,
  getPublishedProjects,
} from "@/lib/content/work";

const FIXTURES = path.join(process.cwd(), "tests/fixtures/content");
const GOOD = path.join(FIXTURES, "work");

describe("getAllProjects — filesystem enumeration", () => {
  it("enumerates every project directory, including drafts", () => {
    const slugs = getAllProjects(GOOD).map((p) => p.slug);
    expect(slugs.sort()).toEqual(["alpha", "beta", "delta-full", "gamma-draft"]);
  });
});

describe("getPublishedProjects — publication-state filtering and ordering", () => {
  it("excludes drafts and sorts published projects by order", () => {
    const slugs = getPublishedProjects(GOOD).map((p) => p.slug);
    expect(slugs).toEqual(["beta", "alpha", "delta-full"]);
  });

  it("does not throw when a draft contains a [CONTENT REQUIRED marker", () => {
    expect(() => getPublishedProjects(GOOD)).not.toThrow();
  });
});

describe("getProjectsByTier", () => {
  it("returns only published projects in the requested tier, ordered", () => {
    const slugs = getProjectsByTier("featured", GOOD).map((p) => p.slug);
    expect(slugs).toEqual(["beta", "alpha", "delta-full"]);
  });
});

describe("getProjectBySlug — unknown project lookup", () => {
  it("returns the matching project", () => {
    expect(getProjectBySlug("alpha", GOOD)?.title).toBe("Alpha");
  });

  it("returns undefined for a slug that does not exist", () => {
    expect(getProjectBySlug("does-not-exist", GOOD)).toBeUndefined();
  });
});

describe("getProjectLayers — missing-layer and ordering behavior", () => {
  it("returns null for preview-depth projects (intentionally unavailable layers)", async () => {
    expect(await getProjectLayers("alpha", GOOD)).toBeNull();
  });

  it("returns null for an unknown slug", async () => {
    expect(await getProjectLayers("does-not-exist", GOOD)).toBeNull();
  });

  it("returns compiled layers in Surface -> Flow -> System order for full-depth projects", async () => {
    const layers = await getProjectLayers("delta-full", GOOD);
    expect(layers).not.toBeNull();
    if (!layers) return;

    expect(renderToStaticMarkup(layers.surface)).toContain("grid layout");
    expect(renderToStaticMarkup(layers.flow)).toContain("registers at checkout");
    expect(renderToStaticMarkup(layers.system)).toContain("container image");
  });
});

describe("publication gate failures throw with project/file/rule detail", () => {
  it("throws for a published project containing a [CONTENT REQUIRED marker", () => {
    expect(() => getPublishedProjects(path.join(FIXTURES, "work-fail-marker"))).toThrow(/only/);
  });

  it("throws for a published full-depth project missing its layer files", () => {
    expect(() => getPublishedProjects(path.join(FIXTURES, "work-fail-missing-layer"))).toThrow(
      /all three layer files/,
    );
  });

  it("throws for a published full-depth project with a too-short layer", () => {
    expect(() => getPublishedProjects(path.join(FIXTURES, "work-fail-short-layer"))).toThrow(
      /minimum is/,
    );
  });

  it("throws for a published full-depth project with near-duplicate layers", () => {
    expect(() => getPublishedProjects(path.join(FIXTURES, "work-fail-duplicate-layer"))).toThrow(
      /similar/,
    );
  });

  it("throws when verificationStatus doesn't satisfy the required depth", () => {
    expect(() => getPublishedProjects(path.join(FIXTURES, "work-fail-verification"))).toThrow(
      /verified/,
    );
  });

  it("throws when verificationStatus is 'do-not-publish', regardless of other fields", () => {
    expect(() => getPublishedProjects(path.join(FIXTURES, "work-fail-do-not-publish"))).toThrow(
      /do-not-publish/,
    );
  });

  it("throws when a published full-depth project is missing a required section heading", () => {
    expect(() => getPublishedProjects(path.join(FIXTURES, "work-fail-heading"))).toThrow(
      /required section heading/,
    );
  });
});

describe("schema gate", () => {
  it("throws when provenance is 'fork' and upstream is missing", () => {
    expect(() => getAllProjects(path.join(FIXTURES, "work-fail-schema"))).toThrow(/upstream/);
  });

  it("throws when frontmatter slug does not match its directory name", () => {
    expect(() => getAllProjects(path.join(FIXTURES, "work-fail-slug-mismatch"))).toThrow(
      /does not match its directory name/,
    );
  });
});

describe("missing content directory", () => {
  it("returns an empty array rather than throwing", () => {
    expect(getAllProjects(path.join(FIXTURES, "does-not-exist"))).toEqual([]);
  });
});

describe("11-section case-study template (fixture proof, not public content)", () => {
  it("renders every PROJECT_SPEC §7 IA section for a full-depth fixture", async () => {
    const project = getProjectBySlug("delta-full", GOOD);
    expect(project).toBeDefined();
    if (!project) return;

    const indexBody = getProjectIndexBody("delta-full", GOOD);
    expect(indexBody).toBeDefined();
    const indexContent = indexBody ? await compileProjectMDX(indexBody) : null;

    const layers = await getProjectLayers("delta-full", GOOD);
    expect(layers).not.toBeNull();
    if (!layers) return;

    // D-027: neighbours derive from the fixture set's own global order.
    const { previous, next } = getCaseStudyNeighbours("delta-full", GOOD);

    expect(project.decisions).toBeDefined();
    if (!project.decisions) return;

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
    // Section 11 renders both directions. delta-full is the only case-study
    // destination in this fixture set (alpha/beta are preview, gamma is a
    // draft), so it correctly has no neighbours of its own — proving the
    // boundary case. The component itself is exercised with real fixture
    // entries either side.
    expect(previous).toBeUndefined();
    expect(next).toBeUndefined();
    const nextHtml = renderToStaticMarkup(
      <ProjectNeighbours
        previous={getProjectBySlug("beta", GOOD)}
        next={getProjectBySlug("alpha", GOOD)}
      />,
    );

    // 1. Project hero
    expect(heroHtml).toContain("Delta Full");
    // 2. One-minute summary
    expect(bodyHtml).toContain("One-minute summary");
    // 3. Why it exists
    expect(bodyHtml).toContain("Why it exists");
    // 4. Constraints
    expect(bodyHtml).toContain("Constraints");
    // 5. Surface
    expect(surfaceHtml).toContain(">Surface<");
    expect(surfaceHtml).toContain("grid layout");
    // 6. Flow
    expect(flowHtml).toContain(">Flow<");
    expect(flowHtml).toContain("registers at checkout");
    // 7. System
    expect(systemHtml).toContain(">System<");
    expect(systemHtml).toContain("container image");
    // 8. Decisions
    expect(decisionsHtml).toContain("Fixture decision one");
    // 9. Evolution
    expect(bodyHtml).toContain("Evolution");
    // 10. Reflection
    expect(bodyHtml).toContain("Reflection");
    // 11. Movement between case studies, both directions
    expect(nextHtml).toContain("Alpha");
    expect(nextHtml).toContain("Previous project");
    expect(nextHtml).toContain("Next project");

    // Restricted MDX component whitelist (Figure, Note, DecisionCallout) —
    // exercised inside the layer bodies themselves, proving the compiler
    // resolves exactly these three custom components end to end.
    expect(surfaceHtml).toContain("placeholder-asset-pending.svg");
    expect(surfaceHtml).toContain("Fixture note callout");
    expect(systemHtml).toContain("Fixture inline decision callout");
  });

  it("draft/preview content is never publicly reachable regardless of template completeness", () => {
    // The fixture above (status: published, tier: featured) proves the
    // template renders; this proves the fixture's own draft sibling
    // (gamma-draft) is excluded from the public listing that would ever
    // route to it — the two facts together are what make the fixture-only
    // proof safe (CONTENT_MODEL never has this content served publicly).
    const publishedSlugs = getPublishedProjects(GOOD).map((p) => p.slug);
    expect(publishedSlugs).not.toContain("gamma-draft");
  });
});
