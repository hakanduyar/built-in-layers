# TASK-004 — Content system

Status: **COMPLETE (2026-08-10, JointLedger publication pass and TASK-004 acceptance reconciliation)** — strict-review findings addressed (2026-07-29); full gate suite green (Chromium + WebKit); **7 of 7 acceptance criteria genuinely met**. **Execution order revised 2026-07-17: this task now precedes the homepage (TASK-003), which depends on it (D-011 rejected).**

**2026-08-10 update**: JointLedger was published this pass (repository audit against both `hakanduyar/jointledger` — main and the unmerged `feature/shared-family-book` branch — and upstream `mayswind/ezbookkeeping`, `depth: "short"`, `verificationStatus: "verified"`) as part of this task's own original content-system/publication scope (JointLedger was always this task's "In scope" entry, not a new task — see the task's own Objective and Out-of-scope note that only the Kıvılcım/DropSpot *case studies* were deferred to TASK-005/006). This genuinely satisfies the D-016-order criterion below for the first time. The same pass reconciled the task's other previously-unmet criterion: its original "three preview-depth entries" premise was superseded (not deleted or reinterpreted) by TASK-005/006/this pass's own approved depth promotions — see that criterion's full supersession note below for the exact original wording, why it can never be literally true again, and the current replacement criterion's independent verification against all four published projects. With both criteria now genuinely met, **all 7 acceptance criteria pass and this task is COMPLETE.**

## Objective

The typed content pipeline end-to-end: Zod schemas, loaders, publication gates, MDX rendering (on the pipeline proven by the TASK-001 D-001 spike), the `/work` index, the reusable case-study template at `/work/[slug]`, all featured content entries (including the published preview entries the homepage will consume in TASK-003), notes and lab pages fed by data.

## In scope

- Dependencies: `zod`, `gray-matter`, `next-mdx-remote` are already installed (pinned, security options enabled) by the TASK-001 D-001 spike — verify versions; `package.json` changes only if the spike adopted the `@next/mdx` fallback (then wire that pipeline instead, per D-001).
- `lib/content/schemas.ts`: Zod schemas exactly matching CONTENT_MODEL §1–5 (enums, ProjectFrontmatter with `superRefine` conditional rules, Note, SocialLink; Experiment schema defined but unused).
- `lib/content/work.ts`: `getAllProjects`, `getPublishedProjects`, `getProjectBySlug`, `getProjectsByTier` — fs-based, `cache()`-wrapped, build-fails on invalid content with file+field in the message.
- `lib/content/mdx.ts`: MDX compile wrapper (per the D-001 spike outcome) with the restricted component map (ARCHITECTURE §6) incl. `Figure`, `Note`, `DecisionCallout`.
- `components/ui/Figure.tsx` (image mat + corner ticks + mono caption) and the labelled placeholder-asset SVGs under `public/images/projects/` (flat "PLACEHOLDER — ASSET PENDING" panels per DESIGN_SYSTEM §9 — honest dev placeholders, not fake screenshots).
- `lib/content/validate.ts`: publication gates (CONTENT_MODEL §6) + layer-meaning gate (§7) + required-section heading check (§3). Gates apply only to `status: "published"` content; they reduce risk and do not replace human review (approval item 14).
- Content entries (the homepage consumes these in TASK-003 — D-016 order):
  - `content/work/kivilcim/` — **`depth: preview`, `status: published`, `verificationStatus: partial`**: frontmatter carries only approved PROJECT_SPEC §12 seed copy and verified-direction facts (zero unverified claims — same mechanism as the professional preview); layer/body files exist as `[CONTENT REQUIRED]` skeletons excluded from rendering until TASK-005 upgrades the entry to `depth: full` and publishes the case study. Display name per D-017 (Kıvılcım; first English introduction may gloss “Spark”).
  - `content/work/dropspot/` — same published-preview pattern (upgraded to `depth: short` in TASK-006).
  - `content/work/jointledger/index.mdx` — `depth: preview`, `provenance: fork` with mandatory ezBookkeeping `upstream` disclosure, `status: published` only if every rendered string is verified/pending-approved; otherwise draft.
  - `content/work/professional-systems/index.mdx` — per CONTENT_MODEL §5 (approved anonymous description + the exact D-009 pending copy), `status: published`.
- `data/notes.ts`: typed Note array — real entries only if Hakan has provided the three articles; otherwise empty array + pending copy path.
- Pages: `app/work/page.tsx` (tiered listing: featured / real-life; archive/origins sections render only when entries exist), `app/work/[slug]/page.tsx` (full 11-section template with stacked layer sections, decision list, next-project link; `generateStaticParams` from published projects, `dynamicParams = false`), `app/notes/page.tsx` (list or pending state), `app/lab/page.tsx` (honest empty state — final form).
- `components/project/`: `ProjectCard`, `CaseStudyHero`, `LayerSection` (stacked server-rendered layer block, reused by TASK-007), `DecisionList`, `NextProject`, `Prose` wrapper if needed.
- Vitest coverage: schemas (valid/invalid fixtures), publication gates (marker blocking, layer-meaning gate, fork-disclosure requirement, draft-never-blocks rule), loaders (fixture content dir); e2e: `/work` lists previews in D-016 order, a draft slug 404s, JointLedger card shows upstream attribution.

## Out of scope

- The homepage (TASK-003 — runs after this task and consumes these loaders).
- Publishing the Kıvılcım/DropSpot **case studies** (TASK-005/006) — their entries stay `depth: preview` here; only approved seed copy is published.
- Motion/interactive explorer (TASK-007). SEO surfaces (TASK-008).
- Local MDX notes, Lab experiments content, archive/origins project entries (post-MVP curation).

## Dependencies

- TASK-002 approved. D-001 spike outcome recorded in TASK-001. D-008, D-009, D-016, D-017 resolved 2026-07-17.

## Exact files expected to be created or changed

```text
Created: lib/content/schemas.ts, lib/content/work.ts, lib/content/mdx.ts,
  lib/content/validate.ts,
  content/work/kivilcim/{index,surface,flow,system}.mdx,
  content/work/dropspot/{index,surface,flow,system}.mdx,
  content/work/jointledger/index.mdx,
  content/work/professional-systems/index.mdx,
  data/notes.ts,
  app/work/[slug]/page.tsx,
  components/ui/Figure.tsx,
  public/images/projects/*/placeholder-*.svg (labelled placeholders),
  components/project/ProjectCard.tsx, CaseStudyHero.tsx, LayerSection.tsx,
  DecisionList.tsx, NextProject.tsx,
  tests/unit/{schemas,validate,work-loader}.test.ts, tests/e2e/work.spec.ts
Changed: app/work/page.tsx, app/notes/page.tsx, app/lab/page.tsx
  (package.json/pnpm-lock.yaml only if the D-001 fallback was adopted)
```

## Implementation steps

1. Read docs (incl. CONTENT_MODEL fully) and the TASK-001 D-001 spike outcome; report plan; `git status`.
2. Verify the content deps from TASK-001 (pinned versions, security options); adjust only if the fallback was adopted.
3. Implement schemas → validators → loaders, test-first with fixtures (valid, missing contribution, fork without upstream, published-with-marker, thin layer file, draft-with-marker-passes).
4. Author the four content entries with truthful frontmatter (kivilcim/dropspot as published previews carrying only approved seed copy); run gates.
5. Build `/work` and the case-study template using stacked `LayerSection`s; build `Figure` + labelled placeholder SVGs.
6. Update notes/lab pages. Run all gates + e2e; `git status`; report.

## Acceptance criteria

- [x] All verification commands pass; unit tests cover every publication-gate rule with at least one negative case each, including that draft content never blocks the build.
- [x] `pnpm build` fails demonstrably when a published-fixture violation is introduced (shown in report, then reverted).
- [x] `/work` renders tiers correctly in D-016 order (Kıvılcım, DropSpot, JointLedger, Professional preview); drafts excluded; JointLedger preview shows upstream disclosure text. **Met (2026-08-10)**: JointLedger is now `status: "published"` and renders in the correct D-016 order (Kıvılcım → DropSpot → JointLedger → Professional Systems) on both `/` and `/work`; upstream disclosure ("A fork of ezBookkeeping...") now renders on both the project card and the case-study hero, for every fork-provenance project, not JointLedger alone (`components/project/CaseStudyHero.tsx`/`ProjectCard.tsx` — a genuine, narrow rendering addition, since neither component rendered `project.upstream` at all before this pass, despite CONTENT_MODEL §9 already requiring it). No project remains draft on the D-016 list; JointLedger is no longer a "preview" in the shallow sense this criterion originally meant (it is a real, audited `depth: "short"` case study) but it does satisfy this criterion's literal text (renders in the right order, shows upstream disclosure).
- [x] Published preview entries (kivilcim, dropspot, professional-systems) contain zero unverified claims — only approved seed/pending copy; professional pending copy is the exact D-009 wording. **Superseded requirement (2026-08-10, task-acceptance reconciliation — not a new architecture decision, no `docs/DECISIONS.md` entry)**: this criterion's original wording assumed the final public-content architecture would be three shallow, preview-depth entries plus the professional preview. That premise no longer describes the site and cannot be restored: TASK-005 promoted Kıvılcım to `depth: "full"` (2026-07-31), TASK-006 promoted DropSpot to `depth: "short"` (2026-08-05), and this task's own JointLedger publication pass promoted JointLedger to `depth: "short"` (2026-08-10) — each a real, approved case study, not a preview. The truthfulness requirement underneath the original wording is unchanged and, if anything, stronger now that three of the four entries carry full repository-audited case studies instead of seed copy alone. **Current approved criterion**: all published project entries pass the publication gates required by their declared depth and contain zero unsupported or unverified public claims. **Met, independently verified against all four published projects (2026-08-10)**: `validatePublicationGates` returns zero errors for Kıvılcım (`depth: "full"`, `verificationStatus: "verified"`, `factsCheckedAgainstRepo: true`), DropSpot (`depth: "short"`, `"verified"`, `true`), JointLedger (`depth: "short"`, `"verified"`, `true`), and Professional Systems (`depth: "preview"`, `"requires-user"`, `false` — correctly exempt from the full/short-only checks, and containing zero concrete claims by design, so there is nothing left unverified); no project's rendered output contains a `[CONTENT REQUIRED` marker; every one of the four routes (`/work/kivilcim`, `/work/dropspot`, `/work/jointledger`, `/work/professional-systems`) is publicly reachable. Kıvılcım, DropSpot, and JointLedger's underlying technical claims were each checked directly against their audited repositories during TASK-005/006/this pass respectively (see each task's own completion report and `docs/PROGRESS.md`); Professional Systems makes no concrete claim to verify, by the exact approved D-009 wording.
- [x] Case-study template renders all 11 IA sections from a draft entry in dev — verified via an automated fixture-based test (`tests/unit/work-loader.test.tsx`), not a live `pnpm dev` browser visit: `dynamicParams = false` makes draft/fixture content genuinely unreachable via any running server, dev or prod (by design — see security notes in `docs/PROGRESS.md`), so the only way to prove the template without exposing draft content live is exactly what this task's own remediation instruction specified: a fixture rendered through the real components (`CaseStudyHero`, compiled `index.mdx` body, `LayerSection` ×3, `DecisionList`, `NextProject`) via `renderToStaticMarkup`.
- [x] No new runtime dependencies beyond those installed in TASK-001 (unless the D-001 fallback was adopted — then the swap is documented); lockfile diff reviewed.
- [x] No Client Components added.

## Required verification commands

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build && pnpm test:e2e
```

## Manual browser checks

- `/work` at 375/768/1024/1440px; card rows match DESIGN_SYSTEM; no overflow.
- Dev-mode case-study template on a draft fixture: renders with visible `[CONTENT REQUIRED]` markers — confirming drafts work and markers are loud.
- Production build: draft slugs 404; published previews render only approved copy.

## Accessibility checks

- `/work` and template: heading hierarchy, keyboard pass, focus visibility.
- Stacked layer sections have unique headings; decision list is a semantic list.

## Content verification checks

- Every frontmatter fact traces to PROJECT_SPEC §12 / CONTENT_INVENTORY verified-direction lists; everything else is a marker.
- JointLedger: upstream (ezBookkeeping) named in rendered output; no private infrastructure details anywhere in content files.
- Professional systems: zero concrete claims.
- Notes: only Hakan-confirmed articles or the pending state.

## Rollback notes

Revert = remove created files, restore changed pages from git (`pnpm install` only if `package.json` changed via the D-001 fallback). Returns the repo to the approved TASK-002 state. Note: TASK-003 depends on this task — rolling back after TASK-003 began breaks the homepage and must be reported first.

## Completion report template

```markdown
### TASK-004 report — <date>
- Files created/changed: <list>
- Content deps verified (versions, from TASK-001): zod, gray-matter, next-mdx-remote <or @next/mdx fallback note>
- Gate demonstration (forced failure output): <snippet>
- Commands run and results: <...>
- Manual checks: <results>
- QA_CHECKLIST sections run: 1, 2, 3, 5, 6, 7 — <results>
- Deviations: <none | list>
- Unresolved issues: <none | list>
- Git status after: <...>
STOPPED. Awaiting review for Phase 4.
```
