# V14.7 — Codex engineering gate 2: timing and spacing

**Orchestrated by:** Claude (orchestrator only; no application code written by the orchestrator) ·
**Implemented by:** Codex CLI 0.153.4, `codex exec --cd C:\GitHub\portfolio --approve-for-me` ·
**Date:** 2026-09-09 · **Branch:** `feature/owner-visual-acceptance-v14` · **Base:** `84fb5a9`
(V14.6 Codex motion checkpoint) · **Checkpoint:** `2d40c65`, pushed, `local == origin`.

Owner acceptance is **PENDING**. Not a freeze, not an acceptance, not a merge. `main` = `16d3ec0`.

## 1. Result against the three goals

- **UNDERNEATH fade — now the Built in Layers timing.** Cause: composition opacity is driven by
  `sceneApproach()`, whose reach is the shorter of a scene's two adjacent route segments.
  UNDERNEATH's shorter neighbour is 185 px at 1440×900 against Built in Layers' 433 px, so the same
  curve gave it less than half the reading distance. Fixed by deriving the reference scene's reach
  from the existing focus progresses and applying it to UNDERNEATH's **departure only**. Measured at
  1440×900: full hold after focus 37 → 86 px, opacity 1 → floor 75 → **174 px**, against Built in
  Layers' unchanged 87 / 174. At 1920×1080: 44 → 103 px and 90 → **209 px**, against 104 / 209. The
  entrance is unchanged and the release still completes while the text is on screen.
- **Four-stops reveal — early in its visible passage.** Same mechanism on the acquisition side: the
  handoff sentence arrives over a 433 px leg but its window was derived from its 183 px exit leg, so
  it resolved near focus. It now reads the incoming leg. Entry to full readability 241 → **95 px**
  at 1440×900 (about 215 px before focus) and 329 → **153 px** at 1920×1080. Opacity at first
  visible text is 0.57 and 0.45 respectively, rising to exactly 1 — measured, not eyeballed.
- **ABOUT spacing — centred in its stage.** Cause: the register and content were top-aligned inside
  a minimum-height stage, so the spare height pooled below them. `SystemNode` now centres content
  when `stage` is set (About is its only caller); the 64vh minimum, the major interval above and the
  finale's margin below are unchanged, and `AboutPreview.tsx` is untouched. First text from the
  stage top / last text to the stage bottom: 16 / 173 → **100 / 89 px** at 1440×900 and
  16 / 288 → **157 / 147 px** at 1920×1080. Isolation is preserved at the same scroll positions:
  Field Notes stays entirely above the frame and the finale's first text stays below it.

## 2. Mechanism, in one line

A new `sceneCompositionPresence(id, progress, mobile)` in `lib/spatial/systemPov.ts` maps
composition opacity for these two scenes from a reading window derived from the neighbouring focus
progresses; the unchanged signed approach still drives the acquisition frame's brackets, its state
word and depth resolution. `scenePresence` and `systemsWordPresence` are byte-for-byte unchanged,
and no route coordinate moved.

## 3. Files

Product: `lib/spatial/systemPov.ts`, `components/spatial/SpatialCamera.tsx` (one call site),
`components/spatial/SystemNode.tsx` (the `stage` class).
Tests: new `tests/unit/spatial-composition-timing.test.ts`.
Tools: new `tests/tools/{timing-spacing-probe,timing-spacing-mobile-check}.mjs`.
Docs: `docs/FROZEN_BOUNDARY.md` §5 ledger row (written by Codex),
`docs/review/v14.7-codex-timing/` (report + metrics, 192 KB), this file.

## 4. Preserved — verified by the orchestrator on the checkpoint build

- `git diff --name-only 84fb5a9 -- lib/spatial/{sceneRoute,scenes,cameraFilter,wheelMotion,worldFit,
  editorialDrift}.ts components/spatial/{SceneBreak,SystemsWord,SystemPOV,WorldGrammar,LowerRoute}.tsx
  components/sections components/layout components/ui styles/globals.css app playwright.config.ts`
  → **empty**. SYSTEMS, the interlocking black transition, the POI language, Selected Systems,
  ABOUT's own component, Gate 1's wheel module and first-load implementation are all untouched.
- **Route geometry and Gate 1 behaviour unchanged:** `routeStart` 61, `routeEnd` 4561, `routeSpan`
  4500, `leadCapPx` 540, `docMax` 8604 — identical to the Gate 1 record; every isolated wheel
  impulse still delivers 1.000 with coast 0.
- **First paint:** `FIRST PAINT == SETTLED` at 1440×900 and 1920×1080, cold, on the final build.
- **Mobile:** the route probe at the recorded 2 vh step against the Gate 1 record shows every
  document height, scene position and DOM-rect measure identical; three pixel-row means moved by
  0.001 (sampling). No mobile class changed.
- typecheck 0 · lint 0 · format 0 (three of Codex's new files needed Prettier; the orchestrator ran
  it, no logic touched) · unit **572/572** · build ✓ · focused Chromium (`motion`, `spatial`,
  `spatial-v5`, `home`, `smoke`) **96 passed, 2 skipped** — the two skipped are the V6.6 seam tests
  skipped since V14.5.

The full acceptance matrix and WebKit were not run, per the brief.

## 5. Remaining, for the owner

- The two timing changes are presentation-only by construction. If the owner wants the *entrance* of
  UNDERNEATH or the *release* of four stops to move as well, those halves were deliberately left
  alone and are one call each.
- Codex's report notes that About's text spacing is within 10.6 px of equal above and below; the
  residual is the difference between text line boxes and their centred containers.

NEXT: owner review. No further gate. No final QA. No merge.
