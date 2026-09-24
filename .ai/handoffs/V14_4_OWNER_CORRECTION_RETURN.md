# V14.4 owner visual correction — the black state, the operator's frame, registers

**From:** Fable 5.1 (visual gate, Fable-only; no Codex in this pass) · **Date:** 2026-09-08 ·
**Branch:** `feature/owner-visual-acceptance-v14` · **Base:** `4810181` (the Gate E checkpoint
`51b3387` and its record) · **Checkpoint:** `f9b0a72`, pushed, `local == origin` (verify the tip with `git rev-parse HEAD`).

Owner acceptance is **PENDING**. Not a freeze, not an acceptance, not a merge. `main` = `16d3ec0`.

## 1. Scope, and only that

Three systemic goals: SYSTEMS / UNDERNEATH (fully clear earlier; the stronger black transition of
the older accepted direction restored; the weak, arbitrary shapes beneath and around the word
removed; the typography untouched; forward and reverse intentional; no scroll physics change); the
lower world's rhythm with ABOUT as an isolated operator reveal (more room between major beats,
minor beats compact, no huge dead distances, simplify where overloaded); the Person of Interest
grammar through structure — every remaining line, dot or bracket encoding a real relationship or
state, none of the generic network vocabulary. Preserved: the scroll baseline tag and physics, first
paint, project content and order, no orange, mobile.

## 2. What changed (D-052, `docs/DESIGN_SYSTEM.md` §44) — desktop unless stated

- **SYSTEMS is read whole before the centre** (`systemsWordPresence`, `lib/spatial/systemPov.ts`;
  one branch on one line in `SpatialCamera.tsx`): the word's presence is never below 0.9, full a
  tenth into its approach, and held until the black state has taken the frame. Nothing fades ahead
  of the cover.
- **The black state** (`SceneBreak.tsx`, `lib/spatial/surfaceCover.ts`): the cover is the ink token,
  arriving by opacity within the first 40% of the closing window and leaving within the last 40%
  of the reveal, on the same protected timing and dwell. On the black, the underlying system in
  paper: SURFACE, FLOW, SYSTEM at label size, and the descent. Reverse is the same event backwards.
- **Nothing beneath SYSTEMS** (`SystemsWord.tsx`, `WorldGrammar.tsx`): the desktop surface reveal —
  the diagonal seam, the recess, the strata rising under the word — is removed; the world's strata
  and recess exist only from the cut on (stepped under the opaque cover); the cut's two strokes and
  the landing corner are gone. The mobile compact cut is untouched.
- **Registers, not maps** (`WorldGrammar.tsx`, `SpatialExperience.tsx`, `SiteFooter.tsx`;
  `RouteMap.tsx` deleted): the terminus map is a route register — ROUTE 01, the four stations by
  real title, "4 STATIONS · TRACKED", the branch by real name — where the map stood; the finale's
  map is the resolved register with the lower world's four stations under RESOLVED.
- **The lower world's rhythm** (`SystemNode.tsx`, `AboutPreview.tsx`, `HowIBuild.tsx`,
  `styles/globals.css`): major beats open with 160px above them; Field Notes keeps 56; the finale
  gains 80px. About is a stage of at least 64vh with the name at 7vw; How I Build's second floors
  drawing is removed. Gaps at 1440×900: 160 / 213 / 93 / 213 / 144 px; lower world 3194 → 3556 px.
  At About's primary position the previous section is above the frame and the finale's caption
  below it.

## 3. Files

Product: `lib/spatial/{systemPov,surfaceCover}.ts`, `components/spatial/{SystemsWord,SceneBreak,
WorldGrammar,SpatialCamera,SpatialExperience,SystemNode}.tsx`, `components/sections/{AboutPreview,
HowIBuild}.tsx`, `components/layout/SiteFooter.tsx`, `styles/globals.css`;
`components/spatial/RouteMap.tsx` deleted.
Tests: `tests/e2e/spatial.spec.ts` (the black-state contracts restated), `tests/e2e/spatial-v5.spec.ts`
(no desktop cut; one compact cut below `lg`; two V6.6 seam tests skipped with the reason).
Docs: `DECISIONS.md` D-052, `DESIGN_SYSTEM.md` §44, `FROZEN_BOUNDARY.md` §6.6,
`.ai/{STATE,ACTIVE_TASK,HANDOFF}.md`, this file, `docs/review/v14.4-owner-correction/README.md`.

## 4. Protected behaviour — verified on the checkpoint build

- `git diff --name-only 4810181 -- lib/spatial/{cameraFilter,sceneRoute,scenes,worldFit,
  planeChoreography,projectGround,editorialDrift}.ts components/spatial/{LowerRoute,ProjectPlane,
  SpatialProjectScene,SystemPOV}.tsx app/` → **empty**. `safety-v14-scroll-baseline` untouched.
- **First paint:** `FIRST PAINT == SETTLED` at 1440×900 and 1920×1080, cold, on the final build.
- **Discrete scroll** (diffed against the v14.1 engineering record): geometry identical
  (`routeStart` 61, `routeEnd` 4561, `routeSpan` 4500, `leadCapPx` 540); every isolated impulse
  identical (120 px, delivered 1.000, coast 0); the sustained rows 0.708 / 0.703, in the machine's
  run-to-run band.
- **Scroll contract** (1536×864): see `metrics/scroll-contract-1536x864.json` — geometry identical,
  reverse one notch with 0 wrong-way px.
- **Mobile** (`mobile-route-probe.mjs` at the recorded 2vh step, diffed against the Gate E record):
  document heights, scene positions and every DOM-rect measure identical on every recorded
  viewport; pixel-row and coverage means within ±0.001 on three summaries (sampling).
- **Runtime:** console noise 0 on every content route, hydration 0 on all 11 routes, overflow 0 of
  99, CLS 0.0418 on `/` — unchanged.
- **Focused Chromium** (`spatial`, `spatial-v5`, `a11y`, `smoke`, `motion`, `home`) and the unit
  suite: 111 passed with the two skipped seam tests; unit 569/569.
- typecheck 0 · lint 0 · format 0 · build ✓.

The full acceptance matrix and WebKit were not run, per the brief.

## 5. Owner review

`docs/review/v14.4-owner-correction/README.md` — the approach to SYSTEMS, SYSTEMS → UNDERNEATH
forward and reverse at 1440 and the 1920 smoke; the lower world forward and reverse at 1440 and the
1920 smoke; stills of every touched frame before and after; the metrics.

## 6. Remaining, for the owner

- The black state's strata labels are paper on ink at label size; if the underlying system should
  be quieter on the black (lines only, no names), that is one flag.
- About's stage is 64vh: the name and statement fill its upper half and the lower half is the
  isolation. If the reveal should be centred in its frame rather than registered to the rail's
  station, that changes the rail's station placement.
- The two V6.6 seam tests are skipped, not deleted, so the compact mobile cut keeps its history; a
  later engineering gate (Codex, separately) could restate them against the mobile viewport.

NEXT: owner visual review. Not continued automatically. No further gate, no final Opus QA, no merge.
