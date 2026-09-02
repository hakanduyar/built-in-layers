MODEL: gpt-5.6-luna
REASONING EFFORT: xhigh
RUNNER: Codex CLI (fresh process — do NOT resume the V12 session)

# INDEPENDENT PROJECT-ARCHITECTURE REVIEW

You are reviewing a **proposal**, not an implementation. No code has been written for this phase.
Nothing has been decided. Your job is to attack the proposed architecture before a single
implementation slice starts, and to decide whether its acceptance criteria may be frozen.

## 0. Candidate under review

| | |
|---|---|
| Repository | `C:\GitHub\portfolio` |
| Branch | `feature/project-architecture-v13` |
| Candidate | the tip of that branch — verify with `git rev-parse HEAD` and record what you see |
| Base | `243db3934d634f2c39d339cd2a267c01d86be2bd` — the frozen V12 tip, unmodified |
| Frozen branch | `feature/spatial-portfolio-v5` @ `243db393` — **do not touch** |
| `main` | `16d3ec0` — **do not touch** |
| Expected tree state | clean, except one intentional untracked artifact: `docs/review/v12-codex-gate/codex-gate-checkpoint.bundle` (22.6 MB V12 recovery bundle, deliberately uncommitted) |

Confirm before reviewing: `git merge-base --is-ancestor 243db393 HEAD` must succeed, and
`git diff 243db393 HEAD --stat` must show **documentation and tooling only** — no application
source. If it shows otherwise, STOP and report it.

## 1. What to read

| Artifact | What it is |
|---|---|
| `docs/PROJECT_INVENTORY.md` | Evidence-backed inventory: what exists, 7 findings, IMPLEMENTED / PARTIAL / MISSING / OBSOLETE / DEFERRED / UNKNOWN |
| `docs/PROJECT_ARCHITECTURE.md` | CURRENT map, TARGET proposal, gap/dependency map, candidate slices, attack surface |
| `docs/FROZEN_BOUNDARY.md` | The V12 regression boundary: 30 fingerprinted files, 2 real contact points |
| `docs/review/v13-inventory/metrics/project-inventory.json` | Machine-readable evidence behind every table |
| `tests/tools/project-inventory.mjs` | Regenerates that evidence — re-run it, do not trust the JSON |
| `docs/CONTENT_MODEL.md`, `docs/DESKTOP_FREEZE_ACCEPTANCE.md`, `docs/CONTENT_GAPS.md` | Standing contracts |

## 2. Verify before you critique

Do not inherit the proposal's confidence. Independently reproduce:

1. Re-run `node tests/tools/project-inventory.mjs` and diff against the committed JSON.
2. Confirm F1 — Software Factory is `depth: preview` with no layer files and 0 decisions, while
   it is scene 01 in `lib/spatial/scenes.ts`.
3. Confirm F2 — the `nextSlug` chain (`kivilcim → dropspot → jointledger → professional-systems`)
   contradicts `order`, and `software-factory` has no `nextSlug`.
4. Confirm F7 is **not** a defect — empty tier groups are filtered at `app/work/page.tsx:30`.
   If the proposal has misclassified this, say so.
5. Establish whether Zod strips or rejects an unknown `nextSlug` key, since the removal ordering in
   Slice 1 depends on it (`ProjectFrontmatterBaseSchema`, `lib/content/schemas.ts`).

## 3. The questions that decide the phase

Ranked. Question 1 is the one most likely to invalidate the proposal.

1. **Is `nextSlug` obsolete, or deliberate editorial sequencing?** The proposal calls it a
   duplicate source of truth and deletes it. If instead it encodes an intentional narrative order
   that `order` cannot express, Slice 1 destroys real signal and the correct fix is inverted. No
   repository document states which is intended. Decide from the evidence, or declare it
   owner-only.
2. **Is the "depth ladder" (§2.2 of the architecture doc) an invented rule?** It asserts that
   presented prominence and content depth must agree. Check `CONTENT_MODEL.md` and
   `PROJECT_SPEC.md`. If no approved source requires it, it is an agent-authored rule and must be
   escalated to the owner rather than accepted by review.
3. **Is a content-driven change inside a frozen scene a V12 regression?** Raising Software
   Factory's depth changes the affordance string at `components/spatial/SpatialProjectScene.tsx:115`
   and the topology in `components/sections/SelectedSystems.tsx`, without editing either file.
   `docs/FROZEN_BOUNDARY.md` §3 deliberately declines to rule on this. You must.
4. **Is growing Software Factory the right answer at all?** The alternative — moving the flagship
   position to a project that can actually support it — is not evaluated in the proposal, which
   assumes growth. Is that assumption sound?
5. **Should `professional-systems` be `draft` rather than `published`?** It is `requires-user`
   with a 15-word body and no links, yet occupies a `featured` slot.
6. **Is Slice 1 correctly ordered first?** It is the only unblocked slice, but is it the most
   valuable one, and does it create rework once the blocked slices land?
7. **Does per-project unit testing encode content into tests** such that every content edit breaks
   a test — and if so, is the proposed coverage parity (Slice 3) making that worse?

## 4. Assumptions the proposal makes (challenge them)

- That `order` is the authoritative ordering and the frozen homepage agrees with it. *Verified for
  the four projects; `professional-systems` has `order: 4` and no scene.*
- That the frozen V12 system is correct and must not be reopened. *Given, from the freeze.*
- That no project fact may be invented, so content-side slices blocked on owner knowledge cannot
  proceed. *`CLAUDE.md` §11.*
- That the build fails closed, making schema changes build-affecting.
  *`lib/content/work.ts:141-147`.*
- That six of nine gaps are owner-blocked and only G1 is actionable now. **If this is wrong, the
  phase is far larger than proposed — say so.**

## 5. Unresolved questions — owner-only, not for you to answer

Do not answer these; confirm the list is complete and correctly scoped.

1. May Software Factory's real architecture be published, and at what depth?
2. Do publishable Software Factory screenshots exist?
3. Everything about `professional-systems` (its frontmatter says `requires-user`).
4. Project timelines — absent on all five.
5. Any live/demo URL that may be linked — none exist today.
6. Whether Kıvılcım and JointLedger have screenshottable running states.

## 6. Your authority

You MAY: inspect, measure, re-run the inventory tool, run typecheck/lint/unit/build, write your
review, and commit and push `feature/project-architecture-v13`.

You MAY NOT: implement any slice, merge to `main`, force push, rewrite history, touch
`feature/spatial-portfolio-v5`, modify any file fingerprinted in `docs/FROZEN_BOUNDARY.md` §1,
delete the V12 recovery bundle, or invent any project fact.

**Do not freeze acceptance criteria yourself.** Recommend what they should be; the freeze happens
after your review is accepted.

## 7. Required output

Create `.ai/handoffs/CODEX-ARCH-RETURN.md` and end with:

```
CODEX ARCHITECTURE REVIEW

reviewed candidate SHA:
branch:
tree state:

VERDICT: ACCEPT / ACCEPT WITH CHANGES / REJECT

Inventory accuracy:          (which findings reproduced, which did not)
Misclassifications:
CURRENT map accuracy:
TARGET soundness:
Q1 nextSlug obsolete or editorial:
Q2 depth ladder invented or grounded:
Q3 content change in frozen scene = regression:
Q4 grow vs move the flagship:
Q5 professional-systems draft or published:
Q6 slice ordering:
Q7 test-coverage pattern:
Missed gaps:
Recommended first slice:
Recommended acceptance criteria (NOT frozen):
Owner decisions still required:
Next owner: OPUS / OWNER / FABLE
```

Report what you actually find. If the proposal is wrong, say it is wrong.
