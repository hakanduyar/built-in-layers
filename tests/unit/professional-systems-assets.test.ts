import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { ProjectImageAssetTypeSchema } from "@/lib/content/schemas";
import { checkImageAssets } from "@/lib/content/validate";

// D-019 (docs/DECISIONS.md) — Professional Systems' first representative
// asset (homepage-image completion pass, 2026-08-10): one
// provisional-illustration SVG, built only from the project's own approved
// public description (no client, metric, or confidential detail).

const ASSETS_DIR = path.join(process.cwd(), "public/images/projects/professional-systems");
const CONTENT_DIR = path.join(process.cwd(), "content/work/professional-systems");
const FILE = "professional-systems-overview.svg";
const REQUIRED_LABEL = "PROVISIONAL EDITORIAL VISUAL — NOT A PRODUCT SCREENSHOT";

function readAsset(): string {
  return fs.readFileSync(path.join(ASSETS_DIR, FILE), "utf8");
}

function parseSvg(raw: string): Document {
  return new DOMParser().parseFromString(raw, "image/svg+xml");
}

describe("Professional Systems asset — exactly the expected file exists", () => {
  it("has exactly one image on disk, no stray or old files", () => {
    const actual = fs.readdirSync(ASSETS_DIR).filter((name) => name !== ".gitkeep");
    expect(actual).toEqual([FILE]);
  });

  it("no generic placeholder asset exists in this directory", () => {
    expect(fs.existsSync(path.join(ASSETS_DIR, "placeholder-asset-pending.svg"))).toBe(false);
  });
});

describe("Professional Systems asset — accessible title and description", () => {
  it('has role="img" and a non-trivial <title> and <desc>', () => {
    const doc = parseSvg(readAsset());
    const svg = doc.querySelector("svg");
    expect(svg?.getAttribute("role")).toBe("img");

    const title = svg?.querySelector("title")?.textContent?.trim() ?? "";
    const desc = svg?.querySelector("desc")?.textContent?.trim() ?? "";
    expect(title.length).toBeGreaterThan(10);
    expect(desc.length).toBeGreaterThan(40);

    const labelledBy = svg?.getAttribute("aria-labelledby") ?? "";
    const ids = labelledBy.split(/\s+/).filter(Boolean);
    expect(ids.length).toBeGreaterThanOrEqual(2);
    for (const id of ids) {
      expect(doc.getElementById(id)).not.toBeNull();
    }
  });

  it("declares the 1600x1000 (16:10) canvas via both viewBox and literal width/height attributes", () => {
    const doc = parseSvg(readAsset());
    const svg = doc.querySelector("svg");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 1600 1000");
    expect(svg?.getAttribute("width")).toBe("1600");
    expect(svg?.getAttribute("height")).toBe("1000");
  });
});

describe("Professional Systems asset — required visible honesty label", () => {
  it(`visibly renders "${REQUIRED_LABEL}" as SVG text content`, () => {
    const doc = parseSvg(readAsset());
    const textNodes = Array.from(doc.querySelectorAll("text")).map(
      (node) => node.textContent ?? "",
    );
    expect(textNodes.some((text) => text.includes(REQUIRED_LABEL))).toBe(true);
  });
});

describe("Professional Systems asset — no invented facts, no fake UI", () => {
  const raw = readAsset();
  const doc = parseSvg(raw);
  const allText = Array.from(doc.querySelectorAll("text, title, desc"))
    .map((n) => n.textContent ?? "")
    .join(" ")
    .toLowerCase();

  it("depicts no metric, user count, or outcome", () => {
    expect(allText).not.toMatch(/\d+%|\d+ ?(users|clients|customers)/);
  });

  it("names no client, employer, or company", () => {
    // The illustration must stay generic — only the project's own approved
    // category/description vocabulary (interface, technical, organizational
    // constraints), never a named third party.
    expect(allText).not.toMatch(/inc\.|corp\.|llc|ltd\./);
  });

  it("does not claim to be a real screenshot", () => {
    const screenshotMentions = allText.match(/[^.]*screenshot[^.]*/g) ?? [];
    for (const mention of screenshotMentions) {
      expect(mention).toMatch(/not a (product |captured )?screen(shot)?/);
    }
  });
});

describe("Professional Systems asset — no unsafe or misleading content", () => {
  const raw = readAsset();

  it("contains no <script>", () => {
    expect(/<script/i.test(raw)).toBe(false);
  });

  it("contains no <foreignObject>", () => {
    expect(/<foreignObject/i.test(raw)).toBe(false);
  });

  it("contains no embedded raster <image>", () => {
    expect(/<image[\s>]/i.test(raw)).toBe(false);
  });

  it("contains no event-handler attribute", () => {
    expect(/\son[a-z]+\s*=/i.test(raw)).toBe(false);
  });

  it("contains no animation element", () => {
    expect(/<animate|<animateTransform|<animateMotion/i.test(raw)).toBe(false);
  });

  it("references no external resource (only the required xmlns URI)", () => {
    const urls = raw.match(/https?:\/\/[^\s"'<>]+/g) ?? [];
    for (const url of urls) {
      expect(url).toBe("http://www.w3.org/2000/svg");
    }
  });

  it("has no href/xlink:href to an external resource", () => {
    expect(/(?:^|[^-])href\s*=\s*"https?:/i.test(raw)).toBe(false);
    expect(/xlink:href/i.test(raw)).toBe(false);
  });

  it("contains no credential-shaped string or local filesystem path", () => {
    expect(raw).not.toMatch(/AIza[0-9A-Za-z_-]{20,}/);
    expect(raw.toLowerCase()).not.toContain("localhost");
    expect(raw).not.toContain("/home/");
    expect(raw).not.toContain("C:\\");
    expect(raw.toLowerCase()).not.toMatch(/password\s*[:=]\s*['"]/);
  });
});

describe("Professional Systems frontmatter — images[] registry matches the real file and D-019 rules", () => {
  const { data } = matter(fs.readFileSync(path.join(CONTENT_DIR, "index.mdx"), "utf8"));
  const images = (data as { images?: unknown[] }).images ?? [];

  it("has exactly 1 registered image, provisional-illustration", () => {
    expect(images).toHaveLength(1);
    for (const image of images as Array<{ assetType: string }>) {
      expect(image.assetType).toBe("provisional-illustration");
    }
  });

  it("the registered image's src exists on disk under public/", () => {
    for (const image of images as Array<{ src: string }>) {
      const filePath = path.join(process.cwd(), "public", image.src.replace(/^\//, ""));
      expect(fs.existsSync(filePath), `${image.src} should exist on disk`).toBe(true);
    }
  });

  it("the registered image has a valid D-019 assetType, non-empty alt, and honest caption", () => {
    for (const image of images as Array<{ alt: string; caption?: string; assetType: string }>) {
      expect(ProjectImageAssetTypeSchema.safeParse(image.assetType).success).toBe(true);
      expect(image.alt.length).toBeGreaterThan(0);
      expect(image.caption).toBeTruthy();
      expect((image.caption ?? "").toLowerCase()).toMatch(/diagram|illustrat/);
    }
  });

  it("passes the real reusable checkImageAssets gate against the real file on disk", () => {
    const errors = checkImageAssets("professional-systems", images as never, (relSrc) =>
      fs.existsSync(path.join(process.cwd(), "public", relSrc)),
    );
    expect(errors).toEqual([]);
  });
});
