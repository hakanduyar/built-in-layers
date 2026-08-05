import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { ProjectImageAssetTypeSchema } from "@/lib/content/schemas";

// D-019 (docs/DECISIONS.md) — Kıvılcım's four provisional/verified assets.
// These tests check real structural and security properties of the actual
// SVG files and the real frontmatter that references them, rather than
// re-asserting a hand-copied expectation of their markup.

const ASSETS_DIR = path.join(process.cwd(), "public/images/projects/kivilcim");
const CONTENT_DIR = path.join(process.cwd(), "content/work/kivilcim");

const ASSETS = [
  {
    file: "product-areas-map.svg",
    requiredLabel: "ILLUSTRATIVE PRODUCT MAP — NOT A SCREENSHOT",
  },
  { file: "core-flow-diagram.svg", requiredLabel: "VERIFIED FLOW DIAGRAM" },
  { file: "local-first-architecture.svg", requiredLabel: "VERIFIED ARCHITECTURE DIAGRAM" },
  { file: "focus-lifecycle.svg", requiredLabel: "VERIFIED STATE DIAGRAM" },
] as const;

function readAsset(file: string): string {
  return fs.readFileSync(path.join(ASSETS_DIR, file), "utf8");
}

function parseSvg(raw: string): Document {
  return new DOMParser().parseFromString(raw, "image/svg+xml");
}

describe("Kıvılcım D-019 assets — files exist and are well-formed SVG", () => {
  for (const { file } of ASSETS) {
    it(`${file} exists on disk`, () => {
      expect(fs.existsSync(path.join(ASSETS_DIR, file))).toBe(true);
    });

    it(`${file} parses as valid XML with no parser error`, () => {
      const doc = parseSvg(readAsset(file));
      expect(doc.querySelector("parsererror")).toBeNull();
      expect(doc.querySelector("svg")).not.toBeNull();
    });
  }

  it("no other file lingers in the kivilcim asset directory", () => {
    const actual = fs.readdirSync(ASSETS_DIR).filter((name) => name !== ".gitkeep");
    expect(actual.sort()).toEqual(ASSETS.map((a) => a.file).sort());
  });
});

describe("Kıvılcım D-019 assets — accessible title and description", () => {
  for (const { file } of ASSETS) {
    it(`${file} has role="img" and a non-trivial <title> and <desc>`, () => {
      const doc = parseSvg(readAsset(file));
      const svg = doc.querySelector("svg");
      expect(svg?.getAttribute("role")).toBe("img");

      const title = svg?.querySelector("title")?.textContent?.trim() ?? "";
      const desc = svg?.querySelector("desc")?.textContent?.trim() ?? "";
      expect(title.length).toBeGreaterThan(10);
      expect(desc.length).toBeGreaterThan(40);

      // aria-labelledby must actually point at the title/desc ids present.
      const labelledBy = svg?.getAttribute("aria-labelledby") ?? "";
      const ids = labelledBy.split(/\s+/).filter(Boolean);
      expect(ids.length).toBeGreaterThanOrEqual(2);
      for (const id of ids) {
        expect(doc.getElementById(id)).not.toBeNull();
      }
    });
  }
});

describe("Kıvılcım D-019 assets — required visible honesty label", () => {
  for (const { file, requiredLabel } of ASSETS) {
    it(`${file} visibly renders "${requiredLabel}" as SVG text content`, () => {
      const doc = parseSvg(readAsset(file));
      const textNodes = Array.from(doc.querySelectorAll("text")).map(
        (node) => node.textContent ?? "",
      );
      expect(textNodes.some((text) => text.includes(requiredLabel))).toBe(true);
    });
  }
});

describe("Kıvılcım D-019 assets — no unsafe or misleading content", () => {
  for (const { file } of ASSETS) {
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

    it(`${file} references no external resource (only the required xmlns URI)`, () => {
      // The only permitted "http(s)://" occurrence is the mandatory SVG/XML
      // namespace declaration itself — never a live fetch target.
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
      // Every mention of "screenshot" in these assets must be part of an
      // honest denial ("not a screenshot"), never a bare claim of being one.
      const screenshotMentions = allText.match(/[^.]*screenshot[^.]*/g) ?? [];
      for (const mention of screenshotMentions) {
        expect(mention).toMatch(/not a (product |captured )?screen(shot)?/);
      }
    });

    it(`${file} contains no private repository path or credential-shaped string`, () => {
      // "API key" as a plain-English phrase (describing the verified,
      // user-supplied-key architecture fact) is fine; an actual key value
      // is not. Only the latter is checked here.
      expect(raw).not.toMatch(/AIza[0-9A-Za-z_-]{20,}/);
      expect(raw.toLowerCase()).not.toContain("localhost");
      expect(raw).not.toContain("/home/");
      expect(raw).not.toContain("C:\\");
    });
  }
});

describe("Kıvılcım D-019 assets — reset transitions visibly reach their target node", () => {
  // Regression test for a real defect found in independent review: a reset
  // path's final coordinate didn't match the Idle node's actual boundary,
  // so its arrowhead pointed at empty space instead of the Idle box. Rather
  // than hardcoding the expected endpoint (which would just duplicate the
  // same two numbers the SVG author could get wrong again), this derives
  // the correct target from Idle's own <rect> geometry and checks every
  // dashed "reset" path's real final coordinate against it.
  function lastPoint(d: string): { x: number; y: number } {
    const numbers = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
    const y = numbers.pop();
    const x = numbers.pop();
    if (x === undefined || y === undefined) {
      throw new Error(`could not parse a final coordinate from path data: "${d}"`);
    }
    return { x, y };
  }

  it("focus-lifecycle.svg: every dashed reset path ends exactly on Idle's boundary", () => {
    const doc = parseSvg(readAsset("focus-lifecycle.svg"));

    const idleText = Array.from(doc.querySelectorAll("text")).find(
      (node) => node.textContent === "Idle",
    );
    const idleGroup = idleText?.closest("g");
    const idleRect = idleGroup?.querySelector("rect");
    expect(idleRect, "expected to find the Idle node's <rect>").not.toBeNull();
    if (!idleRect) return;

    const rx = Number(idleRect.getAttribute("x"));
    const ry = Number(idleRect.getAttribute("y"));
    const rw = Number(idleRect.getAttribute("width"));
    const rh = Number(idleRect.getAttribute("height"));
    // Every reset arrow in this diagram approaches Idle from below, so the
    // expected entry point is the bottom edge, centered horizontally.
    const target = { x: rx + rw / 2, y: ry + rh };

    const resetPaths = Array.from(doc.querySelectorAll("path[stroke-dasharray]"));
    expect(resetPaths.length).toBeGreaterThan(0);

    for (const p of resetPaths) {
      const d = p.getAttribute("d") ?? "";
      const end = lastPoint(d);
      expect(end.x, `path "${d}" should end at Idle's x-center`).toBeCloseTo(target.x, 0);
      expect(end.y, `path "${d}" should end at Idle's bottom edge, not float in empty space`).toBe(
        target.y,
      );
    }
  });
});

describe("Kıvılcım frontmatter — images[] registry matches the real files and D-019 rules", () => {
  const { data } = matter(fs.readFileSync(path.join(CONTENT_DIR, "index.mdx"), "utf8"));
  const images = (data as { images?: unknown[] }).images ?? [];

  it("has exactly 4 registered images, one per created asset", () => {
    expect(images).toHaveLength(4);
  });

  it("every registered image's src exists on disk under public/", () => {
    for (const image of images as Array<{ src: string }>) {
      const filePath = path.join(process.cwd(), "public", image.src.replace(/^\//, ""));
      expect(fs.existsSync(filePath), `${image.src} should exist on disk`).toBe(true);
    }
  });

  it("every registered image has a valid D-019 assetType, non-empty alt, and honest caption", () => {
    for (const image of images as Array<{
      alt: string;
      caption?: string;
      assetType: string;
    }>) {
      expect(ProjectImageAssetTypeSchema.safeParse(image.assetType).success).toBe(true);
      expect(image.alt.length).toBeGreaterThan(0);
      expect(image.alt.toLowerCase()).not.toContain("screenshot of");
      expect(image.caption).toBeTruthy();
    }
  });

  it("no registered image is assetType real-screenshot (none exist yet)", () => {
    for (const image of images as Array<{ assetType: string }>) {
      expect(image.assetType).not.toBe("real-screenshot");
    }
  });

  it("the old generic placeholder is not registered anywhere", () => {
    for (const image of images as Array<{ src: string }>) {
      expect(image.src).not.toContain("placeholder-asset-pending");
    }
  });
});
