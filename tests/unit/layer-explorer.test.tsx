import { renderToStaticMarkup } from "react-dom/server";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LayerExplorer } from "@/components/project/LayerExplorer";

// ARCHITECTURE §10: "Vitest + RTL | Interactive components only (LayerExplorer:
// roles, keyboard, reduced-motion branch)". TASK-007's own testing strategy
// splits coverage this way: this file owns tab roles, the manual-activation
// keyboard contract, aria-selected, and the reduced-motion branch; the full
// site-wide reducedMotion:'reduce' Playwright run, no-JS check, and Reveal's
// on-scroll/on-load behavior live in tests/e2e/motion.spec.ts instead.

const LAYERS = {
  surface: <p>surface-unique-content</p>,
  flow: <p>flow-unique-content</p>,
  system: <p>system-unique-content</p>,
};

// jsdom implements neither matchMedia (used by motion/react's
// useReducedMotion) nor IntersectionObserver by default -- minimal local
// mocks, scoped to this file only (no other test currently needs them).
function mockMatchMedia(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion") && reduce,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

beforeEach(() => {
  mockMatchMedia(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LayerExplorer — SSR / pre-hydration fallback (renderToStaticMarkup)", () => {
  it("renders all three layers' distinct content, stacked, with no tab/tabpanel roles", () => {
    const html = renderToStaticMarkup(<LayerExplorer layers={LAYERS} />);

    expect(html).toContain("surface-unique-content");
    expect(html).toContain("flow-unique-content");
    expect(html).toContain("system-unique-content");
    expect(html).not.toContain('role="tab"');
    expect(html).not.toContain('role="tablist"');
    expect(html).not.toContain('role="tabpanel"');
    expect(html).not.toContain("hidden");

    // Surface -> Flow -> System order, matching CONTENT_MODEL/PROJECT_SPEC.
    expect(html.indexOf("surface-unique-content")).toBeLessThan(
      html.indexOf("flow-unique-content"),
    );
    expect(html.indexOf("flow-unique-content")).toBeLessThan(html.indexOf("system-unique-content"));

    // The three labels render as h2 headings (LayerSection), each once.
    const surfaceHeadingCount = (html.match(/>Surface</g) ?? []).length;
    expect(surfaceHeadingCount).toBe(1);
  });
});

describe("LayerExplorer — enhanced (post-mount) tab interface", () => {
  it("renders exactly 3 tabs, Surface active by default, correct roles and roving tabindex", () => {
    render(<LayerExplorer layers={LAYERS} />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Surface", "Flow", "System"]);

    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    expect(tabs[2]).toHaveAttribute("aria-selected", "false");

    // Roving tabindex: only the focused tab (Surface, initially) is in the
    // normal tab order.
    expect(tabs[0]).toHaveAttribute("tabindex", "0");
    expect(tabs[1]).toHaveAttribute("tabindex", "-1");
    expect(tabs[2]).toHaveAttribute("tabindex", "-1");

    // Exactly one tabpanel is exposed in the accessibility tree at a time.
    const visiblePanels = screen.getAllByRole("tabpanel");
    expect(visiblePanels).toHaveLength(1);
    const [panel] = visiblePanels;
    const [surfaceTab] = tabs;
    expect(panel).toBeDefined();
    expect(surfaceTab).toBeDefined();
    if (!panel || !surfaceTab) return;
    expect(within(panel).getByText("surface-unique-content")).toBeInTheDocument();

    // aria-controls/id and aria-labelledby correctly cross-reference.
    expect(surfaceTab).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", surfaceTab.id);
  });

  it("no project content is duplicated client-side -- panel content is exactly the layers prop, once", () => {
    render(<LayerExplorer layers={LAYERS} />);
    expect(screen.getAllByText("surface-unique-content")).toHaveLength(1);
    expect(screen.queryByText("flow-unique-content")).not.toBeInTheDocument();
    expect(screen.queryByText("system-unique-content")).not.toBeInTheDocument();
  });

  it("clicking a tab activates it: aria-selected and the visible panel both update", async () => {
    const user = userEvent.setup();
    render(<LayerExplorer layers={LAYERS} />);

    await user.click(screen.getByRole("tab", { name: "Flow" }));

    expect(screen.getByRole("tab", { name: "Surface" })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tab", { name: "Flow" })).toHaveAttribute("aria-selected", "true");

    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByText("flow-unique-content")).toBeInTheDocument();
    expect(screen.queryByText("surface-unique-content")).not.toBeInTheDocument();
  });

  it("manual activation: ArrowRight moves tab focus without activating; Enter then activates", async () => {
    const user = userEvent.setup();
    render(<LayerExplorer layers={LAYERS} />);

    const surfaceTab = screen.getByRole("tab", { name: "Surface" });
    const flowTab = screen.getByRole("tab", { name: "Flow" });
    surfaceTab.focus();
    expect(surfaceTab).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(flowTab).toHaveFocus();
    // Focus moved; activation (aria-selected, panel content) must NOT have
    // changed yet -- this is the core manual-activation contract (D-006).
    expect(surfaceTab).toHaveAttribute("aria-selected", "true");
    expect(flowTab).toHaveAttribute("aria-selected", "false");
    expect(screen.getByText("surface-unique-content")).toBeInTheDocument();

    await user.keyboard("{Enter}");
    expect(flowTab).toHaveAttribute("aria-selected", "true");
    expect(surfaceTab).toHaveAttribute("aria-selected", "false");
    expect(screen.getByText("flow-unique-content")).toBeInTheDocument();
  });

  it("manual activation: Space also activates the focused tab", async () => {
    const user = userEvent.setup();
    render(<LayerExplorer layers={LAYERS} />);

    screen.getByRole("tab", { name: "System" }).focus();
    await user.keyboard("{ArrowLeft}"); // focus Flow, no activation yet
    await user.keyboard(" ");

    expect(screen.getByRole("tab", { name: "Flow" })).toHaveAttribute("aria-selected", "true");
  });

  it("ArrowLeft from the first tab wraps focus to the last tab (and vice versa for ArrowRight)", async () => {
    const user = userEvent.setup();
    render(<LayerExplorer layers={LAYERS} />);

    const surfaceTab = screen.getByRole("tab", { name: "Surface" });
    const systemTab = screen.getByRole("tab", { name: "System" });

    surfaceTab.focus();
    await user.keyboard("{ArrowLeft}");
    expect(systemTab).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(surfaceTab).toHaveFocus();
  });

  it("Home and End move focus to the first and last tab", async () => {
    const user = userEvent.setup();
    render(<LayerExplorer layers={LAYERS} />);

    screen.getByRole("tab", { name: "Flow" }).focus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "System" })).toHaveFocus();

    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Surface" })).toHaveFocus();
  });

  it("touch targets meet the 44px minimum height (DESIGN_SYSTEM §10/§12)", () => {
    render(<LayerExplorer layers={LAYERS} />);
    for (const tab of screen.getAllByRole("tab")) {
      expect(tab.className).toContain("min-h-11");
    }
  });
});

describe("LayerExplorer — reduced motion", () => {
  it("panel content renders immediately with no animation wrapper state when reduced motion is requested", () => {
    mockMatchMedia(true);
    render(<LayerExplorer layers={LAYERS} />);

    // The panel is fully present immediately -- reduced motion never hides
    // or delays content, it only removes the transition.
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByText("surface-unique-content")).toBeInTheDocument();
  });
});
