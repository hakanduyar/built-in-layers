# TASK-006 — DropSpot case study (short)

Status: NOT STARTED — requires Phase 4 (TASK-003 homepage; content system approved earlier as Phase 3) approved AND repository audit within this task

## Objective

The shorter technical case study for DropSpot, published with `depth: "short"`: focused on the fair-claim/waitlist mechanics and the concurrency engineering, every claim verified against `https://github.com/hakanduyar/dropspot-project`.

Content task — no new components; the TASK-004 template renders `short` depth (Constraints/Decisions/Evolution optional per CONTENT_MODEL §3).

## In scope

- **Step A — Repository audit**: actual frontend/backend stack, PostgreSQL usage, transaction/locking strategy for claims (verify the race-condition story in code: transactions? row locks? unique constraints? queue?), waitlist/priority logic, test evidence, implementation completeness, known gaps. Output: claim→evidence map in the report.
- **Step B — Input intake from Hakan**: screenshots or approval to present without them, demo URL if any, contribution statement, what he learned, limitations. Task pauses after Step A if missing.
- **Step C — Writing** (upgrade the TASK-004 published-preview entry to `depth: short`): frontmatter (`verificationStatus` `verified` or `partial` per gate rules — `partial` allowed for short depth only if every published claim is individually repo-verified), one-minute summary, why it exists, three layer bodies with SYSTEM as the deepest (this project's story is the systems layer), brief reflection. Decisions array optional but recommended if the repo/history shows real ones (e.g. locking strategy choice).
- Real assets into `public/images/projects/dropspot/` (or an approved no-screenshot presentation using a real architecture/flow diagram authored from the audit — diagrams must depict the actual code paths).
- Publish flags; `nextSlug` chain updated (kivilcim ↔ dropspot ↔ jointledger preview as appropriate).
- Extend e2e for `/work/dropspot`.

## Out of scope

- Template/component/design/dependency changes. Motion. Other projects' content.
- Claiming production readiness, load-tested behavior, or user numbers — unless evidence exists, the case study says plainly what is implemented vs. explored.

## Dependencies

- TASK-004 approved. Order-independent with TASK-005 (ROADMAP), executed alone.

## Exact files expected to be created or changed

```text
Changed: content/work/dropspot/index.mdx, surface.mdx, flow.mdx, system.mdx
Created: public/images/projects/dropspot/* (real assets or audited diagrams)
Deleted: public/images/projects/dropspot/placeholder-*.svg
Changed: content/work/kivilcim/index.mdx (nextSlug only, if chaining),
         tests/e2e/work.spec.ts (extend)
```

## Implementation steps

1. Read docs + draft entry; report plan; `git status`.
2. Step A audit — read the actual claim/allocation code paths; document the concurrency mechanism found (or its absence — that too is publishable truth: "designed for X, currently implements Y").
3. Checkpoint: report audit; request Step B inputs if missing; STOP until provided.
4. Step C: write the short case study; SYSTEM layer explains the verified transaction/waitlist design with a diagram of the real flow.
5. Assets; publish flags; gates; e2e; report.

## Acceptance criteria

- [ ] All verification commands pass, including publication gates for `short` depth.
- [ ] Claim→evidence map covers every technical statement, esp. transactions/concurrency — no aspirational claims presented as implemented.
- [ ] Three layer bodies distinct and ≥400 chars; SYSTEM layer is substantive.
- [ ] Contribution + learning statements provided by Hakan.
- [ ] Diagrams (if used) drawn from audited code, labelled as diagrams, not screenshots.
- [ ] No code/component/dependency changes beyond listed files.
- [ ] Hakan approved the published text.

## Required verification commands

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build && pnpm test:e2e
```

## Manual browser checks

- `/work/dropspot` at 375/768/1024/1440px; optional-section omissions leave no visual gaps or dangling rules.
- Scannability pass (≤90s to grasp the project).

## Accessibility checks

- Heading hierarchy with omitted optional sections still sequential; keyboard pass; diagram alt text explains the flow in words.

## Content verification checks

- Verified-direction list (PROJECT_SPEC §12) items confirmed or downgraded per audit; the words "production", "scales", "handles high traffic" absent unless evidenced.
- Status phrased honestly (e.g. portfolio/learning project exploring fair-distribution mechanics) per Hakan's framing.

## Rollback notes

Content-only: `git checkout content/work/dropspot public/images/projects/dropspot` (+ e2e file) restores the published-preview state; a `depth: "preview"` flip reverts the case study alone.

## Completion report template

```markdown
### TASK-006 report — <date>
- Audit summary (claim → evidence map, concurrency mechanism found): <...>
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
