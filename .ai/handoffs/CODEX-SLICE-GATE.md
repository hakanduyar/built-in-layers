MODEL: gpt-5.6-luna
REASONING EFFORT: xhigh
RUNNER: Codex CLI (fresh process)

# INDEPENDENT REVIEW — SLICE 0 + SLICE 1 IMPLEMENTATION

You previously reviewed the project-architecture proposal and returned **ACCEPT WITH CHANGES**
(`.ai/handoffs/CODEX-ARCH-RETURN.md`). The owner then answered every open policy question, and the
slices you recommended have now been implemented. This review decides whether the architecture
acceptance criteria may be frozen.

## 0. Candidate

| | |
|---|---|
| Repository | `C:\GitHub\portfolio` |
| Branch | `feature/project-architecture-v13` |
| Candidate | `78bf83057bbdddda11da783f4e77dcabb7362c17` — verify with `git rev-parse HEAD` |
| Previously reviewed | `499e7d8` (the proposal) |
| Frozen base | `243db393` — the V12 desktop freeze |
| Expected tree | clean, except untracked `docs/review/v12-codex-gate/codex-gate-checkpoint.bundle` and `.ai/orchestrator/` if not yet committed |

`git diff 499e7d8 78bf8305` is the whole of what you are reviewing.

## 1. Owner decisions — authoritative, do not reopen

Recorded in `docs/DECISIONS.md` D-027 and D-021, and `docs/CONTENT_GAPS.md`:

- Global `order` is authoritative; order is SF 0, Kıvılcım 1, JointLedger 2, DropSpot 3,
  Professional Systems 4. No tier-first sorting. `order` must be unique.
- `sortByTierThenOrder` renamed because its name misdescribed its body.
- `nextSlug` removed entirely; forward navigation derived.
- **Previous navigation is APPROVED** (it was deferred in your last review; the owner has since
  approved it). Both directions derive from the same ordered collection. No authored
  `previousSlug`/`nextSlug`.
- Prominence roles approved (flagship / core / preview) but "prominence determines editorial
  priority, NOT permission to invent more content. Evidence availability always overrides desired
  depth."
- **Strict evidence parity REJECTED** — evidence fitness instead. **Strict per-project test parity
  REJECTED** — shared framework tests plus risk/behaviour-based project tests.
- Professional Systems keeps its publication-safe preview role.

## 2. What changed

- `lib/content/work.ts` — `sortByOrder`; `isCaseStudyDestination`; `getCaseStudyNeighbours`;
  `checkUniqueOrder` wired into `getPublishedProjects`
- `lib/content/validate.ts` — `checkUniqueOrder`
- `lib/content/schemas.ts` — `nextSlug` removed
- `components/project/ProjectNeighbours.tsx` — replaces `NextProject.tsx` (deleted)
- `app/work/[slug]/page.tsx` — derived neighbours, both directions
- 3 × `index.mdx` + 1 fixture — `nextSlug` removed
- `tests/unit/project-order.test.ts` — new; plus updates to 4 unit suites and `tests/e2e/work.spec.ts`
- `docs/DECISIONS.md` (D-027), `docs/CONTENT_MODEL.md`, `docs/CONTENT_GAPS.md`

## 3. Verify independently — do not trust these numbers

Claimed: typecheck clean, lint clean, prettier clean on changed files, **520/520** unit (up from
506), build **15/15**, `work.spec.ts` **46/46** Chromium, all **30** frozen blobs unchanged.

Re-run them. Also run the wider e2e suite, which this pass did not: only `work.spec.ts` was run, so
`home.spec.ts`, `smoke.spec.ts`, `a11y.spec.ts`, `seo.spec.ts` and the spatial specs are **unverified
against this change**. If any of them assert the old navigation, that is a real miss.

## 4. The questions

1. **Is the eligibility rule right?** `isCaseStudyDestination` is `depth === "full" || "short"`.
   Consequence: Software Factory — the flagship, order 0 — is `preview`, so it is NOT in the
   navigation sequence and its page has no onward link. Kıvılcım is therefore the first
   destination. Is deriving eligibility from `depth` correct, or does the owner's "unless it
   actually has a case-study destination" mean something else? Was avoiding a new
   `publicationRole` field the right call, or is depth now overloaded?
2. **Is the ordering contract complete?** Uniqueness is enforced for published projects only.
   Should drafts be included? Is `order` required to be contiguous, or only unique? Does anything
   still depend on an undocumented tie-breaker?
3. **Is `checkUniqueOrder` correctly placed?** It runs inside `getPublishedProjects`, after the
   per-project gates. Does that make it reachable from every path that orders projects?
4. **Did the `nextSlug` removal actually complete?** Schema, three entries, fixture, route,
   component, tests, docs. Zod strips unknown keys rather than rejecting them, so a stale field
   would parse silently — is the repository-level guard test sufficient defence?
5. **Is `ProjectNeighbours` accessible and correct?** It renders a `nav` with an accessible name,
   an empty `<span/>` spacer at the first entry, and nothing at all when both neighbours are
   absent. Is the spacer a hack? Should the nav be a list?
6. **Were the raised test budgets legitimate?** Two tests were given 30s timeouts because each
   `getCaseStudyNeighbours` call re-runs the publication gates, measured at ~1.2s. An attempted
   `cache()` optimisation was measured (1210/1162/1162ms — no memoisation outside a request scope)
   and removed rather than shipped. Was removing it right, or should the gates be made cheaper?
   Is ~1.2s per call acceptable at build time now that the route resolves neighbours per page?
7. **Any frozen-boundary contact?** `SpatialProjectScene.tsx:115` reads `project.depth` and
   `SelectedSystems.tsx` reads loader data. Nothing changed either file, and no depth value
   changed — confirm no rendered output moved.
8. **Anything the owner's decisions require that was missed?**

## 5. Authority

You MAY: inspect, run every check, and write your return. You MAY NOT: merge to `main`, force
push, rewrite history, touch `feature/spatial-portfolio-v5`, modify anything fingerprinted in
`docs/FROZEN_BOUNDARY.md` §1, delete the V12 bundle, invent project facts, or start content work.

Fix trivially-wrong things you find only if the fix is mechanical and you say so; otherwise report.

Note: `.git` is read-only in your sandbox, so commit/push will fail. Expected — leave your return
on disk and say so.

## 6. Required output

Create `.ai/handoffs/CODEX-SLICE-RETURN.md` ending with:

```
CODEX SLICE REVIEW

reviewed SHA:
branch:
tree state:

VERDICT: ACCEPT / ACCEPT WITH CHANGES / REJECT

Validation reproduced:      (what you ran, what you got)
Wider e2e result:
Q1 eligibility rule:
Q2 ordering contract completeness:
Q3 gate placement:
Q4 nextSlug removal complete:
Q5 ProjectNeighbours correctness/a11y:
Q6 test budgets and the rejected optimisation:
Q7 frozen-boundary contact:
Q8 missed owner requirements:
Defects found:
May architecture acceptance criteria be FROZEN: YES / NO
If NO, exactly what must change first:
Next owner: OPUS / FABLE / OWNER
```
