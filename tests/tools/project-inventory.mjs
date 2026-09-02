// PROJECT INVENTORY — evidence extraction from the real content tree.
// Reads every content/work/<slug>/ entry and reports the facts the
// architecture classification must be based on. No judgement here.
import matter from "gray-matter";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const WORK = join(ROOT, "content/work");
const LAYERS = ["surface", "flow", "system"];

const slugs = readdirSync(WORK, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const words = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);

const rows = [];
for (const slug of slugs) {
  const dir = join(WORK, slug);
  const indexPath = join(dir, "index.mdx");
  if (!existsSync(indexPath)) {
    rows.push({ slug, ERROR: "no index.mdx" });
    continue;
  }
  const { data: fm, content } = matter(readFileSync(indexPath, "utf8"));

  const layerFiles = {};
  for (const l of LAYERS) {
    const p = join(dir, l + ".mdx");
    if (existsSync(p)) {
      const body = matter(readFileSync(p, "utf8")).content;
      layerFiles[l] = { exists: true, words: words(body), bytes: statSync(p).size };
    } else {
      layerFiles[l] = { exists: false, words: 0, bytes: 0 };
    }
  }

  // assets referenced by frontmatter vs present on disk
  const imgs = Array.isArray(fm.images) ? fm.images : [];
  const referenced = imgs.map((i) => i.src);
  const missingOnDisk = referenced.filter((src) => !existsSync(join(ROOT, "public", src)));
  const assetDir = join(ROOT, "public/images/projects", slug);
  const onDisk = existsSync(assetDir)
    ? readdirSync(assetDir).filter((f) => !f.startsWith("."))
    : [];
  const unreferenced = onDisk.filter((f) => !referenced.some((src) => src.endsWith("/" + f)));

  rows.push({
    slug,
    title: fm.title,
    tier: fm.tier,
    depth: fm.depth,
    order: fm.order,
    provenance: fm.provenance,
    status: fm.status,
    verificationStatus: fm.verificationStatus,
    phase: fm.phase ?? null,
    factsChecked: fm.factsCheckedAgainstRepo,
    aiAssisted: fm.aiAssisted ?? null,
    hasContribution: Boolean(fm.contribution && String(fm.contribution).trim()),
    contributionWords: fm.contribution ? words(String(fm.contribution)) : 0,
    hasLayersSummary: Boolean(fm.layers),
    layerSummaryWords: fm.layers
      ? Object.fromEntries(LAYERS.map((l) => [l, words(String(fm.layers[l]?.summary ?? ""))]))
      : null,
    decisions: Array.isArray(fm.decisions) ? fm.decisions.length : 0,
    tech: Array.isArray(fm.tech) ? fm.tech.length : 0,
    links: Array.isArray(fm.links) ? fm.links.map((l) => l.kind + ":" + l.visibility) : [],
    images: imgs.length,
    assetTypes: imgs.reduce((a, i) => {
      a[i.assetType] = (a[i.assetType] ?? 0) + 1;
      return a;
    }, {}),
    imagesWithLayer: imgs.filter((i) => i.layer).length,
    timeline: fm.timeline ?? null,
    nextSlug: fm.nextSlug ?? null,
    indexBodyWords: words(content),
    layerFiles,
    assetsMissingOnDisk: missingOnDisk,
    assetsOnDiskUnreferenced: unreferenced,
  });
}

console.log(JSON.stringify({ generated: "PROJECT INVENTORY", projects: rows }, null, 2));
