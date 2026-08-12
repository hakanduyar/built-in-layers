import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { buildPersonJsonLd } from "@/lib/seo/metadata";
import { socialLinks } from "@/data/site";

// TASK-008: sitemap must list exactly the genuinely public routes — the
// static pages plus every currently *published* project, in no particular
// order requirement, but never a draft/unknown slug and never a test route.
describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("includes every static public route exactly once", () => {
    for (const path of ["/", "/work", "/about", "/notes", "/lab"]) {
      const matches = urls.filter((u) => new URL(u).pathname === path);
      expect(matches, `expected exactly one entry for ${path}`).toHaveLength(1);
    }
  });

  it("includes exactly the four published project routes, in D-016 order", () => {
    const projectPaths = urls.map((u) => new URL(u).pathname).filter((p) => p.startsWith("/work/"));
    expect(projectPaths).toEqual([
      "/work/kivilcim",
      "/work/dropspot",
      "/work/jointledger",
      "/work/professional-systems",
    ]);
  });

  it("contains no draft, unknown, or test-route slug", () => {
    for (const url of urls) {
      expect(url).not.toMatch(/\/work\/(delta-full|draft|test|unknown)/);
    }
  });

  it("every URL is absolute and uses the configured SITE_URL origin", () => {
    for (const url of urls) {
      expect(() => new URL(url)).not.toThrow();
    }
    const origins = new Set(urls.map((u) => new URL(u).origin));
    expect(origins.size).toBe(1);
  });
});

describe("robots", () => {
  const result = robots();

  it("allows crawling of the whole site (no accidental disallow)", () => {
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;
    expect(rule?.userAgent).toBe("*");
    expect(rule?.allow).toBe("/");
    expect(rule?.disallow).toBeUndefined();
  });

  it("points at the real sitemap URL", () => {
    expect(result.sitemap).toMatch(/\/sitemap\.xml$/);
  });
});

// ARCHITECTURE §9: "a single Person object on / and /about containing only
// verified fields (name, job title, GitHub/LinkedIn/Medium URLs). No
// organization, employer, or address claims."
describe("buildPersonJsonLd", () => {
  const data = buildPersonJsonLd();

  it("has the correct schema.org type", () => {
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("Person");
  });

  it("states only the approved job title", () => {
    expect(data.jobTitle).toBe("Frontend & Product Engineer");
  });

  it("sameAs lists exactly the verified social links, nothing invented", () => {
    expect(data.sameAs).toEqual(socialLinks.map((l) => l.url));
  });

  it("never includes an email, phone, or address field", () => {
    const serialized = JSON.stringify(data).toLowerCase();
    expect(serialized).not.toContain("email");
    expect(serialized).not.toContain("telephone");
    expect(serialized).not.toContain("address");
  });

  it("is valid, serializable JSON with no undefined/circular values", () => {
    expect(() => JSON.stringify(data)).not.toThrow();
  });
});

// TASK-008: proves that when Hakan eventually confirms a real production
// domain, setting NEXT_PUBLIC_SITE_URL is the *only* thing required — no
// second site-URL mechanism exists, and derivation is correct (no double
// slashes, correct project routes). "https://portfolio.example" is the
// IANA-reserved documentation TLD (RFC 2606 / RFC 6761) — it appears only
// in this test process's environment, never as a source default, never in
// committed output. Vitest's `vi.resetModules()` + dynamic re-`import()`
// re-evaluates the `SITE_URL` module-level constant against the new env
// value, since `lib/seo/metadata.ts` intentionally reads
// `process.env.NEXT_PUBLIC_SITE_URL` exactly once at module load (the same
// mechanism ARCHITECTURE §9 and TASK-002 already specify) rather than
// introducing a second, competing runtime-configurable lookup.
describe("SITE_URL: derivation once a real domain is configured (test-only)", () => {
  const TEST_DOMAIN = "https://portfolio.example";
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;

  async function loadWithTestDomain() {
    process.env.NEXT_PUBLIC_SITE_URL = TEST_DOMAIN;
    vi.resetModules();
    const metadataModule = await import("@/lib/seo/metadata");
    const sitemapModule = await import("@/app/sitemap");
    const robotsModule = await import("@/app/robots");
    return {
      SITE_URL: metadataModule.SITE_URL,
      buildMetadata: metadataModule.buildMetadata,
      buildPersonJsonLd: metadataModule.buildPersonJsonLd,
      sitemap: sitemapModule.default,
      robots: robotsModule.default,
    };
  }

  afterEach(async () => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
    }
    vi.resetModules();
  });

  it("SITE_URL picks up the configured domain, not the dev fallback", async () => {
    const { SITE_URL } = await loadWithTestDomain();
    expect(SITE_URL).toBe(TEST_DOMAIN);
  });

  it("canonical URLs derive from the configured domain with no double slash", async () => {
    const { buildMetadata } = await loadWithTestDomain();
    const metadata = buildMetadata({ description: "test", path: "/work" });
    const canonical = metadata.alternates?.canonical?.toString() ?? "";
    expect(canonical).toBe("https://portfolio.example/work");
    expect(canonical).not.toMatch(/[^:]\/\//);
  });

  it("the homepage path resolves to the bare origin, no trailing double slash", async () => {
    const { buildMetadata } = await loadWithTestDomain();
    const metadata = buildMetadata({ description: "test", path: "/" });
    expect(metadata.alternates?.canonical?.toString()).toBe("https://portfolio.example/");
  });

  it("sitemap URLs all derive from the configured domain, project routes correct", async () => {
    const { sitemap } = await loadWithTestDomain();
    const urls = sitemap().map((e) => e.url);
    for (const url of urls) {
      expect(url.startsWith(TEST_DOMAIN)).toBe(true);
      expect(url).not.toMatch(/[^:]\/\//);
    }
    const projectPaths = urls.map((u) => new URL(u).pathname).filter((p) => p.startsWith("/work/"));
    expect(projectPaths).toEqual([
      "/work/kivilcim",
      "/work/dropspot",
      "/work/jointledger",
      "/work/professional-systems",
    ]);
  });

  it("robots sitemap URL derives from the configured domain", async () => {
    const { robots } = await loadWithTestDomain();
    expect(robots().sitemap).toBe("https://portfolio.example/sitemap.xml");
  });

  it("Person JSON-LD url field derives from the configured domain", async () => {
    const { buildPersonJsonLd } = await loadWithTestDomain();
    expect(buildPersonJsonLd().url).toBe(TEST_DOMAIN);
  });

  it("reverting the env var restores the safe development fallback (no leak between tests)", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    vi.resetModules();
    const { SITE_URL } = await import("@/lib/seo/metadata");
    expect(SITE_URL).toBe("http://localhost:3000");
  });
});

// TASK-008 dead-asset cleanup: a stray, unreferenced public/images/projects/
// professional/ directory (mismatched slug, missing "-systems") was removed
// — this regression-tests its absence so it can't silently reappear.
describe("dead-asset cleanup regression", () => {
  it("public/images/projects/professional/ (mismatched slug) does not exist", () => {
    const orphanDir = path.join(process.cwd(), "public/images/projects/professional");
    expect(fs.existsSync(orphanDir)).toBe(false);
  });

  it("public/images/projects/professional-systems/ (correct slug) still exists", () => {
    const realDir = path.join(process.cwd(), "public/images/projects/professional-systems");
    expect(fs.existsSync(realDir)).toBe(true);
  });
});
