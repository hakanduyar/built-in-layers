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

    const layers: Array<[string, string]> = [
      ["Surface", "interface and interaction"],
      ["Flow", "behavior, states, and user journeys"],
      ["System", "architecture, data, and constraints"],
    ];
    for (const [label, body] of layers) {
      await expect(page.getByRole("heading", { name: label, exact: true })).toBeVisible();
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
  test("lists exactly the four published projects, in D-016 order", async ({ page }) => {
    await page.goto("/");
    const links = page.locator("main a[href^='/work/']");
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
    await expect(page.getByText("Kıvılcım")).toBeVisible();
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

  test("each of the four project cards shows exactly one representative image, capped to a secondary size", async ({
    page,
  }) => {
    await page.goto("/");
    const cards = page.locator("main li", { has: page.locator("a[href^='/work/']") });
    await expect(cards).toHaveCount(4);

    for (let i = 0; i < 4; i += 1) {
      const card = cards.nth(i);
      const images = card.locator("img");
      await expect(images).toHaveCount(1);
      const box = await images.first().boundingBox();
      expect(box, "expected a bounding box for the card image").not.toBeNull();
      if (box) expect(box.width).toBeLessThanOrEqual(400);
    }
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
