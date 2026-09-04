# TOKEN POLICY

Canonical policy for model routing, session shape, reading, validation, artifacts and the QA loop.
Where another document disagrees about any of these, this file wins.

## Model policy

| Situation | Model / effort |
|---|---|
| Normal engineering, implementation, orchestration | **Opus 5 · Medium** |
| Difficult architecture, critical engineering gate, final independent QA | **Opus 5 · High** |
| Normal visual / art-direction gate | **Fable 5.1 · High** |
| Exceptional critical visual gate only | **Fable 5.1 · Max** |
| P2 polish | no new model gate by default |

Fable Max is **not** the default — it was used for V13 and Gate 4 because those were first-of-kind
gates; a routine visual pass does not need it. Never run the same full job on two models.

## Session policy

- One major gate = one fresh session.
- Resume the same session **only** when that gate was interrupted mid-flight (quota, turn boundary).
  Preserve the session id; do not restart a half-finished pass.
- Once a gate is committed, pushed and handed off, start the next gate fresh.
- Carry context through `STATE.md` / `ACTIVE_TASK.md` / `HANDOFF.md`, not giant session history.

## Read policy

Startup read, in order: `CLAUDE.md` → `.ai/STATE.md` → `.ai/ACTIVE_TASK.md` → `.ai/HANDOFF.md` (only
if a handoff is pending).

Read anything else **only** when ACTIVE_TASK names it. Do not recursively read `docs/`, review
artifacts, historical handoffs, recovery records or old transcripts.

## Validation policy

- **Iterating:** affected tests only, typecheck when relevant, targeted runtime capture.
- **Before an implementer checkpoint:** enough to prove the implementation is coherent.
- **Final independent QA:** the full matrix, once.

Do not run the full suite in the implementer, then the orchestrator, then QA. The orchestrator does
not re-run an expensive suite to reconfirm an independent QA result unless the evidence is
inconsistent.

## Artifact policy

- Primary visual reference widths: **320 / 390 / 768**.
- Mechanical probe widths: **320 / 360 / 375 / 390 / 430 / 768** — measured, not captured.
- Capture an intermediate width only when a finding exists there.
- Target roughly **20–60 meaningful artifacts per gate**, not hundreds. No duplicate stills unless a
  comparison needs them.

## QA loop policy

```
IMPLEMENTER → one independent QA
  P0/P1 remaining → one correction pass → one recheck
  same material issue after two full cycles → STOP, owner decision
  P2 → record and defer; do not reopen a gate
```

## Orchestrator policy

The orchestrator owns state, routing, Git safety and handoff. It is **not** a third full reviewer.
It verifies git/scope/frozen-boundary cheaply and trusts an independent QA's measurements unless
they contradict something visible.

## Prompt templates

**Normal task**

```
Read CLAUDE.md, .ai/STATE.md and .ai/ACTIVE_TASK.md.
Execute ACTIVE_TASK end-to-end.
Update STATE and HANDOFF when complete.
Do not broaden scope.
```

**Fable task**

```
Read CLAUDE.md, .ai/STATE.md, .ai/ACTIVE_TASK.md and the evidence ACTIVE_TASK references.
Execute the visual gate using Fable 5.1.
Do not reopen frozen systems outside scope.
```

**QA task**

```
Read CLAUDE.md, .ai/STATE.md and .ai/HANDOFF.md.
Independently QA the committed checkpoint.
Run the acceptance validation required by ACTIVE_TASK/TOKEN_POLICY.
Do not redo art direction.
```
