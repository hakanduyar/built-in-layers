import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CaseStudyHero } from "@/components/project/CaseStudyHero";
import { getProjectBySlug } from "@/lib/content/work";
import { representativeAsset } from "@/lib/spatial/systemPov";

// V13 (Fable gate, finding D). The content model requires `contribution` of
// every featured project and `aiDisclosure` whenever `aiAssisted` is true,
// and the Fable gate found that neither field rendered anywhere on the site.
// These tests read the real published content, not fixtures: a required
// statement that is validated but never shown is not a statement.
function renderHero(slug: string): string {
  const project = getProjectBySlug(slug);
  expect(project).toBeDefined();
  if (!project) throw new Error(`no published project: ${slug}`);
  return renderToStaticMarkup(<CaseStudyHero project={project} />);
}

/** React's text escaping, so a statement containing an apostrophe can be
 *  asserted in full rather than up to its first `'`. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

describe("CaseStudyHero — the required statements are rendered, not just validated", () => {
  it("renders each published project's contribution statement verbatim", () => {
    for (const slug of [
      "kivilcim",
      "jointledger",
      "dropspot",
      "software-factory",
      "professional-systems",
    ]) {
      const project = getProjectBySlug(slug);
      expect(project?.contribution).toBeTruthy();
      if (!project?.contribution) continue;
      const html = renderHero(slug);
      expect(html).toContain(escapeHtml(project.contribution));
      expect(html).toContain("Contribution");
    }
  });

  it("renders the AI disclosure only for projects that declare AI assistance", () => {
    const kivilcim = renderHero("kivilcim");
    expect(kivilcim).toContain("AI assistance");
    expect(kivilcim).toContain("AI tools assisted parts of the planning");

    const softwareFactory = renderHero("software-factory");
    expect(softwareFactory).toContain("AI assistance");
    expect(softwareFactory).toContain("The factory builds itself through its own loop");

    // DropSpot and JointLedger leave `aiAssisted` unset (D-018): no evidence
    // either way, so no claim either way -- not even a "none" line.
    expect(renderHero("dropspot")).not.toContain("AI assistance");
    expect(renderHero("jointledger")).not.toContain("AI assistance");
  });
});

describe("CaseStudyHero — the lead plate is the asset the reader arrived from", () => {
  it("opens with the same representative asset the spatial scene chose for the project", () => {
    for (const slug of ["kivilcim", "jointledger", "dropspot", "software-factory"]) {
      const project = getProjectBySlug(slug);
      if (!project) throw new Error(`no published project: ${slug}`);
      const lead = representativeAsset(project);
      expect(lead).toBeDefined();
      if (!lead) continue;
      const html = renderHero(slug);
      expect(html).toContain(lead.src);
      // Every representative asset carries its D-019 honesty caption; the
      // schema leaves captions optional, so the type has to be narrowed here.
      expect(lead.caption).toBeTruthy();
      if (lead.caption) expect(html).toContain(escapeHtml(lead.caption));
      // The hero plate is the largest contentful paint candidate: a high
      // fetch priority, which React 19 also turns into a preload hint.
      expect(html).toContain('fetchPriority="high"');
      expect(html).toContain(`<link rel="preload" as="image" href="${lead.src}"`);
    }
  });

  it("puts the record (provenance, phase, verification, stack, access) in the hero, read off the frontmatter", () => {
    const kivilcim = renderHero("kivilcim");
    expect(kivilcim).toContain("Provenance");
    expect(kivilcim).toContain("Personal");
    expect(kivilcim).toContain("Active development");
    expect(kivilcim).toContain("Verified against source");

    const dropspot = renderHero("dropspot");
    expect(dropspot).toContain("Paused");
    expect(dropspot).toContain("PostgreSQL");
  });
});

describe("CaseStudyHero — a preview-depth project is composed the same way", () => {
  it("Professional Systems carries its plate, its placeholder contribution and an honest verification state", () => {
    const html = renderHero("professional-systems");
    expect(html).toContain("professional-systems-overview.svg");
    expect(html).toContain("I will share my specific role and contributions here");
    expect(html).toContain("Not yet verified");
    expect(html).toContain("Professional");
    // No phase is declared, so no phase row is guessed.
    expect(html).not.toContain(">Phase<");
    expect(html).not.toContain("AI assistance");
  });
});
