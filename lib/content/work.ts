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
import { formatGateError, validatePublicationGates } from "@/lib/content/validate";

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

function sortByTierThenOrder(projects: ProjectFrontmatter[]): ProjectFrontmatter[] {
  return [...projects].sort((a, b) => a.order - b.order);
}

/** All projects regardless of status — includes drafts. Server-only. */
export function getAllProjects(contentDir: string = DEFAULT_CONTENT_DIR): ProjectFrontmatter[] {
  return sortByTierThenOrder(parseAllProjects(contentDir).map((entry) => entry.project));
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

  return sortByTierThenOrder(published.map((entry) => entry.project));
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
