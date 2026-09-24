# FABLE V14 RETURN — owner visual candidate

**Status: FABLE VISUAL CANDIDATE READY.** Owner acceptance: **PENDING**. Not frozen, not accepted,
not ready to merge — the owner's visual verdict is the only acceptance this pass can receive.

| | |
|---|---|
| Branch | `feature/owner-visual-acceptance-v14`, created from exactly `5670234` |
| Starting baseline | `5670234` (Phase 7, the accepted technical baseline) |
| V13 | `feature/project-architecture-v13` still at `5670234` — not mutated |
| `main` | `16d3ec0` — untouched, never merged to |
| Fable checkpoint | the tip of the V14 branch at the Opus launch: `git rev-parse HEAD` (the commit subject begins `V14: owner visual candidate`) |
| Model | Claude Fable 5.1, Max — the visual redesign only; engineering QA is the separate Opus 5 / High session (`.ai/handoffs/OPUS-V14-QA.md`) |
| Brief | `.ai/handoffs/V14-OWNER-BRIEF.md`, verbatim |

## 1. What the baseline showed

Captured before any change, from a production build of `5670234`, with the tool that captured the
candidate (`tests/tools/v14-baseline.mjs`; `docs/review/v14-owner-visual/baseline/`). Every
finding in the brief reproduced, frame for frame:

- **A.** Four separate vocabularies shared one world: the ghost SURFACE glyph on the hero, the
  directional fields and the "travel material" strokes during travel, the system field behind the
  scenes, the CONVERGE mark on the footer. None of them was derived from anything the reader was
  travelling on. At 50% zoom the world read as components placed on a canvas.
- **B.** A project arrived as a block that scaled up (`SCENE_SCALE_FAR → FOCUS`) over an offset
  rectangle (the "ground") and left the same way; the ghost label sat on it at every distance;
  the rail — a one-pixel polyline at 8–20% opacity — ran across the title at focus.
- **C.** SYSTEMS opened with a peel that put a second copy of the word in motion.
- **D.** The lower world carried 50vh of authored paper between four sections, a DriftRoute and a
  DriftSettle beat that staged arrivals nobody was waiting for, and a footer with its own mark.
- **E.** At 80 / 67 / 50% the one thing connecting the scenes was half a device pixel wide.
- **F.** The lower world took **10.1s at a normal wheel and 10.2s at a hard flick** at 1440×900 —
  identical, because the ceiling bound — against 14.8s for the whole route. The ceiling was a
  scroll px/s number: the same number moved the world 3.6 screen pixels per scroll pixel inside the
  route and one outside it.

## 2. What changed, by system

Decisions D-034 … D-040 in `docs/DECISIONS.md`; the design-system record is
`docs/DESIGN_SYSTEM.md` §38. Everything below is desktop (`lg` and above) unless it says otherwise.
The mobile system is the V13 gate's, untouched by intent; §4 lists what moved on mobile anyway.

### A — one world language (D-034)

- Removed, not restyled: `SystemField`, both `DirectionalField`s, `TravelMaterial`, the hero's
  SURFACE ghost, `MeasureScale`, the footer's CONVERGE mark, `DriftRoute` and `DriftSettle`. The
  drift field is gated off (`DRAW_FIELDS = false`), its geometry kept.
- One structural motif remains: **the route's own topology**, drawn from the route module in four
  states (`components/spatial/RouteMap.tsx`: latent as the rails, revealed under SYSTEMS, mapped at
  the terminus, resolved at the finale). If the route moves, all four move.
- Three strata bands (SURFACE / FLOW / SYSTEM, from `layerDefinitions`) at the handoff, approach
  and reorient anchors give the deep world a floor the reader can place the scenes on.
- `WORLD_REFERENCE` height 1040 → 990: the tallest composition now clears the frame at 1366×768
  and 1536×864 (measured, §3 scene fit) and the world is 5% larger everywhere else.

### B — project scene grammar (D-035)

- **DETECTED → ACQUIRED → FOCUSED → UNDERSTOOD → RELEASED** as a single presence curve
  (`scenePresence`, opacity only): 0.4 far, 1 through focus, receding to 0.45 behind. **No scale on
  the foreground** — `SCENE_SCALE_FAR / FOCUS` are deleted; text is never continuously scaled.
- **Grounds rethought** (`ProjectPlane.tsx`): the offset rectangle is gone. A plane is a constructed
  edge 0.07 route units up-route of the block, a faint fill (`rgba(22,22,22,0.045)`) sheared to the
  route's bearing and running 0.45 units off-frame down-route, two registration ticks, and a far
  hairline. It appears with the block (presence `0.92 × near`) and reads as the same surface at
  every zoom.
- The four compositions were recomposed: identity row first (index, layer / phase, category,
  title, action), then the plate at 9 of 12 columns with the detail column beside it; the
  stacked (DropSpot), counter (JointLedger) and split (Kıvılcım) variants keep their character with
  the plate as the largest object in frame. Mono labels moved from `mono-meta` to `mono-label` at
  `lg` (the small-text audit); the case action is a bordered register on desktop.
- **Evidence legibility:** every plate carries a desktop inspector button (`FigureInspect
  where="desktop"`), so the diagram is readable at full size without leaving the world.
- **Rail attention:** the spine recedes to a quarter of its weight while a scene is in frame
  (`1 − 0.74 · focusProximity`), so it never runs across a title again.

### C — SYSTEMS / UNDERNEATH (D-036)

- The peel is gone. The word stays intact and in place; **the surface opens beside it**: a seam at
  `SYSTEMS_SEAM_ANGLE` across a 240vw × 200vh field, a cut (`data-systems-cut`) that travels with
  the reader, a recessed strip, and — under the opened surface — the revealed structure: three
  strata and the route's own map (`RouteMap state="revealed"`). One cut, one word, no collision.
- The reveal is a compositor layer gated on `visibility`; transform and opacity only; no filter.
- Mobile keeps the V6.6 `SurfaceCut` box and `StructuralLayers` exactly.

### D — lower-world narrative (D-037)

- The desktop approach intervals fell from 22 / 14 / 14vh to **6 / 4 / 6vh** (`gapVhDesktop`;
  the mobile `gapVh` values are byte-identical to V13). DriftRoute and DriftSettle are gone.
- `HowIBuild` is a two-column ledger at `lg` (index, heading, consequence) instead of a stacked
  list; `SystemNode` spacing tightened; `SelectedSystems`' verification line moved to `mono-label`.
- The handoff scene is a sentence, the beyond-tour line and the action; its map moved into the
  world at the turn (`TerminusMap`, `RouteMap state="mapped"`, stations 01–04 and the two branch
  names), where the reader can see it while still travelling.
- **The CTA is the final system state:** the footer is the resolved map (`RouteMap
  state="resolved"`, hidden when the tour is not on the page) beside the closing sentence.

### E — zoom-out / topology (D-038)

- Each route is one continuous faint rail (the route exists); each leg carries an ink rail
  revealed along the real curve exactly as far as the filtered camera has come (`pathLength`):
  behind the reader the route is a fact, ahead a proposal.
- Stations seven units up-route of each anchor, rings that fill on acquisition and stay once
  passed; the survey (cross-ticks at even arc length, square to the bearing); two strokes at the
  cut; the resolved corner where route two is picked up.
- Stroke weight `max(1.5px, 0.09vw)`: heavier exactly when the CSS viewport grows — at 50% zoom
  the rail is 1.7px of a 3840-wide viewport, not half a device pixel.
- Polyline budget inside the frame: 15 (bound 20); the cut's drawing 2.

### F — vertical scroll pacing (D-039, D-037)

- **No multiplier constant.** The ceiling is restated in the unit the reader perceives — screen
  travel per second — and held constant across the whole page. Inside the pinned route the budget
  is byte-identical to V7–V11 (`ROUTE_MAX_RATE × routeSpan`); from the pinned end it is that budget
  times the world's gearing, `routeWorldLength × worldUnitPx × fit / routeSpan`
  (`pageGearing`, `governorBudget` in `lib/spatial/cameraFilter.ts`; 3.6 at 1440×900). Nothing is
  authored: change the route, the unit or the fit and the page's cap follows.
- Intent, sign collapse, the lead cap, the break event's ownership of its band, wheel-only scope
  and the edge hand-backs are untouched. Reverse is still one notch.
- The lower page was shortened first (D above): 4104 → 3176px at 1440×900.

### D-040 — frame time is route speed (found by this pass's own evidence)

The first after-evidence showed the **reverse** traverse of the route at 21.0s against the
baseline's 12.9s at 1440×900, with forward unchanged and every governor number identical. A frame
probe (`tests/tools/frame-time-probe.mjs`, new) showed why: the governor pays per frame and
forfeits a dropped frame's share, so a traverse runs exactly as fast as the page paints, and every
traverse after a fresh page's first ran at 25ms a frame against the baseline's 17ms. Bisected by
hiding one suspect at a time, the cost was the D-038 attention wrapper — whose opacity is written
every frame — holding ninety absolutely positioned survey tick spans. The survey is now one path
per route inside the base rail's SVG (same ticks, same bearings, same opacities), the group holds
SVG only, and the rebuilt candidate is at frame parity with the baseline (§3). The e2e
sparse-structure test guards the group's contents.

## 3. Measured — baseline `5670234` against the candidate

Same tools, same viewports, production builds of each, sequential so the governor's wall-clock
timings are not skewed. Artifacts: `docs/review/v14-owner-visual/{baseline,after}/`.

### Journeys at a normal wheel (120px notches every 55ms)

| Journey | baseline `5670234` | candidate |
|---|---|---|
| 1440x900 · route forward | 14.8s · 93 notches · 5113px · peak 509 px/s | 13.6s · 89 notches · 5070px · peak 710 px/s |
| 1440x900 · lower world forward (continuing) | 9.7s · 72 notches · 3552px · peak 582 px/s | 3.5s · 23 notches · 2667px · peak 1429 px/s |
| 1440x900 · lower world from the handover | 10.1s · 78 notches · 4104px · peak 627 px/s | 3.8s · 27 notches · 3176px · peak 1395 px/s |
| 1440x900 · lower world, hard flick (400px / 16ms) | 10.2s · 122 notches · 4104px · peak 567 px/s | 3.1s · 29 notches · 3176px · peak 2231 px/s |
| 1440x900 · lower world reverse | 10.7s · 83 notches · 4608px · peak 644 px/s | 3.9s · 27 notches · 3240px · peak 1602 px/s |
| 1440x900 · route reverse | 12.9s · 79 notches · 4057px · peak 581 px/s | 14.2s · 89 notches · 4497px · peak 1174 px/s |
| 1440x900 · document / route span | 8665px / 4500px (lower 4104px) | 7737px / 4500px (lower 3176px) |
| 1920x1080 · route forward | 19.5s · 97 notches · 5929px · peak 449 px/s | 18.9s · 108 notches · 6110px · peak 797 px/s |
| 1920x1080 · lower world forward (continuing) | 11.1s · 70 notches · 3823px · peak 570 px/s | 3.8s · 23 notches · 2692px · peak 1310 px/s |
| 1920x1080 · lower world from the handover | 11.6s · 78 notches · 4291px · peak 559 px/s | 4.4s · 28 notches · 3341px · peak 1304 px/s |
| 1920x1080 · lower world, hard flick (400px / 16ms) | 11.7s · 113 notches · 4291px · peak 568 px/s | 3.4s · 23 notches · 3341px · peak 2275 px/s |
| 1920x1080 · lower world reverse | 11.6s · 77 notches · 4671px · peak 547 px/s | 4.4s · 28 notches · 3360px · peak 1277 px/s |
| 1920x1080 · route reverse | 15.8s · 85 notches · 5072px · peak 471 px/s | 19.5s · 109 notches · 5442px · peak 549 px/s |
| 1920x1080 · document / route span | 9752px / 5400px (lower 4291px) | 8802px / 5400px (lower 3341px) |

### Scroll contract, 1440×900

| Measure | baseline | candidate |
|---|---|---|
| routeGentle peak px/s | 462 | 465 |
| routeGentle coast after input | 12px · 0.01vh · 0ms | 4px · 0vh · 0ms |
| routeAggressive peak px/s | 520 | 615 |
| routeAggressive coast after input | 524px · 0.58vh · 1000ms | 516px · 0.57vh · 900ms |
| lowerGentle peak px/s | 486 | 438 |
| lowerGentle coast after input | 4px · 0vh · 0ms | 0px · 0vh · 0ms |
| lowerAggressive peak px/s | 522 | 1981 |
| lowerAggressive coast after input | 524px · 0.58vh · 900ms | 192px · 0.21vh · 100ms |
| reverse latency | 1 notch · 0px wrong-way · 133ms | 1 notch · 0px wrong-way · 103ms |

### Dead scroll, 1440×900 (content fill per 120px step)

| Measure | baseline | candidate |
|---|---|---|
| document height (scrollable) | 8665px | 7737px |
| mean fill | 0.216 | 0.261 |
| dead runs | [] | [] |

### Frame time, 1440×900 (route driven at a normal wheel)

| Traverse | baseline | candidate |
|---|---|---|
| forward-1 | 17.4ms mean · p95 16.8ms · 25/582 over 25ms · 10.2s / 79 notches | 17.2ms mean · p95 16.8ms · 19/584 over 25ms · 10.2s / 84 notches |
| forward-2 | 18.3ms mean · p95 33.4ms · 18/188 over 25ms · 3.5s / 26 notches | 18.1ms mean · p95 33.3ms · 15/188 over 25ms · 3.5s / 30 notches |
| reverse | 17.3ms mean · p95 16.8ms · 22/578 over 25ms · 10.1s / 84 notches | 17.2ms mean · p95 16.8ms · 19/578 over 25ms · 10s / 85 notches |

### Scene fit (candidate): composition ink against the frame

| Viewport | fit | worst overflow (px, negative = clear) | per scene |
|---|---|---|---|
| 1366x768 | 0.776 | -37 | software-factory -37 · kivilcim -40 · jointledger -77 · dropspot -116 · reorient -403 · approach -433 · handoff -485 |
| 1440x900 | 0.909 | -12 | software-factory -12 · kivilcim -15 · jointledger -60 · dropspot -107 · reorient -426 · approach -477 · handoff -551 |
| 1536x864 | 0.873 | -16 | software-factory -16 · kivilcim -19 · jointledger -62 · dropspot -108 · reorient -419 · approach -466 · handoff -533 |
| 1920x1080 | 1 | -78 | software-factory -78 · kivilcim -81 · jointledger -131 · dropspot -183 · reorient -504 · approach -568 · handoff -671 |
| 2560x1440 | 1 | -387 | software-factory -387 · kivilcim -391 · jointledger -440 · dropspot -493 · reorient -756 · approach -834 · handoff -981 |

### Mobile smoke — the V13 gate against the candidate

| Viewport | V13 mobile gate (1vh steps) | candidate (2vh steps) |
|---|---|---|
| 320x568 | 14.8 screens (route 6, lower 8.6) · near-empty 0vh · unsettled 0 · doc 8385px | 14.1 screens (route 6, lower 8) · near-empty 0vh · unsettled 0 · doc 8034px |
| 390x844 | 11.9 screens (route 6, lower 5.8) · near-empty 0vh · unsettled 0 · doc 10021px | 11.6 screens (route 6, lower 5.5) · near-empty 0vh · unsettled 0 · doc 9777px |
| 768x1024 | 10.7 screens (route 6, lower 4.6) · near-empty 1vh · unsettled 0 · doc 10917px | 10.5 screens (route 6, lower 4.4) · near-empty 0vh · unsettled 0 · doc 10702px |

**Reading the journey table.** Each half of a journey ends where the next begins, so a "route"
half's last samples cross the pinned end into the geared page, and a "reverse route" half starts
wherever the reverse lower half overshot into the route (4057px on the baseline, whose ungeared
page coasted 472px past the handover; 4497px on the candidate, whose geared page coasts 44px). The
per-half **peak** therefore includes the hand-over on the candidate (710 / 1174 px/s at the
crossing), which is why the scroll-contract table below — measured inside each region, from rest —
is the number for the ceiling. Per pixel, the route's pace is the same on both builds: reverse
314 px/s (baseline) against 317 px/s (candidate) at 1440×900; forward 345 against 373, the
difference being the candidate's geared final 500px of the half. The lower world is the finding:
**10.1s → 3.8s** at a normal wheel and **10.2s → 3.1s** at a hard flick at 1440×900;
**11.6s → 4.4s** and **11.7s → 3.4s** at 1920×1080.

**Reading the scroll contract.** The route ceiling is set in code (`ROUTE_MAX_RATE × routeSpan` per
second, 472 px/s at 1440×900) and is asserted unchanged below the pinned end by the unit tests
(`tests/unit/spatial-filter.test.ts`, "V14 page gearing"). The probe's peak-over-100ms measurement
of it varies with machine load run to run — 520 on the baseline, 522 / 558 / 615 across three
candidate runs of identical governor code — because it stamps each sample's time before the
scroll position is read. Route gentle reads 462 against 465. The candidate's page ceiling is the
geared one: **1981 px/s** aggressive against the baseline's 522, with the coast after a hard flick
down from 524px / 900ms to 192px / 100ms, and reverse still one notch with zero wrong-way travel.
One candidate run of the probe read the gentle lower run at 0 px/s; it did not reproduce in three
further runs on either build (60px per notch, exactly the input), and the committed file is the
clean rerun.


### Runtime, validation

| Check | Result (production build of the committed code) |
|---|---|
| typecheck · lint · `format:check` | 0 · 0 · pass |
| unit | **562 / 562** (29 files) |
| build | 15 / 15 routes |
| Chromium e2e | **224 / 224** |
| WebKit e2e | **220 / 224** — the two Phase 7 environment cases (Safari's Tab default; one governed-camera arrival) and two cut-region arrival cases, classified in §3a below |
| console / runtime / hydration | **0** across the 10 content routes (`after/metrics/runtime.txt`); the 404 route's three font-preload notices are pre-existing |
| CLS | ≤ 0.0388 (home), 0 elsewhere |
| images | 0 broken · 0 unsized · 0 empty-alt |
| horizontal overflow | **0 of 99** route × width combinations |
| scene fit | every composition clears its frame at 1366 / 1440 / 1536 / 1920 / 2560 (table above) |
| mobile smoke | 14.1 / 11.6 / 10.5 screens at 320 / 390 / 768, sharp, 0vh near-empty, 0 unsettled |
| frame time | parity with the baseline in all three traverses (table above) |

### 3a. WebKit — the two cut-region arrival cases

On this branch's full WebKit run four tests failed: the two Phase 7 environment cases, and two more
— `spatial-v5.spec.ts` "the surface opens monotonically and stays open" (last sample 783.36px, the
cut's closed value) and `spatial.spec.ts` "every break rail closes onto the frame at the cut"
(best 1440px, the rails fully open). Both sweep the cut region with `scrollTo` jumps and wait for
the camera with a bounded stability poll. Measured, rather than assumed:

- **The geometry is identical on both engines and monotonic.** Mapping the cut's translateY
  against progress in 0.004 steps on the candidate gives the same table on Chromium and WebKit:
  143 → 92 → 42 → 32.3px, open from 0.672 and still open at 0.712, past the sweep's end. The rails
  read 0px at `BREAK_CUT` on WebKit once settled, on both builds.
- **After a large `scrollTo` jump, this machine's software-rendered WebKit leaves the camera
  stationary for more than two seconds before the glide begins — on both builds** (candidate and
  baseline both read the closed value for 2.4s at 0.668 and arrive later). The tests' stability
  heuristic (six identical 120ms reads after ten polls) accepts that stall as arrival and records
  the pre-arrival value. V7 and V8 tuned this heuristic twice for the same reason (the tests' own
  comments record a 783px mid-journey read).
- **Frame time on WebKit is not the cause and did not regress.** Cut region: candidate 33ms a
  frame against the baseline's 84–90ms; whole route 47–49ms against 47–53ms
  (`{after,baseline}/metrics/frame-time-webkit-{cut,route}-1440x900.json`). In the region these
  tests sweep the candidate renders 2.7× faster than the baseline.
- **The same two tests against the baseline build, served on the Playwright port today, failed
  4 of 5 runs with the identical values** (1440 and 783.36); one surface run passed.

Classification: **ENVIRONMENT** (this machine's WebKit, both builds), with a **TEST** component —
the settle heuristic cannot tell a post-jump stall from arrival. Not a V14 regression. Not changed
here: the remedy is in the tests' arrival detection, which is engineering and belongs to Opus QA's
list if it takes it; no assertion was weakened. Chromium passes both.

## 4. Mobile — the V13 gate is frozen; what moved anyway

Every change above is scoped to `lg` and above by class or by the `mobile` branch, and the mobile
route probe (`after/mobile/metrics/mobile-route.json`) is in §3. The deltas that exist:

- **The lower page is slightly shorter on mobile** — the smoke at 2vh steps reads 14.1 screens at
  320×568 (V13 gate: 14.8), 11.6 at 390×844 (11.9), 10.5 at 768×1024 (10.7). The route half is
  unchanged (6 screens at 320); the difference is the lower page: `HowIBuild`'s restructure and
  the removal of `DriftSettle` and `DriftRoute` (which drew on mobile too). The mobile approach
  intervals (`gapVh`) are byte-identical to V13.
- The footer's resolved map is `hidden` below `lg`; the terminus map lives in the desktop world
  only; the desktop inspector buttons are `hidden` below `lg` and the below-`lg` inspector is the
  V13 one.
- `SystemPOV` rows and the scene's mono labels keep their base (`mono-meta`) classes below `lg`.
- ~~Not re-run on mobile in this pass: the touch-target probe and the 320–768 overflow matrix~~ —
  both run by the Opus QA: 0 standalone sub-44 targets across 8 pages × 6 widths; overflow 0 of 99.
- **Three further mobile composition deltas, found by the Opus QA and not listed above**
  (`.ai/handoffs/OPUS-V14-QA-RETURN.md` §6.1, with measurements). All three come from shared
  markup rather than a mobile decision, none moved a mobile health metric, and none was changed —
  they are the owner's call: (a) every project scene is one `gap-8` (32px) taller below `lg`,
  because the scene grid gained the identity row as a third child and `gap-8` carries no `lg:`
  prefix; (b) the 0.972 → 1 arrival scale was removed on mobile as well as desktop — D-035 argued
  it for desktop sharpness, and the baseline applied it to every scene; (c) Software Factory's
  mobile case action moved from `mt-8 flex` to `mt-4 inline-flex`. The minimal mechanical repair
  for (a) — scoping the detail block's `mt-8` to `lg:` — is recorded there and was not taken.

## 5. Observations for Opus QA (not V14 defects; both builds behave the same)

- **A forward traverse begun ~400ms after a programmatic `scrollTo` runs ungoverned for its first
  notches**: `frame-time-probe`'s `forward-2` completes 4500px in ~3.5s / 26–31 notches on both
  builds, while the same traverse begun 1.5s after the jump is governed (14.1s). The governor is
  identical on both builds and no reader reaches the route that way with a wheel; recorded here
  because the probe shows it, not because V14 touched it.
- WebKit: the two Phase 7 environment failures are expected to remain; see §3 for the actual
  count on this build.
- The 404 route's three font-preload notices are pre-existing (Phase 7).

## 6. Artifacts

- `docs/review/v14-owner-visual/README.md` — the owner review package index
  (forward / reverse / lower-world recordings, zoom stills at 100 / 80 / 67 / 50, focus frames at
  1366 / 1440 / 1920, before/after by system, every metric). Recordings are git-ignored by the
  repository's `docs/review/**/recordings/` rule and exist in the working tree; `journey.json`
  carries their numbers.
- `docs/review/v14-owner-visual/{baseline,after}/journey.json`,
  `metrics/{scroll-contract,dead-scroll}-1440x900.json`, `metrics/frame-time-1440x900.json`,
  `after/metrics/{scene-fit,route-focus}.json`, `after/metrics/runtime.txt`,
  `after/mobile/metrics/mobile-route.json`
- `docs/review/v14-owner-visual/iter1 … iter4` — the working record of the four internal
  iterations, each reviewed A–F in motion before the next
- Tools: `tests/tools/v14-baseline.mjs`, `scene-fit-probe.mjs`, `frame-time-probe.mjs`;
  `tests/unit/route-focus-dump.test.ts` writes the focus table from the route module
- Records: `docs/DECISIONS.md` D-034 … D-040; `docs/DESIGN_SYSTEM.md` §38;
  `docs/FROZEN_BOUNDARY.md` §6 (the desktop boundary reopened by owner decision — what moved and
  why); `docs/REVIEW_POLICY.md` tool rows

## 7. What this pass did not do

- It did not declare acceptance. FINAL FREEZE / OWNER ACCEPTED / READY TO MERGE are the owner's.
- It did not touch `main`, V13, the mobile art direction, any external repository, the recovery
  bundle, or any project fact. No content was written or changed.
- It did not add a per-region scroll multiplier; the gearing is a derived ratio with a stated
  derivation (D-039).
- It did not run the touch-target probe or the sub-1024 overflow matrix (Opus QA's list).
