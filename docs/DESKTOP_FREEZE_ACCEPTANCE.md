# DESKTOP FREEZE ACCEPTANCE

Final measured acceptance matrix for the desktop spatial homepage.

- Branch: `feature/spatial-portfolio-v5`
- Starting HEAD: `fd8228a8ea75fea820294e1916f3ea1f863a413c`
- Review date: 2026-09-02
- Verdict: **PASS — desktop freeze-ready**

This decision follows the complete inspect → measure → implement → render → watch → capture →
critique → refute → fix → repeat loop. It is based on final production-browser geometry, direct
screenshots, six motion recordings, moving/stationary sharpness comparisons, reduced-motion
rendering, and the validation record below.

Raw evidence lives in [`docs/review/v12-codex-gate/`](review/v12-codex-gate/).

## Project order

- [x] **PASS — Software Factory** is 01 / 04.
- [x] **PASS — Kıvılcım** is 02 / 04.
- [x] **PASS — JointLedger** is 03 / 04.
- [x] **PASS — DropSpot** is 04 / 04.
- [x] **PASS — SYSTEMS** follows as its own destination.

## Focus isolation

Measured at each destination's real focus coordinate. Every value is the neighboring scene's
painted intersection with the viewport, including its supporting ground.

| viewport | Software Factory | Kıvılcım | JointLedger | DropSpot | SYSTEMS | verdict |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 1366×768 | 0 px² | 0 px² | 0 px² | 0 px² | 0 px² | PASS |
| 1440×900 | 0 px² | 0 px² | 0 px² | 0 px² | 0 px² | PASS |
| 1536×864 | 0 px² | 0 px² | 0 px² | 0 px² | 0 px² | PASS |
| 1920×1080 | 0 px² | 0 px² | 0 px² | 0 px² | 0 px² | PASS |
| 2560×1440 | 0 px² | 0 px² | 0 px² | 0 px² | 0 px² | PASS |

- [x] **PASS — Software Factory** owns its focus.
- [x] **PASS — Kıvılcım** owns its focus.
- [x] **PASS — JointLedger** owns its focus.
- [x] **PASS — DropSpot** owns its focus.
- [x] **PASS — SYSTEMS** owns its focus.

Evidence: `metrics/desktop-gate-final-2.json`. The shortest project-to-project focus gap is 669 px
at 1366; the narrowest DropSpot-to-SYSTEMS gap is 111 px. Software Factory's complete caption is
visible at the mid-height viewports; the reported 7–12 px lower overhang there is its supporting
registration/ground edge, not clipped evidence.

## Viewports

- [x] **PASS — 1366×768:** dense but intentional; all four evidence compositions remain readable.
- [x] **PASS — 1440×900:** evidence is viewport-scale and focus-isolated.
- [x] **PASS — 1536×864:** reference desktop composition is balanced and sharp.
- [x] **PASS — 1920×1080:** negative space expands without shrinking the destination.
- [x] **PASS — 2560×1440:** the world remains connected rather than becoming isolated cards.

Evidence: `responsive/` contains 15 named frames at each viewport.

## Project spacing

- [x] **PASS — project departures clear.** Departure frames reveal travel before the next focus.
- [x] **PASS — actual travel intervals exist.** Five-beat captures show entry and exit geometry.
- [x] **PASS — narrow desktop not compressed.** The 1366 minimum gap is 669 px.
- [x] **PASS — no glued destinations.** Focus intersections remain zero at every viewport.

## Grounds

- [x] **PASS — shared abstraction.** `lib/spatial/projectGround.ts` owns one policy for all four.
- [x] **PASS — Software Factory lead / align / trail.** 69.7 px / 0 px / 103.8 px.
- [x] **PASS — Kıvılcım lead / align / trail.** 54.9 px / 0 px / 95.5 px.
- [x] **PASS — JointLedger lead / align / trail.** 53.7 px / 0 px / 95.8 px.
- [x] **PASS — DropSpot lead / align / trail.** 53.7 px / 0 px / 95.9 px.
- [x] **PASS — Kıvılcım ground appropriately enlarged.** 0.8344 × 0.5720 of the scene measure.
- [x] **PASS — DropSpot uncropped.** Both honest screenshots render at native aspect ratio.
- [x] **PASS — DropSpot ground appropriately wider/larger.** 0.96 × 0.58, the route maximum.

The policy measures each `[data-project-ground-source]` union with `ResizeObserver`, derives geometry
from those live bounds, then applies project registration rather than storing four coordinate sets.
At 1536 the final ground sizes are Software Factory 0.7903×0.5593, Kıvılcım 0.8344×0.5720,
JointLedger 0.78×0.5347, and DropSpot 0.96×0.58.

Evidence: `metrics/plane-phase-1536x864.json` and `project-phases/` (ENTRY, MID-ENTRY, FOCUS,
EARLY EXIT, EXIT for all four projects).

## SYSTEMS

- [x] **PASS — isolated focus.** Neighbor intersection is zero in the complete viewport matrix.
- [x] **PASS — real approach space.** The approach frame carries DropSpot departure and open route.
- [x] **PASS — real departure from DropSpot.** The focus is followed by the deliberate black cut.

Evidence: `project-phases/1536x864--systems--approach.png`, `--focus.png`, and `--departure.png`.

## Scroll

- [x] **PASS — one global model.** The same governor covers the spatial and lower routes.
- [x] **PASS — max velocity enforced.** `ROUTE_MAX_RATE = 0.105` route progress / second.
- [x] **PASS — slow may remain slow.** Gentle input peaks at 493 route / 486 lower px/s.
- [x] **PASS — hard input cannot exceed max.** Measured peaks are 525 route / 528 lower px/s.
- [x] **PASS — target lead bounded.** `INTENT_LEAD_VH = 0.6`; measured coast is 0.58 vh.
- [x] **PASS — debt bounded.** Repeated aggression settles after 502 px / 900 ms.
- [x] **PASS — reverse cancels intent.** First notch, 109 ms, 0 px wrong-way movement.
- [x] **PASS — diagonal/vertical same physics.** Both route regimes use the same governor.
- [x] **PASS — no brute-force multi-destination skipping.** Six reviewed input profiles remain paced.

Evidence: `metrics/scroll-contract-1536x864.json` and `recordings-manifest.json`. Recordings cover slow,
medium, very aggressive, repeated aggressive, reverse, and diagonal-to-vertical input; all six report
zero console errors. Thirty-six extracted review frames are in `recording-review/`.

## Motion sharpness

- [x] **PASS — typography sharp.** Direct moving screenshots remain crisp.
- [x] **PASS — screenshots sharp.** No blur/filter is applied in the ancestor chain.
- [x] **PASS — diagrams sharp.** Same unit-scale chain as text.
- [x] **PASS — SYSTEMS sharp.** The word is never filtered, masked, or scaled by movement.
- [x] **PASS — max-speed movement sharp.** Captures were taken during 5.42–11.03 px / 34 ms motion.
- [x] **PASS — no blur motion crutch.** Filter lists are empty.
- [x] **PASS — no damaging continuous foreground scaling.** Rest is 1.0000; moving is
  0.9992–0.9993 from rotated-matrix precision, visually and numerically unit scale.

Evidence: `metrics/motion-sharpness.json` and `sharpness/` at 1366, 1536, 1920, and 2560.

## Lower route

- [x] **PASS — obsolete dead distance removed.** No natural-scroll dead run occurs below route end.
- [x] **PASS — meaningful content moved upward.** Selected Systems follows the surface handoff.
- [x] **PASS — vertical regime begins earlier.** Handoff, index, and operating model arrive directly.
- [x] **PASS — no narrative vacuum.** Natural-scroll mean content fill is 0.172; sparse runs are only
  short designed beats inside the spatial journey (88 px, 185 px, and 60 px).

Evidence: `metrics/natural-fill-1536x864.json` and `responsive/*--surface-return.png`.

## Lower design

- [x] **PASS — project rectangles not reused generically.** Lower sections use route, register, and map
  grammars rather than project plates.
- [x] **PASS — Selected Systems meaningful.** Five loader-fed systems resolve into Surface / Flow /
  System coverage plus provenance and verification; it is not a second gallery.
- [x] **PASS — How I Build meaningful.** Four operational rules each state a concrete consequence.
- [x] **PASS — Field Notes meaningful.** The compact external-writing state is honest and linked.
- [x] **PASS — About meaningful.** The preview states practice, provenance, phase, and verification.
- [x] **PASS — CTA final-state quality.** The route converges into one high-contrast closing action.
- [x] **PASS — no obvious filler.** Each lower section supplies information absent from the journey.

## Zoom

- [x] **PASS — 100%.** Full-scale focus remains the primary reading mode.
- [x] **PASS — 80%.** More route context appears without local recomposition.
- [x] **PASS — 67%.** Adjacent world structure becomes legible.
- [x] **PASS — 50%.** Multiple connected states share the viewport coherently.
- [x] **PASS — coherent world revealed.** Zoom-out exposes more of one world rather than shrinking an
  independently isolated active card.

Evidence: `zoom/` at CSS viewport equivalents 1920×1080, 2400×1350, 2866×1612, and 3840×2160.

## Reduced motion

- [x] **PASS.** `prefers-reduced-motion: reduce` renders no camera plane, sticky camera, destination
  surface, or break rail; it retains the complete authored static composition, one SYSTEMS surface,
  all content, zero overflow, and zero console errors.

Evidence: `reduced-motion/reduced-motion.json` and the two 1440×900 screenshots.

## Technical validation

- [x] **PASS — typecheck:** `tsc --noEmit`.
- [x] **PASS — lint:** `eslint .`.
- [x] **PASS — Prettier (gate-owned files):** all 19 changed/new source and test files pass.
- [x] **PASS — unit:** 22 files, 506 tests.
- [x] **PASS — build:** Next.js production build, 15 static pages.
- [x] **PASS — Chromium:** 96/96 relevant homepage/motion/spatial tests after the final fix. The initial
  214-test run scheduled the full repository, found one Software Factory width regression, and hit
  the 900 s wrapper limit during teardown; that assertion now passes unchanged.
- [x] **PASS — relevant WebKit:** 92/96 parallel; the four software-rendered arrival cases were rerun
  serially. Three passed unchanged; the reload test passed in WebKit and Chromium after its missing
  post-reload hydration wait was added. No assertion or threshold was weakened.
- [x] **PASS — console/runtime:** five responsive runs, six recordings, reduced motion, and the in-app
  review report zero errors.
- [x] **PASS — reduced motion:** designed static fallback verified in Chromium and WebKit.
- [x] **PASS — overflow:** default and reduced-motion suites pass; desktop geometry passes all five
  required widths.

Repository-wide `pnpm format:check` remains a known pre-existing baseline failure across 131 untouched
files. Reformatting that unrelated surface was deliberately excluded; every file owned by this gate is
formatted and checked.

## Independent critic and refutation

- The critic challenged the 64% Software Factory plate as too small. The existing viewport-scale E2E
  contract refuted it (626.6 px versus required >648 px). Final fix: 67% plate plus 16 px recovered
  vertical margin; the evidence caption remains visible and the unchanged assertion passes.
- The critic challenged grounds as authored beige rectangles. Live evidence-union geometry, four
  distinct final masses, and measured lead/align/trail displacement refute that failure mode.
- The critic challenged Selected Systems as repeated gallery filler. The final layer/record topology
  asks and answers a new operational question without descriptions, stacks, or repeated imagery.
- The critic challenged zoom-out as local scaling. 50% captures reveal adjacent journey and lower
  states in one continuous route.
- The critic challenged WebKit failures as possible product defects. Serial unchanged-threshold reruns
  cleared three arrival cases; the fourth exposed and fixed a real post-reload hydration race in its
  harness.

## Freeze decision

No critical FAIL remains and no unresolved pure art-direction question warrants a Fable handoff.
Recommended next owner: **FREEZE**.
