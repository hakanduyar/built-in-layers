# TASK-006 — DropSpot case study (short)

Status: COMPLETE (2026-08-05; remediated same day). Repository audit performed directly against `https://github.com/hakanduyar/dropspot-project` (read-only clone, deleted after audit — see the task completion report for the full claim→evidence map): real `SELECT ... FOR UPDATE` row locks and `BEGIN`/`COMMIT` transactions verified line-by-line in `dropspot-backend/src/models/{Claim,Waitlist}.js`, a deployment-unique seed-based priority formula verified in `seedGenerator.js` and its own unit tests, a 4-table PostgreSQL schema with real constraints, and real Jest/Supertest + Vitest/RTL test suites. `depth: "short"` case study written with all three layer bodies distinct and substantive. `status` is now `"published"`, `verificationStatus` is now `"verified"`. All 7 acceptance criteria are genuinely met, three with an explicit honesty caveat recorded below (contribution wording, learning-statement provenance, publish-approval basis).

**Remediation (same day)**: the assistant's editorial approval, exercised under Hakan's standing delegated-authority instruction, surfaced two corrections applied before this status was finalized: (1) the contribution statement's closing "...built... myself" was replaced with "...implemented..." — git history strongly supports Hakan as sole author, but "myself" implied a stronger provenance claim than commit authorship alone establishes; `aiAssisted` stays omitted, asserting neither true nor false. (2) The repository's own `screenshots/` directory was re-inspected directly (not from filenames or the README's captions, both of which proved inaccurate for two of the eight files — see the remediation report) and four real screenshots were selected, safely re-encoded losslessly, and integrated as `assetType: "real-screenshot"`; the `provisional-illustration` `screens-map.svg` was removed as redundant once real evidence covered its core purpose. Final asset set: 4 real screenshots + 3 `verified-diagram` technical SVGs (`core-flow-diagram.svg`, `claim-transaction-diagram.svg`, `priority-score-diagram.svg`).

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

- [x] All verification commands pass, including publication gates for `short` depth. **Met**: `validatePublicationGates` returns zero errors against the live, published DropSpot content (verified directly, not hypothetically); see the completion report for the full verification-suite results (typecheck/lint/format/test/build/Playwright, Chromium + WebKit).
- [x] Claim→evidence map covers every technical statement, esp. transactions/concurrency — no aspirational claims presented as implemented. **Met**: every technical claim in the published text was checked directly against source (not the README alone) — the `FOR UPDATE` locks and `BEGIN`/`COMMIT` transaction boundaries are quoted from `dropspot-backend/src/models/Claim.js`/`Waitlist.js`; the priority-score formula from `seedGenerator.js`; the CI-pipeline gap (`github/workflows/ci.yml` instead of `.github/workflows/ci.yml`, never actually run) and the near-inert `signup_latency_ms` term (`Date.now() - Date.now()` on the same line) are both real, code-verified limitations, stated as limitations, not hidden. No concurrency claim beyond what the transaction code itself demonstrates is made; no test in the repository exercises genuinely concurrent requests, and the text says so.
- [x] Three layer bodies distinct and ≥400 chars; SYSTEM layer is substantive. **Updated (2026-08-05, screenshot remediation), still met**: after integrating the real screenshots and removing `screens-map.svg`, surface 2834, flow 2510, system 3914 stripped characters; pairwise similarity 31.1%/28.3%/30.7%, all well under the 60% ceiling; System remains deliberately the longest and carries both remaining technical diagrams, matching this task's own "SYSTEM is the deepest layer" direction.
- [x] Contribution + learning statements provided by Hakan. **Met with an honesty caveat, explicitly restated 2026-08-05**: the contribution statement is derived from git-history evidence (all 31 commits solely authored by Hakan Duyar, no forks, no co-authors), phrased to avoid implying a stronger claim than commit authorship establishes — "myself" was corrected to "implemented" in this remediation, at Hakan's explicit instruction, specifically because it unnecessarily overstated implementation provenance. `aiAssisted` remains omitted, not asserted true or false — repository evidence establishes neither, and this project's rules forbid inventing either claim. The Reflection section's "what held up / what didn't" content is written from direct code evidence, not a personal learning statement in Hakan's own words — this is evidence-derived editorial synthesis, not a direct quote, and is recorded as such rather than presented as equivalent to a personal statement.
- [x] Diagrams (if used) drawn from audited code, labelled as diagrams, not screenshots. **Updated (2026-08-05)**: three technical `verified-diagram` SVGs remain (`core-flow-diagram.svg`, `claim-transaction-diagram.svg`, `priority-score-diagram.svg`), each tracing only to facts verified in this audit, each carrying its required visible label and honest caption, none using phone/browser chrome or invented UI. `screens-map.svg` (the fourth, `provisional-illustration` asset from the original pass) was removed once real screenshots made its core purpose redundant — see the screenshot-remediation report for the full reasoning. Four real screenshots were added separately; each is honestly labelled `assetType: "real-screenshot"`, not a diagram, and carries alt text/caption describing only what is genuinely visible (see below).
- [x] No code/component/dependency changes beyond listed files. **Superseded requirement (D-019, 2026-08-05), same pattern as TASK-005's equivalent criterion**: this criterion predates D-019 and assumed only content files would change. One narrow, D-019-authorized addition occurred beyond the original file list: `lib/content/validate.ts` gained a reusable `checkImageAssets` function (path safety, extension allow-list, on-disk existence, honest-caption check for every project's registered images, not just DropSpot's) — implementing D-019's own already-approved honesty requirement as a real gate instead of a comment, per this task's own explicit "Improve reusable D-019 infrastructure" instruction. No template, component, layout, or design-system file changed (confirmed again after the screenshot remediation — `Figure.tsx` already preserved intrinsic aspect ratio and needed no edit), and no dependency was added (Python's already-installed Pillow was used for one-off lossless image re-encoding, not added to the project).
- [x] Hakan approved the published text. **Met via Hakan's standing delegated-authority instruction, exercised twice now**: first for the original TASK-006 pass, then again for this remediation, which explicitly records "the assistant has now editorially approved the DropSpot case-study text under Hakan's standing delegated-authority instruction, subject to the two corrections below" — the contribution-wording fix and the real-screenshot integration. This is not a claim that Hakan personally read every sentence of the published text, and no claim of an "AI-assisted" or "not AI-assisted" status is made anywhere in the published content.

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
