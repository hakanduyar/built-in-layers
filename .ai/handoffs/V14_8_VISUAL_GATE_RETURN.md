# V14.8 visual gate — the strata classified, the frame that closes, the wide tier

**From:** Fable 5.1 (visual gate), **completed by Opus 5** after the Fable limit was reached
mid-gate — the work in progress was inspected, preserved and finished, and no accepted design
decision was revisited. **Date:** 2026-09-09 · **Branch:** `feature/owner-visual-acceptance-v14` ·
**Base:** `518984a` (the V14.7 Codex timing checkpoint `2d40c65`) · **Checkpoint:** `b385675`,
pushed, `local == origin`.

Owner acceptance is **PENDING**. Not a freeze, not an acceptance, not a merge. `main` = `16d3ec0`.

## 1. Scope, and only that

Three goals. Improve the supporting composition beneath SYSTEMS, keeping the restored interlocking
black transition and without touching the word's typography or reintroducing node graphics.
Strengthen the Person of Interest / Machine atmosphere through behaviour and visual grammar —
acquisition, classification, observation, registration, controlled boundaries, state change —
premium and professional, no fan art, no sci-fi HUD, no fake telemetry. Improve the wide-screen
presence of the final sections without making normal desktop oversized. Not touched: scroll
engineering, the V14.5 transition timing, the V14.7 timing fixes, Selected Systems' content, ABOUT's
spacing, mobile, the no-orange rule, and every item reserved for the next Codex gate.

## 2. What changed (D-054, `docs/DESIGN_SYSTEM.md` §46) — desktop only unless stated

- **Beneath SYSTEMS** (`SystemsWord`'s `StructureBeneath`): the three frame-wide straight rules now
  carry a classification rather than a name — index, name and the real definition from
  `layerDefinitions`, hung off a dotted descent inside the word's left edge — and the stratum's own
  state at the word's right edge: SURFACE **acquired**, FLOW and SYSTEM **detected**. Rule weight
  increases with depth; the descent draws down as the cut approaches, on a compositor transform. The
  word is drawn once and never touched.
- **On the black** (`SceneBreak`'s `SystemOnInk`): the same strata in paper, carrying the state the
  cut has changed them to — SURFACE **released**, FLOW detected, SYSTEM **acquired**, which is the
  stratum UNDERNEATH lands on. One drawing, two materials, one state change at the boundary. The
  rails, their protected timing and the dwell are the V14.5 gate's, untouched.
- **The acquisition frame** (`SystemPOV`): the four brackets stand off a detected composition, close
  onto its edges as it is acquired and stand off again as it is released — each along its own
  diagonal, from the same signed approach the opacity already reads, as a translate only. The state
  word is now a ruled box on the index line that fills with ink while the composition is acquired.
- **The wide tier** (`styles/globals.css`, `EditorialDrift`, `AboutPreview`, `HowIBuild`,
  `SiteFooter`): from `min-width: 1536px` the homepage's lower sections and the finale re-resolve
  the type-scale theme variables as linear clamps — the current size plus `(100vw - 1536px)` at a
  per-step rate, capped — so 1440 and 1536 are byte-identical, the tier grows about 12% at 1920 and
  about 33% at 2560, and it cannot run away on a 4K canvas. `--drift-w` and the finale's max-width
  grow on the same schedule. Every step scales at roughly one rate, so hierarchy and the intervals
  between sections are unchanged.

## 3. Files

Product: `components/spatial/{SystemsWord,SceneBreak,SystemPOV,EditorialDrift}.tsx`,
`components/sections/{AboutPreview,HowIBuild}.tsx`, `components/layout/SiteFooter.tsx`,
`styles/globals.css`. No test, tool or `lib/` file changed.
Docs: `DECISIONS.md` D-054, `DESIGN_SYSTEM.md` §46, `FROZEN_BOUNDARY.md` §6.8,
`docs/review/v14.8-visual-gate/` (README + the mobile metric), this file.

## 4. Protected behaviour — verified on the checkpoint build

- `git diff --name-only 518984a -- lib/spatial/ components/spatial/SpatialCamera.tsx
  components/spatial/SystemNode.tsx components/spatial/WorldGrammar.tsx
  components/spatial/LowerRoute.tsx components/sections/SelectedSystems.tsx
  components/sections/FieldNotes.tsx app/ playwright.config.ts tests/` → **empty**. The scroll
  modules, the V14.5 rails and their timing, the V14.7 composition timing, the route geometry, the
  first-load implementation and Selected Systems' content are untouched.
- **SYSTEMS forward and reverse** verified frame by frame at 1440 and forward at 1920 and 2560: the
  word arrives clean, the classification resolves and holds, the rails close, the black carries the
  changed state, and the reverse is the same event backwards.
- **First paint:** `FIRST PAINT == SETTLED`, cold, at 1440×900, 1920×1080 and 2560×1440.
- **Mobile:** the route probe at the recorded 2vh step is identical to the V14.6 record on every
  geometry and layout measure; five pixel-row sampling means moved by 0.004 or less. Every change is
  gated to `lg` or to `min-width: 1536px`.
- typecheck 0 · lint 0 · format 0 · unit **572/572** · build ✓ · focused Chromium (`motion`,
  `spatial`, `spatial-v5`, `home`, `smoke`) **96 passed, 2 skipped** — the two skipped are the V6.6
  seam tests skipped since V14.5.

The full acceptance matrix and WebKit were not run, per the brief.

## 5. One regression found and fixed during the checks

On the black at 1440 the stratum's definition ran into the state word (`SURFACE INTERFACE AND
IN/RELEASED` overlapping). The definitions are read once on paper and are no longer repeated on the
ink; index and name stay at the label datum, the state at the descent. Re-verified forward and
reverse at 1440 and 1920.

## 6. Remaining, for the owner

- The wide tier starts at 1536px. If the owner wants 1440 to grow as well, that is one number, but
  it would move the composition the earlier gates were accepted at.
- The state words beneath SYSTEMS are fixed per stratum by position in the journey, not animated per
  frame — they state where the reader is in the descent, which is what the cut then changes.

NEXT: owner visual review. No further gate, no Codex, no final QA, no merge.
