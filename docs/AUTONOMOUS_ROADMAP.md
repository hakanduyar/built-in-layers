# AUTONOMOUS ROADMAP

Execution order for the autonomous engineering supervisor. Live state is in
`docs/AUTONOMOUS_STATUS.md`; this file is the plan, not the status.

_Last updated: 2026-09-01 (V9)_

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
| 1 | Recovery + durable checkpoint | Opus | **COMPLETE** — V6.8 recovered from Ubuntu, merged with `dc81393`, pushed (`dc0fef6`) |
| 2 | Technical baseline / console triage | Opus | **COMPLETE** — see `§ Phase 2 result` |
| 3 | DropSpot final engineering prep (mechanical diagnosis first) | Opus | **COMPLETE** — measured; residue is compositional, see `.ai/handoffs/FABLE-GATE.md` |
| — | **Fable Gate 1** — desktop final art direction | Fable | **COMPLETE** — executed 2026-08-31; `.ai/handoffs/OPUS-RETURN.md` |
| V7 | Owner reorder, plane grammar, governed scroll, Selected Systems | Opus | **COMPLETE** — D-021, DESIGN_SYSTEM §32 |
| V8 | Early duplicate removal + responsive world fit + late-page development | Opus | **COMPLETE** — D-022/D-023, DESIGN_SYSTEM §33 |
| V9 | Homepage release candidate: stale facts, dead run, pacing, affordance, About/Field Notes, CTA | Opus | **COMPLETE** — D-024, DESIGN_SYSTEM §34 |
| V10 | Route/plane/scroll rearchitecture: one governed scroll model, bounded intent, plane registration, seam | Opus | **COMPLETE** — D-025, DESIGN_SYSTEM §35 |
| 4 | Project architecture / content expansion (`PROJECT_INVENTORY.md`) | Opus | after Gate 1 |
| — | **Fable Gate 2** — project experience system (SURFACE / FLOW / SYSTEM, case-study framework) | Fable | after Phase 4 |
| 5 | Apply the approved case-study system to remaining projects | Opus | after Gate 2 |
| — | **Fable Gate 3** — Software Factory flagship | Fable | after real architecture is extracted by Opus |
| 6 | Mobile audit (320/360/375/390/430/768) | Opus | after desktop is structurally stable — V8 verified all six widths for overflow and console health, but not art direction |
| — | **Fable Gate 4** — mobile art direction | Fable | after the Phase 6 audit |
| 7 | Final engineering / console / performance | Opus | last |

---

## Phase 1 gate criteria (current)

Classify the machine into exactly one state before any code change:

- **STATE A** — latest V6.8 source in the Windows working tree
- **STATE B** — latest source on `origin`, safely synchronizable
- **STATE C** — latest source in another local branch / worktree / snapshot / patch / copy
- **STATE D** — Windows and `origin` hold only `d7013f8`-era source; the Ubuntu work is unavailable

**Result at the time of writing: STATE D.** Resolved on 2026-08-28 — the Ubuntu machine held the
complete V6.8 tree; it was snapshotted, committed (`d7bcebc`), merged with the Windows
documentation checkpoint (`682d54e`) and pushed. The branch tip is `dc0fef6`.

---

## Phase 2 result — technical baseline / console triage (2026-08-31)

Audited the recovered V6.8 production build with an instrumented browser (console, page errors,
failed requests, listener/rAF lifecycle across scroll + resize + client-side navigation, keyboard
focus, reduced motion).

| Finding | Class | Outcome |
|---|---|---|
| Reduced-motion hydration mismatch (React #418) in `DriftBlock` — server served `translateX(…0.04…)`, client hydrated `…0.22…`, whole lower page regenerated | **ERROR** | **FIXED**. `AboutPreview` and `SystemNode` use the new `useSettledReducedMotion()` (reports the preference only after hydration commits). `DriftBlock` needed more: settling in JS fixed the mismatch but left a window in which the block was still bound to the scroll, and the D-020 e2e caught 91.44px of travel through it. Its parked state is now a `prefers-reduced-motion` rule in `styles/globals.css` against a server-rendered `--drift-parked` constant — no JS branch, no window, no mismatch. |
| `Target ref is defined but not hydrated` — `useScroll` targeted `spacerRef`, which exists only in the enhanced tree | **DEV-ONLY** (stripped in prod) | **FIXED** — the target is supplied only while `enhanced` |
| React "unique key" warning attributed to `SpatialCamera`/`SpatialExperience` | **DEV-ONLY / framework** | Not fixed. Every authored JSX list was scanned programmatically and all are keyed; the payload arrives as an RSC lazy reference at the server→client prop boundary. Absent from the production build. Documented, not suppressed. |
| Motion "You have Reduced Motion enabled" notice | **THIRD-PARTY** | Expected |
| Production console errors / warnings / failed requests / missing assets | — | **none** |
| rAF still running after client-side navigation away | — | **0 ticks** — clean teardown |
| Net window/document listeners after navigation | **EXPECTED** | React root-delegated listeners; persist by design |
| Keyboard focus reaching off-viewport scene links | **EXPECTED** | The camera recenters them in 600–800 ms and focus is retained — an initial 90 ms probe was the measurement artifact, not a defect |
| Reduced-motion overflow / document height | — | 0 px overflow, static tree correct |

Validation after the fixes: typecheck, lint, prettier clean; unit **491/491**; production build
14/14 routes; Chromium E2E **208/208**; production and reduced-motion consoles both clean.

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
