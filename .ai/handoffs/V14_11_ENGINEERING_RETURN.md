# V14.11 engineering gate — navigator correctness, route/native handoff, Kıvılcım registration

**Orchestrated by:** Claude Opus 5 (orchestrator only; no product code written by the orchestrator) ·
**Implemented by:** Codex CLI 0.153.4, `codex exec --cd C:\GitHub\portfolio --approve-for-me` ·
**Date:** 2026-09-13 · **Branch:** `feature/owner-visual-acceptance-v14` · **Base:** `1ec2726`
(application baseline `60a6708`) · **Checkpoint:** `e37e77b`, pushed, `local == origin`.

Owner acceptance is **PENDING**. Not a freeze, not an acceptance, not a merge. `main` = `16d3ec0`.

## 1. How the delegation ran

Codex was given the three objectives, the preserve list, the validation list and an explicit
prohibition on committing, on touching `.ai/**`, and on the known untracked capture script. It
measured, changed code, wrote `docs/review/v14.11-engineering/REPORT.md` with before/after numbers —
and then **exhausted its usage limit before running the validation suite**. The orchestrator ran the
full validation, fixed one leftover type annotation in `tests/e2e/navigation.spec.ts` (Codex had
improved `settle()` to also wait for the camera transform to stop and left one sentinel typed
`number` instead of `string`), verified the result visually, and recorded the checkpoint. One writer
throughout.

## 2. Result against the three objectives

- **Navigator correctness.** The active station for a scene is now selected from the camera's own
  filtered progress — published read-only by the new `lib/spatial/routePresentation.ts`, which does
  not change the motion value — using the same ACQUIRED range the acquisition frame already applies,
  and holding the last subject between acquisitions. Lower-world stations still use document
  position. Measured at 1440×900: Kıvılcım is first named at **927ms with its evidence inside the
  viewport** (left 979.97), where before it was named at **205ms with the evidence 2319px outside**.
  At 1920×1080, 930ms. `lib/spatial/routeNavigation.ts` remains the single canonical list, and
  navigation still only scrolls the document.
- **Black legibility, and the cue.** The navigator's marks composite against the material beneath
  them, so the instrument reads through the interlocking black — including the half-interlocked
  frame — with `SceneBreak` and the break's timing untouched and no panel or background added. On a
  settled black frame at progress 0.72 the navigator crop carries 274 pixels above mean channel 150;
  the old treatment carried 0. Cue cancellation is latched into the observable snapshot, so returning
  to the top cannot restart it, and a disabled PREVIOUS no longer animates (`animationName: none`).
- **Route/native handoff.** A finite 0.75-viewport band below `pinnedEnd` mixes native displacement
  with the existing governed intent in both directions, the native share rising continuously; beyond
  the band the browser owns the event. Downward steps now ramp
  `20, 48, 48, 56, 48, 48, 53, 70, 108, 207, 341, 400 …` where they previously jumped `64 → 452`.
  Upward now ramps instead of braking a full viewport early.
- **Kıvılcım registration.** A desktop-only measurement of the union of the composition wrapper and
  every evidence source supplies the frame's horizontal overhang. Frame-minus-evidence right edge:

  | | before | after |
  |---|---:|---:|
  | Kıvılcım 1440×900 | −58.86 px (inside the diagram) | **+12.72 px** |
  | Kıvılcım 1920×1080 | −64.75 px | **+14.00 px** |
  | Software Factory / DropSpot | +12.7 / +14.0 | unchanged |
  | JointLedger | +290 / +319 (its text occupies that field) | unchanged |

  Every evidence right edge is identical to baseline.

## 3. Files

Product: `components/spatial/{RouteNavigator,SpatialCamera,SystemPOV}.tsx`,
`lib/spatial/routeNavigation.ts`, new `lib/spatial/{routePresentation,routeBoundary}.ts`,
`styles/globals.css`.
Tests: `tests/unit/route-navigation.test.ts` (camera-presentation contracts), new
`tests/unit/route-boundary.test.ts`, `tests/e2e/navigation.spec.ts`.
Tools: new `tests/tools/{v14-11-engineering-probe,v14-11-ink-probe}.mjs`.
Docs: `docs/FROZEN_BOUNDARY.md` §5 ledger row (written by Codex),
`docs/review/v14.11-engineering/` (report + metrics, 165 KB), `DECISIONS.md` D-057, this file.

## 4. Protected behaviour — verified by the orchestrator on the checkpoint build

- `git diff --name-only 60a6708 -- lib/spatial/{sceneRoute,scenes,cameraFilter,wheelMotion,worldFit,
  editorialDrift}.ts components/spatial/{SceneBreak,SystemsWord,WorldGrammar,LowerRoute,SystemNode}.tsx
  components/sections components/layout app data` → **empty**. SYSTEMS, the interlocking black
  transition and its constants, the V14.8 composition, the lower world and mobile are untouched.
- **Route geometry unchanged:** the pin is 4560.5 at 1440×900 and 5460.5 at 1920×1080; `routeStart`
  60.5, `routeSpan` 4500 / 5400, lead caps 540 / 648.
- **Lower world still native:** aggressive peak 7273 px/s with **0px coast** — native order, not a
  return to the pre-V14.10 ceiling of 1543 px/s.
- **Mobile:** the route probe at the recorded 2vh step against the V14.10 record shows **zero**
  layout differences; ten readings move, all pixel-sampling means.
- **Visually verified by the orchestrator:** the navigator legible in paper across the full black and
  the half-interlocked frame; Kıvılcım's brackets outside its diagram with the readout naming the
  scene actually in frame.
- typecheck 0 · lint 0 · format 0 · unit **593/593** · build ✓ · focused Chromium (`navigation`,
  `spatial`, `spatial-v5`, `motion`, `home`, `smoke`, `a11y`) **128 passed, 2 skipped** — the two
  skipped are the V6.6 seam tests skipped since V14.5.

The full acceptance matrix and WebKit were not run, per the brief.

## 5. Remaining, for the owner

- **The motion gate is still owed.** Explicitly out of scope here: the audit measured the composition
  still travelling ~2068 screen px/s for ~251ms after document scrolling stops. The navigator now
  reports acquisition honestly, which makes that lag easier to perceive rather than less.
- Codex's own scroll-contract run recorded the route's aggressive peak at 431 px/s against 520 px/s
  before. No route constant changed and the protected files are byte-identical, so this reads as
  run-to-run variance on a loaded machine rather than a retune — but it is a number that moved and
  the owner should know it moved.
- The known untracked `tests/tools/v14-10-review-capture.mjs` was left untouched and is still
  untracked.

NEXT: owner review. No motion gate started. No final QA. No merge.
