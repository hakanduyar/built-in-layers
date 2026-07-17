# TASK-004 — Content system

Status: NOT STARTED — requires Phase 2 (TASK-002 static shell) approved. **Execution order revised 2026-07-17: this task now precedes the homepage (TASK-003), which depends on it (D-011 rejected).**

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

- [ ] All verification commands pass; unit tests cover every publication-gate rule with at least one negative case each, including that draft content never blocks the build.
- [ ] `pnpm build` fails demonstrably when a published-fixture violation is introduced (shown in report, then reverted).
- [ ] `/work` renders tiers correctly in D-016 order (Kıvılcım, DropSpot, JointLedger, Professional preview); drafts excluded; JointLedger preview shows upstream disclosure text.
- [ ] Published preview entries (kivilcim, dropspot, professional-systems) contain zero unverified claims — only approved seed/pending copy; professional pending copy is the exact D-009 wording.
- [ ] Case-study template renders all 11 IA sections from a draft entry in dev.
- [ ] No new runtime dependencies beyond those installed in TASK-001 (unless the D-001 fallback was adopted — then the swap is documented); lockfile diff reviewed.
- [ ] No Client Components added.

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
