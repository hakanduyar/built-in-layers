# HANDOFF

What the next model needs, and nothing else. No transcripts, no test logs, no restated rules.

**CHECKPOINT:** `f4bdab3` — the V14.1 Fable visual correction gate
(`.ai/handoffs/V14_1_FABLE_TO_OPUS.md`), on the V14.1 engineering
checkpoint `c2ba26a` / `fa7c72c`, on the V14 candidate `35c2c58`. Verify `local == origin`. Scroll
safety tag: `safety-v14-scroll-baseline` → `35c2c58`, untouched.
**V14.2 GATE B (2026-09-07, Fable, scoped):** the SYSTEMS → UNDERNEATH cut is the underside of the
surface instead of ink (D-048); UNDERNEATH stands on the exposed section's SYSTEM line; Back on the
surface is a rising paper plane from the SURFACE rule down. Scroll untouched, first paint and mobile
verified. Handoff: `.ai/handoffs/V14_2_GATE_B_RETURN.md`; package `docs/review/v14.2-gate-b/`.
Checkpoint `de538bf`.
**V14.2 GATE C (2026-09-07, Fable, scoped):** the lower world as one system on desktop — Selected
Systems as a section drawing, How I Build as the method beside the same floors, Field Notes as one
entry, About as the operator in the systems' grammar, the finale as the resolved state on the rail's
datum (D-049). Scroll untouched, page 245 px shorter at 1440×900, first paint and mobile verified.
Handoff: `.ai/handoffs/V14_2_GATE_C_RETURN.md`; package `docs/review/v14.2-gate-c/`. Checkpoint
`5a4147d`.
**V14.3 GATE D (2026-09-07, Fable, scoped):** one corner per corner (no registration tick under a
bracket, no plate ticks inside the brackets, no borrowed affordance corner); the signal tokens
retired and every orange usage ink or graphite, the owned diagrams included; the map under the
opened SYSTEMS surface removed and the branch junction ring gone (D-050). Scroll untouched, first
paint and mobile geometry verified, Chromium 224/224. Handoff: `.ai/handoffs/V14_3_GATE_D_RETURN.md`;
package `docs/review/v14.3-gate-d/`. Checkpoint `5bbccb6`.
**V14.3 GATE E (2026-09-07, Fable, scoped):** readable on arrival — scenes and lower sections fully
present a short travel after they enter (desktop curves only), 128px above the three major beats and
32px above the finale, the state word gone and secondary text at a readable weight (D-051). Scroll
untouched, first paint and mobile verified, Chromium 112/112. Handoff:
`.ai/handoffs/V14_3_GATE_E_RETURN.md`; package `docs/review/v14.3-gate-e/`. Checkpoint `51b3387`.
**V14.4 OWNER VISUAL CORRECTION (2026-09-08, Fable-only):** SYSTEMS read whole before the centre and
then a decisive black state carrying the underlying system, nothing drawn beneath the word; the
terminus and finale maps replaced by typographic route registers; 160px major intervals, About a
64vh stage at 7vw, the finale 80px later, How I Build simplified (D-052). Scroll untouched, first
paint and mobile verified, Chromium 111 passed (two seam tests skipped). Handoff:
`.ai/handoffs/V14_4_OWNER_CORRECTION_RETURN.md`; package `docs/review/v14.4-owner-correction/`.
Checkpoint `f9b0a72`.
**V14.5 VISUAL GATE (2026-09-08, Fable-only):** the older SYSTEMS restored after `f4bdab3` — a short
muted entrance then whole before focus, straight rules with names beneath the word, the V4
interlocking black rails with the system in paper on the black; the acquisition frame states its
state; the terminus and finale registers removed; Selected Systems as five entries on rules (D-053).
Scroll untouched, first paint and mobile verified. Handoff: `.ai/handoffs/V14_5_VISUAL_GATE_RETURN.md`;
package `docs/review/v14.5-visual-gate/`. Checkpoint `b8ff8b8`.
**V14.6 CODEX ENGINEERING GATE 1 — MOTION (2026-09-08, Codex CLI implemented, Claude orchestrated):**
the wheel notch eased inside the governor (reach, delivery and settle unchanged), the lower world's
ceiling down 15%, and the first painted frame now pixel-identical to settled (the pre-hydration tree
lays out in the camera's frame; nothing hidden). No per-frame blur was found by the numeric probe.
Handoff: `.ai/handoffs/V14_6_CODEX_MOTION_RETURN.md`; report `docs/review/v14.6-codex-motion/REPORT.md`.
Checkpoint `84fb5a9`.
**V14.7 CODEX ENGINEERING GATE 2 — TIMING + SPACING (2026-09-09, Codex implemented, Claude
orchestrated):** composition opacity for UNDERNEATH and the four-stops sentence now reads a window
derived from the neighbouring focus progresses instead of the shorter adjacent segment, so
UNDERNEATH holds to the Built in Layers release (174px / 209px) and four stops is fully readable
after 95px / 153px; About is centred in its existing stage. Signed approach, route geometry, Gate 1
motion and first paint untouched. Handoff: `.ai/handoffs/V14_7_CODEX_TIMING_RETURN.md`; report
`docs/review/v14.7-codex-timing/REPORT.md`. Checkpoint `2d40c65`.
**V14.8 VISUAL GATE (2026-09-09, Fable 5.1, completed by Opus 5 after the Fable limit was reached
mid-gate):** beneath SYSTEMS the three rules carry index, name, definition and the stratum's state
with a dotted descent; on the black the same strata carry the state the cut changed them to; the
acquisition frame's brackets close onto a composition as it is acquired and its state word is a
ruled box that fills with ink; from 1536px up the lower sections and the finale re-resolve the
type-scale variables through linear clamps floored at today's size. Scroll modules, the V14.5
timing, the V14.7 timing, Selected Systems and `tests/` untouched; mobile identical. Handoff:
`.ai/handoffs/V14_8_VISUAL_GATE_RETURN.md`; package `docs/review/v14.8-visual-gate/README.md`.
Checkpoint `b385675`.
**V14.9 NAVIGATION GATE (2026-09-09, Opus 5):** one ordered list of fourteen stations
(`lib/spatial/routeNavigation.ts`) drives a fixed desktop route navigator, previous/next controls
and ArrowLeft/ArrowRight. Navigation is one `window.scrollTo` on the document, so the camera travels
the real route; the active station is read from `window.scrollY` only, so free scrolling and the
controls share one signal. Absent below `lg`, under reduced motion and without JS. Scroll physics,
route geometry, first paint, the V14.8 composition and mobile are untouched. Handoff:
`.ai/handoffs/V14_9_NAVIGATION_RETURN.md`; package `docs/review/v14.9-navigation/README.md`.
Checkpoint `b244a4d`.

**VERDICT:** `V14.1 FABLE VISUAL GATE COMPLETE` · `FINAL OPUS ENGINEERING QA COMPLETE — PASS` ·
`V14.2 VISUAL GATE B COMPLETE` · `V14.2 VISUAL GATE C COMPLETE` · `V14.3 VISUAL GATE D COMPLETE` · `V14.3 VISUAL GATE E COMPLETE` · `V14.4 OWNER VISUAL CORRECTION COMPLETE` · `V14.5 VISUAL GATE COMPLETE` · `V14.6 CODEX MOTION GATE COMPLETE` · `V14.7 CODEX TIMING GATE COMPLETE` · `V14.8 VISUAL GATE COMPLETE` · `V14.9 NAVIGATION GATE COMPLETE`
(`.ai/handoffs/OPUS-V14_1-QA-RETURN.md`: independent, on its own fresh production build of the
application tree `f4bdab3`; no defect, no source change). Owner acceptance **PENDING**. Do not merge.

**THIS GATE (Fable 5.1, art direction only):** the owner's remaining findings corrected as systems,
recorded as D-043 … D-047 and `docs/DESIGN_SYSTEM.md` §39. The route as a track; the ground drawn
and presence as a state change; the acquired detail on three diagrams; strata as floors with
UNDERNEATH on its line and the terminus map clear of the surface return; the route continued down
the page with a station at every section, the map's index, rows, the finale tail. Full account,
files, proofs: `.ai/handoffs/V14_1_FABLE_TO_OPUS.md`.

**SCROLL CODE CHANGED: NO.** `lib/spatial/{cameraFilter,sceneRoute,scenes,worldFit,
planeChoreography,projectGround,editorialDrift}.ts`, `SceneBreak.tsx`, `SystemsWord.tsx`, `app/` are
byte-identical to `fa7c72c`. `SpatialCamera.tsx` gained one argument on one call
(`scenePresence(value, mobile)`). Initial paint `FIRST PAINT == SETTLED`; discrete scroll 120px per
notch, delivered 1.000, coast 0; frame time 16.7 / 16.8 / 16.8ms a frame against the recorded
17.2–17.3; journeys in `docs/review/v14.1-fable/after/journey.json`.

**MOBILE:** not reopened. The mobile route probe at the recorded step is identical to
`docs/review/v14.1-engineering/mobile/metrics/mobile-route.json` but for one 0.001 pixel-row mean at
320×568. The three owner-pending deltas of `OPUS-V14-QA-RETURN.md` §6.1 remain pending.

**CHANGED** — desktop only:

- Frozen surface: `WorldGrammar.tsx` (track rails, stations, strata, recess, map offset),
  `ProjectPlane.tsx` (drawn ground), `SpatialProjectScene.tsx` (action mark; the foundation's detail
  column), `SystemPOV.tsx` (cluster top-right; `compact` keeps V13), `SpatialExperience.tsx`
  (reorient/approach on their strata; the junction on the rail's datum at `lg`), `EditorialDrift.tsx`
  and `SystemNode.tsx` (arms, register hooks, lateral-only clip), `lib/spatial/systemPov.ts`
  (presence curve; mobile branch keeps V14), `SpatialCamera.tsx` (one argument).
- New: `components/spatial/LowerRoute.tsx`, `lib/spatial/railTravel.ts`,
  `lib/spatial/evidenceDetail.ts`, `tests/tools/transition-sheet.mjs`.
- Also: `RouteMap.tsx` (`tail`), `SiteFooter.tsx`, `Figure.tsx` (`detail`, lg-only),
  `FigureInspect.tsx`, `SelectedSystems.tsx`, `HowIBuild.tsx`, `AboutPreview.tsx`.
- Tests / tools: `tests/e2e/spatial.spec.ts` (D-040 guard restated for the track markup, derived
  count), `tests/tools/scene-fit-probe.mjs` (clips to overflow ancestors).
- Docs: `DECISIONS.md`, `DESIGN_SYSTEM.md` §39, `FROZEN_BOUNDARY.md` §6.1, `REVIEW_POLICY.md`, the
  package `docs/review/v14.1-fable/`.

**OPEN** (none blocking the QA; the owner's acceptance is the gate)

- The SYSTEMS → UNDERNEATH cut is the V4 `SceneBreak`, unchanged; its ink frames are what the
  transition sheets show at p≈0.70–0.73 (D-046). Re-authoring it would be an owner decision.
- WebKit not re-run on this gate; the four known cases are in `FABLE-V14-RETURN.md` §3a and the Opus
  return §6.2.
- Three mobile deltas for the owner, `OPUS-V14-QA-RETURN.md` §6.1.

**VALIDATION:** typecheck 0 · lint 0 · format:check 0 · unit 562/562 · build ✓ · Chromium 224/224 ·
console/hydration 0 on the content routes · overflow 0 of 99 · scene fit clear at five viewports ·
mobile identical to the record · initial paint PASS · discrete scroll NORMAL · frame time at parity.

**ARTIFACTS**

- `.ai/handoffs/V14_1_FABLE_TO_OPUS.md` — the account, the proofs, the files
- `docs/review/v14.1-fable/README.md` — the owner review package index (before / after / iterations)
- `docs/review/v14.1-fable/after/{journey.json,metrics,runtime,mobile}` — the numbers

**NEXT:** the owner reviews `docs/review/v14.1-fable/README.md`. Both model gates have run and
stopped. Neither model declares FREEZE, OWNER ACCEPTED or READY TO MERGE.
