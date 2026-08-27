# AUTONOMOUS ROADMAP

Execution order for the autonomous engineering supervisor. Live state is in
`docs/AUTONOMOUS_STATUS.md`; this file is the plan, not the status.

_Last updated: 2026-08-28_

---

## Model policy

| Role | Model | Scope |
|---|---|---|
| Default worker | **Opus 5, high effort** | recovery, git, implementation, refactors, tests, types, lint, format, build, E2E, console/runtime triage, performance, accessibility, documentation, and repeat application of an already-approved design system |
| Design gate | **Fable 5, ultracode xhigh + workflows** | only where human-level art direction is the core unresolved problem |

Fable is **not** to be used for routine work merely because a task touches CSS. Model switching
cannot be performed from inside the session: when a gate is genuinely reached, all safe work is
checkpointed first, a handoff is written to `.ai/handoffs/FABLE-GATE.md`, and the session stops
cleanly. Fable returns via `.ai/handoffs/OPUS-RETURN.md`.

---

## Phases

| # | Phase | Owner | State |
|---|---|---|---|
| 1 | Recovery + durable checkpoint | Opus | **HALTED — STATE D**, see `AUTONOMOUS_RECOVERY_STATUS.md` |
| 2 | Technical baseline / console triage | Opus | blocked on Phase 1 |
| 3 | DropSpot final engineering prep (mechanical diagnosis first) | Opus | blocked on Phase 1 |
| — | **Fable Gate 1** — desktop final art direction | Fable | only if unresolved judgement remains after Phase 3 |
| 4 | Project architecture / content expansion (`PROJECT_INVENTORY.md`) | Opus | blocked on Phase 1 |
| — | **Fable Gate 2** — project experience system (SURFACE / FLOW / SYSTEM, case-study framework) | Fable | after Phase 4 |
| 5 | Apply the approved case-study system to remaining projects | Opus | after Gate 2 |
| — | **Fable Gate 3** — Software Factory flagship | Fable | after real architecture is extracted by Opus |
| 6 | Mobile audit (320/360/375/390/430/768) | Opus | after desktop is structurally stable |
| — | **Fable Gate 4** — mobile art direction | Fable | after the Phase 6 audit |
| 7 | Final engineering / console / performance | Opus | last |

---

## Phase 1 gate criteria (current)

Classify the machine into exactly one state before any code change:

- **STATE A** — latest V6.8 source in the Windows working tree
- **STATE B** — latest source on `origin`, safely synchronizable
- **STATE C** — latest source in another local branch / worktree / snapshot / patch / copy
- **STATE D** — Windows and `origin` hold only `d7013f8`-era source; the Ubuntu work is unavailable

**Result: STATE D.** Under STATE D the rule is a hard stop — do not recreate V6.8, do not rebuild
it from reports, do not start new development on the old source, do not let a design gate
redesign from screenshots, and do not create a competing implementation history.

---

## Git policy

Authorized: checkpoint commits and pushes on `feature/spatial-portfolio-v5`; safe
non-destructive tags.

Forbidden without explicit owner authorization: merging to `main`, force-push, history rewrite,
branch deletion, destructive rebase/reset, and touching unrelated repositories.

Standing objective: **latest source committed, pushed, and recoverable on both machines.** No
further week of work should exist only as an uncommitted working tree on one machine.

---

## Stop conditions

Routine questions are not escalated. The supervisor stops only for:

- **A** — STATE D (latest source only on Ubuntu) ← *current*
- **B** — missing credentials or secrets
- **C** — a destructive git choice
- **D** — a missing project fact where proceeding would require fabrication
- **E** — external manual authentication
- **F** — a Fable design gate requiring an actual model switch
- **G** — two genuinely equivalent art-direction alternatives that would redefine the product

---

## Visual artifact standard

Spatial changes are never judged from a single screenshot. Capture **entry / mid / focus / exit**
where applicable, plus a natural-scroll video driven by real incremental wheel input (not a
scripted `scrollTo` sweep), a comparison sheet, a manifest, and a validation summary. Artifacts
live outside the repository or under `review/`, and their location is recorded in
`AUTONOMOUS_STATUS.md`.
