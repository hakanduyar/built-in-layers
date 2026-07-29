import { expect, test } from "@playwright/test";

const routes: Array<{ path: string; h1: string }> = [
  { path: "/", h1: "Hakan Duyar" },
  { path: "/work", h1: "Selected systems" },
  { path: "/notes", h1: "Notes" },
  { path: "/lab", h1: "Lab" },
  { path: "/about", h1: "About" },
];

test.describe("Shell: desktop", () => {
  for (const route of routes) {
    test(`${route.path} renders its h1`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(route.h1);
    });
  }

  test("header nav links navigate to every route", async ({ page }) => {
    await page.goto("/");
    for (const item of [
      { label: "Work", h1: "Selected systems" },
      { label: "Notes", h1: "Notes" },
      { label: "Lab", h1: "Lab" },
      { label: "About", h1: "About" },
    ]) {
      await page
        .getByRole("navigation", { name: "Primary" })
        .getByRole("link", { name: item.label })
        .click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(item.h1);
    }
  });

  test("skip link is the first Tab stop and moves focus to #main", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Skip to content" });
    await expect(skipLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test("unknown route renders the custom 404 with links back to Home and Work", async ({
    page,
  }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
    const suggested = page.getByRole("navigation", { name: "Suggested pages" });
    await expect(suggested.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    await expect(suggested.getByRole("link", { name: "Work" })).toHaveAttribute("href", "/work");
  });

  test("external links open in a new tab with rel=noopener noreferrer", async ({ page }) => {
    await page.goto("/");
    const github = page.getByRole("link", { name: /GitHub/ });
    await expect(github).toHaveAttribute("target", "_blank");
    await expect(github).toHaveAttribute("rel", "noopener noreferrer");
  });
});

test.describe("Shell: mobile MENU", () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test("trigger opens the panel; Escape closes it and returns focus to the trigger", async ({
    page,
  }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Menu" });
    await trigger.click();
    const panel = page.getByRole("dialog", { name: "Primary navigation" });
    await expect(panel).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("close button closes the panel and returns focus to the trigger", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Menu" });
    await trigger.click();
    const panel = page.getByRole("dialog", { name: "Primary navigation" });
    await expect(panel).toBeVisible();

    await page.getByRole("button", { name: "Close" }).click();
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("selecting a route link navigates and closes the panel", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    const panel = page.getByRole("dialog", { name: "Primary navigation" });
    await panel.getByRole("link", { name: "Work" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Selected systems");
    await expect(panel).toBeHidden();
  });

  test("regression: the MENU trigger is present in the raw server HTML, before any script runs", async ({
    page,
  }) => {
    const response = await page.goto("/");
    const rawHtml = await response!.text();
    expect(rawHtml).toContain('id="mobile-nav-trigger"');
  });

  test("regression: header height is identical before and after hydration under delayed JS", async ({
    page,
  }) => {
    await page.route("**/_next/static/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.continue();
    });

    // domcontentloaded fires once the server-rendered HTML is parsed, before
    // the deliberately delayed hydration scripts finish loading.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const header = page.locator("header");
    const heightBeforeHydration = (await header.boundingBox())!.height;

    // Wait past the artificial 600ms JS delay so hydration completes.
    await page.waitForTimeout(900);
    const heightAfterHydration = (await header.boundingBox())!.height;

    expect(heightAfterHydration).toBe(heightBeforeHydration);
  });
});

test.describe("Shell: no JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("every nav link remains reachable and the MENU trigger is hidden", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");

    for (const item of ["Home", "Work", "Notes", "Lab", "About"]) {
      await expect(page.getByRole("link", { name: item }).first()).toBeVisible();
    }
    await expect(page.locator("#mobile-nav-trigger")).toBeHidden();
  });
});
