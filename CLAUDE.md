# CLAUDE.md — durable rules

Permanent constitution for this repository. Rules only — no history, no current state.
Current state lives in `.ai/STATE.md`; the current assignment in `.ai/ACTIVE_TASK.md`.

## Project

Active repository: `C:\GitHub\portfolio` — the **Built in Layers** portfolio (Next.js App Router,
TypeScript strict, Tailwind, pnpm). Owner: Hakan Duyar.

## Git safety

- Never merge to `main` without an explicit owner request. Never force push, `reset --hard`, or
  `git clean`.
- Never discard unknown owner work. Preserve recovery evidence (snapshots, bundles) when it exists.
- Normal feature-branch commits and pushes are allowed and expected at stable checkpoints.
- Verify `local HEAD == origin` after every push.

## Single writer

One implementation writer per working tree. Never run two implementation or art-direction gates
against the same checkout. Before starting a gate, confirm no other session is writing — check
`ListAgents` and recent file mtimes, **not** one `.claude/projects/<dir>`, which cannot see a session
working from another project directory.

## External repositories

Read-only unless explicitly authorized. Never confuse a portfolio *project* with a similarly named
external repo or agent session (e.g. "Software Factory" the case study vs. the `software-factory`
repository vs. a `software-factory-*` session).

## Model routing

- **Opus 5** — engineering, architecture, orchestration, implementation, QA.
- **Fable 5.1** — visual and art-direction gates only.
- Do not run the same full job on both. Effort tiers: `.ai/TOKEN_POLICY.md`.

## Frozen systems

Frozen systems are listed in `.ai/STATE.md` and fingerprinted in `docs/FROZEN_BOUNDARY.md`. Do not
reopen one without a **measured** regression or an explicit new phase. If a frozen file must move,
it needs a stated reason, before/after measurement, proof the other platform is unchanged, and a
row in `FROZEN_BOUNDARY.md` §5.

## Truth

Never fabricate project facts, architecture, metrics, outcomes, timelines, URLs or evidence. Missing
facts go to `docs/CONTENT_GAPS.md`. Distinguish repository, live and demo links — never relabel one
as another. Report results faithfully: if a check did not run, say so.

## Validation

Targeted validation while iterating; the full matrix once, at the acceptance gate. Do not repeat an
expensive suite merely to reconfirm another agent's independent result unless the evidence is
inconsistent. Never weaken an assertion to make a gate pass — fix the product, or report it.

## Owner interruption

Resolve routine engineering decisions autonomously. Stop only for: a decision needing private owner
facts, an unsafe or destructive action, confidential data, a merge to `main`, an uncontrolled
concurrent writer that cannot be isolated, or a material design fork no existing decision resolves.

## Task routing

1. `.ai/STATE.md` — current truth
2. `.ai/ACTIVE_TASK.md` — the one current assignment
3. `.ai/HANDOFF.md` — only if a handoff is pending

Read deeper documents (`docs/**`, review artifacts, historical handoffs) **only** when ACTIVE_TASK
names them. Do not load history by default.
