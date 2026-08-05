import type { ProjectFrontmatter } from "@/lib/content/schemas";

// Publication gates (docs/CONTENT_MODEL.md §6-7, docs/ARCHITECTURE.md §7).
// These gates reduce the risk of publishing incomplete, duplicated, or
// unverified content — they do not verify factual truth. They apply only to
// `status: "published"` content; draft content is never gated and never
// blocks a production build.

export type GateError = {
  slug: string;
  file: string;
  rule: string;
};

export function formatGateError({ slug, file, rule }: GateError): string {
  return `${slug} (${file}): ${rule}`;
}

/** CONTENT_MODEL §8.1 — the internal marker. Raw-text scan, independent of
 *  which MDX compiler processes the surrounding content. */
export function containsContentRequiredMarker(text: string): boolean {
  return text.includes("[CONTENT REQUIRED");
}

/** Strips the minimal markup used in this project's MDX (headings, bold,
 *  italics, inline code, links) so the layer-meaning gate measures prose
 *  length rather than markup noise. Intentionally simple, per CONTENT_MODEL
 *  §7's own "simple normalized comparison" framing. */
export function stripMarkup(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Simple normalized Levenshtein-distance similarity in [0, 1]. No
 *  dependency — CLAUDE.md §7: don't install a package when a small local
 *  utility suffices. */
export function similarity(a: string, b: string): number {
  const left = stripMarkup(a);
  const right = stripMarkup(b);
  if (left.length === 0 && right.length === 0) return 1;

  const rows = left.length + 1;
  const cols = right.length + 1;
  const distances: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i += 1) {
    const row = distances[i];
    if (row) row[0] = i;
  }
  for (let j = 0; j < cols; j += 1) {
    const row = distances[0];
    if (row) row[j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      const prevRow = distances[i - 1];
      const currentRow = distances[i];
      if (!prevRow || !currentRow) continue;
      currentRow[j] = Math.min(
        (prevRow[j] ?? 0) + 1,
        (currentRow[j - 1] ?? 0) + 1,
        (prevRow[j - 1] ?? 0) + cost,
      );
    }
  }

  const distance = distances[rows - 1]?.[cols - 1] ?? Math.max(left.length, right.length);
  const maxLength = Math.max(left.length, right.length, 1);
  return 1 - distance / maxLength;
}

export const LAYER_MIN_LENGTH = 400;
export const LAYER_MAX_SIMILARITY = 0.6;

type LayerBodies = {
  surface: string;
  flow: string;
  system: string;
};

/** CONTENT_MODEL §7 — for depth full|short, each layer body must be >= 400
 *  characters (stripped) and no two bodies may be more than 60% similar.
 *  Detects empty/duplicated layer content; does not verify factual truth. */
export function checkLayerMeaning(slug: string, bodies: LayerBodies): GateError[] {
  const errors: GateError[] = [];
  const lengths: Record<keyof LayerBodies, number> = {
    surface: stripMarkup(bodies.surface).length,
    flow: stripMarkup(bodies.flow).length,
    system: stripMarkup(bodies.system).length,
  };

  for (const [layer, length] of Object.entries(lengths) as Array<[keyof LayerBodies, number]>) {
    if (length < LAYER_MIN_LENGTH) {
      errors.push({
        slug,
        file: `${layer}.mdx`,
        rule: `layer body is ${length} characters after stripping markup; minimum is ${LAYER_MIN_LENGTH}`,
      });
    }
  }

  const pairs: Array<[keyof LayerBodies, keyof LayerBodies]> = [
    ["surface", "flow"],
    ["surface", "system"],
    ["flow", "system"],
  ];
  for (const [a, b] of pairs) {
    const ratio = similarity(bodies[a], bodies[b]);
    if (ratio > LAYER_MAX_SIMILARITY) {
      errors.push({
        slug,
        file: `${a}.mdx / ${b}.mdx`,
        rule: `layers are ${(ratio * 100).toFixed(0)}% similar; maximum allowed is ${LAYER_MAX_SIMILARITY * 100}%`,
      });
    }
  }

  return errors;
}

// CONTENT_MODEL §3 — required `h2` narrative sections in index.mdx's body,
// by depth. Surface/Flow/System are excluded here: the table marks them
// "from layer files", not index.mdx headings. Decisions is excluded too:
// the table marks it "from frontmatter data" (already schema-enforced via
// the >= 3 decisions rule for depth "full"). Preview requires none — the
// description field alone suffices (§3: "— (description field only)").
export const REQUIRED_SECTIONS_BY_DEPTH: Record<ProjectFrontmatter["depth"], string[]> = {
  full: ["One-minute summary", "Why it exists", "Constraints", "Evolution", "Reflection"],
  short: ["One-minute summary", "Why it exists", "Reflection"],
  preview: [],
  none: [],
};

/** Extracts `## Heading` text (h2 only) from raw MDX/markdown source. */
export function extractH2Headings(text: string): string[] {
  return text
    .split("\n")
    .filter((line) => /^##\s+/.test(line))
    .map((line) => line.replace(/^##\s+/, "").trim());
}

/** CONTENT_MODEL §3 — a published full/short-depth project must have every
 *  required narrative section present as an `h2` heading in index.mdx. Does
 *  not apply to preview/none depth (nothing required there) — this is a
 *  structural completeness check, not a claim that the section content
 *  itself is factually accurate. */
export function checkRequiredSectionHeadings(
  slug: string,
  depth: ProjectFrontmatter["depth"],
  indexBody: string,
): GateError[] {
  const required = REQUIRED_SECTIONS_BY_DEPTH[depth] ?? [];
  if (required.length === 0) return [];

  const headings = extractH2Headings(indexBody).map((h) => h.toLowerCase());
  const errors: GateError[] = [];
  for (const section of required) {
    if (!headings.includes(section.toLowerCase())) {
      errors.push({
        slug,
        file: "index.mdx",
        rule: `required section heading "${section}" is missing (depth: ${depth})`,
      });
    }
  }
  return errors;
}

export type PublishedContentCheck = {
  project: ProjectFrontmatter;
  indexBody: string;
  layerBodies?: LayerBodies;
};

/** Master publication gate for a single `status: "published"` project.
 *  Returns every failing rule, each identifying the project, file, and rule
 *  — never just a boolean. Never called for `status: "draft"` content. */
export function validatePublicationGates({
  project,
  indexBody,
  layerBodies,
}: PublishedContentCheck): GateError[] {
  const errors: GateError[] = [];
  const { slug } = project;

  // Marker gate (CONTENT_MODEL §6.2): no [CONTENT REQUIRED marker anywhere
  // in rendered text — frontmatter strings included, since those render too.
  const renderedStrings = [
    project.title,
    project.categoryLabel,
    project.description,
    project.contribution ?? "",
    project.upstream?.url ?? "",
    project.upstream?.name ?? "",
    project.upstream?.relationship ?? "",
    indexBody,
  ];
  if (renderedStrings.some((text) => containsContentRequiredMarker(text))) {
    errors.push({
      slug,
      file: "index.mdx / frontmatter",
      rule: "published content must not contain a [CONTENT REQUIRED marker",
    });
  }

  // verificationStatus / depth gate (CONTENT_MODEL §6.3-6.5).
  if (project.verificationStatus === "do-not-publish") {
    errors.push({
      slug,
      file: "index.mdx",
      rule: "verificationStatus 'do-not-publish' refuses publication regardless of other fields",
    });
  } else if (project.depth === "full") {
    if (project.verificationStatus !== "verified") {
      errors.push({
        slug,
        file: "index.mdx",
        rule: "depth 'full' requires verificationStatus 'verified'",
      });
    }
    if (!project.factsCheckedAgainstRepo) {
      errors.push({
        slug,
        file: "index.mdx",
        rule: "depth 'full' requires factsCheckedAgainstRepo === true",
      });
    }
  } else if (project.depth === "short") {
    if (project.verificationStatus !== "verified" && project.verificationStatus !== "partial") {
      errors.push({
        slug,
        file: "index.mdx",
        rule: "depth 'short' requires verificationStatus 'verified' or 'partial'",
      });
    }
  }

  // Images: non-empty alt already schema-enforced. assetType (D-019) —
  // "verified-diagram"/"provisional-illustration" honesty (visible label,
  // repository-verified content only) is verified manually per task, same
  // as the pre-existing pending-copy rules this doesn't duplicate.

  // Required-section heading gate (CONTENT_MODEL §3) — full/short depth only.
  errors.push(...checkRequiredSectionHeadings(slug, project.depth, indexBody));

  // Layer-meaning gate (CONTENT_MODEL §7) — full/short depth only.
  if (project.depth === "full" || project.depth === "short") {
    if (!layerBodies) {
      errors.push({
        slug,
        file: "surface.mdx / flow.mdx / system.mdx",
        rule: "depth 'full' or 'short' requires all three layer files to exist",
      });
    } else {
      errors.push(...checkLayerMeaning(slug, layerBodies));
    }
  }

  return errors;
}
