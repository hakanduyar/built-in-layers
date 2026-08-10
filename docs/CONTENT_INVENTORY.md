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

Status: `VERIFIED` — repository audit complete (TASK-006, 2026-08-05, remediated same day; read-only clone deleted after each audit pass), `status: "published"`, `verificationStatus: "verified"`, under **D-019** (`docs/DECISIONS.md`). The case study uses four real screenshots (`assetType: "real-screenshot"`) sourced directly from the audited repository's own `screenshots/` directory, plus three `verified-diagram` technical SVGs — DropSpot is the first project on this site to use real screenshots under D-019, not provisional diagrams standing in for them.

Verified direction (repository-audited, TASK-006, code read directly — not just the README):

- limited-stock drop/waitlist product — confirmed: browse (public), join a waitlist, claim during a claim window
- React/Vite/Tailwind v3 frontend, Node.js/Express/PostgreSQL backend — confirmed in both `package.json` files
- claim/allocation logic — confirmed: a single PostgreSQL transaction takes `SELECT ... FOR UPDATE` row locks on the claim and drop records before checking the claim window, stock, and waitlist position, then commits three writes together
- PostgreSQL transaction/concurrency considerations — confirmed genuinely implemented (not just claimed): quoted directly from `dropspot-backend/src/models/Claim.js`/`Waitlist.js`
- a deployment-unique seed-based priority formula — confirmed in `seedGenerator.js`, unit-tested in the repository
- real Jest/Supertest backend tests and Vitest/RTL frontend tests — confirmed present and passing locally
- 8 real product screenshots exist in the repository's own `screenshots/` directory — 4 selected and used (see below); the remaining 4 (`home.png`, `sign-up.png`, `my-waitlist.png`, `my-claims.png`) were inspected and not selected — `home.png` was redundant with the selected `home-login.png` (which shows strictly more state), `sign-up.png` is a generic auth form with no DropSpot-specific value, `my-waitlist.png` and `my-claims.png` add little beyond what the selected four already show (and `my-claims.png` is mostly empty whitespace around an empty-state message)

Rejected/corrected claims (repository audit, TASK-006):

- **No test exercises genuinely concurrent/simultaneous requests** — the row-locking mechanism is verified by reading the transaction code directly, not by a passing concurrency test; the case study says this plainly rather than implying load-tested behavior
- **The repository's CI workflow never actually ran** — `github/workflows/ci.yml` is misplaced (should be `.github/workflows/ci.yml`), so GitHub Actions never picked it up; the tests are real, the live CI claim is not
- **The `signup_latency_ms` priority-score term is near-inert** — the frontend computes it from two `Date.now()` calls issued back to back on the same line, so it contributes almost nothing in practice; account age and the rapid-action penalty do the real ordering work
- **No accessibility-specific work exists** — zero `aria-*`/`role` attributes anywhere in the frontend source, stated as a verified gap, not assumed
- No production deployment, no real users, no usage data — the README's framing as "a case study for Alpaco Full Stack Developer position" is noted but not further characterized; the case study makes no employment or client claim either way
- **The repository's own screenshot filenames and README captions are not reliable** — `waitlist-claimed.png` (README: "User successfully claimed a drop. Shows unique claim code...") actually shows the waitlist-**joined** confirmation state ("You're in the waitlist!" / "Leave Waitlist"), not a claim or claim code; `my-claims.png` (README: "User's claimed drops with unique claim codes...") actually shows the empty "No claims yet" state. No screenshot in the repository shows an actual completed claim with a visible claim code — the case study does not claim otherwise. Both files were used under corrected, directly-observed descriptions (`waitlist-joined.webp`), not their original names/captions.
- **`db.png` is not a schema diagram** — despite the README calling it "Database Schema (Bonus)... showing relationships between users, drops, waitlist, and claims tables," the actual image is a pgAdmin dashboard screenshot of generic server activity graphs (sessions, transactions/sec, tuples in/out, block I/O) with no table structure, columns, or relationships visible anywhere. Rejected outright — not imported under any description.

Needed:

- **4 more real screenshots exist but were not selected**: `home.png` (redundant with `home-login.png`), `sign-up.png` (generic, no DropSpot-specific value), `my-waitlist.png`, `my-claims.png` (see above) — available if a future task wants a larger gallery.
- demo URL — none exists; no live deployment.
- what Hakan personally learned building this — the Reflection section is written from direct code evidence (what holds up, what doesn't), not a personal statement in Hakan's own words; see the task completion report for the honesty caveat recorded on this basis.

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
public/images/projects/dropspot/     — DONE: 4 real screenshots in use (browse-drops.webp,
                                        drop-detail.webp, admin-panel.webp, waitlist-joined.webp),
                                        sourced directly from the audited repository; see DropSpot
                                        section above for the 4 not selected and why
public/images/projects/jointledger/
public/images/projects/professional/
public/images/projects/archive/
```

**D-019 (2026-08-05)**: until real screenshots exist, a project may publish with repository-verified, visibly labelled `verified-diagram`/`provisional-illustration` SVGs instead of a generic development placeholder — see `docs/DECISIONS.md`. Kıvılcım (`product-areas-map.svg`, `core-flow-diagram.svg`, `local-first-architecture.svg`, `focus-lifecycle.svg`) still uses diagrams only, since its real screenshots don't exist yet. **DropSpot is the first project to use real screenshots under D-019** (`browse-drops.webp`, `drop-detail.webp`, `admin-panel.webp`, `waitlist-joined.webp`, `assetType: "real-screenshot"`) alongside three `verified-diagram` technical SVGs (`core-flow-diagram.svg`, `claim-transaction-diagram.svg`, `priority-score-diagram.svg`) — its earlier `provisional-illustration` (`screens-map.svg`) was removed once real screenshots covered the interface areas it illustrated, per D-019's own "real assets replace provisional ones... as a pure asset swap" principle. A reusable validator (`checkImageAssets`, `lib/content/validate.ts`, added TASK-006) enforces D-019's structural/honesty rules for every project's registered images and every asset type, not just these two projects. JointLedger and Professional Systems remain on generic labelled development placeholders (or `images: []`) until either real assets or D-019 diagrams are created for them.
