import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DecisionCallout } from "@/components/ui/DecisionCallout";
import { Note } from "@/components/ui/Note";
import { compileProjectMDX } from "@/lib/content/mdx";

// V13 mobile gate (M2): the reading measure is a token, `--container-measure`,
// consumed as `max-w-measure`. It is 42rem (DESIGN_SYSTEM §3/§6, the desktop
// prose measure) and re-declared to 34rem below `lg`, so running text reads at
// the right length whether it sits in the desktop's 12-column composition or
// alone on a tablet. These tests pin the token and the places that consume
// it; the rendered widths themselves are measured in the browser
// (docs/review/v13-mobile-gate/after).

const css = readFileSync(path.join(process.cwd(), "styles/globals.css"), "utf8");

describe("the measure token (styles/globals.css)", () => {
  it("declares 42rem inside @theme so `max-w-measure` exists as a utility", () => {
    const theme = css.match(/@theme \{([\s\S]*?)\n\}/)?.[1] ?? "";
    expect(theme).toMatch(/--container-measure:\s*42rem;/);
  });

  it("re-declares the token to 34rem below `lg` (64rem) and nowhere else", () => {
    // `:root` inside the media query rather than a second utility: one class
    // name, one meaning, two frames.
    expect(css).toMatch(
      /@media \(width < 64rem\) \{\s*:root \{\s*--container-measure:\s*34rem;\s*\}\s*\}/,
    );
    expect(css.match(/--container-measure:/g)).toHaveLength(2);
  });
});

describe("running text consumes the measure", () => {
  it("MDX paragraphs, lists and headings carry `max-w-measure`", async () => {
    const content = await compileProjectMDX(
      "## Heading\n\n### Sub\n\nA paragraph.\n\n- one\n- two\n\n1. first\n2. second",
    );
    const html = renderToStaticMarkup(content);
    for (const tag of ["h2", "h3", "p", "ul", "ol"]) {
      expect(html).toMatch(new RegExp(`<${tag} class="[^"]*max-w-measure[^"]*"`));
    }
  });

  it("Note and DecisionCallout carry `max-w-measure` on their outer element", () => {
    expect(renderToStaticMarkup(<Note>A note.</Note>)).toMatch(
      /^<aside class="[^"]*max-w-measure[^"]*"/,
    );
    expect(
      renderToStaticMarkup(<DecisionCallout title="A decision">Body.</DecisionCallout>),
    ).toMatch(/^<div class="[^"]*max-w-measure[^"]*"/);
  });
});
