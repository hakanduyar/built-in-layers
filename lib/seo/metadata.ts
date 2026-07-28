import type { Metadata } from "next";

/**
 * No production domain is confirmed yet (ARCHITECTURE §9). This safe
 * development value is never presented as the real domain anywhere
 * user-visible; it only backs canonical URLs until TASK-008.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type BuildMetadataOptions = {
  /** Omit to inherit the root layout's default title (used by Home only). */
  title?: string;
  description: string;
  path: string;
};

export function buildMetadata({ title, description, path }: BuildMetadataOptions): Metadata {
  const canonical = new URL(path, SITE_URL).toString();
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical },
  };
}
