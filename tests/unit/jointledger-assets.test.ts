import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { ProjectImageAssetTypeSchema } from "@/lib/content/schemas";
import { checkImageAssets } from "@/lib/content/validate";

// D-019 (docs/DECISIONS.md) — JointLedger's asset set (JointLedger publication
// pass, 2026-08-10): four `verified-diagram` SVGs. No real screenshots exist
// because no frontend UI for the shared-book work exists yet (verified during
// the repository audit — zero references to a book id anywhere in the Vue
// source), so there is nothing to photograph honestly.

const ASSETS_DIR = path.join(process.cwd(), "public/images/projects/jointledger");
const CONTENT_DIR = path.join(process.cwd(), "content/work/jointledger");

const DIAGRAMS = [
  { file: "upstream-extension-map.svg", requiredLabel: "VERIFIED EXTENSION DIAGRAM" },
  { file: "personal-book-backfill-flow.svg", requiredLabel: "VERIFIED FLOW DIAGRAM" },
  { file: "book-data-model-diagram.svg", requiredLabel: "VERIFIED ARCHITECTURE DIAGRAM" },
  { file: "book-scoped-authorization-diagram.svg", requiredLabel: "VERIFIED ARCHITECTURE DIAGRAM" },
] as const;

function readAsset(file: string): string {
  return fs.readFileSync(path.join(ASSETS_DIR, file), "utf8");
}

function parseSvg(raw: string): Document {
  return new DOMParser().parseFromString(raw, "image/svg+xml");
}

describe("JointLedger assets — exactly the expected files exist, nothing else lingers", () => {
  it("has exactly the 4 diagrams on disk, no stray or old files", () => {
    const actual = fs.readdirSync(ASSETS_DIR).filter((name) => name !== ".gitkeep");
    const expected = DIAGRAMS.map((d) => d.file);
    expect(actual.sort()).toEqual(expected.sort());
  });

  it("the old generic placeholder is gone", () => {
    expect(fs.existsSync(path.join(ASSETS_DIR, "placeholder-asset-pending.svg"))).toBe(false);
  });
});

describe("JointLedger diagrams — accessible title and description", () => {
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

describe("JointLedger diagrams — required visible honesty label", () => {
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

describe("JointLedger diagrams — no unsafe or misleading content", () => {
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

    it(`${file} does not claim ezBookkeeping's own accounting/transaction engine as Hakan's work`, () => {
      const doc = parseSvg(raw);
      const allText = Array.from(doc.querySelectorAll("text, title, desc"))
        .map((n) => n.textContent ?? "")
        .join(" ");
      // Every diagram is scoped to what the audit actually verified; none may
      // present ezBookkeeping's inherited engine as a JointLedger addition.
      expect(allText).not.toMatch(/I (built|wrote|created) (the )?transaction engine/i);
    });
  }
});

describe("JointLedger frontmatter — images[] registry matches the real files and D-019 rules", () => {
  const { data } = matter(fs.readFileSync(path.join(CONTENT_DIR, "index.mdx"), "utf8"));
  const images = (data as { images?: unknown[] }).images ?? [];

  it("has exactly 4 registered images, all verified-diagram", () => {
    expect(images).toHaveLength(4);
    for (const image of images as Array<{ assetType: string }>) {
      expect(image.assetType).toBe("verified-diagram");
    }
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
      expect((image.caption ?? "").toLowerCase()).toMatch(/diagram|illustrat/);
    }
  });

  it("the old generic placeholder is not registered anywhere", () => {
    for (const image of images as Array<{ src: string }>) {
      expect(image.src).not.toContain("placeholder-asset-pending");
    }
  });

  it("passes the real reusable checkImageAssets gate against real files on disk", () => {
    const errors = checkImageAssets("jointledger", images as never, (relSrc) =>
      fs.existsSync(path.join(process.cwd(), "public", relSrc)),
    );
    expect(errors).toEqual([]);
  });
});
