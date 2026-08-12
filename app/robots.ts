import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/metadata";

// TASK-008: no route on this site is private or should be hidden from
// crawlers — every published page is meant to be found. Sane defaults only:
// allow everything, point at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
