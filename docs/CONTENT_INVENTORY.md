# CONTENT INVENTORY

Status legend:

- `VERIFIED`: may be used, but repository/content should still be checked before technical publication
- `PARTIAL`: enough for a preview, not enough for a full case study
- `REQUIRES USER`: Hakan must provide details
- `ARCHIVE`: show only as earlier work
- `DO NOT PUBLISH YET`: presentation or facts need cleanup

## Identity

| Field | Status | Value |
|---|---|---|
| Name | VERIFIED | Hakan Duyar |
| Primary title | APPROVED DIRECTION | Frontend & Product Engineer |
| Brand | APPROVED DIRECTION | Built in Layers |
| GitHub | VERIFIED | `https://github.com/hakanduyar` |
| LinkedIn | VERIFIED LINK | `https://www.linkedin.com/in/hakanduyar/` |
| Medium | VERIFIED LINK | `https://hakanduyar.medium.com/` |
| Public email | REQUIRES USER CONFIRMATION | Do not publish an old CV email automatically |
| Current location | REQUIRES USER CONFIRMATION | Do not infer from old CV files |
| CV download | REQUIRES CURRENT CV | Old CVs must not be published as current |

## Featured projects

### Professional Systems

Status: `REQUIRES USER`

Known:

- Hakan has professional public-sector/enterprise interface work.
- Details will be provided later.

Missing:

- approved project names
- dates
- role and ownership
- screenshots that may be published
- constraints
- contribution
- outcomes
- confidentiality boundaries

Rule:

Use an anonymous preview only until details are approved.

### Kıvılcım

Display name (approved D-017): **Kıvılcım** — first English-language introduction may be glossed as Kıvılcım — “Spark”; never a permanent “Kıvılcım / Spark” lockup. Route slug: `/work/kivilcim`.

Repository:

`https://github.com/hakanduyar/spark`

Status: `VERIFIED` — repository audit complete (TASK-005, 2026-07-31), full case-study text approved (delegated editorial review, 2026-08-03), `status: "published"`, `verificationStatus: "verified"` (2026-08-05, under **D-019** — see `docs/DECISIONS.md`). Real screenshots remain outstanding; the case study currently illustrates itself with four repository-verified `verified-diagram`/`provisional-illustration` assets instead (D-019 explicitly permits this in the interim — see "Needed" below).

Verified direction (repository-audited, TASK-005):

- personal operating system — Today/Plan/Mind/Focus/Progress, confirmed as the app's real 5-tab structure
- mobile-first, local-first, offline PWA — confirmed (real `manifest.webmanifest`, Workbox service worker, zero backend/API code)
- React, TypeScript, Vite, Tailwind CSS, Dexie, IndexedDB — confirmed in `package.json`/`vite.config.ts`
- tasks, planning, routines, general plans/important dates, calendar views — confirmed, extensively implemented
- focus sessions/timer, XP and level progression, daily review — confirmed, fully implemented
- JSON export/import — confirmed, fully implemented
- optional AI assistance (user-supplied Gemini key, `localStorage`-only, never bundled) — confirmed exactly as previously described
- UI language: **Turkish-only**, currently — newly confirmed via audit, not previously recorded here

Rejected/corrected claims (repository audit, TASK-005):

- **"Habits" tracking is not a working feature** — `habits`/`habitLogs` tables exist in the schema and JSON backup but have no screen anywhere in the app; recurring commitments are handled by a separate `Routines` feature instead (the repo's own decision log explains why)
- **"Weekly review" is not a working feature** — `weeklyReviews` table exists but is never read or written outside the generic backup loop
- **Recharts is not implemented** — absent from dependencies; the app's own task log lists chart-based statistics as a future, unchecked to-do item, not current fact

Needed (unchanged by this audit):

- current screenshots (real product imagery — still none supplied; the case study publishes under D-019 in the meantime with four honestly-labelled `verified-diagram`/`provisional-illustration` SVGs in `public/images/projects/kivilcim/`, which real screenshots will replace as a pure asset swap once supplied — the content model does not change when that happens)
- current live URL — none exists; this is a locally-installed PWA, not hosted publicly

Case-study text review: **complete** — Hakan explicitly delegated editorial review to the assistant (2026-08-03) and authorized publication; see `docs/PROGRESS.md`.

### DropSpot

Repository:

`https://github.com/hakanduyar/dropspot-project`

Status: `PARTIAL`, repository audit required.

Known direction:

- limited-stock drop/waitlist product
- frontend and backend
- claim/allocation logic
- PostgreSQL transaction/concurrency considerations

Needed:

- screenshots
- demo URL
- exact implementation status
- test evidence
- Hakan's specific contribution
- what was learned
- known limitations

### JointLedger

Repository:

`https://github.com/hakanduyar/jointledger`

Status: `PARTIAL / ACTIVE DEVELOPMENT`

Known direction:

- family/shared finance
- based on or forked from ezBookkeeping
- shared books
- memberships and roles
- invitation flow
- data migration/backfill
- Docker deployment

Disclosure requirement:

Clearly identify original upstream project and Hakan's own changes.

Needed:

- public/private repository decision
- safe screenshots
- architecture diagram
- current phase
- live demo policy
- privacy-safe sample data
- contribution boundary

### Eat Fit Evolve

Repository:

`https://github.com/hakanduyar/eat-fit-evolve`

Status: `SECONDARY FEATURED CANDIDATE`

Needed:

- current state
- screenshots
- source/originality disclosure
- web/mobile scope
- Hakan's contribution
- AI-assisted development disclosure
- production status

## Secondary projects

Initial candidates:

- `planmaster-chronos-flow`
- `kilo-takip-app`
- `kilo-takip-dusler-alemi`
- `kozmetik`
- `blog-app`
- `medyanes-smartboard-app`
- `medyanes-smatboard-app`
- `CaliskanAri----Medyanes-360-main`
- `playable-ecommerce`

Status: `REQUIRES CURATION`

Rules:

- remove duplicates
- verify which repository is canonical
- improve README before featuring
- do not publish default AI-builder README text as a professional case study
- do not imply ownership of code not written by Hakan
- classify internship work separately from personal work

## Origins / early experiments

Candidates:

- `anime_vault`
- `IMDB-clone`
- `youtube_clone`
- `e-commerce`

Status: `ARCHIVE`

Presentation rule:

Label clearly as learning-era work. Do not include among the main featured systems.

## Medium

Profile:

`https://hakanduyar.medium.com/`

Status: `REQUIRES ARTICLE SELECTION`

Needed:

- select three strongest current articles
- verify titles and URLs
- choose category, reading time, and description
- avoid copying full copyrighted article content into the site

## Missing visual assets

Do not invent or auto-generate final project screenshots.

Still needed (real screenshots/photographs/video):

```text
public/images/projects/kivilcim/     — real screenshots still wanted; see Kıvılcım section above
public/images/projects/dropspot/
public/images/projects/jointledger/
public/images/projects/professional/
public/images/projects/archive/
```

**D-019 (2026-08-05)**: until real screenshots exist, a project may publish with repository-verified, visibly labelled `verified-diagram`/`provisional-illustration` SVGs instead of a generic development placeholder — see `docs/DECISIONS.md`. Kıvılcım is the first project to use this (`product-areas-map.svg`, `core-flow-diagram.svg`, `local-first-architecture.svg`, `focus-lifecycle.svg`, all under `public/images/projects/kivilcim/`). DropSpot, JointLedger, and Professional Systems remain on generic labelled development placeholders (or `images: []`) until either real assets or D-019 diagrams are created for them.
