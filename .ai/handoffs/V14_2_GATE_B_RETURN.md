# V14.2 Gate B — SYSTEMS → UNDERNEATH, the landing, and back to the surface

**From:** Fable 5.1 (visual gate, scoped) · **Date:** 2026-09-07 · **Branch:**
`feature/owner-visual-acceptance-v14` · **Base:** `8c6045c` (V14.1 Fable checkpoint `f4bdab3` +
the Opus QA record) · **Checkpoint:** the commit carrying this file; `.ai/STATE.md` records the
SHA once pushed.

Owner acceptance is **PENDING**. Not a freeze, not an acceptance, not a merge. `main` = `16d3ec0`.

## 1. Scope, and only that

The owner's three findings: the black `SceneBreak` reads as a glitch rather than the world opening
(worse in reverse), UNDERNEATH arrives as a sparse heading rather than as the consequence of the
revealed system, and "Back on the surface" is too weak to read as a state change. Desired:
SYSTEMS → the world changes state → the surface opens → the structure is exposed → UNDERNEATH is
the consequence → the return to the surface is clear. Not touched: project transitions and
evidence, the route elsewhere, the lower page's sections, the final CTA, scroll tuning, mobile.

## 2. What changed (D-048, `docs/DESIGN_SYSTEM.md` §40)

- **The cover is the underside of the surface** (`components/spatial/SceneBreak.tsx`,
  `lib/spatial/surfaceCover.ts`, new). On desktop the frame is covered — on the same protected
  timing, with the same opacity contract and the same guaranteed dwell — by an opaque plane in the
  ground's own material: the page's paper under the 2.5% ink the opened surface already shows
  beneath the seam. It carries the section the reveal drew, at rest: the three strata with their
  names at the reveal's step, the SYSTEM line at the height UNDERNEATH's own SYSTEM stratum
  arrives, and the descent from the surface line to SYSTEM at the x where UNDERNEATH's depth rail
  arrives (fitted through the boot-published world fit; measured at 1440 and 1920). It arrives by
  opacity — a plane of the ground's tone has no edge worth drawing — while the world's own seam
  finishes rising past the frame. The section travels with the landing's decompression as the cover
  lets go (13 world-vw); the labels lead out within the first quarter of the reveal; SURFACE and
  FLOW stay with the field. Reverse is the same event backwards, by construction.
- **Mobile keeps the V4 rails** below `lg`, byte for byte in behaviour; the cover is `hidden
  lg:block`.
- **Back on the surface is a plane** (`SurfaceReturn` in `SpatialExperience.tsx`;
  `SpatialCamera.tsx`): the rule is the SURFACE stratum, labelled once inside the band; from the
  rule down the page's opaque paper runs to the frame's foot and on into the lower page; and the
  plane rises 24vh into the frame over the window its opacity already resolved in (one
  compositor-only `y` on the existing wrapper, **desktop only**), so the terminus map climbs out from
  behind it.
- **Not changed, deliberately:** the reorient and approach compositions (UNDERNEATH now stands at
  the foot of the exposed section and Built in Layers reads as the definition of the strata just
  descended through — judged on `after/motion/1440--reorient--to--approach.png` and left), the
  strata, the recess tone, `SystemsWord.tsx`, `lib/spatial/sceneRoute.ts` (its `breakBandOffset` /
  `breakWipeOffset` now drive the mobile rails only).

## 3. Files

Product: `components/spatial/SceneBreak.tsx`, `components/spatial/SpatialExperience.tsx`,
`components/spatial/SpatialCamera.tsx` (two additions: `surfaceReturnRise` and its `y`, gated
`isDesktop`), `lib/spatial/surfaceCover.ts` (new).
Tests: `tests/unit/surface-cover.test.ts` (new); `tests/e2e/spatial.spec.ts` — the two rail
contracts restated for the cover without loss of intent (fully opaque at the cut and spanning the
frame, on the same derived sweep and settle poll; the world's own ground, not a wipe — mid-arrival
by opacity alone at 40% of the closing, no transform, no clip-path, background equal to the frame's
paper, three strata and one descent, rails hidden on desktop); reduced motion in `spatial.spec.ts`
and `spatial-v5.spec.ts` asserts `[data-surface-cover]` absent as well as `[data-break-rail]`.
Tools: `tests/tools/progress-stills.mjs` (new, `docs/REVIEW_POLICY.md`).
Docs: `DECISIONS.md` D-048, `DESIGN_SYSTEM.md` §40, `FROZEN_BOUNDARY.md` §6.2, `REVIEW_POLICY.md`,
`.ai/{STATE,ACTIVE_TASK,HANDOFF}.md`, this file, `docs/review/v14.2-gate-b/README.md`.

## 4. Protected behaviour — verified on the checkpoint build

- `git diff --name-only 8c6045c HEAD -- lib/spatial/{cameraFilter,sceneRoute,scenes,worldFit,
  planeChoreography,projectGround,editorialDrift}.ts components/spatial/SystemsWord.tsx app/` →
  **empty**. Every break timing constant, the guarded playback and the governor are untouched.
- **First paint:** `FIRST PAINT == SETTLED` at 1440×900 and 1920×1080, cold.
- **Discrete scroll** (diffed field by field against
  `docs/review/v14.1-engineering/discrete-scroll/discrete-1440x900.json`): `routeStart` 61,
  `routeEnd` 4561, `routeSpan` 4500, `leadCapPx` 540 identical; every isolated impulse identical
  (120px, delivered 1.000, coast 0); sustained-12 inside the cap as before; `docMax` 7806 as at the
  V14.1 checkpoint (the composition, not the scroll).
- **Scroll contract** (1536×864): geometry identical (61 / 4381 / 7593); routeAggressive 525 px/s,
  coast 502px inside the 540px cap; **reverse one notch, 0 wrong-way px**.
- **Frame time** (1440×900): route 16.7 / 17.0 / 16.8 ms a frame (forward, second forward,
  reverse); the cut region (`PROBE_SPAN=0.62,0.80`) 17.2 / 17.4 / 17.2 ms — the cover is an opacity
  on one plane and costs nothing measurable.
- **Mobile** (`mobile-route-probe.mjs` at the recorded step, diffed against the engineering
  record): identical after the rise was gated to desktop — the first run had shown the DOM-rect ink
  measure move on three frames because the (opacity-0) junction block sat 24vh lower; the
  pixel-row measure had not moved, and the stills are identical. Gated, nothing differs.
- **Runtime:** content routes noise 0, hydration 0 on all 11 routes, overflow 0 of 99, CLS max
  0.0418 on `/` (good) — unchanged from the Opus record.
- **Focused Chromium** (`spatial`, `spatial-v5`, `a11y`, `smoke`, `motion`): 99/99.
- typecheck 0 · lint 0 · format 0 · unit: `surface-cover` 5/5 and `spatial-route` 39/39 · build ✓.

The full acceptance matrix was not run, per the brief.

## 5. Owner review

`docs/review/v14.2-gate-b/README.md` — before / iterations / after; forward and reverse at
1440×900, the 1920×1080 smoke, full-size frames through the cover, the landing and the return.

## 6. Remaining, for the owner

- Whether the dwell — ~0.25s of the section standing still on the recess before UNDERNEATH
  appears — is quiet enough or too quiet. It is the guaranteed cover window the scroll system
  protects; its content can change, its length cannot without touching scroll.
- Built in Layers was left as it was, by scope; if it still reads as anticlimactic after the
  section now precedes it, that is a Gate C question.
- The three owner-pending mobile deltas (`OPUS-V14-QA-RETURN.md` §6.1) remain pending.

NEXT: owner review, or V14.2 Gate C. Not continued automatically. Not merged.
