import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { ProjectImageAssetTypeSchema } from "@/lib/content/schemas";
import { checkImageAssets } from "@/lib/content/validate";

// D-019 (docs/DECISIONS.md) — DropSpot's asset set (TASK-006, remediated
// 2026-08-05): three technical `verified-diagram` SVGs plus four real,
// repository-sourced `real-screenshot` images. These tests check real
// structural/security properties of the actual files and the real
// frontmatter that references them, rather than re-asserting a hand-copied
// expectation of their markup.

const ASSETS_DIR = path.join(process.cwd(), "public/images/projects/dropspot");
const CONTENT_DIR = path.join(process.cwd(), "content/work/dropspot");

const DIAGRAMS = [
  { file: "core-flow-diagram.svg", requiredLabel: "VERIFIED FLOW DIAGRAM" },
  { file: "claim-transaction-diagram.svg", requiredLabel: "VERIFIED ARCHITECTURE DIAGRAM" },
  { file: "priority-score-diagram.svg", requiredLabel: "VERIFIED ARCHITECTURE DIAGRAM" },
] as const;

const SCREENSHOTS = [
  "browse-drops.webp",
  "drop-detail.webp",
  "admin-panel.webp",
  "waitlist-joined.webp",
] as const;

function readAsset(file: string): string {
  return fs.readFileSync(path.join(ASSETS_DIR, file), "utf8");
}

function parseSvg(raw: string): Document {
  return new DOMParser().parseFromString(raw, "image/svg+xml");
}

describe("DropSpot assets — exactly the expected files exist, nothing else lingers", () => {
  it("has exactly the 3 diagrams + 4 screenshots on disk, no stray or old files", () => {
    const actual = fs.readdirSync(ASSETS_DIR).filter((name) => name !== ".gitkeep");
    const expected = [...DIAGRAMS.map((d) => d.file), ...SCREENSHOTS];
    expect(actual.sort()).toEqual(expected.sort());
  });

  it("the old generic placeholder is gone", () => {
    expect(fs.existsSync(path.join(ASSETS_DIR, "placeholder-asset-pending.svg"))).toBe(false);
  });

  it("the removed provisional screens-map.svg is genuinely gone, not just unregistered", () => {
    expect(fs.existsSync(path.join(ASSETS_DIR, "screens-map.svg"))).toBe(false);
  });

  it("the rejected pgAdmin dashboard image was never imported as a schema diagram", () => {
    for (const name of ["db.png", "db.webp", "schema.png", "schema.webp"]) {
      expect(fs.existsSync(path.join(ASSETS_DIR, name))).toBe(false);
    }
  });
});

describe("DropSpot diagrams — accessible title and description", () => {
  for (const { file } of DIAGRAMS) {
    it(`${file} has role="img" and a non-trivial <title> and <desc>`, () => {
      const doc = parseSvg(readAsset(file));
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
  }

  it("every diagram has a unique title/desc id pair (no collisions across the set)", () => {
    const seen = new Set<string>();
    for (const { file } of DIAGRAMS) {
      const doc = parseSvg(readAsset(file));
      const labelledBy = doc.querySelector("svg")?.getAttribute("aria-labelledby") ?? "";
      for (const id of labelledBy.split(/\s+/).filter(Boolean)) {
        expect(seen.has(id), `id "${id}" reused across assets`).toBe(false);
        seen.add(id);
      }
    }
  });
});

describe("DropSpot diagrams — required visible honesty label", () => {
  for (const { file, requiredLabel } of DIAGRAMS) {
    it(`${file} visibly renders "${requiredLabel}" as SVG text content`, () => {
      const doc = parseSvg(readAsset(file));
      const textNodes = Array.from(doc.querySelectorAll("text")).map(
        (node) => node.textContent ?? "",
      );
      expect(textNodes.some((text) => text.includes(requiredLabel))).toBe(true);
    });
  }
});

describe("DropSpot diagrams — no unsafe or misleading content", () => {
  for (const { file } of DIAGRAMS) {
    const raw = readAsset(file);

    it(`${file} contains no <script>`, () => {
      expect(/<script/i.test(raw)).toBe(false);
    });

    it(`${file} contains no <foreignObject>`, () => {
      expect(/<foreignObject/i.test(raw)).toBe(false);
    });

    it(`${file} contains no embedded raster <image>`, () => {
      expect(/<image[\s>]/i.test(raw)).toBe(false);
    });

    it(`${file} contains no event-handler attribute`, () => {
      expect(/\son[a-z]+\s*=/i.test(raw)).toBe(false);
    });

    it(`${file} contains no animation element`, () => {
      expect(/<animate|<animateTransform|<animateMotion/i.test(raw)).toBe(false);
    });

    it(`${file} references no external resource (only the required xmlns URI)`, () => {
      const urls = raw.match(/https?:\/\/[^\s"'<>]+/g) ?? [];
      for (const url of urls) {
        expect(url).toBe("http://www.w3.org/2000/svg");
      }
    });

    it(`${file} has no href/xlink:href to an external resource`, () => {
      expect(/(?:^|[^-])href\s*=\s*"https?:/i.test(raw)).toBe(false);
      expect(/xlink:href/i.test(raw)).toBe(false);
    });

    it(`${file} does not claim to be a real screenshot`, () => {
      const doc = parseSvg(raw);
      const allText = Array.from(doc.querySelectorAll("text, title, desc"))
        .map((n) => n.textContent ?? "")
        .join(" ")
        .toLowerCase();
      const screenshotMentions = allText.match(/[^.]*screenshot[^.]*/g) ?? [];
      for (const mention of screenshotMentions) {
        expect(mention).toMatch(/not a (product |captured )?screen(shot)?/);
      }
    });

    it(`${file} contains no credential-shaped string or local filesystem path`, () => {
      expect(raw).not.toMatch(/AIza[0-9A-Za-z_-]{20,}/);
      expect(raw.toLowerCase()).not.toContain("localhost");
      expect(raw).not.toContain("/home/");
      expect(raw).not.toContain("C:\\");
      expect(raw.toLowerCase()).not.toMatch(/password\s*[:=]\s*['"]/);
    });
  }
});

describe("DropSpot real screenshots — genuine WebP files, safely sized", () => {
  for (const file of SCREENSHOTS) {
    it(`${file} exists on disk and is a genuine WebP file (RIFF/WEBP header)`, () => {
      const filePath = path.join(ASSETS_DIR, file);
      expect(fs.existsSync(filePath)).toBe(true);

      const buffer = fs.readFileSync(filePath);
      expect(buffer.subarray(0, 4).toString("ascii")).toBe("RIFF");
      expect(buffer.subarray(8, 12).toString("ascii")).toBe("WEBP");
    });

    it(`${file} is a real, non-trivial image file (not a stub or placeholder-sized file)`, () => {
      const filePath = path.join(ASSETS_DIR, file);
      const { size } = fs.statSync(filePath);
      // A genuine 1700-1900px-wide UI screenshot, even losslessly
      // compressed, is comfortably several KB; this floor only exists to
      // catch an accidentally-truncated or placeholder-sized file, not to
      // assert a specific quality level.
      expect(size).toBeGreaterThan(5_000);
      expect(size).toBeLessThan(10_000_000);
    });
  }
});

describe("DropSpot frontmatter — images[] registry matches the real files and D-019 rules", () => {
  const { data } = matter(fs.readFileSync(path.join(CONTENT_DIR, "index.mdx"), "utf8"));
  const images = (data as { images?: unknown[] }).images ?? [];

  it("has exactly 7 registered images: 4 real screenshots + 3 verified diagrams", () => {
    expect(images).toHaveLength(7);
  });

  it("every registered image's src exists on disk under public/", () => {
    for (const image of images as Array<{ src: string }>) {
      const filePath = path.join(process.cwd(), "public", image.src.replace(/^\//, ""));
      expect(fs.existsSync(filePath), `${image.src} should exist on disk`).toBe(true);
    }
  });

  it("every registered image has a valid D-019 assetType, non-empty alt, and honest caption", () => {
    for (const image of images as Array<{ alt: string; caption?: string; assetType: string }>) {
      expect(ProjectImageAssetTypeSchema.safeParse(image.assetType).success).toBe(true);
      expect(image.alt.length).toBeGreaterThan(0);
      expect(image.caption).toBeTruthy();
    }
  });

  it("has exactly 4 real-screenshot entries and 3 verified-diagram entries, 0 provisional-illustration", () => {
    const byType = (images as Array<{ assetType: string }>).reduce<Record<string, number>>(
      (acc, img) => {
        acc[img.assetType] = (acc[img.assetType] ?? 0) + 1;
        return acc;
      },
      {},
    );
    expect(byType["real-screenshot"]).toBe(4);
    expect(byType["verified-diagram"]).toBe(3);
    expect(byType["provisional-illustration"] ?? 0).toBe(0);
  });

  it("real-screenshot captions make no 'not a screenshot' denial (they genuinely are screenshots)", () => {
    const realScreenshots = (
      images as Array<{ assetType: string; caption?: string; alt: string }>
    ).filter((img) => img.assetType === "real-screenshot");
    expect(realScreenshots.length).toBeGreaterThan(0);
    for (const img of realScreenshots) {
      expect((img.caption ?? "").toLowerCase()).not.toContain("not a");
      expect(img.alt.toLowerCase()).not.toContain("not a screenshot");
    }
  });

  it("verified-diagram entries still carry the honest diagram/illustration denial", () => {
    const diagrams = (images as Array<{ assetType: string; caption?: string }>).filter(
      (img) => img.assetType === "verified-diagram",
    );
    for (const img of diagrams) {
      expect((img.caption ?? "").toLowerCase()).toMatch(/diagram|illustrat/);
    }
  });

  it("the old generic placeholder and the removed screens-map are not registered anywhere", () => {
    for (const image of images as Array<{ src: string }>) {
      expect(image.src).not.toContain("placeholder-asset-pending");
      expect(image.src).not.toContain("screens-map");
    }
  });

  it("passes the real reusable checkImageAssets gate against real files on disk", () => {
    const errors = checkImageAssets("dropspot", images as never, (relSrc) =>
      fs.existsSync(path.join(process.cwd(), "public", relSrc)),
    );
    expect(errors).toEqual([]);
  });
});
