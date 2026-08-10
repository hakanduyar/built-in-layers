# TASK-003 — Homepage static

Status: IMPLEMENTED 2026-07-31 — full gate suite green (Chromium + WebKit); 7 of 9 acceptance criteria genuinely met, 2 honestly left unchecked. **Updated (2026-08-05)**: as of TASK-006, three of the four D-016 projects (Kıvılcım, DropSpot, Professional Systems) are published in the correct order; only JointLedger's continued draft status keeps the two unchecked criteria unmet (see below and `docs/PROGRESS.md`). Awaiting review. **Execution order revised 2026-07-17: this task now runs after TASK-004 and depends on it (D-011 rejected).**

## Objective

The complete, fully static homepage: all 10 IA sections (PROJECT_SPEC §7) with approved seed copy, asymmetric compositions per DESIGN_SYSTEM §15, and the layer explorer in its stacked (non-interactive) form — **consuming the real typed content system (TASK-004 loaders) from its first implementation.** No transitional or disposable data layer exists. **This page is the static-layout approval gate for the whole visual system.**

## In scope

- Project data via the TASK-004 loaders (`getProjectsByTier`, frontmatter-only reads): Selected systems renders the approved D-016 order — **1. Kıvılcım, 2. DropSpot, 3. JointLedger, 4. Professional Systems preview** — from the published preview entries created in TASK-004. Non-project homepage copy (Built for real life items, How I build principles, Field notes pending state, About preview text) lives in `data/copy.ts` alongside the other approved chrome copy; every not-yet-verified value uses approved pending copy (never rendered `[CONTENT REQUIRED]`).
- `components/sections/`: `Hero`, `PositioningStatement`, `LayerExplorerIntro` (static stacked SURFACE/FLOW/SYSTEM blocks with registration mark; real layer content plugs in after TASK-005/007), `SelectedSystems` (alternating asymmetric rows), `BuiltForRealLife`, `HowIBuild`, `FieldNotes`, `AboutPreview`. (Contact CTA already lives in the footer from TASK-002.)
- Compose `app/page.tsx` from sections; hero copy exactly from PROJECT_SPEC §11 (grammar-level refinement allowed, meaning/tone preserved — any wording change listed in the report).
- Extend Playwright smoke: homepage sections present in order (by heading), Selected systems entries in D-016 order, no overflow at test viewport.

## Out of scope

- Any Client Component beyond the existing `MobileNav`, tab behavior, or motion (TASK-007).
- Changes to schemas, loaders, gates, or content entries (TASK-004 owns them — if the homepage needs something the content system does not provide, STOP and report).
- Real screenshots or final assets. Notes/Work/About page bodies. SEO beyond existing helper.

## Dependencies

- TASK-004 approved (this task consumes its loaders and content entries). D-016 order and D-017 naming (resolved 2026-07-17). DESIGN_SYSTEM approved (this task realizes it).

## Exact files expected to be created or changed

```text
Created: components/sections/Hero.tsx, PositioningStatement.tsx,
  LayerExplorerIntro.tsx, SelectedSystems.tsx, BuiltForRealLife.tsx,
  HowIBuild.tsx, FieldNotes.tsx, AboutPreview.tsx,
  tests/e2e/home.spec.ts
Changed: app/page.tsx, data/copy.ts (homepage chrome copy — the single
  location for non-project homepage strings)
```

(`components/ui/Figure.tsx` and the labelled placeholder SVGs are created in TASK-004 with the rest of the content pipeline.)

## Implementation steps

1. Read docs; report plan; `git status`.
2. Wire `app/page.tsx` to the TASK-004 loaders (frontmatter-only reads); add the non-project homepage strings to `data/copy.ts` — project descriptions come from the content entries (PROJECT_SPEC §12 seed copy, already authored in TASK-004).
3. Implement sections top-down against DESIGN_SYSTEM §15 grid placements; hero first (display-xl, columns 1–10 + meta block).
4. Static layer explorer: three stacked blocks titled SURFACE / FLOW / SYSTEM, each with its one-line definition from PROJECT_SPEC §2 and a note that a featured project's layers plug in after TASK-005/007.
5. Wire project imagery through the existing `Figure` + labelled placeholder SVGs (from TASK-004).
6. Compose the page; verify section order equals PROJECT_SPEC §7 list and Selected systems order equals D-016.
7. Extend e2e; run all gates; manual width pass; `git status`; report.

## Acceptance criteria

- [x] All verification commands pass.
- [x] All 10 IA sections present in spec order with section indexes (`01 /` …).
- [x] Hero, statement, and section headings use exact approved copy (any refinement listed). Hero name/title/primary line and the positioning statement use exact copy from CLAUDE.md §4 / PROJECT_SPEC §11. "How I build"'s four principle sentences have no literal pre-approved seed (none exists) — authored this task, each traced to an already-approved document statement; see `docs/PROGRESS.md` for the sourcing of each. "Built in Layers" (section 4 heading) uses the approved brand name (CLAUDE.md §4 / PROJECT_SPEC §2), matching this task's own suggested framing for that section.
- [x] Zero `"use client"` in the diff; zero animation.
- [ ] Selected systems order matches approved D-016: Kıvılcım, DropSpot, JointLedger, Professional Systems preview; the professional entry uses the exact D-009 pending copy; Kıvılcım is displayed per D-017 (first English introduction may gloss “Spark”). **Updated (2026-08-05, TASK-006), still unmet, honestly**: three of the four `featured`-tier entries are now published and in the correct relative order — Kıvılcım (`order: 1`, D-019/TASK-005, 2026-08-05), DropSpot (`order: 2`, D-019/TASK-006, 2026-08-05), Professional Systems (`order: 4`, D-009 pending copy). Only JointLedger (`order: 3`) remains `status: "draft"` — its absence alone is why this criterion is still unmet, not any ordering or copy defect among the three that are live. Left unchecked until JointLedger can honestly satisfy it too; not weakened or reworded.
- [ ] Every image is a labelled placeholder SVG — no fake UI, no stock, no generated screenshots. **Superseded requirement (D-019, 2026-08-05)**: this criterion assumed the only acceptable pre-real-asset image would be the generic "PLACEHOLDER — ASSET PENDING" SVG. Hakan's D-019 decision explicitly replaces that assumption: a project may instead use repository-verified, visibly labelled `verified-diagram`/`provisional-illustration` assets (a strictly more informative honesty-preserving alternative to the generic pending panel), alongside real screenshots where they exist. **Current approved criterion**: every rendered image is either a real screenshot (`assetType: "real-screenshot"`), or a visibly labelled `verified-diagram`/`provisional-illustration` (D-019) whose content traces only to repository-verified facts — no fake UI, no stock imagery, no generated screenshots, in either case. **Still not exercised on the homepage itself**: the homepage's "Selected systems" section (`components/sections/`) renders zero project images/thumbnails — confirmed by inspection, no `Figure`/`images[]` usage anywhere in `app/` or `components/sections/`. TASK-005 (this decision's companion task) does now render real D-019 assets, but only inside the Kıvılcım case-study page itself, not on the homepage. Left unchecked here for the same reason as before — nothing on the homepage exercises this criterion either way — not weakened or reworded beyond recording the supersession.
- [x] Anti-generic criteria DESIGN_SYSTEM §17 items 1–7 verifiably true (item 8 done in review) — self-verified against actual rendered output (see the task report); item 8 (template side-by-side comparison) is explicitly deferred to your review, per the criterion's own text.
- [x] No data hard-coded in section components — all via props from `app/page.tsx` reading the TASK-004 content loaders; no temporary/disposable data module exists anywhere in the diff (D-011 rejected).
- [x] No new dependencies.

## Required verification commands

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build && pnpm test:e2e
```

## Manual browser checks

- 375/768/1024/1440px: section behavior matches DESIGN_SYSTEM §15 table; no overflow at 320px.
- Verify asymmetric placements (hero, statement, selected systems alternation) against the grid — use dev-tools grid overlay.
- JavaScript disabled: page identical.
- `--signal` count per viewport ≤ 3.

## Accessibility checks

- Single `h1` (hero); heading order h1→h2→h3 without skips through all sections.
- Keyboard pass; all links focusable with visible focus.
- Stacked layer blocks readable in sequence; registration mark `aria-hidden`.
- Placeholder SVGs have appropriate alt ("Placeholder — asset pending" or empty if captioned).

## Content verification checks

- Compare every factual string against PROJECT_SPEC §11–12 seeds and CONTENT_INVENTORY; anything else must be `[CONTENT REQUIRED]` or D-009 pending copy.
- No metrics, dates, client names, tech claims beyond the verified-direction lists.
- Field notes section: no fake article titles — pending copy until Hakan selects articles.

## Rollback notes

Additive files + `app/page.tsx` and `data/copy.ts` edits. `git checkout . && git clean -fd` restores the approved TASK-004 state (content system intact, home still the TASK-002 stub).

## Completion report template

```markdown
### TASK-003 report — <date>
- Files created/changed: <list>
- Copy refinements made (before → after): <list | none>
- Commands run and results: <...>
- Manual checks (widths, grid overlay, no-JS, signal count): <results>
- Anti-generic review notes (§17, incl. template comparison): <notes>
- QA_CHECKLIST sections run: 1, 2, 3, 5, 6, 7 — <results>
- Deviations: <none | list>
- Unresolved issues: <none | list>
- Git status after: <...>
STOPPED. Awaiting static-layout approval (gates Phase 7 motion work).
```
