# PROJECT ARCHITECTURE — FROZEN ACCEPTANCE CRITERIA

Frozen 2026-09-03 at `bc2dad371651ef350f65658d6d5df37e623bc372`, after two independent Codex
reviews (`gpt-5.6-luna`/xhigh) and a confirmation pass that answered **YES** to "may acceptance
criteria be frozen".

Authority: owner decision brief 2026-09-02 → **D-027** → `.ai/handoffs/CODEX-ARCH-RETURN.md` →
`.ai/handoffs/CODEX-SLICE-RETURN.md` (including its Confirmation review section).

These criteria bind the project-architecture layer. They do not govern art direction, which is the
Fable gate, or the frozen V12 desktop system, which is `docs/FROZEN_BOUNDARY.md`.

---

## A. Ordering

- [x] **A1** `order` is a single global editorial sequence. No tier-first sorting anywhere.
- [x] **A2** Published order is Software Factory 0, Kıvılcım 1, JointLedger 2, DropSpot 3,
      Professional Systems 4 — matching D-021 and the frozen homepage.
- [x] **A3** `order` is unique across published projects, enforced at the loader
      (`checkUniqueOrder` inside `getPublishedProjects`), not merely by a helper. Duplicates fail
      the build. Uniqueness is required; contiguity is not.
- [x] **A4** No undocumented tie-breaker decides editorial sequence.
- [x] **A5** No abstraction name misdescribes its behaviour — `sortByTierThenOrder` → `sortByOrder`.

## B. Navigation

- [x] **B1** Previous and next derive from one ordered collection and cannot disagree.
- [x] **B2** No authored `nextSlug` / `previousSlug` anywhere: schema, content, fixtures, route,
      component, tests, tooling, or committed evidence.
- [x] **B3** Boundaries are open. First destination has no previous, last has no next, and there is
      no wrap-around.
- [x] **B4** Only case-study destinations participate — `depth` of `full` or `short`, the same test
      `getProjectLayers` uses. A preview index never enters case-study navigation.
- [x] **B5** A project with no neighbours renders no navigation region at all — no empty wrapper.
- [x] **B6** The navigation is a labelled `nav` landmark with real links.

## C. Truthfulness

- [x] **C1** No project fact was invented. Unverified facts live in `docs/CONTENT_GAPS.md`.
- [x] **C2** Evidence **fitness**, not parity — strict screenshot/diagram/timeline/link parity is
      rejected. No fake screenshot or metric is added for symmetry.
- [x] **C3** Repository, live and demo are distinct evidence types and are never relabelled as one
      another.
- [x] **C4** Professional Systems keeps its publication-safe preview role and is not penalised for
      it.
- [x] **C5** Prominence sets editorial priority only. Evidence availability always overrides
      desired depth.

## D. Testing

- [x] **D1** Shared framework contracts plus risk-based project tests. Strict per-project suite
      parity is rejected.
- [x] **D2** Contract behaviour is covered at the level it is wired, not only in isolation — the
      duplicate-order case asserts the **loader** throws.
- [x] **D3** No assertion is weakened to pass. Raised time budgets must cite a measurement.

## E. Regression boundary

- [x] **E1** All 30 blobs fingerprinted in `docs/FROZEN_BOUNDARY.md` §1 unchanged.
- [x] **E2** No rendered output of a frozen scene moved. No project `depth` changed, so
      `SpatialProjectScene.tsx:115` and `SelectedSystems.tsx` render as before.
- [x] **E3** `feature/spatial-portfolio-v5` remains at `243db393`; `main` untouched.

## F. Validation

- [x] **F1** typecheck, lint, and Prettier clean on changed files.
- [x] **F2** Unit suite green — **521/521**, 23 files.
- [x] **F3** Production build green — 15/15 routes.
- [x] **F4** Chromium e2e green — **214/214**.
- [x] **F5** WebKit e2e — **212/214**. Both failures pre-existing and classified:
      `shell.spec.ts:35` is the known skip-link failure; `spatial.spec.ts:265` passes when run
      serially (software-rendering contention on this machine, not a regression).
- [x] **F6** The **full** browser suite is run, not a single spec.

---

## Deliberately open, and why

**Software Factory is not in case-study navigation.** It is the flagship at `order: 0` but is still
`depth: "preview"`, so under B4 it is not a destination and its page has no onward link. This is a
content gap (`docs/CONTENT_GAPS.md` gaps 1–2), not a navigation defect: raising its depth adds it to
the sequence automatically, with no code change. Both independent reviews accepted this framing.

**Gate cost.** Deriving neighbours re-runs the publication gates at ~1.2s per call. A `cache()`
optimisation was measured (1210/1162/1162ms — React `cache` does not memoise outside a request
scope) and removed rather than shipped unproven. If build time becomes a problem, make the gates
cheaper; do not re-add unmeasured memoisation.
