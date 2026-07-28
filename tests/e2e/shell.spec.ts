import { expect, test } from "@playwright/test";

test.describe("Shell: desktop", () => {
  test("primary navigation links exist with correct hrefs", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    await expect(nav.getByRole("link", { name: "Work" })).toHaveAttribute("href", "/work");
    await expect(nav.getByRole("link", { name: "Notes" })).toHaveAttribute("href", "/notes");
    await expect(nav.getByRole("link", { name: "Lab" })).toHaveAttribute("href", "/lab");
    await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  });

  test("skip link targets #main and becomes focused on first Tab", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.getByRole("link", { name: "Skip to content" });
    await expect(skipLink).toHaveAttribute("href", "#main");
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
  });

  test("every route stub renders its expected h1", async ({ page }) => {
    const routes: Array<[string, string]> = [
      ["/", "Hakan Duyar"],
      ["/work", "Selected systems"],
      ["/notes", "Notes"],
      ["/lab", "Lab"],
      ["/about", "About"],
    ];
    for (const [path, heading] of routes) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    }
  });

  test("unknown route renders the custom 404", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
    const suggested = page.getByRole("navigation", { name: "Suggested pages" });
    await expect(suggested.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    await expect(suggested.getByRole("link", { name: "Work" })).toHaveAttribute("href", "/work");
  });

  test("external links open in a new tab with noopener noreferrer", async ({ page }) => {
    await page.goto("/");
    const github = page.getByRole("link", { name: /GitHub/ });
    await expect(github).toHaveAttribute("target", "_blank");
    await expect(github).toHaveAttribute("rel", "noopener noreferrer");
  });
});

test.describe("Shell: mobile MENU", () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test("trigger opens the panel, Escape closes it and restores focus", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Menu" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const dialog = page.getByRole("dialog", { name: "Primary navigation" });
    await expect(dialog).toBeVisible();
    // Native <dialog> showModal() moves focus into the panel; autoFocus
    // pins it to the close button deterministically.
    await expect(page.getByRole("button", { name: "Close" })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
  });

  test("the close button closes the panel and restores focus", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Menu" });
    await trigger.click();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog", { name: "Primary navigation" })).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("selecting a route in the panel navigates and closes the menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Primary navigation" });
    await dialog.getByRole("link", { name: "Work" }).click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(dialog).toBeHidden();
  });

  test("MENU trigger is present in the raw server HTML, before any script runs", async ({
    page,
  }) => {
    // Regression guard: an earlier implementation gated the trigger behind
    // a post-hydration "mounted" check and rendered a full-height stacked
    // link list as the pre-mount fallback, causing a large layout collapse
    // once hydration completed. The trigger must now be structurally
    // present from the very first byte of HTML, not appear only later.
    const response = await page.goto("/");
    const html = await response!.text();
    expect(html).toContain('id="mobile-nav-trigger"');
  });

  test("header height is identical before and after hydration under a slow-JS simulation", async ({
    page,
  }) => {
    // Delay every JS chunk to widen the pre-hydration window so a shift, if
    // one existed, would be reliably observable rather than lost to speed.
    await page.route("**/_next/static/chunks/**/*.js", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.continue();
    });

    const header = page.locator("header");
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const preHydrationBox = await header.boundingBox();

    await page.getByRole("button", { name: "Menu" }).waitFor({ state: "attached" });
    await page.waitForTimeout(900); // past the artificial delay; hydration settled

    const postHydrationBox = await header.boundingBox();
    expect(postHydrationBox?.height).toBe(preHydrationBox?.height);
  });
});

test.describe("Shell: no JavaScript", () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 375, height: 800 } });

  test("all primary nav links remain reachable at a mobile viewport without JS", async ({
    page,
  }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Work" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Notes" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Lab" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "About" })).toBeVisible();
  });

  test("the MENU trigger is not shown, since it cannot function without JS", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#mobile-nav-trigger")).toBeHidden();
  });
});
