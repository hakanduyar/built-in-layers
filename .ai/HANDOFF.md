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
package `docs/review/v14.3-gate-d/`. Checkpoint `5bbccb6`. Gate E not started.

**VERDICT:** `V14.1 FABLE VISUAL GATE COMPLETE` · `FINAL OPUS ENGINEERING QA COMPLETE — PASS` ·
`V14.2 VISUAL GATE B COMPLETE` · `V14.2 VISUAL GATE C COMPLETE` · `V14.3 VISUAL GATE D COMPLETE`
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
