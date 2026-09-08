# V14.6 — Codex engineering gate 1: motion

**Orchestrated by:** Claude (orchestrator only; no application code written by the orchestrator) ·
**Implemented by:** Codex CLI 0.153.4, `codex exec --cd C:\GitHub\portfolio --approve-for-me` ·
**Date:** 2026-09-08 · **Branch:** `feature/owner-visual-acceptance-v14` · **Base:** `b8ff8b8`
(V14.5 application checkpoint) · **Checkpoint:** `84fb5a9`, pushed, `local == origin`.

Owner acceptance is **PENDING**. Not a freeze, not an acceptance, not a merge. `main` = `16d3ec0`.

## 1. How the delegation ran

- `codex --version` was 0.147.0; its configured model (`gpt-6-astra`) returned "requires a newer
  version of Codex", and `codex doctor` reported 0.153.4 available. The CLI was updated with its own
  `codex update`. Nothing else in the environment was changed.
- `codex exec` was given the three goals, the preserve list, the validation list and an explicit
  prohibition on committing, pushing, branching, merging, touching `.ai/**` or weakening tests.
  `--sandbox` and `--approve-for-me` are mutually exclusive in this CLI; `--approve-for-me` (which
  implies the workspace-write sandbox) was used.
- Codex measured, changed code and produced evidence, then **exhausted its usage limit before
  writing its report**. The orchestrator compiled `docs/review/v14.6-codex-motion/REPORT.md` from
  the metrics Codex left, ran the validation, and recorded this checkpoint. One writer throughout.

## 2. Result against the three goals

- **Scroll blur — no per-frame blur exists; a hydration repaint did.** The numeric probe reports
  acutance retained while moving of 1.0727 before and 1.0702 after: the moving crop measures
  marginally *sharper* than at rest, and a controlled device-pixel phase sweep shows no
  offset-dependent loss. What was found and fixed is that the pre-hydration tree painted the hero at
  `zoom: 1` and a different position, so hydration moved and re-antialiased the text. That is gone
  (see first load). No change was made to chase a number that did not need moving.
- **Wheel motion — eased, with identical reach.** An isolated 120 px notch now steps 2, 4, 6, 7, 8…
  instead of 8, 8, 8… from the first frame, and eases out at the end; travel 120 px,
  `deliveredFraction` 1.000, coast 0, settle 329 → 328 ms. The lower world's aggressive peak is
  1957 → **1657 px/s** (−15%). `routeStart` 61, `routeEnd` 4561, `routeSpan` 4500, `leadCapPx` 540
  and reverse (1 notch, 0 wrong-way px) are unchanged. Mechanism: `lib/spatial/wheelMotion.ts`
  eases inside the governor's existing budget with no stored velocity, and a 0.85 ceiling ratio
  applies only to the lower world.
- **First load — the flash is gone, without hiding anything.** The first painted frame was at
  `zoom: 1`, hero at (149.09, 157.03); hydration then moved the heading 44 px left and 56 px down.
  The boot script now also sets `data-world-preview="desktop"`, and a boot-gated desktop
  no-reduced-motion CSS block lays the same static scenes out in the camera's initial frame with the
  sticky frame's opaque backing. The first painted frame now carries the settled fit and position:
  `compositionMaxDeltaPx` 0, `heroTextMaxDeltaPx` 0, first three frames `changedPixelsOver8: 0`.
  No opacity, visibility, splash or delay was used.

## 3. Files

Product: `components/spatial/SpatialCamera.tsx`, `lib/spatial/worldFit.ts`, `styles/globals.css`,
new `lib/spatial/wheelMotion.ts`.
Tests: new `tests/unit/spatial-wheel-motion.test.ts`, `tests/unit/spatial-world-preview.test.ts`;
`playwright.config.ts` now reads `PORT` from the environment (was hard-coded 3100).
Tools (extended, additive): `tests/tools/{discrete-scroll-probe,foreground-sharpness-probe,
initial-paint-probe}.mjs` — frame traces, glyph boxes and pixel diffs.
Docs: `docs/FROZEN_BOUNDARY.md` §5 ledger row (written by Codex),
`docs/review/v14.6-codex-motion/` (report + metrics), this file.

## 4. Preserved — verified on the checkpoint build

- `git diff --name-only b8ff8b8 -- components/spatial/{SceneBreak,SystemsWord,SystemPOV,
  WorldGrammar}.tsx components/sections components/layout components/ui/motion/Reveal.tsx
  components/spatial/SystemNode.tsx lib/spatial/{sceneRoute,scenes,cameraFilter,systemPov}.ts`
  → **empty**. The V14.5 SYSTEMS experience, the interlocking black transition, the POI language,
  Selected Systems, the reveal and fade timings, the lower-world spacing and ABOUT are untouched.
- No orange: the retired tokens are not reintroduced.
- **Mobile art direction unchanged.** The preview CSS is gated to `min-width: 1024px`,
  `prefers-reduced-motion: no-preference` and an attribute only the boot script sets. At 390×844
  every hero and glyph measurement is identical before and after, cold and warm
  (`metrics/mobile-paint-comparison.json`); the mobile route probe at the recorded 2 vh step matches
  the V14.5 record on document heights, scene positions and every DOM-rect measure, with two
  pixel-row means moved by 0.001–0.002 (sampling).
- typecheck 0 · lint 0 · format 0 · unit **569/569** · build ✓ · focused Chromium
  (`motion`, `spatial`, `spatial-v5`, `smoke`) **83 passed, 2 skipped** — the two skipped are the
  V6.6 seam tests skipped since V14.5. The reduced-motion and no-JS contracts pass, including
  "removes every animated system: no camera, no parallax, no plane".

The full acceptance matrix and WebKit were not run, per the brief.

## 5. Remaining, for the owner

- The blur brief assumed a per-frame sharpness loss; the 1× probe does not find one. If softness is
  still perceived while travelling, the next measurement should be a high-DPI capture at a real
  display scale rather than this probe.
- Codex's own report was never written (usage limit); `REPORT.md` is the orchestrator's compilation
  from Codex's metrics and is labelled as such.
- Raw per-frame arrays (~35 MB) were copied to
  `C:\Users\hakan\portfolio-review\v14.6-codex-motion\` and truncated in the committed JSONs per
  `docs/REVIEW_POLICY.md`; `samplesCount` records the original length. Nothing was deleted.

NEXT: owner review. Gate 2 not started. No final QA. No merge.
