import { z } from "zod";

// Executable form of docs/CONTENT_MODEL.md — the single source of truth at
// runtime. Field names, enum values, and conditional rules must match that
// document exactly.

// §1 Shared enums
export const TierSchema = z.enum(["featured", "real-life", "archive", "origins"]);
export const CaseStudyDepthSchema = z.enum(["full", "short", "preview", "none"]);
export const ProvenanceSchema = z.enum([
  "personal",
  "professional",
  "internship",
  "learning",
  "fork",
]);
export const VerificationSchema = z.enum([
  "verified",
  "partial",
  "requires-user",
  "do-not-publish",
]);
export const PublishStatusSchema = z.enum(["draft", "published"]);
export const ProjectPhaseSchema = z.enum(["active-development", "usable", "paused", "archived"]);

export type Tier = z.infer<typeof TierSchema>;
export type CaseStudyDepth = z.infer<typeof CaseStudyDepthSchema>;
export type Provenance = z.infer<typeof ProvenanceSchema>;
export type Verification = z.infer<typeof VerificationSchema>;
export type PublishStatus = z.infer<typeof PublishStatusSchema>;
export type ProjectPhase = z.infer<typeof ProjectPhaseSchema>;

const UpstreamSchema = z.object({
  name: z.string(),
  url: z.string(),
  relationship: z.string(),
});

const ProjectLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
  kind: z.enum(["repo", "live", "demo", "article", "other"]),
  visibility: z.enum(["public", "private-noted"]),
});

// D-019: what kind of asset this is, and therefore which honesty rule
// applies to it. Replaces the earlier `placeholder: boolean` field with a
// single, non-duplicated distinction rather than layering a second flag
// alongside it.
export const ProjectImageAssetTypeSchema = z.enum([
  "real-screenshot",
  "verified-diagram",
  "provisional-illustration",
]);
export type ProjectImageAssetType = z.infer<typeof ProjectImageAssetTypeSchema>;

const ProjectImageSchema = z.object({
  src: z.string(),
  alt: z.string().min(1),
  caption: z.string().optional(),
  layer: z.enum(["surface", "flow", "system"]).optional(),
  assetType: ProjectImageAssetTypeSchema,
});

const ProjectLayersSchema = z.object({
  surface: z.object({ summary: z.string() }),
  flow: z.object({ summary: z.string() }),
  system: z.object({ summary: z.string() }),
});

const ProjectDecisionSchema = z.object({
  id: z.string(),
  title: z.string(),
  context: z.string(),
  choice: z.string(),
  alternatives: z.array(z.string()),
  tradeoff: z.string(),
});

// §2 Project frontmatter. `contribution` is modelled as optional at the base
// level and required conditionally via superRefine below — the conditional
// requirements table is the more specific, authoritative source than the
// inline type comment, which would otherwise be self-contradictory (it says
// "REQUIRED when tier === featured" on a field with no `?`).
const ProjectFrontmatterBaseSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  categoryLabel: z.string().min(1),
  description: z.string().min(1).max(160),
  tier: TierSchema,
  depth: CaseStudyDepthSchema,
  order: z.number(),

  provenance: ProvenanceSchema,
  upstream: UpstreamSchema.optional(),
  // aiAssisted and phase are optional at the schema level (see D-018):
  // CONTENT_MODEL's inline type shows them unconditionally required, but no
  // approved source states either value for several current entries, and
  // this project's rules forbid inventing a fact to fill a required field.
  // When present, aiAssisted still requires aiDisclosure if true.
  aiAssisted: z.boolean().optional(),
  aiDisclosure: z.string().optional(),
  contribution: z.string().optional(),
  verificationStatus: VerificationSchema,
  status: PublishStatusSchema,
  phase: ProjectPhaseSchema.optional(),
  factsCheckedAgainstRepo: z.boolean(),

  tech: z.array(z.string()),
  timeline: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
    })
    .optional(),
  links: z.array(ProjectLinkSchema),

  images: z.array(ProjectImageSchema),

  layers: ProjectLayersSchema.optional(),
  decisions: z.array(ProjectDecisionSchema).optional(),
  nextSlug: z.string().optional(),
});

export const ProjectFrontmatterSchema = ProjectFrontmatterBaseSchema.superRefine((data, ctx) => {
  if (data.tier === "featured" && (!data.contribution || data.contribution.trim() === "")) {
    ctx.addIssue({
      code: "custom",
      path: ["contribution"],
      message: "contribution is required when tier is 'featured'",
    });
  }

  if ((data.depth === "full" || data.depth === "short") && !data.layers) {
    ctx.addIssue({
      code: "custom",
      path: ["layers"],
      message: "layers is required when depth is 'full' or 'short'",
    });
  }

  if (data.depth === "full" && (!data.decisions || data.decisions.length < 3)) {
    ctx.addIssue({
      code: "custom",
      path: ["decisions"],
      message: "at least 3 decisions are required when depth is 'full'",
    });
  }

  if (data.provenance === "fork" && !data.upstream) {
    ctx.addIssue({
      code: "custom",
      path: ["upstream"],
      message: "upstream is required when provenance is 'fork'",
    });
  }

  if (data.aiAssisted && (!data.aiDisclosure || data.aiDisclosure.trim() === "")) {
    ctx.addIssue({
      code: "custom",
      path: ["aiDisclosure"],
      message: "aiDisclosure is required when aiAssisted is true",
    });
  }
});

export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatterSchema>;

// §5 Notes (MVP: external links)
export const NoteSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
  source: z.literal("medium"),
  publishedDate: z.string().optional(),
  readingTimeMinutes: z.number().optional(),
  category: z.string().min(1),
  description: z.string().min(1),
  language: z.enum(["en", "tr"]),
  verified: z.boolean(),
});

export type Note = z.infer<typeof NoteSchema>;

// §5 External links (data/site.ts already defines an equivalent plain TS
// type for TASK-002 chrome data; this schema is the content-system's own
// validated form, per the task file's explicit requirement).
export const SocialLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
  verified: z.literal(true),
});

export type SocialLink = z.infer<typeof SocialLinkSchema>;

// §5 Lab experiments — schema reserved, unused while content/lab/ is empty.
export const ExperimentSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(["idea", "in-progress", "done"]),
  links: z.array(z.string()).optional(),
  verified: z.boolean(),
});

export type Experiment = z.infer<typeof ExperimentSchema>;
