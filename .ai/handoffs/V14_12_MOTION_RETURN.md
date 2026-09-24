# V14.12 motion / readability gate — the camera tracks the reader

**Orchestrated by:** Claude Opus 5 (orchestrator only; no product code written by the orchestrator) ·
**Implemented by:** Codex CLI 0.153.4, `codex exec --cd C:\GitHub\portfolio --approve-for-me` ·
**Date:** 2026-09-13 · **Branch:** `feature/owner-visual-acceptance-v14` · **Base:** `0d350d0`
(application baseline `e37e77b`) · **Checkpoint:** `1944e25`, pushed, `local == origin`.

Owner acceptance is **PENDING**. Not a freeze, not an acceptance, not a merge. `main` = `16d3ec0`.

## 1. How the delegation ran

Codex quota was probed before the brief was issued and was available. Codex measured, implemented,
measured again and wrote `docs/review/v14.12-motion/REPORT.md`, then **exhausted its usage limit
during the final validation sweep**. The orchestrator completed it: lint, Prettier (one whitespace
fix in `SpatialCamera.tsx`), the full unit suite, a rebuild, the focused Chromium run with `a11y`
added, cold first paint at both sizes, and a visual check of the SYSTEMS → black → UNDERNEATH
sequence. One writer throughout. A stray Chromium GPU log (`debug.log`) left by a probe run was
deleted; it was untracked and is not product output.

## 2. Result against the three objectives

- **Camera lag.** Two mechanisms were separated by measurement: the filter's own settling, and
  `glideStep`, which capped VISUAL progress a second time after the document's wheel governor had
  already paced the input — the reason a navigation jump left a large visual backlog. Desktop
  presentation no longer applies `glideStep`; the desktop filter branch responds in **12ms falling
  to 8ms per stage** instead of 48ms falling to 22ms, capped at 0.7 frame intervals for high-refresh
  displays. Both fractional stages remain, so the camera is tighter, not absent. Mobile keeps the
  original response and the glide cap.

  Movement continuing after the document stops:

  | 1440×900 | before | after |
  |---|---:|---:|
  | slow forward | 23.18 px / 197.5 ms | **1.66 px / 15.7 ms** |
  | aggressive forward | 71.17 px / 250.5 ms | **1.96 px / 16.9 ms** |
  | aggressive reverse | 77.56 px / 283.3 ms | **0.65 px / 0 ms** |
  | navigation + immediate wheel | 1496.51 px / 997.2 ms | **0.49 px / 0 ms** |

  At 1920×1080 the same cases land at 0.93, 1.63, 0.36 and 0.18 px. The audit's 519px figure was not
  reproduced by explicit input profiles; that magnitude actually lived in the navigation case, which
  is now essentially gone.
- **Motion readability.** The proxy is the P95 distance between on-screen evidence and where the
  route says it should be: **296.13 → 26.02 px** on aggressive forward at 1440 (−91.2%), 125.62 →
  11.34 px at 1920 (−91.0%). The traces did NOT establish composition opacity, `Reveal`,
  `EditorialDrift` or the departure scale as material contributors — acquired evidence is already at
  opacity 1 through the measured intervals — so none of them was changed and `lib/spatial/systemPov.ts`
  is untouched. The accepted V14.7 timing and V14.8 curves therefore need no re-acceptance.
- **Verification.** Both sizes, across slow wheel, aggressive wheel, stopping after fast input,
  forward and reverse, and a navigation jump followed by free scrolling. A latent defect surfaced and
  was fixed on the way: the camera previously reversed 4 (1440) / 3 (1920) presentation frames after
  the document, with 27.95 / 24.50 px of wrong-way travel; it now reverses on the next presentation
  frame with 0 px of wrong-way travel from that frame on.

## 3. Files

Product: `lib/spatial/cameraFilter.ts`, `components/spatial/SpatialCamera.tsx` — that is the whole
product diff, 28 lines.
Tests: `tests/unit/spatial-filter.test.ts` (smoothing, 80ms settling and next-step reversal at
30–144Hz, monotonic cut crossing).
Tools: new `tests/tools/v14-12-{motion-probe,trace-summary,preservation-probe,invariants,mobile-diff}.mjs`.
Docs: `docs/FROZEN_BOUNDARY.md` §5 ledger row (written by Codex),
`docs/review/v14.12-motion/` (report + metrics, 108 KB), `DECISIONS.md` D-058, this file.

## 4. Preserved — verified by the orchestrator on the checkpoint build

- `git diff --name-only e37e77b -- lib/spatial/{sceneRoute,scenes,systemPov,wheelMotion,
  routeNavigation,routePresentation,routeBoundary}.ts components/spatial/{SceneBreak,SystemsWord,
  SystemPOV,RouteNavigator,WorldGrammar,EditorialDrift}.tsx components/ui/motion/Reveal.tsx
  components/sections components/layout app data styles` → **empty**. V14.11's navigator sync, the
  black readability, the cue latch, the handoff blend, Kıvılcım's registration, SYSTEMS, the POI
  grammar and all layout and content are untouched.
- **Navigator still honest, and faster:** first naming in the navigation case moves 837.8 → 259.6 ms
  (1440) and 833.6 → 246.6 ms (1920), and at that moment Kıvılcım's evidence genuinely intersects the
  frame at opacity 1.
- **Lower world still native:** five 200px events deliver exactly 1000px with 0 extra pixels before
  and after; native peaks 3361 / 3842 px/s. The governor's lead is exactly 540 / 648 px, unchanged.
- **First paint:** `FIRST PAINT == SETTLED`, cold, at 1440×900 and 1920×1080.
- **Mobile:** one non-pixel difference of 0.001 in an ink-coverage ratio; everything else is
  pixel-sampling noise. Mobile keeps the original camera response by an explicit desktop branch.
- typecheck 0 · lint 0 · format 0 · unit **595/595** · build ✓ · focused Chromium (`motion`,
  `spatial`, `spatial-v5`, `navigation`, `home`, `smoke`, `a11y`) **128 passed, 2 skipped** — the two
  skipped are the V6.6 seam tests skipped since V14.5.

The full acceptance matrix and WebKit were not run, per the brief.

## 5. Remaining, for the owner

- **This is a real change of feel and it needs your eyes, not just the numbers.** The camera now sits
  almost on the document rather than trailing it. The measurements say tracking improved by ~91%;
  whether the world still reads as cinematic rather than merely fast is a judgement only you can make.
- An abrupt programmatic document jump — a stress control, not a wheel gesture — still produces a
  large movement, now concentrated into ~60 ms instead of ~1442 ms.
- The known untracked `tests/tools/v14-10-review-capture.mjs` was left untouched and is still
  untracked.

NEXT: owner review. No further gate. No final QA. No merge.
