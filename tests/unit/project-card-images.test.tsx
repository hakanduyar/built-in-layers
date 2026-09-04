import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProjectCard } from "@/components/project/ProjectCard";
import { containsContentRequiredMarker } from "@/lib/content/validate";
import { getProjectsByTier } from "@/lib/content/work";

// Homepage-image completion pass (TASK-003, 2026-08-10). Exercises the real
// loader (getProjectsByTier, reading actual content/work/*/index.mdx) and the
// real ProjectCard component -- not a hand-copied frontmatter fixture -- so
// these tests fail the moment the live representative-image wiring breaks.

// The card's caption text. Since the V13 mobile gate (D-031 addendum, ART-1)
// the card's figure opts into the inspector, so its <figcaption> is a row:
// the caption in the first <span>, then the INSPECT control and its closed
// <dialog>. The assertions below are about the caption, so they read that
// span; a figure without the control keeps the caption as the whole element.
function cardCaption(html: string): string | null {
  const figcaption = html.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/)?.[1];
  if (figcaption === undefined) return null;
  const span = figcaption.match(/^<span[^>]*>([^<]*)<\/span>/)?.[1];
  return span ?? figcaption;
}

describe("ProjectCard — representative images, real content and real loader", () => {
  const projects = getProjectsByTier("featured");

  it("returns exactly the five published featured projects, in owner order, no duplicates", () => {
    const slugs = projects.map((p) => p.slug);
    expect(slugs).toEqual([
      "software-factory",
      "kivilcim",
      "jointledger",
      "dropspot",
      "professional-systems",
    ]);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("no draft project is present among the rendered cards", () => {
    for (const project of projects) {
      expect(project.status).toBe("published");
    }
  });

  const EXPECTED: Record<string, { file: string; assetType: string }> = {
    "software-factory": { file: "factory-loop-diagram.svg", assetType: "verified-diagram" },
    kivilcim: { file: "product-areas-map.svg", assetType: "provisional-illustration" },
    dropspot: { file: "browse-drops.webp", assetType: "real-screenshot" },
    jointledger: { file: "upstream-extension-map.svg", assetType: "verified-diagram" },
    "professional-systems": {
      file: "professional-systems-overview.svg",
      assetType: "provisional-illustration",
    },
  };

  for (const project of projects) {
    const expected = EXPECTED[project.slug];

    it(`${project.slug} card renders exactly one <img>, sourced from real project metadata`, () => {
      expect(expected, `no expectation registered for ${project.slug}`).toBeDefined();
      if (!expected) return;
      expect(project.images[0]?.src).toContain(expected.file);
      expect(project.images[0]?.assetType).toBe(expected.assetType);

      const html = renderToStaticMarkup(<ProjectCard project={project} />);
      const imgMatches = html.match(/<img\b/g) ?? [];
      expect(imgMatches).toHaveLength(1);
      expect(html).toContain(expected.file);
    });

    it(`${project.slug} card's image file genuinely exists on disk`, () => {
      const src = project.images[0]?.src ?? "";
      const filePath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
      expect(fs.existsSync(filePath), `${src} should exist on disk`).toBe(true);
    });

    it(`${project.slug} card renders non-empty, meaningful alt text`, () => {
      const html = renderToStaticMarkup(<ProjectCard project={project} />);
      const altMatch = html.match(/<img[^>]*\balt="([^"]*)"/);
      expect(altMatch, "expected an alt attribute on the rendered <img>").not.toBeNull();
      expect((altMatch?.[1] ?? "").length).toBeGreaterThan(10);
    });

    it(`${project.slug} card contains no [CONTENT REQUIRED marker`, () => {
      const html = renderToStaticMarkup(<ProjectCard project={project} />);
      expect(containsContentRequiredMarker(html)).toBe(false);
    });
  }

  it("DropSpot's real screenshot never carries a 'not a screenshot' denial caption", () => {
    const dropspot = projects.find((p) => p.slug === "dropspot");
    expect(dropspot).toBeDefined();
    if (!dropspot) return;
    const html = renderToStaticMarkup(<ProjectCard project={dropspot} />);
    const caption = cardCaption(html);
    expect(caption, "expected a figcaption").not.toBeNull();
    expect((caption ?? "").toLowerCase()).not.toContain("not a");
  });

  it("Kıvılcım, JointLedger, and Professional Systems keep their honest diagram/illustration denial caption visible on the card", () => {
    for (const slug of ["kivilcim", "jointledger", "professional-systems"]) {
      const project = projects.find((p) => p.slug === slug);
      expect(project, `expected to find ${slug}`).toBeDefined();
      if (!project) continue;
      const html = renderToStaticMarkup(<ProjectCard project={project} />);
      const caption = cardCaption(html);
      expect(caption, `expected a figcaption for ${slug}`).not.toBeNull();
      expect((caption ?? "").toLowerCase()).toMatch(/not a (product )?screenshot/);
    }
  });

  // ART-1 (V13 mobile QA, D-031 addendum): the thumbnail opts into the
  // inspector, so the same 1400px plate the case studies open is one tap
  // away from the index too. The control is named for its figure (A11Y-1)
  // and hides at `lg`, where the index is what it was.
  it("every card's thumbnail carries the inspector, named for its own figure and hidden at lg", () => {
    for (const project of projects) {
      const html = renderToStaticMarkup(<ProjectCard project={project} />);
      const triggers = [
        ...html.matchAll(/<button[^>]*data-figure-inspect[^>]*>Inspect<\/button>/g),
      ];
      expect(triggers, `expected one INSPECT control on ${project.slug}`).toHaveLength(1);
      const trigger = triggers[0]?.[0] ?? "";
      // Both attributes come out of the same renderer, so the (escaped)
      // alt text is compared as rendered, not as authored.
      const alt = html.match(/<img[^>]*\balt="([^"]*)"/)?.[1] ?? "";
      expect(alt.length).toBeGreaterThan(10);
      expect(trigger).toContain(`aria-label="Inspect: ${alt}"`);
      expect(trigger).toMatch(/class="[^"]*lg:hidden[^"]*"/);
    }
  });

  it("no card claims a fake screenshot anywhere ('screenshot of' only appears for DropSpot's genuine screenshots)", () => {
    for (const project of projects) {
      const html = renderToStaticMarkup(<ProjectCard project={project} />).toLowerCase();
      if (project.slug !== "dropspot") {
        expect(html).not.toContain("screenshot of");
      }
    }
  });

  it("ProjectCard's own source contains no per-project hard-coded image filename or slug->image map", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "components/project/ProjectCard.tsx"),
      "utf8",
    );
    for (const { file } of Object.values(EXPECTED)) {
      expect(source).not.toContain(file);
    }
    // The only slug ProjectCard may reference is the pre-existing D-017
    // Kıvılcım naming gloss -- unrelated to image selection.
    expect(source).not.toContain('"dropspot"');
    expect(source).not.toContain('"jointledger"');
    expect(source).not.toContain('"professional-systems"');
  });
});
