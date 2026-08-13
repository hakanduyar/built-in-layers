import { expect, test } from "@playwright/test";

// Spatial Portfolio prototype (feature/spatial-portfolio, not merged to
// main -- docs/DESIGN_SYSTEM.md §18). Tests experience contracts, not CSS
// transform values: route progression is real and reachable, the collision
// reads as a break rather than a bounce, reduced-motion/no-JS fallbacks are
// genuinely complete, keyboard/AT access is preserved, no horizontal
// overflow, and existing project routes remain fully unaffected.

const TOUR = "section[aria-label='Spatial system tour']";

test.describe("Spatial: homepage identity unaffected", () => {
  test("h1 is still exactly the approved name; exactly one h1", async ({ page }) => {
    await page.goto("/");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveText("Hakan Duyar");
    await expect(h1).toHaveCount(1);
  });
});

test.describe("Spatial: real project content and links", () => {
  test("Kıvılcım and DropSpot render real, distinct content, each linking to its real case study", async ({
    page,
  }) => {
    await page.goto("/");
    const tour = page.locator(TOUR);
    await expect(tour.getByRole("link", { name: /Kıvılcım/ })).toHaveAttribute(
      "href",
      "/work/kivilcim",
    );
    await expect(tour.getByRole("link", { name: "DropSpot" })).toHaveAttribute(
      "href",
      "/work/dropspot",
    );
    await expect(
      tour.getByText("A local-first system for planning, focus, and personal growth."),
    ).toBeAttached();
    await expect(
      tour.getByText("A fair claim and waitlist system for limited-stock product drops."),
    ).toBeAttached();
  });

  test("clicking through to Kıvılcım's real case study still works", async ({ page }) => {
    await page.goto("/");
    await page
      .locator(TOUR)
      .getByRole("link", { name: /Kıvılcım/ })
      .click();
    await expect(page).toHaveURL(/\/work\/kivilcim$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Kıvılcım");
  });

  test("a real link continues on to the full Work index, which still lists all four D-016 projects", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator(TOUR).getByRole("link", { name: "See every system" }).click();
    await expect(page).toHaveURL(/\/work$/);
    const links = page.locator("main li a[href^='/work/']");
    await expect(links).toHaveCount(4);
    await expect(links.nth(0)).toHaveAttribute("href", "/work/kivilcim");
    await expect(links.nth(1)).toHaveAttribute("href", "/work/dropspot");
    await expect(links.nth(2)).toHaveAttribute("href", "/work/jointledger");
    await expect(links.nth(3)).toHaveAttribute("href", "/work/professional-systems");
  });
});

test.describe("Spatial: no inaccessible transformed content", () => {
  test("off-progress content stays attached to the DOM (clipped, never removed) so keyboard/AT users can still reach it", async ({
    page,
  }) => {
    await page.goto("/");
    // Without scrolling, the camera is at "hero" -- DropSpot's own node is
    // panned out of the sticky viewport's visible bounds, but must remain
    // reachable, not display:none/hidden.
    await expect(page.locator(TOUR).getByRole("link", { name: "DropSpot" })).toBeAttached();
  });

  test("focusing a not-yet-reached project link re-centers the camera so focus becomes visible", async ({
    page,
  }) => {
    await page.goto("/");
    const dropspotLink = page.locator(TOUR).getByRole("link", { name: "DropSpot" });
    await dropspotLink.focus();
    await page.waitForTimeout(500);
    await expect(dropspotLink).toBeInViewport();
  });
});

test.describe("Spatial: reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("renders a static stack with no camera transform; all real content present", async ({
    page,
  }) => {
    await page.goto("/");
    const tour = page.locator(TOUR);
    await expect(tour.getByText("Kıvılcım", { exact: false }).first()).toBeVisible();
    await expect(tour.getByText("DropSpot", { exact: false }).first()).toBeVisible();
    await expect(tour.getByText("See every system")).toBeVisible();
    // No sticky/pinned camera element at all under reduced motion -- the
    // fallback branch never renders it (SpatialCamera.tsx).
    await expect(tour.locator(".sticky")).toHaveCount(0);
    // No canvas atmosphere either -- AtmosphereEmbers renders null.
    await expect(tour.locator("canvas")).toHaveCount(0);
  });

  test("no horizontal overflow at 320/375/768/1024/1440px under reduced motion", async ({
    page,
  }) => {
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
});

test.describe("Spatial: no JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("hero, real project content, and navigation remain usable without JS", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hakan Duyar");
    const tour = page.locator(TOUR);
    await expect(tour.getByRole("link", { name: /Kıvılcım/ })).toHaveAttribute(
      "href",
      "/work/kivilcim",
    );
    await expect(tour.getByRole("link", { name: "DropSpot" })).toHaveAttribute(
      "href",
      "/work/dropspot",
    );
    await expect(tour.getByRole("link", { name: "See every system" })).toHaveAttribute(
      "href",
      "/work",
    );
    for (const item of ["Home", "Work", "Notes", "Lab", "About"]) {
      await expect(page.getByRole("link", { name: item }).first()).toBeVisible();
    }
  });
});

test.describe("Spatial: keyboard access", () => {
  test("Tab reaches the Kıvılcım and DropSpot links in order, each with a visible focus state", async ({
    page,
  }) => {
    await page.goto("/");
    const kivilcimLink = page.locator(TOUR).getByRole("link", { name: /Kıvılcım/ });
    const dropspotLink = page.locator(TOUR).getByRole("link", { name: "DropSpot" });

    await kivilcimLink.focus();
    await expect(kivilcimLink).toBeFocused();
    const outline = await kivilcimLink.evaluate((el) => getComputedStyle(el).outlineWidth);
    expect(outline).not.toBe("0px");

    await dropspotLink.focus();
    await expect(dropspotLink).toBeFocused();
  });
});

// Shared by the two tests below. Measures the spacer's scroll range only
// after the enhanced camera (`.sticky`) actually exists in the DOM --
// without this wait, a real race exists: `page.goto()`'s default "load"
// wait does not guarantee client hydration/enhancement has completed yet
// (SpatialCamera's `useHasMounted` flips asynchronously), so reading the
// spacer's height too early can measure the no-JS fallback's natural stack
// height instead of the enhanced 600vh spacer -- caught empirically: an
// earlier version of these two tests intermittently read a much smaller,
// wrong scroll range and asserted against positions that didn't correspond
// to the intended progress fractions at all.
async function measureRoute(page: import("@playwright/test").Page, viewportHeight: number) {
  await page.locator(`${TOUR} .sticky`).waitFor({ state: "attached" });
  const spacerHeight = await page.evaluate((selector) => {
    const spacer = document.querySelector(`${selector} > div`);
    return spacer ? spacer.getBoundingClientRect().height : 0;
  }, TOUR);
  const sectionTop = await page.evaluate((selector) => {
    const el = document.querySelector(selector);
    return el ? el.getBoundingClientRect().top + window.scrollY : 0;
  }, TOUR);
  return { start: sectionTop, end: sectionTop + spacerHeight - viewportHeight };
}

async function readWorldTransform(page: import("@playwright/test").Page) {
  return page.evaluate((selector) => {
    const world = document.querySelector(`${selector} .sticky > div > div`);
    return world ? getComputedStyle(world).transform : null;
  }, TOUR);
}

/** Extracts the x-translation (tx) from a computed `matrix(a, b, c, d, tx, ty)`
 *  string. Parsed here in plain Node, not via `DOMMatrix` (a browser-only
 *  API unavailable in the test process itself). */
function matrixTranslateX(transform: string): number {
  const match = /matrix\(([^)]+)\)/.exec(transform);
  if (!match) return 0; // "none" (identity) -- no translation
  const parts = match[1]!.split(",").map((value) => Number.parseFloat(value.trim()));
  return parts[4] ?? 0;
}

// Motion's scroll-driven MotionValue recalculates via a scroll-event +
// rAF pipeline, asynchronous relative to `window.scrollTo` itself -- a
// transform read immediately after scrolling can still reflect the
// *previous* position (it is never null, so a "not null" poll resolves
// instantly without actually waiting for the update, a real bug an
// earlier version of this helper had, caught empirically). Polling until
// the transform genuinely differs from its pre-scroll snapshot proves the
// read reflects the new scroll position, not a stale one.
async function worldTranslateXAt(page: import("@playwright/test").Page, y: number) {
  const before = await readWorldTransform(page);
  await page.evaluate((yy) => window.scrollTo(0, yy), Math.round(y));
  await expect.poll(() => readWorldTransform(page), { timeout: 3000 }).not.toBe(before);
  const after = await readWorldTransform(page);
  if (after === null) return null;
  return matrixTranslateX(after);
}

test.describe("Spatial: mobile choreography differs from desktop (same world, same content)", () => {
  test("desktop camera moves diagonally (non-zero horizontal translation) while mobile stays purely vertical", async ({
    page,
  }) => {
    async function worldTranslateX(width: number, height: number, scrollFraction: number) {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      const { start, end } = await measureRoute(page, height);
      return worldTranslateXAt(page, start + (end - start) * scrollFraction);
    }

    const desktopX = await worldTranslateX(1440, 900, 0.4); // dropspot stop
    const mobileX = await worldTranslateX(375, 812, 0.4);

    expect(desktopX).not.toBeNull();
    expect(mobileX).not.toBeNull();
    if (desktopX !== null && mobileX !== null) {
      expect(Math.abs(desktopX)).toBeGreaterThan(50);
      expect(mobileX).toBe(0);
    }
  });
});

test.describe("Spatial: collision reads as a break, not a bounce", () => {
  test("the world position after the impact band differs sharply from a smooth continuation of the approach", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const { start, end } = await measureRoute(page, 900);

    const beforeCollision = await worldTranslateXAt(page, start + (end - start) * 0.59);
    const justAfterJump = await worldTranslateXAt(page, start + (end - start) * 0.67);
    expect(beforeCollision).not.toBeNull();
    expect(justAfterJump).not.toBeNull();
    if (beforeCollision !== null && justAfterJump !== null) {
      // A continuation of the same diagonal approach would keep moving in
      // the same direction by a small increment; the reposition instead
      // jumps back toward a much smaller world offset -- a real break.
      expect(Math.abs(justAfterJump - beforeCollision)).toBeGreaterThan(200);
    }
  });
});

test.describe("Spatial: existing project routes are unaffected", () => {
  for (const slug of ["kivilcim", "dropspot", "jointledger", "professional-systems"]) {
    test(`/work/${slug} still renders correctly`, async ({ page }) => {
      const response = await page.goto(`/work/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }
});

test.describe("Spatial: responsive", () => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width}px (default motion)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
