# PHASE EXECUTION PROMPT

Replace every value inside `<...>` before sending.

---

Implement only:

`<TASK FILE PATH, for example docs/tasks/TASK-001-foundation.md>`

Do not begin any other task.

Before editing:

1. Read `CLAUDE.md`.
2. Read `docs/PROJECT_SPEC.md`.
3. Read `docs/ARCHITECTURE.md`.
4. Read `docs/DESIGN_SYSTEM.md`.
5. Read `docs/CONTENT_MODEL.md`.
6. Read the active task file completely.
7. Inspect Git status and the relevant existing code.
8. Report:
   - exact scope
   - files expected to change
   - assumptions
   - risks
   - verification plan

Do not make optional product or design decisions. If the active task requires a decision not already approved in the documents, stop and ask for approval before editing.

Implementation rules:

- Change only files required by the active task.
- Do not refactor unrelated code.
- Do not add packages outside the approved dependency budget.
- Do not use placeholder facts as real content.
- Do not start motion work during a static-layout task.
- Do not silently alter design tokens or architecture.
- Prefer Server Components.
- Keep client boundaries minimal.
- Preserve accessibility and reduced-motion requirements.
- Do not commit unless explicitly requested.

After implementation:

1. Run every verification command defined in the task.
2. Run the applicable project-wide quality checks.
3. Inspect the final Git diff.
4. Update `docs/PROGRESS.md`.
5. Update `docs/DECISIONS.md` only if a real decision was made.
6. Mark each acceptance criterion as:
   - passed
   - failed
   - not applicable
7. Report:
   - files changed
   - behavior implemented
   - commands run and results
   - manual checks completed
   - unresolved issues
   - deviations from the task, if any

Stop after this task. Do not begin the next task.
