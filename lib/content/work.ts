import fs from "node:fs";
import path from "node:path";
import { cache, type ReactElement } from "react";
import matter from "gray-matter";
import { compileProjectMDX } from "@/lib/content/mdx";
import {
  ProjectFrontmatterSchema,
  type ProjectFrontmatter,
  type Tier,
} from "@/lib/content/schemas";
import {
  checkUniqueOrder,
  formatGateError,
  validatePublicationGates,
} from "@/lib/content/validate";

const DEFAULT_CONTENT_DIR = path.join(process.cwd(), "content/work");

type ParsedProject = {
  project: ProjectFrontmatter;
  indexBody: string;
};

// Error messages name only the project-relative file (e.g. "kivilcim/index.mdx"),
// never the absolute filesystem path — this is a build-time-only surface with
// no request-time exposure, but the relative form is kept as a deliberate
// hardening so nothing here ever depends on that distinction.
function readIndexFile(dir: string, entrySlug: string): { data: unknown; content: string } {
  try {
    const raw = fs.readFileSync(path.join(dir, entrySlug, "index.mdx"), "utf8");
    return matter(raw);
  } catch {
    throw new Error(
      formatGateError({ slug: entrySlug, file: "index.mdx", rule: "file could not be read" }),
    );
  }
}

function readLayerFile(
  dir: string,
  entrySlug: string,
  layer: "surface" | "flow" | "system",
): string {
  try {
    return fs.readFileSync(path.join(dir, entrySlug, `${layer}.mdx`), "utf8");
  } catch {
    throw new Error(
      formatGateError({
        slug: entrySlug,
        file: `${layer}.mdx`,
        rule: "file could not be read",
      }),
    );
  }
}

function layerFileExists(
  dir: string,
  entrySlug: string,
  layer: "surface" | "flow" | "system",
): boolean {
  return fs.existsSync(path.join(dir, entrySlug, `${layer}.mdx`));
}

/**
 * Enumerates content/work/<slug>/ from the filesystem, parses each
 * index.mdx's frontmatter with gray-matter, and validates it against the
 * schema gate (CONTENT_MODEL §6.1). Never called with a caller-supplied
 * path — `contentDir` is only ever a fixed constant or a test fixture path,
 * never derived from request/route input.
 */
const parseAllProjects = cache((contentDir: string): ParsedProject[] => {
  if (!fs.existsSync(contentDir)) return [];

  const entries = fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  return entries.map((entrySlug) => {
    const { data, content } = readIndexFile(contentDir, entrySlug);
    const result = ProjectFrontmatterSchema.safeParse(data);

    if (!result.success) {
      const issue = result.error.issues[0];
      const field = issue?.path.join(".") || "(root)";
      const message = issue?.message ?? "invalid frontmatter";
      throw new Error(
        formatGateError({ slug: entrySlug, file: "index.mdx", rule: `${field}: ${message}` }),
      );
    }

    if (result.data.slug !== entrySlug) {
      throw new Error(
        formatGateError({
          slug: entrySlug,
          file: "index.mdx",
          rule: `frontmatter slug "${result.data.slug}" does not match its directory name "${entrySlug}"`,
        }),
      );
    }

    return { project: result.data, indexBody: content };
  });
});

/**
 * THE ORDERING CONTRACT (D-027, owner decision 2026-09-02).
 *
 * `order` is a single GLOBAL editorial sequence, not a position within a
 * tier. It is the only ordering source: D-021 already named it "the single
 * source of truth", and nothing may silently reorder around it.
 *
 * This function was previously called `sortByTierThenOrder`, a name that
 * asserted a two-key sort its body never performed — it has always been a
 * flat sort on `order`. Tier does not participate: `/work` groups by tier
 * separately (`getProjectsByTier`), which is presentation, not ordering.
 *
 * `order` must be unique across published projects, enforced by
 * `checkUniqueOrder`, so no tie-breaker is needed and none is implied.
 */
function sortByOrder(projects: ProjectFrontmatter[]): ProjectFrontmatter[] {
  return [...projects].sort((a, b) => a.order - b.order);
}

/** All projects regardless of status — includes drafts. Server-only. */
export function getAllProjects(contentDir: string = DEFAULT_CONTENT_DIR): ProjectFrontmatter[] {
  return sortByOrder(parseAllProjects(contentDir).map((entry) => entry.project));
}

/**
 * Published projects only, after running the publication gates
 * (CONTENT_MODEL §6-7). Throws a build-failing error naming the project,
 * file, and failing rule if any published project fails a gate. Draft
 * content is excluded before gates ever run, so incomplete drafts never
 * block a production build.
 */
export function getPublishedProjects(
  contentDir: string = DEFAULT_CONTENT_DIR,
): ProjectFrontmatter[] {
  const published = parseAllProjects(contentDir).filter(
    (entry) => entry.project.status === "published",
  );

  for (const entry of published) {
    const { project, indexBody } = entry;
    const needsLayers = project.depth === "full" || project.depth === "short";
    const layerBodies = needsLayers
      ? (["surface", "flow", "system"] as const).every((layer) =>
          layerFileExists(contentDir, project.slug, layer),
        )
        ? {
            surface: readLayerFile(contentDir, project.slug, "surface"),
            flow: readLayerFile(contentDir, project.slug, "flow"),
            system: readLayerFile(contentDir, project.slug, "system"),
          }
        : undefined
      : undefined;

    const errors = validatePublicationGates({ project, indexBody, layerBodies });
    if (errors.length > 0) {
      throw new Error(errors.map(formatGateError).join("; "));
    }
  }

  // Cross-project ordering gate (D-027) — runs after the per-project gates so
  // a duplicate `order` cannot quietly decide editorial sequence.
  const orderErrors = checkUniqueOrder(published.map((entry) => entry.project));
  if (orderErrors.length > 0) {
    throw new Error(orderErrors.map(formatGateError).join("; "));
  }

  return sortByOrder(published.map((entry) => entry.project));
}

export function getProjectsByTier(
  tier: Tier,
  contentDir: string = DEFAULT_CONTENT_DIR,
): ProjectFrontmatter[] {
  return getPublishedProjects(contentDir).filter((project) => project.tier === tier);
}

/**
 * Looks up a project by slug. Security note: the raw `slug` is never used
 * to construct a filesystem path — it is only compared, in memory, against
 * slugs already produced by `readdirSync`. Path traversal is therefore
 * structurally impossible, not merely filtered.
 */
export function getProjectBySlug(
  slug: string,
  contentDir: string = DEFAULT_CONTENT_DIR,
): ProjectFrontmatter | undefined {
  return getAllProjects(contentDir).find((project) => project.slug === slug);
}

export function getProjectIndexBody(
  slug: string,
  contentDir: string = DEFAULT_CONTENT_DIR,
): string | undefined {
  return parseAllProjects(contentDir).find((entry) => entry.project.slug === slug)?.indexBody;
}

/**
 * Whether a project is a destination in case-study navigation.
 *
 * Owner decision (2026-09-02): a preview entry "must not automatically enter
 * full case-study previous/next navigation unless it actually has a
 * case-study destination". "Has a case study" is not a new idea needing a new
 * field — the content model already draws that line at depth, and
 * `getProjectLayers` uses the same test to decide whether case-study layers
 * exist at all.
 *
 * Consequence, stated openly rather than hidden: Software Factory is the
 * flagship but is still `depth: "preview"`, so it is NOT in this collection
 * today and its case study still has no onward link. It joins automatically
 * the moment its depth rises — no navigation code changes with it. Recorded
 * in docs/CONTENT_GAPS.md.
 */
export function isCaseStudyDestination(project: ProjectFrontmatter): boolean {
  return project.depth === "full" || project.depth === "short";
}

export type ProjectNeighbours = {
  previous: ProjectFrontmatter | undefined;
  next: ProjectFrontmatter | undefined;
};

/**
 * Previous/next case studies, derived from the single global `order`
 * sequence (D-027). Replaces the hand-authored `nextSlug` chain, which
 * duplicated the ordering and had drifted out of agreement with it.
 *
 * Both directions come from the same collection, so they cannot disagree.
 * Boundaries are open: the first destination has no previous, the last has
 * no next — never a wrap-around, which would imply a cycle the editorial
 * order does not have.
 *
 * A slug that is not itself a case-study destination gets no neighbours: it
 * has no position in this sequence, so offering one would be an invention.
 */
export function getCaseStudyNeighbours(
  slug: string,
  contentDir: string = DEFAULT_CONTENT_DIR,
): ProjectNeighbours {
  const destinations = getPublishedProjects(contentDir).filter(isCaseStudyDestination);
  const index = destinations.findIndex((project) => project.slug === slug);
  if (index === -1) return { previous: undefined, next: undefined };

  return {
    previous: index > 0 ? destinations[index - 1] : undefined,
    next: index < destinations.length - 1 ? destinations[index + 1] : undefined,
  };
}

export type ProjectLayers = {
  surface: ReactElement;
  flow: ReactElement;
  system: ReactElement;
};

/**
 * Returns compiled layer content in Surface -> Flow -> System order, or
 * `null` when layers are intentionally unavailable (any depth other than
 * "full"/"short" — e.g. every current preview-depth project). Publication
 * gates already guarantee that a *published* full/short project cannot be
 * missing a layer file, so this only returns `null` here for the
 * depth-doesn't-need-layers case, not a silently-omitted one.
 */
export async function getProjectLayers(
  slug: string,
  contentDir: string = DEFAULT_CONTENT_DIR,
): Promise<ProjectLayers | null> {
  const project = getProjectBySlug(slug, contentDir);
  if (!project) return null;
  if (project.depth !== "full" && project.depth !== "short") return null;

  const hasAllLayers = (["surface", "flow", "system"] as const).every((layer) =>
    layerFileExists(contentDir, slug, layer),
  );
  if (!hasAllLayers) return null;

  const [surface, flow, system] = await Promise.all([
    compileProjectMDX(readLayerFile(contentDir, slug, "surface")),
    compileProjectMDX(readLayerFile(contentDir, slug, "flow")),
    compileProjectMDX(readLayerFile(contentDir, slug, "system")),
  ]);

  return { surface, flow, system };
}
