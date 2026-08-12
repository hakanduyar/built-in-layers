import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/content/work";
import { SITE_URL } from "@/lib/seo/metadata";

// TASK-008: lists exactly the genuinely public, indexable routes — the
// static pages plus every *published* project (never a draft slug; a
// project not yet approved for publication must not be discoverable via
// the sitemap even though it isn't linked from any page either).
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/work", "/about", "/notes", "/lab"].map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    lastModified: new Date(),
  }));

  const projectRoutes = getPublishedProjects().map((project) => ({
    url: new URL(`/work/${project.slug}`, SITE_URL).toString(),
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...projectRoutes];
}
