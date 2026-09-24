import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import NotFound from "@/app/not-found";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CaseStudyHero } from "@/components/project/CaseStudyHero";
import { ProjectCard } from "@/components/project/ProjectCard";
import { ProjectNeighbours } from "@/components/project/ProjectNeighbours";
import { AboutPreview } from "@/components/sections/AboutPreview";
import { FieldNotes } from "@/components/sections/FieldNotes";
import { SelectedSystems } from "@/components/sections/SelectedSystems";
import { getProjectBySlug, getProjectsByTier } from "@/lib/content/work";

// V13 mobile gate (M4): standalone text links get a 44px hit box below `lg`
// through one utility, `touch-link`, applied as `max-lg:inline-block
// max-lg:touch-link`. The utility's whole contract is "the hit box grows, the
// layout does not": the padding that makes the box is given straight back as
// negative margin. These tests pin the utility's shape and the call sites
// that carry it; the box sizes themselves are measured in the browser
// (docs/review/v13-mobile-gate/after/tap-targets.txt).

const css = readFileSync(path.join(process.cwd(), "styles/globals.css"), "utf8");

describe("the touch-link utility (styles/globals.css)", () => {
  const block = css.match(/@utility touch-link \{([\s\S]*?)\n\}/)?.[1] ?? "";

  it("trades block padding for an equal negative margin, and sets no display of its own", () => {
    expect(block).toMatch(/padding-block:\s*max\(0px, calc\(\(2\.8125rem - 1lh\) \/ 2\)\);/);
    expect(block).toMatch(/margin-block:\s*min\(0px, calc\(\(1lh - 2\.8125rem\) \/ 2\)\);/);
    // The call site chooses: `inline-block` for a link in a line, `block`
    // for a full-width row (the mobile menu).
    expect(block).not.toMatch(/display:/);
  });

  it("trades the same horizontal slop both ways, with a default a call site can override", () => {
    expect(block).toMatch(/padding-inline:\s*var\(--touch-slop-x, 0\.5rem\);/);
    expect(block).toMatch(/margin-inline:\s*calc\(-1 \* var\(--touch-slop-x, 0\.5rem\)\);/);
  });
});

type Anchor = { element: string; href: string; text: string };

/** Every `<a>` in the markup, with its href and its visible text (tags stripped). */
function anchorsIn(html: string): Anchor[] {
  return [...html.matchAll(/<a ([^>]*)>([\s\S]*?)<\/a>/g)].map((match) => ({
    element: match[0],
    href: match[1]?.match(/href="([^"]*)"/)?.[1] ?? "",
    text: (match[2] ?? "").replace(/<[^>]+>/g, "").trim(),
  }));
}

/** The anchors whose href is `by`, or whose visible text starts with it. */
function find(html: string, by: string): Anchor[] {
  return anchorsIn(html).filter((anchor) => anchor.href === by || anchor.text.startsWith(by));
}

const TOUCH = /class="[^"]*\bmax-lg:inline-block max-lg:touch-link\b[^"]*"/;

function expectTouchLink(html: string, by: string) {
  const anchors = find(html, by);
  expect(anchors.length, `no link "${by}"`).toBeGreaterThan(0);
  for (const anchor of anchors) {
    expect(anchor.element, `link "${by}" is not a touch link below lg`).toMatch(TOUCH);
  }
}

describe("standalone links carry `max-lg:inline-block max-lg:touch-link`", () => {
  const routes = ["/", "/work", "/notes", "/lab", "/about"];

  it("site header: the wordmark and every primary nav item, the nav with a wider slop", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    expectTouchLink(html, "Hakan Duyar");
    const nav = html.match(
      /<nav aria-label="Primary" class="hidden md:block">[\s\S]*?<\/nav>/,
    )?.[0];
    expect(nav).toBeDefined();
    for (const href of routes) {
      const anchors = find(nav ?? "", href);
      expect(anchors).toHaveLength(1);
      expect(anchors[0]?.element).toMatch(TOUCH);
      expect(anchors[0]?.element).toMatch(/\bmax-lg:\[--touch-slop-x:0\.75rem\]/);
    }
  });

  it("mobile menu: every route is a full-width row target", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    const panel = html.match(/<dialog[\s\S]*?<\/dialog>/)?.[0] ?? "";
    for (const href of routes) {
      const anchors = find(panel, href);
      expect(anchors).toHaveLength(1);
      expect(anchors[0]?.element).toMatch(/class="touch-link block /);
    }
  });

  it("site footer: the social links (the finale button is already 44px)", () => {
    const html = renderToStaticMarkup(<SiteFooter />);
    for (const label of ["GitHub", "LinkedIn", "Medium"]) expectTouchLink(html, label);
  });

  it("work index: each project card's title", () => {
    for (const project of getProjectsByTier("featured")) {
      const html = renderToStaticMarkup(<ProjectCard project={project} />);
      expectTouchLink(html, `/work/${project.slug}`);
    }
  });

  it("case study: the record's access links and both onward destinations", () => {
    const kivilcim = getProjectBySlug("kivilcim");
    const dropspot = getProjectBySlug("dropspot");
    if (!kivilcim || !dropspot) throw new Error("published projects missing");
    const hero = renderToStaticMarkup(<CaseStudyHero project={kivilcim} />);
    expectTouchLink(hero, "Repository");
    const neighbours = renderToStaticMarkup(
      <ProjectNeighbours previous={kivilcim} next={dropspot} />,
    );
    expectTouchLink(neighbours, `/work/${kivilcim.slug}`);
    expectTouchLink(neighbours, `/work/${dropspot.slug}`);
  });

  it("404: both suggested routes", () => {
    const html = renderToStaticMarkup(<NotFound />);
    expectTouchLink(html, "/");
    expectTouchLink(html, "/work");
  });

  it("homepage (frozen sections, FROZEN_BOUNDARY §5): the register titles, See all notes, the two About routes", () => {
    const projects = getProjectsByTier("featured");
    const register = renderToStaticMarkup(<SelectedSystems projects={projects} />);
    for (const project of projects) expectTouchLink(register, `/work/${project.slug}`);
    const notes = renderToStaticMarkup(<FieldNotes notes={[]} />);
    expectTouchLink(notes, "See all notes");
    const about = renderToStaticMarkup(<AboutPreview />);
    expectTouchLink(about, "/about");
    expectTouchLink(about, "LinkedIn");
  });

  it("a link inside a running sentence is left alone", () => {
    const html = renderToStaticMarkup(<FieldNotes notes={[]} />);
    // The archive link sits mid-sentence in the pending copy (an inline
    // link is exempt, and an inline-block would reflow the sentence).
    const anchors = find(html, "hakanduyar.medium.com");
    expect(anchors.length).toBeGreaterThan(0);
    for (const anchor of anchors) expect(anchor.element).not.toMatch(/touch-link/);
  });
});
