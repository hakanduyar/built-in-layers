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

test.describe("Home: Built in Layers", () => {
  test("static Surface / Flow / System explanation is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Built in Layers" })).toBeVisible();

    // TASK-007: below this static definitions list, the section also
    // previews a real project's layers via the Layer Explorer. Its no-JS/
    // pre-hydration fallback is itself a stacked, labelled "Surface"/"Flow"/
    // "System" heading group -- honest, required content, not a defect --
    // so briefly (and, without JS, permanently) there can be two heading
    // groups sharing these words. `.first()` checks the static definitions
    // list specifically, matching this test's own original intent.
    const layers: Array<[string, string]> = [
      ["Surface", "interface and interaction"],
      ["Flow", "behavior, states, and user journeys"],
      ["System", "architecture, data, and constraints"],
    ];
    for (const [label, body] of layers) {
      await expect(page.getByRole("heading", { name: label, exact: true }).first()).toBeVisible();
      await expect(page.locator("body")).toContainText(body);
    }
  });

  test("no decorative registration-mark element remains in this section", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section", {
      has: page.getByRole("heading", { name: "Built in Layers" }),
    });
    await expect(section.locator('[role="presentation"]')).toHaveCount(0);
  });
});

test.describe("Home: selected systems", () => {
  // Scoped to the Selected Systems <ul> itself, not all of <main> -- TASK-007
  // adds a legitimate 5th /work/ link on the homepage (the Layer Explorer
  // preview's "Previewing real layers from <Project>" link, inside the Built
  // in Layers section), so a bare `main a[href^='/work/']` locator now
  // over-matches by one.
  const cardLinks = (page: import("@playwright/test").Page) =>
    page
      .locator("section", {
        has: page.getByRole("heading", { name: "Selected systems", level: 2 }),
      })
      .locator("li a[href^='/work/']");

  test("lists exactly the four published projects, in D-016 order", async ({ page }) => {
    await page.goto("/");
    const links = cardLinks(page);
    await expect(links).toHaveCount(4);
    await expect(links.nth(0)).toHaveAttribute("href", "/work/kivilcim");
    await expect(links.nth(1)).toHaveAttribute("href", "/work/dropspot");
    await expect(links.nth(2)).toHaveAttribute("href", "/work/jointledger");
    await expect(links.nth(3)).toHaveAttribute("href", "/work/professional-systems");
  });

  test("JointLedger renders with its real title, description, and ezBookkeeping fork disclosure", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByText("JointLedger")).toBeVisible();
    await expect(page.locator("body")).toContainText(
      "Personal accounts. Shared financial life. One coordinated system.",
    );
    const card = page.locator("main li", { has: page.locator("a[href='/work/jointledger']") });
    await expect(card.getByText("ezBookkeeping")).toBeVisible();
  });

  test("Kıvılcım renders with its real title and description", async ({ page }) => {
    await page.goto("/");
    const card = page.locator("main li", { has: page.locator("a[href='/work/kivilcim']") });
    await expect(card.getByText("Kıvılcım", { exact: false }).first()).toBeVisible();
    await expect(page.locator("body")).toContainText(
      "A local-first system for planning, focus, and personal growth.",
    );
  });

  test("DropSpot renders with its real title and description", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("DropSpot")).toBeVisible();
    await expect(page.locator("body")).toContainText(
      "A fair claim and waitlist system for limited-stock product drops.",
    );
  });

  test("Professional Systems renders with its exact approved description", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toContainText(
      "Designing usable interfaces within complex technical and organizational constraints.",
    );
  });

  test("renders no [CONTENT REQUIRED marker and no unsupported metadata", async ({ page }) => {
    await page.goto("/");
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("CONTENT REQUIRED");
    expect(bodyText).not.toContain("active-development");
    expect(bodyText.toLowerCase()).not.toContain("ai-assisted");
  });

  // Replaces the old uniform "every card image <=400px" rule, which the
  // approved Layered Editorial Systems prototype deliberately supersedes:
  // evidence now earns unequal visual space instead of every project
  // sharing one thumbnail size. This asserts the real, rendered hierarchy
  // (dominant real-screenshot and technical-plate evidence vs. a smaller
  // JointLedger diagram vs. a deliberately restrained Professional Systems
  // treatment) rather than hard-coding one arbitrary pixel ceiling for all
  // four -- so a future genuine redesign of any one project's treatment
  // doesn't have to fight this test's numbers, only the relationship
  // between them.
  test("Selected Systems evidence hierarchy: unequal visual weight per project, not a uniform thumbnail grid", async ({
    page,
  }) => {
    await page.goto("/");
    const links = cardLinks(page);
    await expect(links).toHaveCount(4);
    // D-016 order is preserved -- unequal visual weight is layered on top
    // of this order, never a reordering of it.
    await expect(links.nth(0)).toHaveAttribute("href", "/work/kivilcim");
    await expect(links.nth(1)).toHaveAttribute("href", "/work/dropspot");
    await expect(links.nth(2)).toHaveAttribute("href", "/work/jointledger");
    await expect(links.nth(3)).toHaveAttribute("href", "/work/professional-systems");

    async function representativeImageWidth(slug: string) {
      const card = page.locator("main li", { has: page.locator(`a[href='/work/${slug}']`) });
      const images = card.locator("img");
      // Each project still renders exactly one registered representative
      // asset -- unequal weight comes from that one image's size and
      // composition, never from adding a second image.
      await expect(images, `${slug} should render exactly one image`).toHaveCount(1);

      const image = images.first();
      const box = await image.boundingBox();
      expect(box, `expected a bounding box for ${slug}'s image`).not.toBeNull();
      if (!box) throw new Error(`no bounding box for ${slug}`);

      // No image bleeds past its own card -- contained within the
      // container/viewport, never wider than the page itself.
      const cardBox = await card.boundingBox();
      expect(cardBox, `expected a bounding box for ${slug}'s card`).not.toBeNull();
      if (cardBox) expect(box.x + box.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 1);

      // Intrinsic aspect ratio is real -- a genuinely loaded asset, not a
      // broken or zero-size one.
      const naturalSize = await image.evaluate((el) => {
        const img = el as HTMLImageElement;
        return { width: img.naturalWidth, height: img.naturalHeight };
      });
      expect(naturalSize.width, `${slug} image should have real intrinsic width`).toBeGreaterThan(
        0,
      );
      expect(naturalSize.height, `${slug} image should have real intrinsic height`).toBeGreaterThan(
        0,
      );

      return box.width;
    }

    const kivilcimWidth = await representativeImageWidth("kivilcim");
    const dropspotWidth = await representativeImageWidth("dropspot");
    const jointledgerWidth = await representativeImageWidth("jointledger");
    const professionalWidth = await representativeImageWidth("professional-systems");

    // DropSpot's real screenshot is the dominant evidence moment --
    // materially larger than the old uniform secondary-thumbnail cap.
    expect(dropspotWidth).toBeGreaterThan(400);
    // Kıvılcım's technical plate is intentionally large too -- a system-map
    // moment, not a thumbnail.
    expect(kivilcimWidth).toBeGreaterThan(400);
    // JointLedger's diagram is a real but deliberately smaller, quieter
    // evidence composition than the two major plates.
    expect(jointledgerWidth).toBeLessThan(kivilcimWidth);
    expect(jointledgerWidth).toBeLessThan(dropspotWidth);
    // Professional Systems stays visually restrained relative to the major
    // evidence treatments -- the one project where the old secondary-
    // thumbnail scale remains the deliberately correct choice.
    expect(professionalWidth).toBeLessThan(dropspotWidth);
    expect(professionalWidth).toBeLessThan(kivilcimWidth);
  });

  test("DropSpot's homepage card image is its real screenshot; Kıvılcım/JointLedger/Professional Systems keep their honest diagram/illustration labelling", async ({
    page,
  }) => {
    await page.goto("/");
    const dropspotCard = page.locator("main li", {
      has: page.locator("a[href='/work/dropspot']"),
    });
    await expect(dropspotCard.locator('img[src*="browse-drops.webp"]')).toBeVisible();
    const dropspotCaption = await dropspotCard.locator("figcaption").innerText();
    expect(dropspotCaption.toLowerCase()).not.toContain("not a");

    for (const [slug, filename] of [
      ["kivilcim", "product-areas-map.svg"],
      ["jointledger", "upstream-extension-map.svg"],
      ["professional-systems", "professional-systems-overview.svg"],
    ] as const) {
      const card = page.locator("main li", { has: page.locator(`a[href='/work/${slug}']`) });
      await expect(card.locator(`img[src*="${filename}"]`)).toBeVisible();
      const caption = await card.locator("figcaption").innerText();
      expect(caption.toLowerCase()).toMatch(/not a (product )?screenshot/);
    }
  });

  test("no card claims a fake screenshot; title and description stay the dominant visible text", async ({
    page,
  }) => {
    await page.goto("/");
    const bodyText = await page.locator("main").innerText();
    expect(bodyText.toLowerCase().match(/screenshot of/g) ?? []).toHaveLength(0);

    // Title heading text must still visually precede the image within each
    // card's DOM order -- the image stays secondary to the copy.
    const jointledgerCard = page.locator("main li", {
      has: page.locator("a[href='/work/jointledger']"),
    });
    const cardHtml = await jointledgerCard.innerHTML();
    expect(cardHtml.indexOf("JointLedger")).toBeLessThan(cardHtml.indexOf("<img"));
  });
});

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
    await expect(page.locator("body")).toContainText("Selected writing will be linked here soon");

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
    await page.getByRole("link", { name: "Read the full introduction" }).click();
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
    for (const heading of [
      "Built in Layers",
      "Selected systems",
      "Built for real life",
      "How I build",
      "Field notes",
      "About",
    ]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
    for (const item of ["Home", "Work", "Notes", "Lab", "About"]) {
      await expect(page.getByRole("link", { name: item }).first()).toBeVisible();
    }
  });
});

test.describe("Home: responsive", () => {
  // 320px included per DESIGN_SYSTEM §15's "no horizontal overflow at any
  // width >= 320px" -- the Layered Editorial Systems prototype's evidence-
  // hierarchy test (above) depends on this floor holding for its own
  // per-image containment checks to mean anything at the narrowest width.
  for (const width of [320, 375, 768, 1024, 1440]) {
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
