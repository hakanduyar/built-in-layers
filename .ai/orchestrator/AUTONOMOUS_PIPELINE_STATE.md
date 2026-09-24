# AUTONOMOUS PIPELINE STATE

> **Historical (2026-09-04).** The V13 / mobile pipeline it tracked is complete. Current state is
> `.ai/STATE.md`; policy is `.ai/TOKEN_POLICY.md`. Kept for its recovery record and the
> concurrent-writer incident. Do not read it by default.

Recovery record for the autonomous pipeline, so an interrupted CLI session can be resumed without
the owner reconstructing context. Machine-readable twin: [`state.json`](state.json). Timestamped
transitions: [`AUTONOMOUS_PIPELINE.log`](AUTONOMOUS_PIPELINE.log).

```
CODEX  →  FABLE_5_1  →  OPUS_FINAL_QA  →  DESKTOP_FREEZE_CANDIDATE
  ▲
current
```

## Correction to the pipeline brief's premise

The brief that established this file opened with "Codex is CURRENTLY RUNNING. Do not kill it."
**That was not the case.** The Codex architecture review (session `01a06372`) had already completed
and returned ACCEPT WITH CHANGES. What was in flight was the Claude-side implementation of Slice 0
and Slice 1, which the owner had authorised in the preceding decision brief. No Codex process was
interrupted, and none was competing.

## Git

| | |
|---|---|
| Working branch | `feature/project-architecture-v13` |
| Frozen base | `243db393` — the V12 desktop freeze |
| Frozen branch | `feature/spatial-portfolio-v5` @ `243db393`, untouched |
| `main` | `16d3ec0`, untouched |
| Last observed HEAD / origin | `78bf8305` / `78bf8305` |
| Working tree | clean except the intentional untracked V12 recovery bundle |
| Frozen boundary | all 30 fingerprinted blobs unchanged (`docs/FROZEN_BOUNDARY.md` §4) |

## Stage 1 — CODEX

**Architecture review: COMPLETE.** `gpt-5.6-luna` / `xhigh`, session
`01a06372-fc4a-7232-b371-6d78c1bd42c5`, reviewed `499e7d8`. Verdict **ACCEPT WITH CHANGES**.
Gate `.ai/handoffs/CODEX-ARCH-GATE.md`, return `.ai/handoffs/CODEX-ARCH-RETURN.md`.

Its corrections were applied, and the owner's decision brief then authorised the slices:

- **Slice 0 — ordering contract: DONE** (`78bf8305`). `order` documented as one global sequence;
  `sortByTierThenOrder` → `sortByOrder`; `checkUniqueOrder` makes duplicates a build failure.
- **Slice 1 — derived navigation: DONE** (`78bf8305`). `nextSlug` removed from schema, three
  entries and the fixture; previous/next derived from one ordered collection; `NextProject` →
  `ProjectNeighbours`. D-027 records it.

**Slice re-review: PENDING.** Owner brief §C requires an independent review of the slices *before*
architecture acceptance criteria are frozen. That is still owed and is the current substage.

## Stage 2 — FABLE 5.1

**NOT STARTED.** Model availability **CONFIRMED**: `claude-fable-5-1` returns completions and
self-reports that id, while a deliberately bogus control model name is rejected by the API — so
acceptance is meaningful evidence, not a silent fallback. This is therefore *not* the true blocker
§8 of the brief anticipated.

## Stage 3 — OPUS FINAL QA

**NOT STARTED.**

## Quota policy

A usage-limit exit is **PAUSED_FOR_QUOTA**, never FAILED. On hitting one: persist the session id and
the stated reset time, wait past it with a safety buffer, and resume the *same* session so
accumulated context is not thrown away. Codex quota was exhausted earlier today and resumed cleanly
at its 2:57 PM reset; that precedent is the pattern.

## Resume

Read this file and `state.json`, verify git state, then continue from `current_stage` /
`current_substage`. `pipeline-watchdog.ps1` observes state and reports; it is deliberately
non-destructive and never merges, force-pushes, resets, or cleans.
