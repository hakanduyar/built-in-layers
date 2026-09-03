# FINAL PIPELINE RETURN — V13

Closing record for the autonomous pipeline that ran 2026-09-02 → 2026-09-03 on
`feature/project-architecture-v13`. Live state: [`state.json`](state.json). Timeline:
[`AUTONOMOUS_PIPELINE.log`](AUTONOMOUS_PIPELINE.log).

```
CODEX (architecture) → OWNER DECISIONS → SLICE 0/1 → CODEX (slice) → FABLE 5.1 → OPUS 5 HIGH QA
                                                                                        ▲ here
```

## CODEX

- **Model:** `gpt-5.6-luna`, effort `xhigh`. Sessions `01a06372` (architecture review),
  `01a063b6` (slice review), `01a063f1` (confirmation).
- **Start / final HEAD:** `243db393` → `bc2dad3`.
- **Verdicts:** ACCEPT WITH CHANGES, then ACCEPT WITH CHANGES, then all conditions MET / may freeze.
- **Key architectural changes:** one global `order` (D-027) with uniqueness enforced at the loader;
  `sortByTierThenOrder` → `sortByOrder`, a name that had never matched its body; `nextSlug` removed
  from schema, three entries and a fixture; previous/next derived from one ordered collection so
  they cannot disagree; `isCaseStudyDestination` gating navigation on `depth`.
- It also corrected the proposal on facts: D-021 had already settled the ordering question, and
  several "gaps" were optional fields rather than contract violations.
- **Removed from this gate 2026-09-03** by owner decision (capacity). Its completed reviews stand as
  history; no retry is scheduled.

## FABLE

- **Model:** `claude-fable-5-1` (Fable 5.1), effort `max`. Session
  `20173014-40f9-4a94-8e5b-a8a3fb435448` — one session throughout, resumed twice through quota
  pauses, never restarted.
- **Start / final HEAD:** `76c5660` → `26836ba` (52 files, +11169/−142).
- **Visual verdict:** **FREEZE**.
- **Key art-direction changes:** D-028 bottom-anchored grounds (Kıvılcım/JointLedger blank ground
  153–213px → 42–59px, DropSpot held as control); the Software Factory nine-column plate
  (plate-bottom clearance 0/4/16 → 44/46/67px); D-029 case-study destinations — lead asset, record,
  contribution and AI disclosure now rendered, `h1` 40 → 64px, first evidence inside the first
  viewport on all five routes, Professional Systems exiting to `/work`; HOW I BUILD's consequence
  rule 40 → 331–347px; SELECTED SYSTEMS label aligned to the Record column (77–80 → 0px).

**Its most valuable find came before any of that.** In pass 1 it could not render at all, judged
from static stills, and still caught that the site's primary line — *"Interfaces on the surface.
Systems underneath."* — was cut on every display wider than ~1600px: 256px of box for 309px of text
at 1920, and 24px at 2560, i.e. effectively absent. V12 had passed because it measured "0 horizontal
overflow", and clipping by an ancestor is not overflow. Verified by rendering, fixed in `76c5660`,
approved viewports byte-identical by construction.

## OPUS QA

- **Model:** `claude-opus-5`, effort `high`, fresh independent session.
- **Start / final HEAD:** `26836ba` → `83ebac7` (`742ecf5` boundary ledger, `83ebac7` its return).
- **Verdict:** **PASS WITH DOCUMENTED NON-BLOCKERS**.
- **Measured itself, accepting nothing on report:** typecheck 0 · lint 0 · Prettier clean on all 17
  changed files · unit 527/527 · build 15 routes · Chromium 216/216 · 0 console errors across 55
  page loads · 245/245 committed metric values reproduced against a fresh build.
- **WebKit tested rather than trusted:** a detached worktree at `76c5660` with its own install and
  build reproduced all five failures with identical received values (`"Hakan Duyar"`, `inactive`,
  `783.360005`, `viewport ratio 0`, `1440`). Pre-existing environment condition, not product
  regression; all five pass on Chromium.
- **Defect it found and fixed:** `docs/FROZEN_BOUNDARY.md` — the document defining the boundary —
  had not been updated, so its own procedure printed five unexplained `MOVED:` lines. It added a §5
  ledger tying each move to its granting decision and evidence, and left the `243db393` fingerprints
  intact so the check still compares against the freeze.

## GIT

| | |
|---|---|
| `feature/project-architecture-v13` | `83ebac739f3d9b62a8866b3566caf3cdf950554e` |
| origin | identical |
| `main` | `16d3ec0` — **untouched**, reflog holds exactly one entry (the original clone) |
| `feature/spatial-portfolio-v5` | `243db393` — **untouched** |
| Working tree | clean apart from `.ai/orchestrator/*`, `docs/AUTONOMOUS_STATUS.md` and the preserved V12 bundle |
| Frozen boundary | exactly 5 of 30 moved, all ledgered in `FROZEN_BOUNDARY.md` §5 |

## Carried forward

1. **WebKit environment condition** — five failures under software rendering; the constant received
   values suggest the scripted scroll never executes. Pre-existing, reproduced at `76c5660`.
2. **Art direction, for Fable** — pass 1's directive to set decision *alternatives* as a list rather
   than a comma join was not carried into pass 2. D-029 does not claim it was, so nothing asserted is
   false. Left undecided rather than settled by an engineering pass.
3. Three `<nav>`s sharing `aria-label="Primary"` — pre-existing, axe-clean, `components/layout/`
   untouched by this work.
4. The repo-wide Prettier "debt" figure is largely a `core.autocrlf` artefact.

## Incident on the record

A third session (`software-factory-0b`, working from a different project directory) wrote to this
repository while the gate was running: it edited a frozen-boundary file with an attribution to a
role that did not exist, rebuilt `.next` under Fable's server — corrupting a set of zoom captures —
and at 06:16:42 reverted three of Fable's files to HEAD. Neither recovery snapshot contained those
edits, because both predated the revert. They were recovered from Fable's own transcript, and the
orchestrator handed the evidence back rather than reimplementing Fable's design.

The orchestrator's first isolation check was wrong: it searched one project directory and concluded
no third session existed. **Scope concurrent-writer checks by `ListAgents`, not by
`.claude/projects/<dir>`.**

## FINAL VERDICT

**DESKTOP FREEZE CANDIDATE** — for `feature/project-architecture-v13` only.

`main` is untouched and nothing here proposes merging it.
