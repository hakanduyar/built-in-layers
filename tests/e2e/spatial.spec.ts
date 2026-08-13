import { expect, test } from "@playwright/test";

// Spatial Portfolio V2 (feature/spatial-portfolio-v2, not merged to main --
// docs/DESIGN_SYSTEM.md §18). Tests experience contracts, not CSS transform
// values: scenes own real viewport territory, evidence is not a thumbnail,
// the collision reads as a break rather than a bounce, the atmosphere is
// scene-scoped and reduced-motion-safe, fallbacks are complete, keyboard/AT
// access is preserved, and existing project routes stay untouched.
//
// Deliberately no assertions on exact world coordinates or transform
// matrices-as-such: those are art direction and must stay free to move.
// Where a number appears it is a deliberately loose art-direction bound
// (e.g. "not a thumbnail", "not microtext").

const TOUR = "section[aria-label='Spatial system tour']";

async function measureRoute(page: import("@playwright/test").Page, viewportHeight: number) {
  // `page.goto`'s load event does not guarantee hydration has finished, and
  // before it does the fallback (not the camera) is in the DOM -- wait for
  // the enhanced camera before measuring anything.
  await page.locator(`${TOUR} .sticky`).waitFor({ state: "attached" });
  const spacerHeight = await page.evaluate(
    (selector) => document.querySelector(`${selector} > div`)?.getBoundingClientRect().height ?? 0,
    TOUR,
  );
  const sectionTop = await page.evaluate((selector) => {
    const el = document.querySelector(selector);
    return el ? el.getBoundingClientRect().top + window.scrollY : 0;
  }, TOUR);
  return { start: sectionTop, end: sectionTop + spacerHeight - viewportHeight, spacerHeight };
}

async function readWorldTransform(page: import("@playwright/test").Page) {
  return page.evaluate((selector) => {
    const world = document.querySelector(`${selector} .sticky > div > div`);
    return world ? getComputedStyle(world).transform : null;
  }, TOUR);
}

/** Extracts tx from a computed `matrix(a, b, c, d, tx, ty)`. Parsed in Node
 *  -- `DOMMatrix` is browser-only and not available in the test process. */
function matrixTranslateX(transform: string): number {
  const match = /matrix\(([^)]+)\)/.exec(transform);
  if (!match) return 0;
  return Number.parseFloat(match[1]!.split(",")[4]!.trim()) || 0;
}

/** Scrolls to a progress point and waits until the scroll-driven transform
 *  has genuinely changed -- Motion updates via a scroll+rAF pipeline, so an
 *  immediate read can still return the previous position. */
async function worldTranslateXAt(page: import("@playwright/test").Page, y: number) {
  const before = await readWorldTransform(page);
  await page.evaluate((yy) => window.scrollTo(0, Math.round(yy)), y);
  await expect.poll(() => readWorldTransform(page), { timeout: 3000 }).not.toBe(before);
  const after = await readWorldTransform(page);
  return after === null ? null : matrixTranslateX(after);
}

test.describe("Spatial V2: page identity unaffected", () => {
  test("h1 is still exactly the approved name; exactly one h1", async ({ page }) => {
    await page.goto("/");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveText("Hakan Duyar");
    await expect(h1).toHaveCount(1);
  });
});

test.describe("Spatial V2: scenes are composed from real loader data, not cards", () => {
  test("no ProjectCard list markup exists anywhere in the spatial world", async ({ page }) => {
    await page.goto("/");
    // ProjectCard renders each project as an <li>. A scene is not a list
    // item among siblings -- this is the structural contract that keeps V1's
    // rejected "tiny floating cards" from creeping back in.
    await expect(page.locator(`${TOUR} li`)).toHaveCount(0);
  });

  test("each project scene renders its real title, description, tech, and honest asset caption", async ({
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
    // Real loader-fed tech lists, not retyped copy.
    await expect(tour.getByText(/Dexie/)).toBeAttached();
    await expect(tour.getByText(/PostgreSQL/)).toBeAttached();
    // D-019 honesty: the diagram scene must still say it is not a screenshot.
    await expect(tour.getByText(/Verified architecture diagram/i)).toBeAttached();
  });

  test("Kıvılcım keeps its Turkish orthography -- never CSS-uppercased into KIVILCIM", async ({
    page,
  }) => {
    await page.goto("/");
    const title = page.locator(TOUR).getByRole("link", { name: /Kıvılcım/ });
    await expect(title).toHaveText(/Kıvılcım/);
    await expect(title).not.toHaveCSS("text-transform", "uppercase");
  });
});

test.describe("Spatial V2: scene framing owns real viewport territory", () => {
  test("the focal evidence plate is viewport-scale, not a thumbnail, and titles are not microtext", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const { start, end } = await measureRoute(page, 900);

    // Kıvılcım's focal moment.
    await worldTranslateXAt(page, start + (end - start) * 0.3);

    const plate = page.locator(`${TOUR} img`).first();
    const box = await plate.boundingBox();
    expect(box, "expected a bounding box for the focal evidence plate").not.toBeNull();
    if (box) {
      // V1's cards capped images near 384px (~27% of a 1440px viewport).
      // A scene's evidence has to genuinely occupy the frame. Loose lower
      // bound on purpose -- this asserts "not a thumbnail", not a layout.
      expect(box.width).toBeGreaterThan(1440 * 0.45);
    }

    const titleSize = await page
      .locator(`${TOUR} h3`)
      .first()
      .evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));
    expect(titleSize).toBeGreaterThan(36);
  });

  test("total route length stays controlled -- no return to V1's 600vh blind spacer", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const { spacerHeight } = await measureRoute(page, 900);
    expect(spacerHeight).toBeGreaterThan(900);
    expect(spacerHeight).toBeLessThan(900 * 4.5);
  });
});

test.describe("Spatial V2: atmosphere", () => {
  test("V1's ember canvas is gone entirely", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(`${TOUR} canvas`)).toHaveCount(0);
  });

  test("the erosion atmosphere exists under default motion", async ({ page }) => {
    await page.goto("/");
    await page.locator(`${TOUR} .sticky`).waitFor({ state: "attached" });
    const fragments = page.locator("[data-erosion-fragments]");
    expect(await fragments.count()).toBeGreaterThan(0);
  });
});

test.describe("Spatial V2: no inaccessible transformed content", () => {
  test("off-camera content stays attached to the DOM so keyboard/AT users can reach it", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator(TOUR).getByRole("link", { name: "DropSpot" })).toBeAttached();
  });

  test("focusing a not-yet-reached project link re-centers the camera so focus becomes visible", async ({
    page,
  }) => {
    await page.goto("/");
    // This contract is about the enhanced camera specifically, so wait for
    // it to exist. Without this the test can focus during hydration, while
    // the linear fallback is still mounted, and then assert against a
    // camera that only appeared afterwards -- a race in the test, not in
    // the component (it surfaced only on WebKit, only under full-suite
    // parallel load).
    await page.locator(`${TOUR} .sticky`).waitFor({ state: "attached" });
    const dropspotLink = page.locator(TOUR).getByRole("link", { name: "DropSpot" });
    await dropspotLink.focus();
    await expect(dropspotLink).toBeInViewport({ timeout: 10_000 });
  });

  test("Tab reaches project links with a visible focus state", async ({ page }) => {
    await page.goto("/");
    const kivilcimLink = page.locator(TOUR).getByRole("link", { name: /Kıvılcım/ });
    await kivilcimLink.focus();
    await expect(kivilcimLink).toBeFocused();
    const outline = await kivilcimLink.evaluate((el) => getComputedStyle(el).outlineWidth);
    expect(outline).not.toBe("0px");
  });
});

test.describe("Spatial V2: collision reads as a scene break, not a bounce", () => {
  test("world position after the break differs sharply from a continuation of the approach", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const { start, end } = await measureRoute(page, 900);

    const beforeCollision = await worldTranslateXAt(page, start + (end - start) * 0.8);
    const afterBreak = await worldTranslateXAt(page, start + (end - start) * 0.92);
    expect(beforeCollision).not.toBeNull();
    expect(afterBreak).not.toBeNull();
    if (beforeCollision !== null && afterBreak !== null) {
      // The whole route travels left-to-right; the reposition lands far back
      // to the left. Nothing about this reads as the camera continuing on.
      expect(Math.abs(afterBreak - beforeCollision)).toBeGreaterThan(400);
    }
  });

  test("a scene-break panel bridges the cut so the jump is never witnessed", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const { start, end } = await measureRoute(page, 900);

    // At the cut the panel must be covering the viewport; well away from it
    // the panel must be parked entirely off-screen.
    await page.evaluate((y) => window.scrollTo(0, Math.round(y)), start + (end - start) * 0.87);
    await page.waitForTimeout(350);
    const covering = await page.locator(`${TOUR} .sticky > div`).last().boundingBox();
    expect(covering).not.toBeNull();

    const panelXAtCut = await page.evaluate((selector) => {
      const panels = document.querySelectorAll(`${selector} .sticky > div`);
      const panel = panels[panels.length - 1];
      if (!panel) return null;
      const m = /matrix\(([^)]+)\)/.exec(getComputedStyle(panel).transform);
      return m ? Number.parseFloat(m[1]!.split(",")[4]!) : 0;
    }, TOUR);
    expect(panelXAtCut).not.toBeNull();
    if (panelXAtCut !== null) expect(Math.abs(panelXAtCut)).toBeLessThan(80);
  });
});

test.describe("Spatial V2: reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("renders a designed linear composition -- no camera, no atmosphere, all real content", async ({
    page,
  }) => {
    await page.goto("/");
    const tour = page.locator(TOUR);
    await expect(tour.getByRole("link", { name: /Kıvılcım/ })).toBeVisible();
    await expect(tour.getByRole("link", { name: "DropSpot" })).toBeVisible();
    await expect(tour.getByText("See every system")).toBeVisible();
    // No pinned camera, no canvas, and no drifting fragments.
    await expect(tour.locator(".sticky")).toHaveCount(0);
    await expect(tour.locator("canvas")).toHaveCount(0);
    await expect(page.locator("[data-erosion-fragments]")).toHaveCount(0);
    // Still a composed scene, not a stripped dump: the evidence plates and
    // their honest captions survive.
    expect(await tour.locator("img").count()).toBeGreaterThanOrEqual(2);
    await expect(tour.getByText(/Verified architecture diagram/i)).toBeVisible();
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

test.describe("Spatial V2: no JavaScript", () => {
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

test.describe("Spatial V2: mobile choreography", () => {
  test("mobile camera stays on a single vertical axis while desktop travels diagonally", async ({
    page,
  }) => {
    async function translateXAtFocalScene(width: number, height: number) {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      const { start, end } = await measureRoute(page, height);
      return worldTranslateXAt(page, start + (end - start) * 0.55);
    }

    const desktopX = await translateXAtFocalScene(1440, 900);
    const mobileX = await translateXAtFocalScene(375, 812);

    expect(desktopX).not.toBeNull();
    expect(mobileX).not.toBeNull();
    if (desktopX !== null && mobileX !== null) {
      expect(Math.abs(desktopX)).toBeGreaterThan(50);
      expect(mobileX).toBe(0);
    }
  });

  test("project scenes stay readable at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const { start, end } = await measureRoute(page, 812);
    await worldTranslateXAt(page, start + (end - start) * 0.3);

    const titleSize = await page
      .locator(`${TOUR} h3`)
      .first()
      .evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));
    expect(titleSize).toBeGreaterThan(24);

    const plate = await page.locator(`${TOUR} img`).first().boundingBox();
    expect(plate).not.toBeNull();
    if (plate) expect(plate.width).toBeGreaterThan(375 * 0.6);
  });
});

test.describe("Spatial V2: existing project routes are unaffected", () => {
  for (const slug of ["kivilcim", "dropspot", "jointledger", "professional-systems"]) {
    test(`/work/${slug} still renders correctly`, async ({ page }) => {
      const response = await page.goto(`/work/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }

  test("the Work index still lists all four projects in D-016 order", async ({ page }) => {
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

test.describe("Spatial V2: responsive", () => {
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
