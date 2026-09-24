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

## TOKEN-FIRST PROMPT GATE — MANDATORY

Before every task:

1. **MODEL** — use the cheapest sufficient model/effort (see Model policy above).
2. **SCOPE** — maximum 2–3 objectives.
3. **CONTEXT** — do not reload information already known or frozen.
4. **VALIDATION** — validate only the changed scope (see Validation policy above).
5. **REUSE** — never regenerate evidence that already passed unless the relevant code changed.

### Micro-fix rules

- Default orchestration: **Haiku / Low**.
- Do not read STATE, HANDOFF, history, docs, screenshots or unrelated source unless the user
  explicitly requires them.
- No repo-wide exploration.
- No browser capture, build or test during the implementation pass.
- Produce the smallest local diff and STOP.
- Implementation and validation are separate tasks.
- Frozen/PASS areas must not be re-audited.

### Claude → Codex delegation

- When Claude is only the orchestrator, it must not independently analyse the repository.
- Start Codex within at most 3 tool actions.
- Do not duplicate Codex's investigation.
- Do not repeatedly inspect `codex --help` if a working invocation is already known.
- Keep verbose Codex output out of Claude context where possible.
- Read/return only Codex's concise result.
- If delegation cannot begin within 3 tool actions, STOP instead of investigating.

### Validation (gate-specific)

- Test only the touched scope.
- Do not rerun previously-passing broad suites.
- Full acceptance suite is reserved for a true final/release gate and should normally run once.

### Model routing (gate-specific)

- Micro-fix orchestration: Haiku / Low.
- Coding/engineering implementation: Codex.
- Visual art-direction: Fable High only when genuinely required.
- Opus Medium/High only for unresolved critical reasoning or a specifically justified final task.
- Never use a more expensive model simply to orchestrate another model.

### STOP conditions

- If scope expands beyond the requested objectives: STOP.
- If previously frozen areas would need reopening: STOP and report why.
- If a task begins consuming context through broad investigation before implementation/delegation:
  STOP.
