# PROJECT INVENTORY

Evidence-backed inventory of the project content system, taken at the start of the
PROJECT ARCHITECTURE EXPANSION phase.

- Branch: `feature/project-architecture-v13`
- Base commit: `243db3934d634f2c39d339cd2a267c01d86be2bd` (frozen V12 tip)
- Date: 2026-09-02
- Machine-readable evidence: [`docs/review/v13-inventory/metrics/project-inventory.json`](review/v13-inventory/metrics/project-inventory.json)
- Regenerate with: `node tests/tools/project-inventory.mjs`

Every claim below cites a source path. Nothing here is inferred from conversation, and no fact
about a project has been invented — where a value is absent, this document says it is absent.

---

## 1. What exists

`content/work/` holds **five** project entries. Three have full layer content; two do not.

| Slug | Tier | Depth | `order` | Provenance | Status | Verification | Phase |
|---|---|---|---|---|---|---|---|
| `software-factory` | featured | **preview** | 0 | personal | published | verified | active-development |
| `kivilcim` | featured | **full** | 1 | personal | published | verified | active-development |
| `jointledger` | featured | **short** | 2 | **fork** | published | verified | active-development |
| `dropspot` | featured | **short** | 3 | personal | published | verified | paused |
| `professional-systems` | featured | **preview** | 4 | professional | published | **requires-user** | — |

Content volume, from the same extraction:

| Slug | `index.mdx` words | surface / flow / system files | Decisions | Images | Tech | Links |
|---|---|---|---|---|---|---|
| `software-factory` | 130 | **none / none / none** | **0** | 1 | 3 | 1 |
| `kivilcim` | 793 | 357 / 452 / 424 words | 6 | 4 | 6 | 1 |
| `jointledger` | 643 | 211 / 309 / 488 words | 4 | 4 | 5 | 1 |
| `dropspot` | 584 | 432 / 399 / 577 words | 4 | 7 | 6 | 1 |
| `professional-systems` | 15 | **none / none / none** | **0** | 1 | **0** | **0** |

Asset honesty split (`assetType`, per D-019 and `lib/content/schemas.ts:49`):

| Slug | real-screenshot | verified-diagram | provisional-illustration |
|---|---|---|---|
| `dropspot` | **4** | 3 | 0 |
| `jointledger` | 0 | 4 | 0 |
| `kivilcim` | 0 | 3 | 1 |
| `software-factory` | 0 | 1 | 0 |
| `professional-systems` | 0 | 0 | 1 |

Asset integrity is clean: **zero** frontmatter-referenced images are missing from `public/`, and
**zero** files under `public/images/projects/<slug>/` are unreferenced.

---

## 2. Findings

Ordered by architectural significance. Each is reproducible from the cited path.

### F1 — The frozen flagship has the thinnest case study (CRITICAL)

The frozen homepage opens the project sequence with Software Factory as scene 01
(`lib/spatial/scenes.ts`, scene order `hero → software-factory → kivilcim → jointledger →
dropspot → tail`), and the V12 acceptance record requires it to "feel foundational / system-level.
Not simply another standard project card."

Its content is the weakest of the five: `depth: preview`, **0** layers, **0** decisions, a
130-word body, one diagram, and no `surface/flow/system` files.

This is not a gate failure — `REQUIRED_SECTIONS_BY_DEPTH.preview` is `[]`
(`lib/content/validate.ts:137-142`), so `preview` demands nothing. The gates are satisfied and the
product intent is not. The contradiction even surfaces in the UI: the case-study affordance is
chosen from depth, so the flagship's link reads **"Open system"** while Kıvılcım, JointLedger and
DropSpot read "Open case study" (`components/spatial/SpatialProjectScene.tsx:115`).

### F2 — Two orderings disagree, and the flagship route is a dead end (CRITICAL)

`order` (and the frozen homepage) run `software-factory(0) → kivilcim(1) → jointledger(2) →
dropspot(3) → professional-systems(4)`.

The `nextSlug` chain, which drives the case-study "next project" link
(`app/work/[slug]/page.tsx:121`, `components/project/NextProject.tsx`), runs:

```
kivilcim → dropspot → jointledger → professional-systems → (none)
software-factory → (none)
```

Two independent orderings of the same five projects exist in the same content set, and they
disagree. A reader arriving at the flagship case study has **no** onward navigation.

### F3 — `professional-systems` is published while explicitly unverified

`verificationStatus: requires-user`, a 15-word body, **0** tech entries, **0** links and a single
`provisional-illustration`, yet `status: published` so it ships. It is honest by construction —
`components/sections/SelectedSystems.tsx` renders "Not yet verified" — but it occupies an equal
`featured` slot next to four substantiated systems. Open questions are already tracked in
`docs/CONTENT_GAPS.md` §"Professional Systems (§19)".

### F4 — Only DropSpot carries real screenshots

`real-screenshot` appears **only** on DropSpot (4 of 7 images). Kıvılcım and JointLedger present
their evidence entirely as diagrams, and Kıvılcım additionally carries one
`provisional-illustration`. Nothing here is dishonest — every asset is correctly typed — but the
"real project assets" requirement in `CLAUDE.md` §5 is currently met by one project out of five.

### F5 — Test coverage mirrors the same asymmetry

`tests/unit/` holds paired content and asset suites for `kivilcim`, `jointledger`, `dropspot`, and
an asset suite for `professional-systems`. There is **no** `software-factory` suite of either kind.
The least-covered project is the flagship.

### F6 — No project declares a timeline, and every link is a repo link

`timeline` is absent on all five (optional per `lib/content/schemas.ts:110`). Every project that has
links has exactly one, of kind `repo`, visibility `public`; there is no `live`, `demo` or `article`
link anywhere, and `professional-systems` has none.

### F7 — Three of four tiers are unpopulated (NOT a defect)

`real-life`, `archive` and `origins` are declared in `TierSchema` and listed in `TIER_ORDER`
(`app/work/page.tsx:17`), but no project uses them. **This renders correctly**: empty groups are
filtered before render (`app/work/page.tsx:30`), and `/work` returned HTTP 200 in the V12 review
server check. Recorded so the independent review does not raise it as a rendering bug. It is a
content-population question, not a code defect.

---

## 3. Classification

### IMPLEMENTED — working, evidenced, no known defect

- Typed content schema with conditional rules — `lib/content/schemas.ts` (206 lines; `superRefine`
  enforces contribution/layers/decisions/upstream/aiDisclosure)
- Build-time publication gates — `lib/content/validate.ts` (`LAYER_MIN_LENGTH = 400`,
  `LAYER_MAX_SIMILARITY = 0.6`, required-section headings per depth, asset extension allow-list)
- Content loader with fail-closed publication — `lib/content/work.ts:119-149`; a published project
  failing any gate throws and breaks the build; drafts are excluded before gates run
- Case-study route and its section composition — `app/work/[slug]/page.tsx` (hero → body → layers →
  decisions → next)
- Layer rendering, both stacked and tabbed — `components/project/LayerExplorer.tsx`,
  `LayerSection.tsx`, covered by `tests/unit/layer-explorer.test.tsx`
- Work index with tier grouping and empty-group filtering — `app/work/page.tsx`
- Asset integrity — 0 missing, 0 unreferenced (§1)
- The frozen V12 spatial homepage — see `docs/FROZEN_BOUNDARY.md`
- SEO, sitemap, OG image — `lib/seo/metadata.ts`, `app/sitemap.ts`, `app/opengraph-image.tsx`

### PARTIAL — exists but does not meet its intended role

- **Software Factory case study** (F1) — exists and passes gates at `preview`; carries none of the
  layer, decision or evidence content its flagship position implies
- **Next-project navigation** (F2) — implemented and rendering, but fed by a chain that contradicts
  `order` and terminates on the flagship
- **`professional-systems`** (F3) — published, honest, and materially empty
- **Project evidence** (F4) — typed and integral, but real screenshots exist for one project
- **Per-project test coverage** (F5) — thorough for three projects, absent for the flagship

### MISSING — required by the target, not present

- Software Factory `surface.mdx` / `flow.mdx` / `system.mdx` and ≥3 decisions
- Any `real-screenshot` for Kıvılcım and JointLedger
- Any `live` / `demo` / `article` link for any project
- `software-factory` unit suites (content + assets)
- A derived, single-source ordering for case-study navigation

### OBSOLETE — candidate for removal

- **The manual `nextSlug` field.** `order` already totally orders the set and is what the frozen
  homepage and `/work` use. `nextSlug` duplicates that ordering by hand and currently contradicts
  it (F2), which is exactly the "no duplicate source of truth for project content" rule in
  `CLAUDE.md` §8. Removal is proposed, not performed — it is schema-affecting and belongs after
  independent review.

### DEFERRED — deliberately not in this phase

- `content/lab/` population (`ExperimentSchema` reserved and unused —
  `lib/content/schemas.ts:196`)
- Notes beyond the external-link model in `data/notes.ts`
- Turkish translation / i18n
- Mobile art direction (roadmap Phase 6 / Fable Gate 4)
- Populating the `real-life` / `archive` / `origins` tiers (F7)

### UNKNOWN — cannot be resolved without the owner

These are facts about Hakan's own work that no repository artifact records. They are **not**
guesses, and none may be filled by an agent (`CLAUDE.md` §11).

1. Whether Software Factory's real architecture may be published, and at what depth — it is
   `provenance: personal` and `phase: active-development`, but no source states what is
   publishable.
2. Whether real Software Factory screenshots exist and may be used.
3. `professional-systems`: everything — it is `requires-user` by its own frontmatter.
4. Timelines (`start` / `end`) for all five projects.
5. Whether any project has a live/demo URL that may be linked.
6. Whether Kıvılcım and JointLedger have screenshottable running states.

Items 1–2 **block** the highest-value slice. See `docs/PROJECT_ARCHITECTURE.md` §4.
