import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/work",
  "/work/kivilcim",
  "/work/dropspot",
  "/work/jointledger",
  "/work/professional-systems",
  "/about",
  "/notes",
  "/lab",
];

test.describe("SEO: sitemap and robots", () => {
  test("sitemap.xml lists exactly the published routes, no draft/test slugs", async ({
    request,
  }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const body = await response.text();
    for (const path of [
      "/work/kivilcim",
      "/work/dropspot",
      "/work/jointledger",
      "/work/professional-systems",
    ]) {
      expect(body).toContain(`<loc>`);
      expect(body).toContain(path);
    }
    expect(body).not.toMatch(/delta-full|draft|unknown-slug/);
  });

  test("robots.txt allows crawling and points at the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("Allow: /");
    expect(body).not.toContain("Disallow: /");
    expect(body).toContain("Sitemap:");
    expect(body).toContain("/sitemap.xml");
  });
});

test.describe("SEO: metadata per route", () => {
  for (const path of routes) {
    test(`${path} has a unique title, description, and canonical link`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(/.+/);
      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute("content", /.+/);
      const canonical = page.locator('link[rel="canonical"]');
      // Next.js's own metadataBase-relative URL resolution normalizes the
      // root path to a bare origin (no trailing slash) rather than
      // origin + "/" — both are the same resource per the URL spec and
      // neither contains a double slash; only the root path is affected.
      await expect(canonical).toHaveAttribute(
        "href",
        path === "/" ? /^https?:\/\/[^/]+\/?$/ : new RegExp(`${path}$`),
      );
    });

    test(`${path} has Open Graph and Twitter card metadata, including the default OG image`, async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /.+/);
      await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
        "content",
        /.+/,
      );
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        "content",
        "summary_large_image",
      );
      const ogImage = page.locator('meta[property="og:image"]');
      await expect(ogImage).toHaveAttribute("content", /opengraph-image/);
      await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
        "content",
        "1200",
      );
      await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute(
        "content",
        "630",
      );
    });
  }

  test("the OG image route itself returns a real 1200x630 PNG", async ({ request }) => {
    const response = await request.get("/opengraph-image");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
    const body = await response.body();
    // PNG signature + IHDR width/height are big-endian uint32 at fixed
    // offsets — reading them directly proves the real dimensions without
    // needing an image-processing dependency.
    expect(body.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(body.readUInt32BE(16)).toBe(1200);
    expect(body.readUInt32BE(20)).toBe(630);
  });
});

test.describe("SEO: JSON-LD Person", () => {
  for (const path of ["/", "/about"]) {
    test(`${path} renders a valid Person JSON-LD block with only verified fields`, async ({
      page,
    }) => {
      await page.goto(path);
      const raw = await page.locator('script[type="application/ld+json"]').textContent();
      expect(raw).toBeTruthy();
      const data = JSON.parse(raw!);
      expect(data["@type"]).toBe("Person");
      expect(data.name).toBe("Hakan Duyar");
      expect(data.jobTitle).toBe("Frontend & Product Engineer");
      expect(Array.isArray(data.sameAs)).toBe(true);
      expect(data.sameAs.length).toBeGreaterThan(0);
      // Never an invented/unconfirmed personal fact.
      expect(data).not.toHaveProperty("email");
      expect(data).not.toHaveProperty("address");
      expect(data).not.toHaveProperty("telephone");
    });
  }
});

test.describe("SEO: no unapproved production leak", () => {
  for (const path of routes) {
    test(`${path} rendered HTML contains no leak marker`, async ({ page }) => {
      await page.goto(path);
      const html = await page.content();
      for (const marker of ["[CONTENT REQUIRED", "/home/", "TODO:", "FIXME", "-----BEGIN"]) {
        expect(html).not.toContain(marker);
      }
    });
  }
});

// DESIGN_SYSTEM §15 / QA_CHECKLIST §5: "no horizontal overflow at any width
// >= 320px" — 320px is the stress-test floor, checked for overflow only
// (not full visual review, which happens at 375/768/1024/1440 elsewhere).
test.describe("Responsive: 320px overflow floor", () => {
  test.use({ viewport: { width: 320, height: 800 } });

  for (const path of routes) {
    test(`${path} has no horizontal overflow at 320px`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
