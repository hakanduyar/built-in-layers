import { expect, test } from "@playwright/test";

test.describe("Work: listing", () => {
  test("lists exactly the published previews under their tier heading, Kıvılcım before Professional Systems", async ({
    page,
  }) => {
    await page.goto("/work");
    await expect(page.getByText("Featured systems")).toBeVisible();

    const links = page.locator("main a[href^='/work/']");
    await expect(links).toHaveCount(2);
    await expect(links.nth(0)).toHaveAttribute("href", "/work/kivilcim");
    await expect(links.nth(1)).toHaveAttribute("href", "/work/professional-systems");
  });

  test("omits empty tier headings", async ({ page }) => {
    await page.goto("/work");
    await expect(page.getByText("Built for real life")).toHaveCount(0);
    await expect(page.getByText("Selected archive")).toHaveCount(0);
    await expect(page.getByText("Origins / early experiments")).toHaveCount(0);
  });

  test("draft projects (DropSpot, JointLedger) do not appear; no fake cards render for them", async ({
    page,
  }) => {
    await page.goto("/work");
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
    for (const slug of ["dropspot", "jointledger"]) {
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

test.describe("Work: Kıvılcım case study (published under D-019)", () => {
  test("/work/kivilcim renders successfully with a visible h1", async ({ page }) => {
    const response = await page.goto("/work/kivilcim");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Kıvılcım");
  });

  test("renders all 11 IA sections: summary, why it exists, constraints, all three layers, decisions, evolution, reflection", async ({
    page,
  }) => {
    await page.goto("/work/kivilcim");
    for (const heading of [
      "One-minute summary",
      "Why it exists",
      "Constraints",
      "Surface",
      "Flow",
      "System",
      "Decisions",
      "Evolution",
      "Reflection",
    ]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
  });

  test("renders all four D-019 assets with honest, non-screenshot labelling", async ({ page }) => {
    await page.goto("/work/kivilcim");
    const images = page.locator("main img");
    await expect(images).toHaveCount(4);

    for (const filename of [
      "product-areas-map.svg",
      "core-flow-diagram.svg",
      "local-first-architecture.svg",
      "focus-lifecycle.svg",
    ]) {
      await expect(page.locator(`main img[src*="${filename}"]`)).toBeVisible();
    }

    const bodyText = await page.locator("main").innerText();
    expect(bodyText).toContain("Illustrative product map based on the audited repository");
    expect(bodyText).toContain("Verified flow diagram, not a product screenshot");
    expect(bodyText).toContain("Verified architecture diagram");
    expect(bodyText).toContain("Verified state diagram");
    expect(bodyText.toLowerCase()).not.toContain("screenshot of");
  });

  test("no generic placeholder asset remains for Kıvılcım", async ({ page }) => {
    await page.goto("/work/kivilcim");
    const html = await page.content();
    expect(html).not.toContain("placeholder-asset-pending.svg");
    expect(html.toUpperCase()).not.toContain("PLACEHOLDER — ASSET PENDING");
  });

  test("no [CONTENT REQUIRED marker or private repo path renders", async ({ page }) => {
    await page.goto("/work/kivilcim");
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("CONTENT REQUIRED");
    // "API key" as a plain-English phrase is an honest, verified
    // architecture fact (Decision 4); only an actual key value would be a
    // leak, and that is what this checks for.
    expect(bodyText).not.toMatch(/AIza[0-9A-Za-z_-]{20,}/);
    expect(bodyText).not.toContain("/home/");
  });

  test("no Next project link renders (DropSpot is still draft, never linked)", async ({ page }) => {
    await page.goto("/work/kivilcim");
    await expect(page.getByText("Next project")).toHaveCount(0);
    await expect(page.locator("a[href='/work/dropspot']")).toHaveCount(0);
  });

  for (const width of [375, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/work/kivilcim");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
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
