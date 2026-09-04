import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { Figure } from "@/components/ui/Figure";
import { FigureInspect, INSPECT_PLATE_WIDTH } from "@/components/ui/FigureInspect";
import { compileProjectMDX } from "@/lib/content/mdx";

// V13 mobile gate (M1): the figure inspector. Below `lg` every case-study
// figure carries an INSPECT control that opens the same asset in a native
// modal dialog at a width it can be read at. These tests pin the contract
// the composition depends on: the prop is opt-in and additive, the MDX
// mapping and the hero opt in, and the plate is laid out at the width the
// smallest verified label reaches the mono-meta floor at.

const DIAGRAM = "/images/projects/kivilcim/local-first-architecture.svg";

beforeAll(() => {
  // jsdom implements <dialog> as an element but not its modal API.
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

afterEach(cleanup);

describe("Figure `inspect` — opt-in and additive", () => {
  it("renders exactly what it did before when the prop is absent", () => {
    const html = renderToStaticMarkup(
      <Figure src={DIAGRAM} alt="Architecture" caption="Verified diagram." index={2} />,
    );
    expect(html).not.toContain("Inspect");
    expect(html).not.toContain("<dialog");
    expect(html).toContain("FIG 02 — Verified diagram.");
    expect(html.match(/<img /g)).toHaveLength(1);
  });

  it("keeps the caption inside the <figcaption> and adds the control beside it", () => {
    const html = renderToStaticMarkup(
      <Figure src={DIAGRAM} alt="Architecture" caption="Verified diagram." index={2} inspect />,
    );
    const figcaption = html.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/)?.[1] ?? "";
    expect(figcaption).toContain("FIG 02 — Verified diagram.");
    expect(figcaption).toMatch(/<button[^>]*data-figure-inspect[^>]*>Inspect<\/button>/);
    // The control hides at `lg`; the desktop column never shows it.
    expect(figcaption).toMatch(/<button[^>]*class="[^"]*lg:hidden[^"]*"/);
    // The plate's <img> is mounted only while the dialog is open.
    expect(html.match(/<img /g)).toHaveLength(1);
    expect(html).toContain("<dialog");
  });

  it("gives an uncaptioned figure a control row that is not a <figcaption>", () => {
    const html = renderToStaticMarkup(<Figure src={DIAGRAM} alt="Architecture" inspect />);
    expect(html).not.toContain("<figcaption");
    expect(html).toMatch(/<button[^>]*data-figure-inspect[^>]*>Inspect<\/button>/);
  });
});

describe("FigureInspect — the plate", () => {
  it("opens the same asset at the reading width and closes back to the trigger", () => {
    render(
      <FigureInspect
        src={DIAGRAM}
        alt="Architecture"
        title="FIG 01 — Verified diagram."
        width={1600}
        height={1000}
      />,
    );
    const trigger = screen.getByRole("button", { name: /inspect/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(document.querySelectorAll("dialog img")).toHaveLength(0);

    fireEvent.click(trigger);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const plate = document.querySelector<HTMLImageElement>("dialog img");
    expect(plate).not.toBeNull();
    expect(plate?.getAttribute("src")).toBe(DIAGRAM);
    expect(plate?.getAttribute("alt")).toBe("Architecture");
    expect(plate?.style.width).toBe(`${INSPECT_PLATE_WIDTH}px`);
    expect(screen.getByText("FIG 01 — Verified diagram.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(document.querySelectorAll("dialog img")).toHaveLength(0);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(trigger);
  });

  it("never lays a plate out wider than the asset itself", () => {
    render(
      <FigureInspect src="/images/x.webp" alt="Screen" title="Screen" width={1200} height={600} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /inspect/i }));
    expect(document.querySelector<HTMLImageElement>("dialog img")?.style.width).toBe("1200px");
  });

  it("lays the 1600-unit diagrams out so their smallest label clears the 12px floor", () => {
    // jointledger/book-data-model.svg carries the smallest label in the
    // verified set: 14 of 1600 units.
    expect((14 / 1600) * INSPECT_PLATE_WIDTH).toBeGreaterThanOrEqual(12);
  });
});

describe("the case-study figures opt in", () => {
  it("MDX <Figure> renders the inspector control with the caption as its title", async () => {
    // No `index` here: under D-001's blockJS an MDX `index={1}` is a JS
    // expression and is neutralised, so authored figures carry no FIG number
    // today (recorded in the V13 mobile return as a pre-existing finding).
    const content = await compileProjectMDX(
      `<Figure src="${DIAGRAM}" alt="Architecture" caption="Verified diagram." />`,
    );
    const html = renderToStaticMarkup(content);
    expect(html).toMatch(/<button[^>]*data-figure-inspect[^>]*>Inspect<\/button>/);
    expect(html).toMatch(/<figcaption[^>]*><span class="min-w-0">Verified diagram\.<\/span>/);
    expect(html).toMatch(/<p id="[^"]+"[^>]*>Verified diagram\.<\/p>/);
  });
});
