# CODEX SLICE RETURN

Independent implementation review of Slice 0 + Slice 1 at the actual repository HEAD.

The implementation behavior is sound against D-021 and D-027: the published collection is sorted
by one global `order`, duplicate published orders fail, `nextSlug` is absent from production and
the shared fixture, and previous/next case-study neighbours are derived from the same filtered
collection with open boundaries. The flagship and Professional Systems remain preview entries and
therefore intentionally have no case-study neighbours.

The review does not freeze the criteria yet. The live inventory extractor still emits a
`nextSlug` field, the current inventory and architecture documents still contain stale
pre-Slice-1 claims, and there is no integration test proving that `getPublishedProjects()` itself
throws on duplicate order values. These are mechanical contract/documentation/test-cleanup items,
not a request for content work.

The complete e2e result is split by browser because the configured nested web-server teardown timed
out when run through the package script. Against a separately started built server, Chromium passed
214/214. WebKit passed 209/214; the three spatial/Home failures passed in isolated reruns, while
the unchanged WebKit skip-link focus test and unchanged spatial camera-focus test reproduced. All
work/navigation assertions passed in both browsers. These two existing frozen-surface failures are
reported, but are not attributable to this slice.

No frozen blob moved: all 30 files compare byte-for-byte with `243db393`. `main` and
`feature/spatial-portfolio-v5` were not touched. The V12 bundle was preserved. The return file is
left on disk as required; no commit or push was attempted because `.git` is read-only.

CODEX SLICE REVIEW

reviewed SHA: 1bea2aabc406a00eaa8a9ef2a715aaf5c30d2fdb (HEAD; implementation parent 78bf83057bbdddda11da783f4e77dcabb7362c17)
branch: feature/project-architecture-v13
tree state: modified `.ai/orchestrator/AUTONOMOUS_PIPELINE.log` and `.ai/orchestrator/state.json` from the active pipeline; untracked preserved `docs/review/v12-codex-gate/codex-gate-checkpoint.bundle`; this return file is newly untracked; no application or frozen-surface edits

VERDICT: ACCEPT WITH CHANGES

Validation reproduced: `pnpm.cmd typecheck` passed; `pnpm.cmd lint` passed; Prettier passed on all 21 existing changed files (repository-wide `prettier --check .` still reports 113 pre-existing files); `pnpm.cmd test` passed 23 files / 520 tests; `pnpm.cmd build` generated 15/15 routes; `git diff --check` passed; focused order suite passed 14/14; all 30 frozen fingerprints passed; protected refs and frozen-base ancestry passed; Chromium e2e passed 214/214; WebKit e2e passed 209/214 with the isolated results described below.
Wider e2e result: full configured suite is 428 tests across Chromium and WebKit. Chromium: 214/214 passed. WebKit: 209/214 passed; Home field-notes, SYSTEMS surface, and rail failures passed in isolation; WebKit skip-link focus and spatial camera-focus failures reproduced in isolation. Neither reproduced failure is in changed code or asserts old navigation. All `work.spec.ts` navigation tests passed in both browsers.
Q1 eligibility rule: Correct and explicitly approved by D-027. `depth === "full" || depth === "short"` is the existing case-study/layer boundary; avoiding a new `publicationRole` field is correct. Software Factory being preview and outside the sequence is an accepted content consequence, not a navigation defect.
Q2 ordering contract completeness: Correct for the approved contract. Uniqueness is required across published projects only; contiguity was not required and should not be invented. `sortByOrder` has one key and published ties are rejected before sorting, so no undocumented tie-breaker remains. Draft order collisions are intentionally outside the publication/navigation contract.
Q3 gate placement: Correct for every published ordered consumer. `getPublishedProjects()` runs the per-project gates, then `checkUniqueOrder`, then `sortByOrder`; the work index, homepage, sitemap, static params, spatial loader, and derived neighbours all flow through it. `getAllProjects()` sorts drafts only for in-memory lookup and is not an editorial published collection.
Q4 nextSlug removal complete: Complete in schema, production entries, shared fixture, route behavior, and navigation component. The content-entry guard catches current production and shared fixture entries, and the schema-strip behavior is pinned. Not complete repository-wide: `tests/tools/project-inventory.mjs:78` still emits `nextSlug`, the generated v13 inventory still records the old values, and current inventory/architecture documents still describe the field as present or removal as proposed. Historical decision/progress/task records may retain the old field when clearly describing prior state.
Q5 ProjectNeighbours correctness/a11y: The labelled `nav`, semantic links, open boundaries, and null component result are correct; a list is not required for two directional links. The empty span is a non-exposed layout spacer, not an accessibility defect. Minor cleanup remains: the route always leaves an empty `mt-16` wrapper when both neighbours are absent, so literal page-level “nothing at all” would require making that wrapper conditional.
Q6 test budgets and the rejected optimisation: Legitimate. Focused timings measured roughly 1.1–1.3 seconds for individual publication-gate calls, with the full mutual-consistency test taking 6.72 seconds; 30 seconds leaves ample headroom without relaxing assertions. The rejected `cache()` optimization should remain rejected under D-027’s measured result. The 15-route production build passed in 41 seconds, so the current build-time cost is acceptable for this repository size.
Q7 frozen-boundary contact: No contact moved a frozen blob and no depth, layer, or loader value consumed by `SpatialProjectScene`/`SelectedSystems` changed. Removing the previously schema-retained unknown field cannot alter those rendered outputs. All 30 frozen fingerprints match `243db393`; the two reproduced WebKit failures are pre-existing unchanged frozen shell/spatial behavior, not slice output movement.
Q8 missed owner requirements: D-021/D-027 requirements are met in code: global order, published uniqueness, no tier-first neighbour sort, rename, complete authored navigation removal from content, derived previous/next, case-study-only participation, open boundaries, no new role field, no strict evidence/test parity, and Professional Systems preview preservation. Missed synchronization is the live inventory tool plus current architecture/inventory documentation. A direct integration test for duplicate-order failure through `getPublishedProjects()` is also missing.
Defects found: (1) stale live `nextSlug` projection in `tests/tools/project-inventory.mjs` and stale current documentation/artifact state; (2) `docs/PROJECT_ARCHITECTURE.md` still says implementation has not started, shows `(tier, order)` and `NextProject`, and says previous navigation required separate approval; (3) no integration assertion that the loader wiring rejects duplicate published orders; (4) minor empty route wrapper for no-neighbour preview pages; (5) two unrelated reproducible WebKit baseline failures: `tests/e2e/shell.spec.ts:35` and `tests/e2e/spatial.spec.ts:265`.
May architecture acceptance criteria be FROZEN: NO
If NO, exactly what must change first: Remove `nextSlug` from the active inventory extractor and reconcile or explicitly label its generated snapshot; update current architecture/inventory docs and the stale component-tree/route references to the implemented D-027 contract; add a fixture-backed test through `getPublishedProjects()` proving duplicate published orders fail; optionally make the page spacing wrapper conditional. Then rerun the full browser suite and re-review the two unrelated WebKit failures before freezing.
Next owner: OPUS
