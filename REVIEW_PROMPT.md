# REVIEW PROMPT — NO EDITS

Perform a strict audit of the current implementation against:

1. `CLAUDE.md`
2. `docs/PROJECT_SPEC.md`
3. `docs/ARCHITECTURE.md`
4. `docs/DESIGN_SYSTEM.md`
5. `docs/CONTENT_MODEL.md`
6. `<COMPLETED TASK FILE>`

This is a review-only task.

Do not edit files.
Do not install packages.
Do not refactor.
Do not commit.
Do not fix issues yet.

Inspect:

- Git diff
- changed files
- architecture boundaries
- component responsibilities
- server/client boundaries
- design-token usage
- responsive behavior
- keyboard behavior
- focus states
- reduced-motion behavior
- semantic HTML
- content truthfulness
- dependency changes
- type safety
- tests
- build result
- scope compliance
- acceptance criteria

Return findings in this order:

## 1. Verdict

Choose exactly one:

- APPROVED
- APPROVED WITH MINOR ISSUES
- CHANGES REQUIRED
- REJECTED

## 2. Blocking issues

List only issues that must be fixed before the next phase.

## 3. Non-blocking issues

List improvements that may wait.

## 4. Scope deviations

Identify anything implemented outside the approved task.

## 5. Unverified claims or content

Identify any text or metadata that is not grounded in approved content.

## 6. Quality-gate results

Report the actual result of:

- typecheck
- lint
- tests
- production build
- manual responsive checks
- keyboard checks
- reduced-motion checks

Do not claim a check passed unless you actually ran or inspected it.

## 7. Exact remediation plan

For each blocking issue, provide:

- file/path
- problem
- smallest safe correction
- verification step

Stop after the audit.
