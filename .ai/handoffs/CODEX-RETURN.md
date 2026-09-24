# CODEX RETURN — DESKTOP FREEZE GATE

## Outcome

- Starting HEAD: `fd8228a8ea75fea820294e1916f3ea1f863a413c`
- Final local HEAD: `fd8228a8ea75fea820294e1916f3ea1f863a413c` (unchanged because `.git` is
  read-only in this execution sandbox)
- Final origin HEAD: `fd8228a8ea75fea820294e1916f3ea1f863a413c` (push authentication unavailable)
- Prepared implementation commit: `42798f13dc9fcc9b0402ece5efa1b470244bef24`
- Branch: `feature/spatial-portfolio-v5`
- Verdict: **NOT READY — experience passes; required commit/push is blocked**

The prepared implementation commit is a direct child of the starting HEAD and contains the complete
validated implementation, gate specification, acceptance record, tests/probes, and tracked review
evidence. The documentation checkpoint containing this return file is identified in the final gate
response and recovery bundle.

## Root causes discovered

- Grounds were authored as fixed project-specific masses rather than derived from live evidence
  geometry, so lead/alignment/trail behavior could not be reasoned about as one system.
- Software Factory's short-height evidence plate had fallen below its existing viewport-scale
  contract; the first gate pass exposed 626.6 px against the unchanged greater-than-648 px assertion.
- Selected Systems repeated gallery-like project summaries instead of adding a distinct systems-level
  reading of the work.
- Several capture probes queried the spatial world before the hydrated sticky camera existed, and the
  WebKit reload determinism test had the same post-reload hydration race.
- Repeated spatial scene keys emitted a React console warning during runtime review.

## Systemic corrections

- Added live evidence-union measurement with `ResizeObserver` and one shared ground registration
  policy. Mobile keeps one explicit shared fallback geometry.
- Restored Software Factory to a 67% short-height plate and recovered vertical margin so its full
  caption stays present while the unchanged scale assertion passes.
- Rebuilt Selected Systems as a five-row Surface / Flow / System topology with provenance and
  verification, fed only by real loader data.
- Hardened all relevant probes and the reload test to wait for the hydrated sticky camera before
  measuring; no product threshold or assertion was weakened.
- Added stable scene keys and focused unit/E2E contracts for the ground and systems topology.

## Abstractions replaced

- Replaced per-project fixed ground geometry with `lib/spatial/projectGround.ts`, which owns
  `PROJECT_GROUND_POLICY`, live visual bounds, lead/trail registration, and fallback geometry.
- Replaced the repeated Selected Systems gallery treatment with a compact operational topology rather
  than introducing another project-card abstraction.

## Art direction deliberately preserved

- Preserved the owner-defined order: Software Factory → Kıvılcım → JointLedger → DropSpot → SYSTEMS.
- Preserved Kıvılcım's foreground identity, JointLedger's first-class evidence, DropSpot's full native
  imagery, the diagonal-to-vertical route physics, the SYSTEMS black cut, and the established lower
  route/CTA language.
- Avoided a new visual direction; changes correct geometry, hierarchy, evidence fit, and information
  structure within the existing world.

## Measured results

- Focus isolation: zero neighboring painted intersection at all five destinations across 1366×768,
  1440×900, 1536×864, 1920×1080, and 2560×1440.
- Minimum project focus gap: 669 px; minimum DropSpot-to-SYSTEMS gap: 111 px.
- Ground lead / align / trail at 1536×864: Software Factory 69.7 / 0 / 103.8 px; Kıvılcım
  54.9 / 0 / 95.5 px; JointLedger 53.7 / 0 / 95.8 px; DropSpot 53.7 / 0 / 95.9 px.
- Scroll maximum: configured `ROUTE_MAX_RATE = 0.105` route progress/s; measured route 525 px/s and
  lower 528 px/s under aggressive input.
- Target lead: configured `INTENT_LEAD_VH = 0.6`; measured coast 502 px / 0.58 vh / 900 ms.
- Reverse: one notch, 109 ms, zero wrong-way pixels. Diagonal and vertical regimes use the same
  governor.
- Sharpness: moving samples cover 5.42–11.03 px per 34 ms; rest scale is 1.0000 and moving scale is
  0.9992–0.9993 from rotated-matrix precision. No filters or blur motion crutch are present.
- Lower route: no dead run below route end; natural content fill mean 0.172.

## Visual artifacts

- Review root: `docs/review/v12-codex-gate/`
- Final responsive captures: `responsive/` (75 images across five required viewports)
- Project and SYSTEMS phases: `project-phases/` (23 images)
- Zoom review: `zoom/` (45 images at 80%, 67%, and 50%; 100% is the 1920 responsive set)
- Reduced motion: `reduced-motion/`
- Moving/stationary sharpness: `sharpness/`
- Motion review: `recording-review/` (36 extracted frames) and `recordings-manifest.json`
- Raw six `.webm` recordings remain local and gitignored by repository policy.

## Validation

- PASS — `pnpm typecheck`
- PASS — `pnpm lint`
- PASS — scoped Prettier for all gate-owned implementation/test/document files
- PASS — 22 unit files / 506 tests
- PASS — production build / 15 static pages
- PASS — Chromium relevant suite 96/96 after the final product fix; the unchanged Software Factory
  scale assertion also passes in isolation.
- PASS — relevant WebKit: 92/96 parallel, with all four software-rendered arrival cases passing in
  serial classification; the reload hydration race passes in both WebKit and Chromium after its wait
  was corrected.
- PASS — console/runtime, reduced motion, overflow, responsive smoke, motion recordings, and in-app
  browser review.
- Baseline exception — repository-wide `pnpm format:check` still reports 131 unrelated pre-existing
  files; every gate-owned file passes.

## Checkpoint blocker and recovery

Normal `git add` fails with `Unable to create .git/index.lock: Permission denied`. A safe alternate
index/object store produced commit `42798f13dc9fcc9b0402ece5efa1b470244bef24` directly on the starting
HEAD. Fast-forward push then failed because the configured HTTPS credential cannot be accessed in the
sandbox; GitHub CLI reports its saved token invalid, token environment variables are absent, and SSH
reports `Permission denied (publickey)`.

No force push, reset, rebase, merge, owner-work discard, or `main` mutation occurred. A verified
incremental bundle is left with the review artifacts so an authenticated owner can publish the exact
prepared checkpoint without reconstructing the work.

## Unresolved pure design questions

None. The independent adversarial pass found no remaining visual concern that warrants Fable.

## Recommended next owner

**OPUS** only to attach and fast-forward-push the prepared checkpoint, then **FREEZE**.
