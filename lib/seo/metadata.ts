import type { Metadata } from "next";

// Safe development value; the production domain is confirmed before
// TASK-008 completion (ARCHITECTURE.md §9) and is never invented.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type BuildMetadataInput = {
  title?: string;
  description: string;
  path: string;
};

export function buildMetadata({ title, description, path }: BuildMetadataInput): Metadata {
  return {
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: new URL(path, SITE_URL).toString(),
    },
  };
}
