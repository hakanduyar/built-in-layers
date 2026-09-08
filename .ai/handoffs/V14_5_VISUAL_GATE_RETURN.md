# V14.5 visual gate — the older SYSTEMS restored, the Machine's state, the index as a file

**From:** Fable 5.1 (visual gate, Fable-only; no Codex) · **Date:** 2026-09-08 · **Branch:**
`feature/owner-visual-acceptance-v14` · **Base:** `ec37eb1` (the V14.4 checkpoint `f9b0a72` and its
record) · **Checkpoint:** see `.ai/STATE.md` (verify the tip with `git rev-parse HEAD`), pushed,
`local == origin`.

Owner acceptance is **PENDING**. Not a freeze, not an acceptance, not a merge. `main` = `16d3ec0`.

## 1. Scope, and only that

Three goals. Restore the older SYSTEMS experience after `f4bdab3`: a very short, slightly muted
entrance then fully clear well before focus; restrained straight rules and textual system marks
beneath the word; the older interlocking black transition where black planes close into the frame;
intentional forward and reverse; clean typography; no orange, no node graphics. Strengthen the
Person of Interest / Machine behaviour through acquisition, classification, registration, state,
boundaries and controlled transitions. Replace the ROUTE 01 / 4 STATIONS · TRACKED register
treatment and redesign Selected Systems — calmer, stronger in hierarchy, more present,
architecturally meaningful, in the Machine's language. Not touched: scroll mechanics, first paint,
project content and order, no orange, the V14.4 lower-world spacing, About, mobile, and every item
reserved for the Codex gate (scroll blur, wheel smoothing, max speed, first-load flash, the
UNDERNEATH fade and four-stops reveal timing, About spacing).

## 2. What changed (D-053, `docs/DESIGN_SYSTEM.md` §45) — desktop unless stated

- **SYSTEMS** (`systemsWordPresence`; `SystemsWord` `StructureBeneath`): the word enters at 0.72 and
  is whole by approach −0.88 — two frames before focus on the approach sheet — and holds until the
  rails have taken the frame. Beneath it, three straight frame-wide rules with their real names,
  SURFACE / FLOW / SYSTEM, resolving as the word is acquired: the rules and marks of the `f4bdab3`
  reveal without its seam, recess or map. The word is never touched.
- **The interlocking black transition** (`SceneBreak`): the V4 rails run on desktop again — black
  planes closing into the frame from alternating sides over the base field, on the protected timing
  — and on the black, present only through the dwell and above the rails, the underlying system in
  paper: SURFACE, FLOW, SYSTEM and the descent. The V14.4 opacity cover is removed
  (`lib/spatial/surfaceCover.ts` and its unit test deleted). Reverse is the same event backwards.
  The rails' hairline stays on the line token.
- **The Machine's state** (`SystemPOV`): the acquisition frame's index line states DETECTED while
  the composition approaches, ACQUIRED while it is read, RELEASED as it leaves — from the same
  signed approach the brackets read; desktop only, never a number.
- **Registers out** (`WorldGrammar`, `SiteFooter`, `SpatialCamera`, `SpatialExperience`): the
  terminus register and the finale register are removed with their plumbing; the handoff's sentence
  and action carry the handoff, and the finale is the operator's address alone.
- **Selected Systems as a file** (`SelectedSystems`, `lg` only): five entries on rules — the station
  and its index, the name at heading scale, its classification, the record filed on one line
  (provenance · verification · phase), and the three layers as labelled marks, filled where the
  validated record documents the layer. No columns, no floors, no descents. Every test contract of
  the section holds (15 layer records, the caption, the links, the fork disclosure).

## 3. Files

Product: `lib/spatial/systemPov.ts`, `components/spatial/{SceneBreak,SystemsWord,SystemPOV,
WorldGrammar,SpatialCamera,SpatialExperience}.tsx`, `components/sections/SelectedSystems.tsx`,
`components/layout/SiteFooter.tsx`; `lib/spatial/surfaceCover.ts` deleted.
Tests: `tests/e2e/spatial.spec.ts` (the two `f4bdab3` rail contracts restored unchanged; the
atmosphere contract restated for the structure and the rails); `tests/unit/surface-cover.test.ts`
deleted with its module.
Docs: `DECISIONS.md` D-053, `DESIGN_SYSTEM.md` §45, `FROZEN_BOUNDARY.md` §6.7,
`.ai/{STATE,ACTIVE_TASK,HANDOFF}.md`, this file, `docs/review/v14.5-visual-gate/README.md`.

## 4. Protected behaviour — verified on the checkpoint build

- `git diff --name-only ec37eb1 -- lib/spatial/{cameraFilter,sceneRoute,scenes,worldFit,
  planeChoreography,projectGround,editorialDrift}.ts components/spatial/{LowerRoute,ProjectPlane,
  SpatialProjectScene,SystemNode}.tsx components/sections/{AboutPreview,HowIBuild,FieldNotes}.tsx
  styles/globals.css app/` → **empty**. `safety-v14-scroll-baseline` untouched.
- **First paint:** `FIRST PAINT == SETTLED` at 1440×900 and 1920×1080, cold, on the final build.
- **Discrete scroll** (diffed against the v14.1 engineering record): geometry identical
  (`routeStart` 61, `routeEnd` 4561, `routeSpan` 4500, `leadCapPx` 540); every isolated impulse
  identical (120 px, delivered 1.000, coast 0); the sustained rows 0.697 / 0.708, in the machine's
  run-to-run band.
- **Mobile** (`mobile-route-probe.mjs` at the recorded 2vh step, diffed against the V14.4 record):
  document heights, scene positions and every DOM-rect measure identical on every recorded
  viewport; one pixel-row mean moved by 0.001 (sampling).
- **Runtime:** console noise 0 on every content route, hydration 0 on all 11 routes, overflow 0 of
  99, CLS 0.0418 on `/` — unchanged.
- **Focused Chromium** (`spatial`, `spatial-v5`, `a11y`, `smoke`, `motion`, `home`) and the unit
  suite: see `.ai/STATE.md` for the counts.
- typecheck 0 · lint 0 · format 0 · build ✓.

The full acceptance matrix and WebKit were not run, per the brief.

## 5. Owner review

`docs/review/v14.5-visual-gate/README.md` — the approach to SYSTEMS, SYSTEMS → UNDERNEATH forward
and reverse at 1440 and the 1920 smoke, the approach to Kıvılcım (the state word), stills of every
touched frame before and after at 1440 and 1920, the metrics.

## 6. Remaining, for the owner

- The word's approach window is short by geometry (the last leg into SYSTEMS is a short segment),
  so "well before focus" is about two frames of the approach sheet — roughly 130px of scroll. A
  longer muted approach would need the leg itself to move, which is scroll geometry and reserved.
- The state word in the acquisition frame is three words; if DETECTED / ACQUIRED / RELEASED should
  be two (no RELEASED), that is one line.
- The record line in Selected Systems wraps once for JointLedger at 1440 ("Fork of ezBookkeeping ·
  Verified against source · Active development").

NEXT: owner visual review. Not continued automatically. No further gate, no final QA, no Codex, no
merge.
