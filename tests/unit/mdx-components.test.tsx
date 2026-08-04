import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { compileProjectMDX } from "@/lib/content/mdx";

// Shared TASK-004 case-study template — the intrinsic-element component
// mapping added to fix the "bare, unstyled h2" defect found reviewing
// TASK-005. Tested against ad-hoc MDX strings, independent of any single
// project's content, since this mapping is shared by every case study.

describe("MDX intrinsic-element mapping — headings", () => {
  it("h2 gets the approved section-heading role (DESIGN_SYSTEM heading-l)", async () => {
    const content = await compileProjectMDX("## A Section Heading\n\nBody text.");
    const html = renderToStaticMarkup(content);
    const match = html.match(/<h2 class="([^"]*)">A Section Heading<\/h2>/);
    expect(match).not.toBeNull();
    const classes = match?.[1] ?? "";
    expect(classes).toContain("text-heading-l");
    expect(classes).toContain("font-display");
  });

  it("h3 is visually subordinate to h2 (different, smaller role)", async () => {
    const content = await compileProjectMDX("### A Sub-heading\n\nBody text.");
    const html = renderToStaticMarkup(content);
    const match = html.match(/<h3 class="([^"]*)">A Sub-heading<\/h3>/);
    expect(match).not.toBeNull();
    const classes = match?.[1] ?? "";
    expect(classes).toContain("text-heading-m");
    expect(classes).not.toContain("text-heading-l");
  });
});

describe("MDX intrinsic-element mapping — body copy", () => {
  it("paragraphs receive the readable body typography role", async () => {
    const content = await compileProjectMDX("Just a plain paragraph of prose.");
    const html = renderToStaticMarkup(content);
    const match = html.match(/<p class="([^"]*)">Just a plain paragraph of prose\.<\/p>/);
    expect(match).not.toBeNull();
    expect(match?.[1]).toContain("text-body");
  });

  it("strong emphasis uses a meaningful, non-maximal weight", async () => {
    const content = await compileProjectMDX("Some **emphasized** text.");
    const html = renderToStaticMarkup(content);
    const match = html.match(/<strong class="([^"]*)">emphasized<\/strong>/);
    expect(match).not.toBeNull();
    expect(match?.[1]).toContain("font-semibold");
  });
});

describe("MDX intrinsic-element mapping — lists", () => {
  it("unordered lists render real <ul>/<li> with visible structure", async () => {
    const content = await compileProjectMDX("- First item\n- Second item");
    const html = renderToStaticMarkup(content);
    expect(html).toMatch(/<ul class="[^"]*list-disc[^"]*">/);
    expect(html).toContain("<li");
    expect(html).toContain("First item");
    expect(html).toContain("Second item");
  });

  it("ordered lists render real <ol>/<li> with visible structure", async () => {
    const content = await compileProjectMDX("1. First step\n2. Second step");
    const html = renderToStaticMarkup(content);
    expect(html).toMatch(/<ol class="[^"]*list-decimal[^"]*">/);
    expect(html).toContain("<li");
    expect(html).toContain("First step");
  });
});

describe("MDX intrinsic-element mapping — links", () => {
  it("renders a real, semantic, focusable <a> preserving its href", async () => {
    const content = await compileProjectMDX("See [the docs](https://example.com/docs).");
    const html = renderToStaticMarkup(content);
    const match = html.match(/<a class="([^"]*)" href="https:\/\/example\.com\/docs">/);
    expect(match).not.toBeNull();
    expect(match?.[1]).toContain("underline");
  });

  it("does not invent external-link behavior (no target/rel added here)", async () => {
    const content = await compileProjectMDX("See [the docs](https://example.com/docs).");
    const html = renderToStaticMarkup(content);
    expect(html).not.toContain("target=");
    expect(html).not.toContain("rel=");
  });
});

describe("MDX intrinsic-element mapping — custom whitelist unaffected", () => {
  it("Figure still renders with real alt text", async () => {
    const content = await compileProjectMDX(
      '<Figure src="/images/projects/kivilcim/placeholder-asset-pending.svg" alt="Placeholder — pending" caption="pending" />',
    );
    const html = renderToStaticMarkup(content);
    expect(html).toContain("placeholder-asset-pending.svg");
    expect(html).toContain('alt="Placeholder — pending"');
  });

  it("Note still renders as an aside", async () => {
    const content = await compileProjectMDX("<Note>A note.</Note>");
    const html = renderToStaticMarkup(content);
    expect(html).toContain("<aside");
    expect(html).toContain("A note.");
  });

  it("DecisionCallout still renders its title and body", async () => {
    const content = await compileProjectMDX(
      '<DecisionCallout title="A decision">Body.</DecisionCallout>',
    );
    const html = renderToStaticMarkup(content);
    expect(html).toContain("A decision");
    expect(html).toContain("Body.");
  });
});

describe("MDX security posture — unaffected by the new mappings", () => {
  // compileMDX compiles lazily: it resolves with a component tree even for
  // blocked/invalid content — the actual behavior only surfaces on render.
  it("still blocks JS expressions (blockJS/blockDangerousJS remain enabled)", async () => {
    const content = await compileProjectMDX("Some text {1 + 1} more text.");
    const html = renderToStaticMarkup(content);
    // blockJS fails safe by neutralizing the expression rather than
    // evaluating it — the point is that "2" (the evaluated result) never
    // appears, not that compilation throws.
    expect(html).not.toContain("2");
    expect(html).toContain("Some text");
    expect(html).toContain("more text.");
  });

  it("does not resolve an arbitrary, non-whitelisted component name", async () => {
    const content = await compileProjectMDX("<TotallyArbitraryComponent />");
    expect(() => renderToStaticMarkup(content)).toThrow();
  });
});
