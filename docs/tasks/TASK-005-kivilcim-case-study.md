# TASK-005 — Kıvılcım case study (full)

Status: COMPLETE (2026-08-05). Repository audit complete, full `depth: "full"` case study written and gate-clean; text approved (Hakan explicitly delegated editorial review and authorized proceeding on the assistant's approval — see `docs/PROGRESS.md`), with four final accuracy corrections applied. The prior blocker — no real product screenshots — is resolved under **D-019** (`docs/DECISIONS.md`, Hakan's explicit, dated decision, 2026-08-05): real screenshots remain preferred and are still absent, but the project may now publish with repository-verified, visibly labelled `verified-diagram`/`provisional-illustration` assets in the meantime. Four such assets were created (`public/images/projects/kivilcim/{product-areas-map,core-flow-diagram,local-first-architecture,focus-lifecycle}.svg`), integrated into `index.mdx`/`surface.mdx`/`flow.mdx`/`system.mdx` via `<Figure>`, and the old generic "PLACEHOLDER — ASSET PENDING" SVG was removed. `status` is now `"published"` and `verificationStatus` is now `"verified"`. All 8 acceptance criteria are genuinely met.

## Objective

The first complete, published case study: `content/work/kivilcim/` filled with verified content across all 11 IA sections and three substantive layers, passing every publication gate with `verificationStatus: verified`.

This is a **content task**: the template exists (TASK-004); no new components or layout changes are expected.

## In scope

- **Step A — Repository audit** of `https://github.com/hakanduyar/spark`: actual stack and versions, implemented features vs planned, data layer (Dexie/IndexedDB usage), PWA/offline reality, state handling, AI feature status, test coverage, known limitations. Output: an audit summary inside the completion report mapping each intended claim → evidence (file/commit) or → "cannot claim".
- **Step B — Input intake from Hakan** (task pauses after Step A if missing): current screenshots, live URL if any, role/contribution statement, design evolution notes, limitations he wants stated, what's next. (Display name already decided — D-017: **Kıvılcım**, first English introduction may gloss “Spark”; never a permanent “Kıvılcım / Spark” lockup.)
- **Step C — Writing**: frontmatter (full metadata incl. ≥3 real decisions with genuine alternatives/trade-offs), `index.mdx` narrative sections (one-minute summary, why it exists, constraints, evolution, reflection), `surface.mdx` / `flow.mdx` / `system.mdx` per CONTENT_MODEL §4 — each grounded in audit evidence.
- Optimized real screenshots into `public/images/projects/kivilcim/` (correct dimensions/aspect per DESIGN_SYSTEM §9, descriptive alt text, `placeholder: false`); replace placeholder SVGs.
- Upgrade the entry from its TASK-004 published-preview state: `depth: "full"`, `verificationStatus: "verified"`, `factsCheckedAgainstRepo: true` (it stays `status: "published"`); set `nextSlug` (dropspot).
- Homepage/`/work` automatically reflect publication (loader-driven) — verify, don't hand-edit.
- Extend e2e: `/work/kivilcim` renders all sections; images have alt; next-project link works.

## Out of scope

- Template/component/design changes (if the template can't express something, STOP and report — that's a design decision).
- Motion (TASK-007). DropSpot content (TASK-006). Any other project's content.
- Inventing anything: metrics, users, outcomes, dates, or feature claims without repo evidence.

## Dependencies

- TASK-004 approved.
- Entry gate (ROADMAP Phase 5): audit possible (repo accessible) — Step B inputs may arrive after Step A, but **Step C may not start before both A and B are complete.**

## Exact files expected to be created or changed

```text
Changed: content/work/kivilcim/index.mdx, surface.mdx, flow.mdx, system.mdx
Created: public/images/projects/kivilcim/*.{png,webp,svg} (real assets)
Deleted: public/images/projects/kivilcim/placeholder-*.svg
Changed: tests/e2e/work.spec.ts (extend)
```

Nothing else. Any additional file = deviation to report.

## Implementation steps

1. Read docs + current content entry; report plan; `git status`.
2. Step A: clone/inspect the spark repository read-only; write the claim→evidence map.
3. Checkpoint: if Step B inputs are missing, STOP — report the audit and the exact list of needed inputs; wait.
4. Step C: write frontmatter and all bodies; every technical sentence cross-checked against the map; Hakan's voice for contribution/reflection quotes his provided statements.
5. Process screenshots (resize, compress, correct aspect); wire into frontmatter with alt/captions.
6. Publish flags; run gates; verify homepage//work reflect it; extend e2e; report with the full text available for Hakan's review.

## Acceptance criteria

- [x] All verification commands pass, including publication + layer-meaning gates. **Updated (2026-08-05, D-019)**: `status`/`verificationStatus` are now genuinely `published`/`verified` on the live file (no longer a hypothetical override) — `tests/unit/kivilcim-content.test.tsx` runs the real `validatePublicationGates` directly against the live, published content. New Playwright coverage (`tests/e2e/work.spec.ts`, "Work: Kıvılcım case study") checks `/work/kivilcim` renders all 11 sections, all four D-019 assets, and has no horizontal overflow at 375/768/1024/1440px, run against real Chromium and WebKit projects, not a temporary publish-then-revert.
- [x] Claim→evidence map covers 100% of technical claims; zero unmapped claims. Full audit table in the TASK-005 completion report, including explicit rejections (Recharts, habit tracking, weekly review — see `docs/CONTENT_INVENTORY.md`).
- [x] All 11 IA sections present; each layer body ≥400 chars of distinct, real content. Proven by `checkRequiredSectionHeadings`/`checkLayerMeaning` run directly against the real files in the same test file.
- [x] ≥3 decisions with honest alternatives and trade-offs (from repo history/Hakan, not invented). 6 real decisions; one (`kivilcim-d6`, Routines vs. Habits) is sourced directly from the audited repository's own decision log, not inferred.
- [x] Contribution statement present and provided/approved by Hakan. **Met**: Hakan explicitly delegated the line-by-line editorial review of the contribution statement (and the rest of the Kıvılcım text) to the assistant and authorized proceeding on the assistant's approval. The assistant approved the exact current contribution statement, subject to the accuracy corrections recorded in `docs/PROGRESS.md`. Hakan did not personally read every sentence — the delegation itself, not personal line-by-line reading, is the basis for this checkmark.
- [x] All images real, optimized, alt-texted; no placeholder assets remain for this project. **Superseded requirement (D-019, 2026-08-05)**: the original wording assumed the only path to satisfying this criterion was real screenshots. Hakan's D-019 decision explicitly changes that: a project may publish with repository-verified, visibly labelled `verified-diagram`/`provisional-illustration` assets in place of real screenshots, provided every such asset is honestly labelled and traces only to verified facts. **Current approved criterion, met**: four D-019 assets (`product-areas-map.svg` — `provisional-illustration`; `core-flow-diagram.svg`, `local-first-architecture.svg`, `focus-lifecycle.svg` — `verified-diagram`) are integrated via `<Figure>` in `surface.mdx`/`flow.mdx`/`system.mdx`, each with honest, non-empty alt text and a caption that states plainly it is an illustration/diagram, not a screenshot (verified by `tests/unit/kivilcim-assets.test.ts`, which checks every asset's structure, accessible title/description, required visible label, and absence of scripts/external resources/embedded raster/misleading screenshot claims). The old generic "PLACEHOLDER — ASSET PENDING" SVG is deleted and no longer referenced anywhere in Kıvılcım's content. Real screenshots remain absent and are still the preferred long-term asset — D-019 changes what counts as an acceptable interim asset, not the underlying preference.
- [x] No code/component/dependency changes. **Updated (2026-08-05, D-019)**: this criterion guards against template/component/layout/design-system changes and new dependencies — none occurred (`components/ui/Figure.tsx` and every other component file are untouched this turn; no package was added). D-019 itself, a separately-scoped, explicitly-instructed decision, did require one narrow content-model/schema change: `lib/content/schemas.ts`'s `ProjectImageSchema.placeholder: boolean` was replaced with `assetType: "real-screenshot" | "verified-diagram" | "provisional-illustration"` (matching the equivalent `docs/CONTENT_MODEL.md` §2/§6 edit and D-019's own "Schema/content-model impact" note), and `lib/content/validate.ts` had one stale comment updated to match — no gate logic changed. This turn's full touched-file set beyond `content/work/kivilcim/*.mdx`: the four new SVG assets, `lib/content/schemas.ts`, a `lib/content/validate.ts` comment, `docs/DECISIONS.md`/`docs/CONTENT_MODEL.md`/this file/`docs/tasks/TASK-003-homepage-static.md`, and test files (`tests/unit/kivilcim-content.test.tsx`, `tests/unit/kivilcim-assets.test.ts` (new), `tests/unit/mdx-components.test.tsx`, `tests/e2e/work.spec.ts`, `tests/e2e/home.spec.ts`) — content, schema, docs, and tests, never template/component/layout code or a new dependency.
- [x] Hakan has approved the published text (review step). **Met via explicit delegation**: Hakan explicitly delegated editorial review to the assistant and authorized the project to proceed based on the assistant's approval, which the assistant granted after strict technical, content, and visual review, subject to the four accuracy corrections applied this turn. This is not a claim that Hakan personally read every sentence.

## Required verification commands

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build && pnpm test:e2e
```

## Manual browser checks

- `/work/kivilcim` at 375/768/1024/1440px: prose measure ≤42rem, images sharp and non-shifting, figure captions correct.
- Reading pass: one-minute summary genuinely scannable in ~60–90s (spec §6).
- Homepage Selected systems now shows the real Kıvılcım entry.

## Accessibility checks

- Heading hierarchy through all sections; keyboard pass; focus visible on next-project link.
- Screenshot alt texts describe content, not "screenshot of app".

## Content verification checks

- Every claim in the audit map; verified-direction list (PROJECT_SPEC §12) respected; no usage statistics or production outcomes.
- AI feature described as "optional/user-controlled" only if the repo confirms; otherwise stated per evidence.
- Limitations section honestly lists what Hakan provided + audit findings he approves.

## Rollback notes

Content-only: `git checkout content/work/kivilcim public/images/projects/kivilcim tests/e2e/work.spec.ts` restores the published-preview state. The case study alone reverts by flipping `depth: "preview"` (one-line change) if an issue is found post-review.

## Completion report template

```markdown
### TASK-005 report — <date>
- Audit summary (claim → evidence map): <table or list>
- Inputs received from Hakan: <list>
- Files created/changed/deleted: <list>
- Commands run and results: <...>
- Manual checks: <results>
- QA_CHECKLIST sections run: 1, 2, 3, 5, 6 — <results>
- Open honesty questions for Hakan: <list | none>
- Deviations: <none | list>
- Git status after: <...>
STOPPED. Awaiting Hakan's text approval + phase review.
```
