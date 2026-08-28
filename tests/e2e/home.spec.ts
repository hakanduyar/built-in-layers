import { expect, test } from "@playwright/test";

test.describe("Home: hero", () => {
  test("h1 is exactly the approved name, with the approved title and primary line present", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hakan Duyar");
    await expect(page.locator("body")).toContainText("Frontend & Product Engineer");
    await expect(page.locator("body")).toContainText(
      "Interfaces on the surface. Systems underneath.",
    );
  });

  test("exactly one h1 on the page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });
});

test.describe("Home: positioning statement", () => {
  test("approved supporting statement is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toContainText(
      "I design clear interfaces and build the systems that make them work.",
    );
  });
});

// Spatial Portfolio prototype (feature/spatial-portfolio, not merged to
// main -- docs/DESIGN_SYSTEM.md §18): this branch replaces Hero,
// PositioningStatement, LayerExplorerIntro, and SelectedSystems with
// `<SpatialExperience>`. The two describe blocks that used to live here --
// "Home: Built in Layers" (the static Surface/Flow/System definitions list
// and its Layer Explorer preview) and "Home: selected systems" (the old
// 4-up card grid, D-016 order, image-cap assertions) -- are genuinely
// obsolete on this branch: those sections no longer exist in this DOM
// shape. They are not silently deleted -- their replacements live in
// tests/e2e/spatial.spec.ts, which asserts the real new contract (Kıvılcım
// and DropSpot render as real, linked, D-019-honest project nodes; the
// full four-project D-016 order remains intact and unaffected on `/work`,
// untouched by this branch). See the branch's final report for the full,
// explicit list of every assertion this replaced.

test.describe("Home: built for real life", () => {
  test("shows the honest pending state (no real-life-tier project exists yet)", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Built for real life" })).toBeVisible();
    await expect(page.locator("body")).toContainText(
      "Personal, real-life products will appear here once they're ready to share.",
    );
  });
});

test.describe("Home: field notes", () => {
  test("shows the honest pending copy and links to Medium and /notes", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Field notes" })).toBeVisible();
    await expect(page.locator("body")).toContainText("Writing currently lives externally");

    const mediumLink = page.getByRole("link", { name: /hakanduyar\.medium\.com/ });
    await expect(mediumLink).toHaveAttribute("href", "https://hakanduyar.medium.com/");

    await page.getByRole("link", { name: "See all notes" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Notes");
  });
});

test.describe("Home: about preview and CTA destinations", () => {
  test("has a visible 'About' heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "About", level: 2 })).toBeVisible();
  });

  test("about preview links to the full About page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Visit the About page" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("About");
  });

  test("footer contact CTA links to the verified LinkedIn profile", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: /Get in touch on LinkedIn/ });
    await expect(cta).toHaveAttribute("href", "https://www.linkedin.com/in/hakanduyar/");
  });
});

test.describe("Home: no JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("hero, section headings, and navigation remain usable", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hakan Duyar");
    // "Built in Layers" and "Selected systems" no longer exist on this
    // branch's homepage (replaced by the Spatial Experience -- see the
    // comment above "Home: built for real life"); the untouched sections
    // below it keep their real headings.
    for (const heading of ["Built for real life", "How I build", "Field notes", "About"]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
    for (const item of ["Home", "Work", "Notes", "Lab", "About"]) {
      await expect(page.getByRole("link", { name: item }).first()).toBeVisible();
    }
  });
});

test.describe("Home: responsive", () => {
  for (const width of [375, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
