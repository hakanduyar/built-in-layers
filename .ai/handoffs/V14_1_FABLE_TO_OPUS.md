# V14.1 — Fable visual correction gate → Opus engineering QA

**From:** Fable 5.1 (art direction only) · **To:** Opus 5 / High (engineering QA) · **Date:** 2026-09-06
**Branch:** `feature/owner-visual-acceptance-v14` · **Base:** `fa7c72c` (V14.1 engineering checkpoint on
`c2ba26a`) · **Fable checkpoint:** the commit that carries this file; `.ai/STATE.md` records the SHA
once pushed · **Scroll safety tag:** `safety-v14-scroll-baseline` → `35c2c58`, untouched.

Owner acceptance is **PENDING**. Nothing here is a freeze, an acceptance or a merge. `main` is
`16d3ec0`, untouched.

## 1. What this gate was, and was not

The owner's verdict on the V14 candidate was "there are improvements, but I cannot yet say it is
what I asked for", and the V14.1 brief asked for the remaining visual weaknesses to be corrected as
**systems** — not screenshot patches — with the following protected: boot fit behaviour, SSR/hydration
geometry, the viewport fit, every scroll constant (velocity ceiling, wheel gain, debt, target lead,
page and route budgets, lower-world gearing, reverse), no scroll snapping, no blur / filter / scaling
/ nested transforms for "sharpness", and the V13 mobile composition.

This gate touched none of those. The engineering constraints established in
`V14_1_ENGINEERING_TO_FABLE.md` (flash fixed, scroll protected, discrete scroll NORMAL, lower-world
pacing accepted, sharpness not reproducible, mobile regression none) were not reopened. §6 is the
proof.

## 2. Major visual decisions (D-043 … D-047, `docs/DESIGN_SYSTEM.md` §39)

| Owner finding | What changed, as a system | Decision |
|---|---|---|
| A · spatial world coherence, F · route hierarchy | The route is a **track**: AHEAD a dotted survey path, TRAVELLED a solid rail revealed along the real curve, drawn only in the open (`lib/spatial/railTravel.ts`); stations scaled with the viewport, indexed while ahead; no per-frame opacity on the rail group | D-043 |
| B · project grammar, §7 ground, ghost typography | The ground is **drawn, not filled**: datum, floor at the composition's foot, tread; laid by acquisition. Presence is a **state change** (a third while detected, one rise, held, released). Two voices at acquisition (the frame's cluster top-right); one action vocabulary (bracket · rule · label) | D-044 |
| C · evidence legibility, project weight, discoverability | The **acquired detail**: SF, Kıvılcım and JL frame the subsystem that is their argument, named by the diagram's own heading, the whole drawing one INSPECT away; the foundation takes the full measure; DropSpot's screenshots stay whole | D-045 |
| D · SYSTEMS→UNDERNEATH | Strata as floors; UNDERNEATH stands on the SYSTEM line; the SURFACE horizon stops before the reveal; the recess fades at both ends; the terminus map clears "Back on the surface" during its rise; the `SceneBreak` cut left as designed (§7) | D-046 |
| E · lower world as narrative, Selected Systems, How I Build, About, H · final CTA | The route **continues down the page** as one rail with a station per section and an arm per register (`LowerRoute.tsx`); Selected Systems is the map's index; How I Build is four rows; About is a station; the finale map carries the lower page as its tail — CTA copy unchanged | D-047 |
| G · zoom-out coherence, microtext | Every state is a difference of form, so it survives 80 / 67 / 50; verified on the zoom sets. The caption prefix `Detail:` is the only new microtext | D-043, D-045 |

Motion was judged on intermediate frames: `tests/tools/transition-sheet.mjs` (new, in
`docs/REVIEW_POLICY.md`) tiles eight settled frames between any two beats.

## 3. Files changed

Product — frozen surface, desktop-scoped (`docs/FROZEN_BOUNDARY.md` §6.1 has the per-file reason
and measurement): `components/spatial/{WorldGrammar,ProjectPlane,SpatialProjectScene,SystemPOV,
SpatialExperience,EditorialDrift,SystemNode}.tsx`, `lib/spatial/systemPov.ts`,
`components/spatial/SpatialCamera.tsx` (**one line**: `scenePresence(value, mobile)`, so the re-cut
presence curve is desktop-only).

Product — outside the frozen surface: `components/spatial/{RouteMap,LowerRoute*}.tsx`,
`components/ui/{Figure,FigureInspect}.tsx`, `components/layout/SiteFooter.tsx`,
`components/sections/{SelectedSystems,HowIBuild,AboutPreview}.tsx`, `lib/spatial/{railTravel*,
evidenceDetail*}.ts` (* new).

Tests and tools: `tests/e2e/spatial.spec.ts` (the D-040 rail guard restated for the track markup —
the rail group holds SVG only; one AHEAD path per leg with open travel, derived from the same
module the component renders from); `tests/tools/scene-fit-probe.mjs` (clips ink to overflow
ancestors); `tests/tools/transition-sheet.mjs` (new).

Docs: `DECISIONS.md` D-043…D-047, `DESIGN_SYSTEM.md` §39, `FROZEN_BOUNDARY.md` §6.1,
`REVIEW_POLICY.md`, this file, `.ai/{STATE,ACTIVE_TASK,HANDOFF}.md`, the package
`docs/review/v14.1-fable/README.md`.

## 4. Structural problems addressed

Read off the before set (`docs/review/v14.1-fable/before/`) and closed on the after set:

1. Three of eight frames between the hero and Software Factory held only a hairline; the departing
   description stood orphaned while the arriving title was cut at the frame edge → presence as a
   state change; the rail carries the frame; the ground's datum is detected before the composition.
2. The ground read as a pale card sliding through empty frames → drawn ground; nothing filled above
   the floor; the floor 7–18px under the composition's bracket feet at 1366 / 1440 / 1920.
3. Diagram body labels at 8–11 CSS px → the acquired detail; Kıvılcım's core ≈1.7× at 1440; the
   delivery loop at the full measure; nothing fabricated, nothing scaled globally.
4. Rails through titles, invisible at 50% → track states by construction; the survey ticks gone.
5. UNDERNEATH bare; a fourth unlabelled line; the map into "Back on the surface" → strata as floors;
   horizon stops at x=760; map offset {28, −14} — verified on handoff→1 sheets at 1366 / 1440 / 1920.
6. "Editorial website" below the junction → one rail, stations 05–08, arms, the map's index, rows,
   the finale tail.

## 5. Known remaining issues, for the owner or for Opus

- **The cut (SYSTEMS → UNDERNEATH) is the V4 `SceneBreak`, unchanged.** The transition sheets show
  black frames at p≈0.70–0.73; a DOM probe on the settled frames finds the ink field and the seven
  `data-break-rail` bars — designed, identical in the before set. Whether the owner wants the cut
  itself re-authored is an owner decision; this gate stood UNDERNEATH on its floor and did not
  redesign the break.
- **Three owner-pending mobile deltas** from the Opus V14 QA (§6.1) remain pending; this gate added
  none (§6).
- **WebKit** not re-run here (Chromium is the relevant suite for a visual gate on this machine; the
  four WebKit environment/arrival cases are documented in `FABLE-V14-RETURN.md` §3a and the Opus
  return §6.2). Opus may re-run it.
- The `iterations/` motion sheets are from intermediate builds (iter1–6) and are kept as the
  record of the sequence; the `after/` set is the checkpoint build.

## 6. Proof the protected behaviour is unchanged

- `git diff --name-only fa7c72c -- lib/spatial/{cameraFilter,sceneRoute,scenes,worldFit,
  planeChoreography,projectGround,editorialDrift}.ts components/spatial/{SceneBreak,SystemsWord}.tsx
  app/` → **empty**. `SpatialCamera.tsx`: one call gained the `mobile` argument; no other line.
- **Initial-load flash** (`initial-paint-probe.mjs`, 1440×900 cold): `FIRST PAINT == SETTLED`; world
  zoom 1 → 0.909 at 237 → 543ms; hero box 225.43 → 225.41px. Same as the engineering record.
- **Discrete scroll** (`discrete-scroll-probe.mjs`): 120px per notch, delivered 1.000, coast 0,
  settle ~320–360ms, isolated and sustained alike — the D-042 table reproduced.
- **Scroll contract** (`scroll-contract-probe.mjs` → `after/metrics/scroll-contract.json`): lower
  aggressive peak 1826 px/s, coast 421px (0.49vh, 200ms); reverse one notch, 0 wrong-way px.
- **Frame time** (`frame-time-probe.mjs`, 1440×900, idle machine): forward 16.7ms, second forward
  16.8ms, reverse 16.8ms a frame (p95 16.7–16.8; >25ms frames 2/581, 2/190, 4/581) against the
  recorded 17.2–17.3ms. At parity or better.
- **Journeys** (`v14-baseline.mjs` → `after/journey.json`): the same tool was run on the same
  machine, back to back and idle, against the checkpoint and against a worktree of `fa7c72c` (the
  state before this gate; `after/metrics/journey--ab-baseline-fa7c72c--same-machine.json`). Notch
  for notch the two are the same journey — 1440×900 lower world 27 notches / 4.9s before, 28 / 5.1s
  after; the route 108 / 20.7s before, 110 / 19.3s after; 1920×1080 route 123 / 30.2s before,
  123 / 27.3s after. Both are slower in seconds than the V14 record (3.8s / 13.6s) taken on this
  machine on 2026-09-04: the video-recorded run is environment-bound today, and the A/B is the proof
  that the candidate did not move it. The full three-column table is
  `docs/review/v14.1-fable/README.md` §C.
- **Mobile** (`mobile-route-probe.mjs` at the recorded step, 320 / 390 / 768):
  `after/mobile/metrics/mobile-route.json` differs from
  `docs/review/v14.1-engineering/mobile/metrics/mobile-route.json` in **one** mean pixel-row value
  at 320×568 (0.325 → 0.326). Every scene height, document height, focus position and screen count
  (14.1 / 11.6 / 10.5) is identical. Where a shared component's first draft reached below `lg` —
  the evidence window and its caption prefix, the foundation row's spacing, the lower sections'
  rows and rules, the surface-return container, the presence curve, the annotation cluster — the
  mobile branch was restored to the V13 markup before this checkpoint.

## 7. Validation at the checkpoint (production build)

typecheck 0 · lint 0 · `format:check` 0 · unit **562/562** · build ✓ · Chromium **224/224** ·
console/runtime/hydration 0 on the content routes, images 0 broken / 0 unsized / 0 empty-alt,
overflow **0 of 99** route × width (`after/runtime/`) · scene fit clear at 1366 / 1440 / 1536 /
1920 / 2560 (worst clearance −42px at 1440, `after/metrics/scene-fit.json`) · initial paint PASS ·
discrete scroll NORMAL · mobile identical to the record (§6).

## 8. Owner review artefacts

`docs/review/v14.1-fable/README.md` — forward journeys at 1440 and 1920, the reverse journey, the
lower-world journeys, zoom 100 / 80 / 67 / 50, the Project 01–04 focus sequence, the
SYSTEMS→UNDERNEATH and handoff→terminus sequences, the final CTA, and the before/after by system.
Recordings are git-ignored by the repository rule and live in the working tree; `journey.json` and
the stills are committed.

## 9. For Opus

Engineering QA only, as for V14: verify §6 independently on a fresh production build (the
protected-file diff, the four probes, the mobile record), re-run WebKit, and confirm the rail guard
counts what the module says it should. No redesign. The owner's acceptance remains the only gate.
