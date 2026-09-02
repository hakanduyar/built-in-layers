import { expect, test } from "@playwright/test";

test.describe("Work: listing", () => {
  test("lists exactly the published previews under their tier heading, in owner order (D-021)", async ({
    page,
  }) => {
    await page.goto("/work");
    await expect(page.getByText("Featured systems")).toBeVisible();

    const links = page.locator("main a[href^='/work/']");
    await expect(links).toHaveCount(5);
    await expect(links.nth(0)).toHaveAttribute("href", "/work/software-factory");
    await expect(links.nth(1)).toHaveAttribute("href", "/work/kivilcim");
    await expect(links.nth(2)).toHaveAttribute("href", "/work/jointledger");
    await expect(links.nth(3)).toHaveAttribute("href", "/work/dropspot");
    await expect(links.nth(4)).toHaveAttribute("href", "/work/professional-systems");
  });

  test("omits empty tier headings", async ({ page }) => {
    await page.goto("/work");
    await expect(page.getByText("Built for real life")).toHaveCount(0);
    await expect(page.getByText("Selected archive")).toHaveCount(0);
    await expect(page.getByText("Origins / early experiments")).toHaveCount(0);
  });

  test("JointLedger's listing card discloses its ezBookkeeping fork provenance", async ({
    page,
  }) => {
    await page.goto("/work");
    const card = page.locator("li", { has: page.locator("a[href='/work/jointledger']") });
    await expect(card.getByText("ezBookkeeping")).toBeVisible();
  });

  test("renders no [CONTENT REQUIRED marker in production output", async ({ page }) => {
    await page.goto("/work");
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("CONTENT REQUIRED");
  });

  test("each of the four listing cards shows exactly one representative image, matching the homepage's asset choice", async ({
    page,
  }) => {
    await page.goto("/work");
    for (const [slug, filename] of [
      ["kivilcim", "product-areas-map.svg"],
      ["dropspot", "browse-drops.webp"],
      ["jointledger", "upstream-extension-map.svg"],
      ["professional-systems", "professional-systems-overview.svg"],
    ] as const) {
      const card = page.locator("li", { has: page.locator(`a[href='/work/${slug}']`) });
      await expect(card.locator("img")).toHaveCount(1);
      await expect(card.locator(`img[src*="${filename}"]`)).toBeVisible();
    }
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
      "Decisions",
      "Evolution",
      "Reflection",
    ]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
    // TASK-007: Surface/Flow/System are now the interactive Layer Explorer's
    // tabs, not headings -- the tab labels are their accessible names.
    for (const label of ["Surface", "Flow", "System"]) {
      await expect(page.getByRole("tab", { name: label })).toBeVisible();
    }
  });

  test("renders all four D-019 assets with honest, non-screenshot labelling (across the three tabs)", async ({
    page,
  }) => {
    await page.goto("/work/kivilcim");

    // Surface: the illustrative product map.
    await expect(page.locator('main img[src*="product-areas-map.svg"]')).toBeVisible();
    let bodyText = await page.getByRole("tabpanel").innerText();
    expect(bodyText).toContain("Illustrative product map based on the audited repository");

    // Flow: the core flow diagram + the focus lifecycle state diagram.
    await page.getByRole("tab", { name: "Flow" }).click();
    await expect(page.locator('main img[src*="core-flow-diagram.svg"]')).toBeVisible();
    await expect(page.locator('main img[src*="focus-lifecycle.svg"]')).toBeVisible();
    bodyText = await page.getByRole("tabpanel").innerText();
    expect(bodyText).toContain("Verified flow diagram, not a product screenshot");
    expect(bodyText).toContain("Verified state diagram");

    // System: the local-first architecture diagram.
    await page.getByRole("tab", { name: "System" }).click();
    await expect(page.locator('main img[src*="local-first-architecture.svg"]')).toBeVisible();
    bodyText = await page.getByRole("tabpanel").innerText();
    expect(bodyText).toContain("Verified architecture diagram");

    const fullText = (await page.locator("main").innerText()).toLowerCase();
    expect(fullText).not.toContain("screenshot of");
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

  // D-027: navigation is derived from the global `order` sequence.
  // Kivilcim is the first case-study destination, so it has a next and no
  // previous.
  test("derived navigation offers JointLedger next and no previous", async ({ page }) => {
    await page.goto("/work/kivilcim");
    const nav = page.getByRole("navigation", { name: "Case study navigation" });
    await expect(nav).toBeVisible();
    await expect(nav.getByText("Next project")).toBeVisible();
    await expect(nav.getByText("Previous project")).toHaveCount(0);
    await expect(nav.locator("a[href='/work/jointledger']")).toBeVisible();
    const response = await page.goto("/work/jointledger");
    expect(response?.status()).toBe(200);
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

test.describe("Work: DropSpot case study (published under D-019, TASK-006)", () => {
  test("/work/dropspot renders successfully with a visible h1", async ({ page }) => {
    const response = await page.goto("/work/dropspot");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("DropSpot");
  });

  test("renders the depth:short required sections, all three layers, and decisions", async ({
    page,
  }) => {
    await page.goto("/work/dropspot");
    for (const heading of [
      "One-minute summary",
      "Why it exists",
      "Constraints",
      "Decisions",
      "Reflection",
    ]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
    // TASK-007: Surface/Flow/System are now the interactive Layer Explorer's
    // tabs, not headings.
    for (const label of ["Surface", "Flow", "System"]) {
      await expect(page.getByRole("tab", { name: label })).toBeVisible();
    }
  });

  test("renders all 7 D-019 assets: 4 real screenshots + 3 diagrams, each honestly labelled (across the three tabs)", async ({
    page,
  }) => {
    await page.goto("/work/dropspot");

    // Surface (default tab): the three real screenshots.
    for (const filename of ["browse-drops.webp", "drop-detail.webp", "admin-panel.webp"]) {
      await expect(page.locator(`main img[src*="${filename}"]`)).toBeVisible();
    }
    let bodyText = await page.getByRole("tabpanel").innerText();
    expect(bodyText).toContain("Home page, signed in — browsing drops with waitlist status");
    expect(bodyText).toContain("Drop detail page before joining the waitlist.");
    expect(bodyText).toContain("Admin panel — drop management table");

    // Flow: the 4th real screenshot + the flow diagram.
    await page.getByRole("tab", { name: "Flow" }).click();
    await expect(page.locator('main img[src*="waitlist-joined.webp"]')).toBeVisible();
    await expect(page.locator('main img[src*="core-flow-diagram.svg"]')).toBeVisible();
    bodyText = await page.getByRole("tabpanel").innerText();
    expect(bodyText).toContain("Drop detail page after joining the waitlist.");
    expect(bodyText).toContain("Verified flow diagram, not a product screenshot");

    // System: the two remaining architecture diagrams.
    await page.getByRole("tab", { name: "System" }).click();
    await expect(page.locator('main img[src*="claim-transaction-diagram.svg"]')).toBeVisible();
    await expect(page.locator('main img[src*="priority-score-diagram.svg"]')).toBeVisible();
    bodyText = await page.getByRole("tabpanel").innerText();
    expect(bodyText).toContain("Verified architecture diagram, not a product screenshot");

    // The removed provisional screens-map must not linger anywhere.
    const fullText = await page.locator("main").innerText();
    expect(fullText).not.toContain("Illustrative screens map");
  });

  test("real screenshots keep their true aspect ratio — no stretching to 16:10", async ({
    page,
  }) => {
    await page.goto("/work/dropspot");
    // Intrinsic ratios (from the source files): browse-drops 1806x822,
    // drop-detail 1731x837, admin-panel 1878x808, waitlist-joined 1804x812 —
    // none is 16:10 (1.6). Figure's plain <img> with no fixed height must
    // render each at its own natural ratio, not a forced 1.6. browse-drops/
    // drop-detail/admin-panel live under Surface (default); waitlist-joined
    // lives under Flow.
    const surfaceExpected: Record<string, number> = {
      "browse-drops.webp": 1806 / 822,
      "drop-detail.webp": 1731 / 837,
      "admin-panel.webp": 1878 / 808,
    };
    for (const [filename, intrinsicRatio] of Object.entries(surfaceExpected)) {
      const img = page.locator(`main img[src*="${filename}"]`);
      // `boundingBox()` is a raw, non-retrying layout read -- it can catch
      // the image before its real bytes have finished decoding (no explicit
      // width/height on Figure's <img>, so pre-decode layout can be
      // zero-size). `toBeVisible()` alone wasn't a strong enough guard
      // (still observed one webkit-only null read immediately after it
      // passed); polling `boundingBox()` itself until it's genuinely
      // non-null is the robust fix -- it retries the exact value this test
      // needs, not a proxy for it.
      await expect.poll(async () => await img.boundingBox(), { timeout: 10_000 }).not.toBeNull();
      const box = await img.boundingBox();
      expect(box, `expected a bounding box for ${filename}`).not.toBeNull();
      if (!box) continue;
      const renderedRatio = box.width / box.height;
      expect(Math.abs(renderedRatio - intrinsicRatio) / intrinsicRatio).toBeLessThan(0.02);
      expect(Math.abs(renderedRatio - 16 / 10) / (16 / 10)).toBeGreaterThan(0.01);
    }

    await page.getByRole("tab", { name: "Flow" }).click();
    const waitlistImg = page.locator('main img[src*="waitlist-joined.webp"]');
    await expect
      .poll(async () => await waitlistImg.boundingBox(), { timeout: 10_000 })
      .not.toBeNull();
    const box = await waitlistImg.boundingBox();
    expect(box, "expected a bounding box for waitlist-joined.webp").not.toBeNull();
    if (box) {
      const intrinsicRatio = 1804 / 812;
      const renderedRatio = box.width / box.height;
      expect(Math.abs(renderedRatio - intrinsicRatio) / intrinsicRatio).toBeLessThan(0.02);
      expect(Math.abs(renderedRatio - 16 / 10) / (16 / 10)).toBeGreaterThan(0.01);
    }
  });

  test("no generic placeholder asset remains for DropSpot", async ({ page }) => {
    await page.goto("/work/dropspot");
    const html = await page.content();
    expect(html).not.toContain("placeholder-asset-pending.svg");
    expect(html.toUpperCase()).not.toContain("PLACEHOLDER — ASSET PENDING");
  });

  test("no [CONTENT REQUIRED marker, credential, or local path renders", async ({ page }) => {
    await page.goto("/work/dropspot");
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("CONTENT REQUIRED");
    expect(bodyText).not.toMatch(/AIza[0-9A-Za-z_-]{20,}/);
    expect(bodyText).not.toContain("/home/");
    expect(bodyText.toLowerCase()).not.toMatch(/password\s*[:=]\s*['"]?admin123|user123/);
  });

  // DropSpot is the last case-study destination: previous, but no next, and
  // never a wrap-around back to the first.
  test("derived navigation offers JointLedger previous and no next", async ({ page }) => {
    await page.goto("/work/dropspot");
    const nav = page.getByRole("navigation", { name: "Case study navigation" });
    await expect(nav).toBeVisible();
    await expect(nav.getByText("Previous project")).toBeVisible();
    await expect(nav.getByText("Next project")).toHaveCount(0);
    await expect(nav.locator("a[href='/work/jointledger']")).toBeVisible();
    const response = await page.request.get("/work/jointledger");
    expect(response.status()).toBe(200);
  });

  for (const width of [375, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/work/dropspot");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test.describe("Work: JointLedger case study (published, JointLedger publication pass)", () => {
  test("/work/jointledger renders successfully with a visible h1", async ({ page }) => {
    const response = await page.goto("/work/jointledger");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("JointLedger");
  });

  test("renders the depth:short required sections, all three layers, and decisions", async ({
    page,
  }) => {
    await page.goto("/work/jointledger");
    for (const heading of [
      "One-minute summary",
      "Why it exists",
      "Constraints",
      "Decisions",
      "Reflection",
    ]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
    // TASK-007: Surface/Flow/System are now the interactive Layer Explorer's
    // tabs, not headings.
    for (const label of ["Surface", "Flow", "System"]) {
      await expect(page.getByRole("tab", { name: label })).toBeVisible();
    }
  });

  test("visibly discloses the ezBookkeeping upstream — not buried in metadata", async ({
    page,
  }) => {
    await page.goto("/work/jointledger");
    const bodyText = await page.locator("main").innerText();
    expect(bodyText).toContain("ezBookkeeping");
    expect(bodyText.toLowerCase()).toContain("fork");
    await expect(
      page.locator("main a[href='https://github.com/mayswind/ezbookkeeping']"),
    ).toBeVisible();
  });

  test("renders all 4 D-019 verified-diagram assets, each honestly labelled (across the three tabs)", async ({
    page,
  }) => {
    await page.goto("/work/jointledger");

    // Surface (default tab): the upstream extension map.
    await expect(page.locator('main img[src*="upstream-extension-map.svg"]')).toBeVisible();
    let bodyText = await page.getByRole("tabpanel").innerText();
    expect(bodyText).toContain("Verified extension diagram, not a product screenshot");

    // Flow: the personal-book backfill flow diagram.
    await page.getByRole("tab", { name: "Flow" }).click();
    await expect(page.locator('main img[src*="personal-book-backfill-flow.svg"]')).toBeVisible();
    bodyText = await page.getByRole("tabpanel").innerText();
    expect(bodyText).toContain("Verified flow diagram, not a product screenshot");

    // System: the two remaining architecture diagrams.
    await page.getByRole("tab", { name: "System" }).click();
    await expect(page.locator('main img[src*="book-data-model-diagram.svg"]')).toBeVisible();
    await expect(
      page.locator('main img[src*="book-scoped-authorization-diagram.svg"]'),
    ).toBeVisible();
    bodyText = await page.getByRole("tabpanel").innerText();
    expect(bodyText).toContain("Verified architecture diagram, not a product screenshot");

    const fullText = (await page.locator("main").innerText()).toLowerCase();
    expect(fullText).not.toContain("screenshot of");
  });

  test("does not claim transactions are book-scoped, an invitation flow exists, or the shared-book work is merged", async ({
    page,
  }) => {
    await page.goto("/work/jointledger");
    const bodyText = await page.locator("main").innerText();
    expect(bodyText.toLowerCase()).not.toMatch(/transactions are (book-scoped|shared)/);
    expect(bodyText.toLowerCase()).not.toMatch(/invite (a|your) (family|partner|member)/);
    expect(bodyText).toContain("aren't book-scoped");
    expect(bodyText).toContain("Unmerged feature branch");
  });

  test("no generic placeholder asset or old provisional wording remains for JointLedger", async ({
    page,
  }) => {
    await page.goto("/work/jointledger");
    const html = await page.content();
    expect(html).not.toContain("placeholder-asset-pending.svg");
    expect(html.toUpperCase()).not.toContain("PLACEHOLDER — ASSET PENDING");
  });

  test("no [CONTENT REQUIRED marker, credential, or local path renders", async ({ page }) => {
    await page.goto("/work/jointledger");
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("CONTENT REQUIRED");
    expect(bodyText).not.toMatch(/AIza[0-9A-Za-z_-]{20,}/);
    expect(bodyText).not.toContain("/home/");
    expect(bodyText.toLowerCase()).not.toMatch(/password\s*[:=]\s*['"]/);
  });

  // JointLedger sits between two destinations, so both directions render.
  // Professional Systems is a preview index with no case study, so it must
  // NOT appear in this navigation even though it is published and ordered
  // immediately after DropSpot.
  test("derived navigation offers both directions and excludes the preview index", async ({
    page,
  }) => {
    await page.goto("/work/jointledger");
    const nav = page.getByRole("navigation", { name: "Case study navigation" });
    await expect(nav.getByText("Previous project")).toBeVisible();
    await expect(nav.getByText("Next project")).toBeVisible();
    await expect(nav.locator("a[href='/work/kivilcim']")).toBeVisible();
    await expect(nav.locator("a[href='/work/dropspot']")).toBeVisible();
    await expect(nav.locator("a[href='/work/professional-systems']")).toHaveCount(0);
  });

  for (const width of [375, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/work/jointledger");
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
