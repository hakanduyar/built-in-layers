import type { Metadata } from "next";
import { siteOwner, socialLinks } from "@/data/site";

// The one and only production-base-URL mechanism (ARCHITECTURE §9,
// TASK-002/TASK-008's own task files): set NEXT_PUBLIC_SITE_URL at deploy
// time to the confirmed production domain. No second/competing mechanism
// exists anywhere in this codebase (sitemap.ts, robots.ts, buildMetadata,
// and buildPersonJsonLd all import this single constant). Until Hakan
// confirms a real domain, this keeps the safe development fallback and the
// domain is never invented/guessed — this is why the "canonical URLs use
// the confirmed domain" TASK-008 acceptance criterion stays unmet; it is a
// deployment-time configuration item, not a code gap. Verified correct
// end-to-end (canonical/sitemap/robots/JSON-LD all derive from the env var
// with no double slashes) with a real production build using a
// RFC 2606/6761-reserved test-only domain
// (tests/unit/seo.test.ts's "SITE_URL: derivation once a real domain is
// configured" suite; see the dated docs/PROGRESS.md TASK-008 entry for the
// manual build-time cross-check) — that value never appears as a default.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type BuildMetadataInput = {
  title?: string;
  description: string;
  path: string;
};

// ARCHITECTURE §9 / D-007: "one static default image in MVP... per-project
// OG images only when real assets exist." `app/opengraph-image.tsx` is
// that single default (generated once at build time via `next/og`, no
// per-project image exists yet; dimensions/alt kept in sync with that
// file's own `size`/`alt` exports). Referenced explicitly here on every
// route's own `openGraph`/`twitter` object — Next.js does NOT deep-merge a
// route's `openGraph` object with the root layout's auto-discovered image
// convention; a route-level `openGraph` object without its own `images`
// key silently drops the image instead of inheriting it (confirmed
// empirically: only `/`, which has the shallowest metadata, showed the
// auto-discovered image; `/about`/`/work`/case studies did not, until this
// explicit reference was added). The full descriptor object (not a bare
// string) is required for Next.js to also emit `og:image:width`/`height`/
// `alt` meta tags, not just `og:image` itself — confirmed empirically: a
// bare `images: ["/opengraph-image"]` string only produced the `og:image`
// tag. The relative `url` resolves against `metadataBase`
// (`app/layout.tsx`), the same single SITE_URL mechanism every other
// metadata surface uses.
const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Built in Layers — Hakan Duyar, Frontend & Product Engineer. Interfaces on the surface. Systems underneath.",
};
export function buildMetadata({ title, description, path }: BuildMetadataInput): Metadata {
  const url = new URL(path, SITE_URL).toString();
  const resolvedTitle = title ? `${title} — Hakan Duyar` : undefined;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      ...(resolvedTitle ? { title: resolvedTitle } : {}),
      description,
      url,
      siteName: "Built in Layers",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      ...(resolvedTitle ? { title: resolvedTitle } : {}),
      description,
      images: [OG_IMAGE],
    },
  };
}

// ARCHITECTURE §9 / original TASK-008 scope: a single Person object on `/`
// and `/about`, verified fields only. No email or location — both remain
// `REQUIRES USER CONFIRMATION` in docs/CONTENT_INVENTORY.md. No employer,
// organization, or address claim (none is approved).
export function buildPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteOwner,
    jobTitle: "Frontend & Product Engineer",
    url: SITE_URL,
    sameAs: socialLinks.map((link) => link.url),
  };
}
