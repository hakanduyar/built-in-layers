# TASK-005 — Kıvılcım case study (full)

Status: NOT STARTED — requires Phase 4 (TASK-003 homepage; content system approved earlier as Phase 3) approved AND content inputs (see Dependencies)

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

- [ ] All verification commands pass, including publication + layer-meaning gates.
- [ ] Claim→evidence map covers 100% of technical claims; zero unmapped claims.
- [ ] All 11 IA sections present; each layer body ≥400 chars of distinct, real content.
- [ ] ≥3 decisions with honest alternatives and trade-offs (from repo history/Hakan, not invented).
- [ ] Contribution statement present and provided/approved by Hakan.
- [ ] All images real, optimized, alt-texted; no placeholder assets remain for this project.
- [ ] No code/component/dependency changes.
- [ ] Hakan has approved the published text (review step).

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
