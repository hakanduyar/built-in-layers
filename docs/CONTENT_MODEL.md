# CONTENT MODEL — Built in Layers

Status: APPROVED WITH REVISIONS (2026-07-17)
Executable form: `lib/content/schemas.ts` (Zod) — created in TASK-004. This document is the human-readable contract; the Zod file must match it exactly.

Core principle: **build gates reduce the risk of publishing incomplete, duplicated, or unverified content, but do not replace human review.** Every content entity carries an explicit `verificationStatus` field and a publication status, and build-time gates connect them (ARCHITECTURE §7). The gates block builds only for content with `status: "published"`; draft and preview content never blocks a production build. Factual truth is verified by Hakan's review, not by automation.

## 1. Shared enums

```ts
Tier          = "featured" | "real-life" | "archive" | "origins"
CaseStudyDepth= "full" | "short" | "preview" | "none"
Provenance    = "personal" | "professional" | "internship" | "learning" | "fork"
Verification  = "verified" | "partial" | "requires-user" | "do-not-publish"
PublishStatus = "draft" | "published"
ProjectPhase  = "active-development" | "usable" | "paused" | "archived"
```

Mapping from `docs/CONTENT_INVENTORY.md` legend: `VERIFIED → verified`, `PARTIAL → partial`, `REQUIRES USER → requires-user`, `DO NOT PUBLISH YET → do-not-publish`, `ARCHIVE → tier: "archive" | "origins"`.

## 2. Project (featured and archive) — frontmatter of `content/work/<slug>/index.mdx`

One schema serves featured and archive projects; tier and depth control what is required.

```ts
ProjectFrontmatter = {
  // Identity
  slug: string,                      // kebab-case, equals directory name
  title: string,                     // display title
  categoryLabel: string,             // mono eyebrow, e.g. "PERSONAL OPERATING SYSTEM"
  description: string,               // one sentence, ≤160 chars
  tier: Tier,
  depth: CaseStudyDepth,
  order: number,                     // sort position within tier

  // Truthfulness
  provenance: Provenance,
  upstream?: {                       // REQUIRED when provenance === "fork"
    name: string,                    // e.g. "ezBookkeeping"
    url: string,
    relationship: string             // what was inherited vs built by Hakan
  },
  aiAssisted: boolean,
  aiDisclosure?: string,             // REQUIRED when aiAssisted === true
  contribution: string,              // REQUIRED when tier === "featured":
                                     // Hakan's specific role, first person, factual
  verificationStatus: Verification,  // explicit verification state (approval item 14)
  status: PublishStatus,
  phase: ProjectPhase,
  factsCheckedAgainstRepo: boolean,  // true only after a real repository audit

  // Facts (only verified values; NEVER invented)
  tech: string[],                    // verified stack items only
  timeline?: { start?: string, end?: string },  // ISO dates; omit if unverified
  links: Array<{
    label: string,
    url: string,
    kind: "repo" | "live" | "demo" | "article" | "other",
    visibility: "public" | "private-noted"      // private repos are named, not linked
  }>,

  // Presentation
  images: Array<{
    src: string,                     // under /public/images/projects/<slug>/
    alt: string,                     // required, non-empty
    caption?: string,
    layer?: "surface" | "flow" | "system",  // optional layer association
    assetType: "real-screenshot" | "verified-diagram" | "provisional-illustration"
                                      // D-019: what kind of asset this is, and
                                      // therefore what honesty rule applies to it
  }>,

  // Case-study structured data
  layers?: {                         // REQUIRED when depth === "full" | "short"
    surface: { summary: string },    // 1–3 sentences each; bodies in *.mdx
    flow:    { summary: string },
    system:  { summary: string }
  },
  decisions?: Array<{                // REQUIRED when depth === "full"; optional "short"
    id: string,                      // e.g. "kivilcim-d1"
    title: string,
    context: string,
    choice: string,
    alternatives: string[],
    tradeoff: string
  }>,
  nextSlug?: string                  // "next project" link; must exist if set
}
```

### Conditional requirements (enforced in Zod with `superRefine`)

| Condition | Requirement |
|---|---|
| `tier === "featured"` | `contribution` non-empty; `description` present |
| `depth === "full" \| "short"` | `layers` present; `surface/flow/system.mdx` files exist |
| `depth === "full"` | `decisions` has ≥ 3 entries; body has all narrative sections (§3) |
| `provenance === "fork"` | `upstream` present |
| `aiAssisted === true` | `aiDisclosure` present |
| `status === "published"` | see publication gates (§6) |
| `tier === "origins"` | rendered only in the archive context, labelled "learning-era work" |

## 3. Case-study body — `index.mdx` sections

The MDX body of `index.mdx` carries the narrative in fixed `h2` sections, matching PROJECT_SPEC §7 IA. Required set by depth:

| Section (`h2` text) | full | short | preview |
|---|---|---|---|
| One-minute summary | ✔ | ✔ | — (description field only) |
| Why it exists | ✔ | ✔ | — |
| Constraints | ✔ | optional | — |
| (Surface / Flow / System — from layer files) | ✔ | ✔ | layer summaries only |
| Decisions (from frontmatter data) | ✔ | optional | — |
| Evolution | ✔ | optional | — |
| Reflection | ✔ | ✔ (may be brief) | — |

The renderer maps these sections into the case-study template; a missing required section fails validation (TASK-004 implements a heading check in `lib/content/validate.ts`).

## 4. Project layer content — `surface.mdx`, `flow.mdx`, `system.mdx`

Each file: no frontmatter (metadata lives in `index.mdx`), MDX body using only the whitelisted components (ARCHITECTURE §6). Expected content per layer, so tabs change meaning and not decoration:

- **surface.mdx** — interface decisions, hierarchy, responsiveness, design-system usage, accessibility work, component structure. Figures: real screenshots, or a labelled `verified-diagram`/`provisional-illustration` (D-019) until real screenshots exist.
- **flow.mdx** — user journeys, state transitions, forms, error/empty states, data movement through the UI. Figures: flow diagrams, state screenshots, or the D-019 provisional equivalent.
- **system.mdx** — architecture, data model, API boundaries, permissions, offline strategy, deployment, performance decisions. Figures: architecture diagrams (naturally `verified-diagram` under D-019, since these were never screenshots to begin with).

## 5. Other content types

### Notes (MVP: external links) — `data/notes.ts`

```ts
Note = {
  title: string,                 // exact published title, verified
  url: string,                   // canonical Medium URL, verified
  source: "medium",
  publishedDate?: string,        // ISO; omit if unverified
  readingTimeMinutes?: number,
  category: string,              // one short label
  description: string,           // Hakan-approved summary, not copied article text
  language: "en" | "tr",
  verified: boolean              // false ⇒ never rendered in production
}
```

MVP shows exactly the three articles Hakan selects (`REQUIRES USER`). Until selection, the Notes page shows an honest pending state (§8). Full article text is never copied into the site.

### Lab experiments — schema reserved, `content/lab/` empty in MVP

```ts
Experiment = {
  slug: string, title: string, description: string,
  status: "idea" | "in-progress" | "done",
  links: Note["url"][] /* optional */, verified: boolean
}
```

MVP Lab page renders the honest empty state (§8) — no fake experiments.

### Professional case-study placeholder — a normal work entry

Professional Systems is modeled as `content/work/professional-systems/index.mdx` with:

```yaml
tier: featured
depth: preview
provenance: professional
verificationStatus: requires-user
status: published        # allowed ONLY because it contains zero concrete claims
```

Its rendered content is limited to: the approved anonymous description from PROJECT_SPEC §12 ("Designing usable interfaces within complex technical and organizational constraints."), a sector-neutral sentence, and the approved pending copy (§8). It must contain **no** concrete client, project, result, or technical claims — no client names, dates, screenshots, URLs, metrics, or outcomes — until Hakan approves them (D-009).

### External links — `data/site.ts`

```ts
SocialLink = { label: string, url: string, verified: true }
```

MVP set: GitHub, LinkedIn, Medium (all `VERIFIED` in CONTENT_INVENTORY). Public email and CV download are **excluded until Hakan confirms** current values — the footer simply omits them meanwhile.

## 6. Publication gates (build-time, in `lib/content/validate.ts`)

These gates apply **only to content with `status: "published"`** — draft and preview content must not block a production build. They reduce the risk of publishing incomplete, duplicated, or unverified content; they do not replace human review.

A content item with `status: "published"` must satisfy all of:

1. Schema-valid (Zod parse passes).
2. Rendered text contains no `[CONTENT REQUIRED` marker.
3. If `depth === "full"`: `verificationStatus === "verified"` and `factsCheckedAgainstRepo === true`.
4. If `depth === "short"`: `verificationStatus` is `verified` or `partial`; every `tech` item and technical claim traced to the repository audit (recorded in the task report).
5. If `verificationStatus === "do-not-publish"`: publication is refused regardless of other fields.
6. All images have non-empty `alt`. `assetType: "real-screenshot"` requires the image to be a real, unedited-beyond-optimization capture of the actual project. `assetType: "verified-diagram"` and `"provisional-illustration"` (D-019) require the accompanying alt text or caption to visibly identify the asset as an illustration/diagram, not a screenshot, and the diagram's content to trace only to repository-verified facts — never an invented UI, metric, user, client, outcome, or feature.
7. Layer-meaning gate (§7) for `full`/`short` depths.

`status: "draft"` items: excluded from production lists, sitemap, and static params; may contain `[CONTENT REQUIRED: ...]` markers freely; never block a production build.

## 7. Layer-meaning gate

For `depth: full | short`, published projects must have `surface.mdx`, `flow.mdx`, `system.mdx` where each body (after stripping markup) is ≥ 400 characters, and no two layer bodies are more than 60% identical (simple normalized comparison). This automated distinctness check detects empty or duplicated layer content so Surface/Flow/System does not silently degrade into a decorative tab — it does **not** claim to verify that the content is factually true; that remains Hakan's review. It applies only to `status: "published"` items.

## 8. Placeholder and pending-content rules

Two distinct mechanisms — never confuse them:

1. **`[CONTENT REQUIRED: <what is needed>]`** — an internal marker. Visible in dev/draft only. Blocks publication (gate §6.2). Used wherever Hakan must supply facts.
2. **Approved pending copy** — public, honest wording for intentionally incomplete areas. Approved texts (D-009, accepted 2026-07-17):
   - Professional systems (**exact approved wording**): "Selected professional work is being prepared for publication. Only approved, non-confidential details will be shown."
   - Lab: "The lab is where small experiments will live. Nothing is published here yet — honestly."
   - Notes (until selection): "Selected writing will be linked here soon. In the meantime: hakanduyar.medium.com."

   No concrete client, project, result, or technical claims may be added to the professional area until Hakan approves them.

Pending copy never implies hidden achievements ("award-winning work coming soon" is forbidden). It states plainly that content is not ready.

## 9. Verification workflow

```text
requires-user ──(Hakan provides facts)──► partial ──(repo audit + Hakan review)──► verified
      │                                                        │
      └────────────► do-not-publish ◄──────(facts wrong/risky)─┘
```

- The workflow above moves the `verificationStatus` field (§2).
- Repository audits happen inside the case-study tasks (TASK-005/006) and their findings are recorded in the task completion report.
- Only Hakan can move an item to `verified` (explicit approval in review).
- Old CV data is never a verification source for *current* facts (location, email, title, employment).
- JointLedger: `upstream` disclosure (ezBookkeeping) is mandatory in any rendering, including preview cards; private infrastructure details, credentials, and household data are never included in content files.
