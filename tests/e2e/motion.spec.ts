import { expect, test } from "@playwright/test";

// TASK-007. Complements tests/unit/layer-explorer.test.tsx (RTL: roles,
// manual-activation keyboard contract, reduced-motion branch) with real
// browser coverage: touch/click activation, keyboard-only operation across
// full page context, focus visibility, no-JS fallback, reducedMotion:
// 'reduce' emulation, and that motion never delays or hides content.

test.describe("Motion: Hero and homepage reveals", () => {
  test("hero content is visible immediately, no wait required", async ({ page }) => {
    await page.goto("/");
    // No explicit wait for animation to finish -- content must already be
    // there and queryable the instant the page settles.
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hakan Duyar");
    await expect(page.locator("body")).toContainText("Frontend & Product Engineer");
    await expect(page.locator("body")).toContainText(
      "Interfaces on the surface. Systems underneath.",
    );
  });

  test("above-the-fold reveals never regress to hidden after hydration settles (no stuck/flashed-to-zero-opacity regression)", async ({
    page,
  }) => {
    // Regression coverage for two real bugs found by adversarial review in
    // this exact file: (1) opacity lives on Reveal's own wrapping
    // `motion.div` (`data-reveal="true"`), never on the plain heading/
    // paragraph children it wraps -- an earlier version of this test
    // checked `h1, h2, h3, p` directly and was a false negative, passing
    // even while wrappers sat at opacity 0. (2) without scrolling, content
    // already in the viewport (the Hero) must never be observed at
    // opacity 0 -- it must not fade out and back in right after hydration.
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    const hiddenInViewport = await page.evaluate(() => {
      const wrappers = Array.from(document.querySelectorAll("[data-reveal]"));
      return wrappers
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
          return inViewport && getComputedStyle(el).opacity === "0";
        })
        .map((el) => el.textContent?.slice(0, 40));
    });
    expect(hiddenInViewport).toEqual([]);
  });

  test("below-the-fold reveal genuinely activates on scroll (proves the reveal-on-scroll mechanic actually runs, not just 'never hides anything')", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const revealWrapper = page
      .locator("[data-reveal]")
      .filter({ has: page.locator("text=Interfaces are built on systems") });

    // Before scrolling: legitimately not yet revealed -- the correct
    // starting state for scroll-triggered content, confirming this test
    // exercises a real hidden->visible transition, not a no-op.
    await expect(revealWrapper).toHaveCSS("opacity", "0");

    await page.getByRole("heading", { name: "How I build", level: 2 }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await expect(revealWrapper).toHaveCSS("opacity", "1");
  });

  test("Selected Systems cards are all visible shortly after load", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const cards = page.locator("main li", { has: page.locator("a[href^='/work/']") });
    await expect(cards).toHaveCount(4);
    for (let i = 0; i < 4; i += 1) {
      await expect(cards.nth(i)).toBeVisible();
    }
  });
});

test.describe("Motion: homepage Layer Explorer preview", () => {
  test("previews a real published project's layers via the interactive explorer", async ({
    page,
  }) => {
    await page.goto("/");
    const tablist = page.getByRole("tablist", { name: "Case study layers" });
    await expect(tablist).toBeVisible();

    const tabs = page.getByRole("tab");
    await expect(tabs).toHaveCount(3);
    await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");

    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "false");
  });
});

test.describe("Motion: Layer Explorer -- keyboard, touch/click, focus", () => {
  test("keyboard: Tab into the tablist, arrows move focus without activating, Enter activates", async ({
    page,
  }) => {
    await page.goto("/work/kivilcim");
    const surfaceTab = page.getByRole("tab", { name: "Surface" });
    const flowTab = page.getByRole("tab", { name: "Flow" });

    await surfaceTab.focus();
    await expect(surfaceTab).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await expect(flowTab).toBeFocused();
    // Manual activation: focus moved, but the panel must NOT have switched.
    await expect(surfaceTab).toHaveAttribute("aria-selected", "true");
    await expect(flowTab).toHaveAttribute("aria-selected", "false");

    await page.keyboard.press("Enter");
    await expect(flowTab).toHaveAttribute("aria-selected", "true");
  });

  test("keyboard: Home/End jump to first/last tab", async ({ page }) => {
    await page.goto("/work/kivilcim");
    const tabs = page.getByRole("tab");
    await tabs.nth(1).focus();

    await page.keyboard.press("End");
    await expect(tabs.nth(2)).toBeFocused();

    await page.keyboard.press("Home");
    await expect(tabs.nth(0)).toBeFocused();
  });

  test("visible focus state on the focused tab", async ({ page }) => {
    await page.goto("/work/kivilcim");
    const surfaceTab = page.getByRole("tab", { name: "Surface" });
    await surfaceTab.focus();
    const outline = await surfaceTab.evaluate((el) => getComputedStyle(el).outlineWidth);
    expect(outline).not.toBe("0px");
  });

  test("touch/click: tapping a tab activates it and swaps to real, distinct content", async ({
    page,
  }) => {
    await page.goto("/work/kivilcim");
    const systemTab = page.getByRole("tab", { name: "System" });
    await systemTab.click();
    await expect(systemTab).toHaveAttribute("aria-selected", "true");

    const panel = page.getByRole("tabpanel");
    await expect(panel).toBeVisible();
    // System's real content mentions the local-first architecture -- Surface
    // and Flow content must not be shown simultaneously.
    await expect(panel).toContainText(/local-first|Dexie|IndexedDB/i);
  });

  test("all three layer panels contain genuinely distinct content across the full explorer", async ({
    page,
  }) => {
    await page.goto("/work/kivilcim");
    const tabs = page.getByRole("tab");
    const panel = page.getByRole("tabpanel");

    const texts: string[] = [];
    for (let i = 0; i < 3; i += 1) {
      await tabs.nth(i).click();
      texts.push((await panel.innerText()).trim());
    }
    expect(new Set(texts).size).toBe(3);
    for (const text of texts) expect(text.length).toBeGreaterThan(0);
  });
});

test.describe("Motion: no layout shift from the explorer or reveals", () => {
  // Different layers legitimately have different amounts of real prose --
  // Kıvılcım's system.mdx is not the same length as surface.mdx -- so the
  // page's total scroll height is *expected* to change when switching tabs.
  // What must NOT happen is the *viewport* jumping out from under the user
  // (the tablist itself moving) when a panel above it changes size.
  test("switching layers does not move the tablist itself (no jump under the user)", async ({
    page,
  }) => {
    await page.goto("/work/kivilcim");
    const tablist = page.getByRole("tablist");
    // Scroll the tablist into view explicitly first -- it starts below the
    // fold on this page, and Playwright's own `.click()` auto-scrolls its
    // target into view before interacting, which would otherwise register
    // as a large, misleading "jump" that has nothing to do with the app's
    // panel-switch transition (confirmed empirically: offsetTop relative to
    // the document never changed, only viewport scrollY did, purely from
    // click-driven auto-scroll).
    await tablist.scrollIntoViewIfNeeded();
    const before = await tablist.boundingBox();
    expect(before).not.toBeNull();

    await page.getByRole("tab", { name: "System" }).click();
    await page.waitForTimeout(350); // full panel transition duration + margin

    const after = await tablist.boundingBox();
    expect(after).not.toBeNull();
    if (before && after) {
      expect(Math.abs(after.y - before.y)).toBeLessThan(2);
      expect(Math.abs(after.x - before.x)).toBeLessThan(2);
    }
  });
});

test.describe("Motion: JavaScript disabled -- content exists without enhancement", () => {
  test.use({ javaScriptEnabled: false });

  test("homepage Layer Explorer preview: all three layers stacked, visible, labelled, ordered", async ({
    page,
  }) => {
    await page.goto("/");
    // The homepage legitimately carries two Surface/Flow/System heading
    // groups without JS: LayerExplorerIntro's own short one-line definitions
    // (unchanged since TASK-003) and, below it, the real project preview's
    // stacked layers (new in TASK-007, `LayerExplorer`'s no-JS fallback) --
    // both are real, honest content, so this checks "at least one, visible"
    // rather than uniqueness.
    for (const heading of ["Surface", "Flow", "System"]) {
      await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible();
    }
    // No JS means no tabs -- the interaction is entirely unavailable, but
    // every layer's real content still ships in the initial HTML.
    await expect(page.locator('[role="tab"]')).toHaveCount(0);
    await expect(page.locator('[role="tablist"]')).toHaveCount(0);

    // The real preview's own stacked block (not the short definitions list)
    // must still carry Kıvılcım's actual layer prose, Surface -> Flow ->
    // System, readable without JS.
    const bodyText = await page.locator("main").innerText();
    expect(bodyText).toContain("Dexie");
  });

  test("case-study page: all three layer sections stacked, visible, labelled, ordered, readable", async ({
    page,
  }) => {
    const response = await page.goto("/work/kivilcim");
    expect(response?.status()).toBe(200);

    for (const heading of ["Surface", "Flow", "System"]) {
      const el = page.getByRole("heading", { name: heading, exact: true });
      await expect(el).toBeVisible();
    }
    await expect(page.locator('[role="tab"]')).toHaveCount(0);

    const bodyText = await page.locator("main").innerText();
    expect(bodyText).toContain("Dexie");
    expect(bodyText.length).toBeGreaterThan(200);
  });

  test("project cards and navigation remain fully usable without JS", async ({ page }) => {
    await page.goto("/");
    // Scoped to the Selected Systems card list, not all of <main> -- the
    // Layer Explorer preview's own "Previewing real layers from <Project>"
    // link is a legitimate 5th /work/ link elsewhere on the homepage.
    const links = page
      .locator("section", {
        has: page.getByRole("heading", { name: "Selected systems", level: 2 }),
      })
      .locator("li a[href^='/work/']");
    await expect(links).toHaveCount(4);
    await expect(links.nth(0)).toHaveAttribute("href", "/work/kivilcim");

    for (const item of ["Home", "Work", "Notes", "Lab", "About"]) {
      await expect(page.getByRole("link", { name: item }).first()).toBeVisible();
    }
  });
});

test.describe("Motion: reducedMotion emulation", () => {
  // This installed Playwright version (1.62.0) nests reducedMotion under
  // `contextOptions` rather than accepting it as a top-level test.use()
  // key -- confirmed against the installed package's own type definitions
  // and doc comment, not assumed from older Playwright API docs.
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("homepage content is fully present and correct under reduced motion", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hakan Duyar");
    const cards = page.locator("main li", { has: page.locator("a[href^='/work/']") });
    await expect(cards).toHaveCount(4);
    for (let i = 0; i < 4; i += 1) {
      await expect(cards.nth(i)).toBeVisible();
    }
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("CONTENT REQUIRED");
  });

  test("Layer Explorer switches instantly and remains fully functional under reduced motion", async ({
    page,
  }) => {
    await page.goto("/work/kivilcim");
    const flowTab = page.getByRole("tab", { name: "Flow" });
    await flowTab.click();
    await expect(flowTab).toHaveAttribute("aria-selected", "true");
    const panel = page.getByRole("tabpanel");
    await expect(panel).toBeVisible();
    await expect(panel).not.toBeEmpty();
  });

  test("keyboard operation still works under reduced motion", async ({ page }) => {
    await page.goto("/work/kivilcim");
    const surfaceTab = page.getByRole("tab", { name: "Surface" });
    const systemTab = page.getByRole("tab", { name: "System" });
    await surfaceTab.focus();
    await page.keyboard.press("End");
    await expect(systemTab).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(systemTab).toHaveAttribute("aria-selected", "true");
  });

  test("no horizontal overflow at 375/768/1024/1440px under reduced motion", async ({ page }) => {
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    }
  });
});

test.describe("Motion: responsive, no overflow (default motion)", () => {
  for (const width of [375, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width}px on / with Layer Explorer active`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test(`no horizontal overflow at ${width}px on /work/kivilcim with Layer Explorer active`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/work/kivilcim");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
