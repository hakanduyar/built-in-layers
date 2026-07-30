import { expect, test } from "@playwright/test";

test.describe("Work: listing", () => {
  test("lists exactly the published previews under their tier heading", async ({ page }) => {
    await page.goto("/work");
    await expect(page.getByText("Featured systems")).toBeVisible();

    const links = page.locator("main a[href^='/work/']");
    await expect(links).toHaveCount(1);
    await expect(links.nth(0)).toHaveAttribute("href", "/work/professional-systems");
  });

  test("omits empty tier headings", async ({ page }) => {
    await page.goto("/work");
    await expect(page.getByText("Built for real life")).toHaveCount(0);
    await expect(page.getByText("Selected archive")).toHaveCount(0);
    await expect(page.getByText("Origins / early experiments")).toHaveCount(0);
  });

  test("draft projects (Kıvılcım, DropSpot, JointLedger) do not appear", async ({ page }) => {
    await page.goto("/work");
    await expect(page.getByText("Kıvılcım")).toHaveCount(0);
    await expect(page.getByText("DropSpot")).toHaveCount(0);
    await expect(page.getByText("JointLedger")).toHaveCount(0);
  });

  test("renders no [CONTENT REQUIRED marker in production output", async ({ page }) => {
    await page.goto("/work");
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("CONTENT REQUIRED");
  });

  test("no unsupported metadata (phase, AI-assisted claim) leaks into public HTML", async ({
    page,
  }) => {
    await page.goto("/work");
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("active-development");
    expect(bodyText.toLowerCase()).not.toContain("ai-assisted");
  });
});

test.describe("Work: project routes", () => {
  test("/work/professional-systems renders successfully with the exact D-009 wording", async ({
    page,
  }) => {
    const response = await page.goto("/work/professional-systems");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).toContain(
      "Selected professional work is being prepared for publication. Only approved, non-confidential details will be shown.",
    );
  });

  test("draft projects are not publicly reachable", async ({ page }) => {
    for (const slug of ["kivilcim", "dropspot", "jointledger"]) {
      const response = await page.goto(`/work/${slug}`);
      expect(response?.status()).toBe(404);
    }
  });

  test("an unknown slug 404s", async ({ page }) => {
    const response = await page.goto("/work/this-project-does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("no [CONTENT REQUIRED marker renders on the published project page", async ({ page }) => {
    await page.goto("/work/professional-systems");
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("CONTENT REQUIRED");
  });
});

test.describe("Work: responsive", () => {
  for (const width of [375, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/work");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
