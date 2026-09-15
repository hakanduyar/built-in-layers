# STATE — current truth only

Replace entries when they go stale. History belongs in Git and `docs/`, not here.

_Updated: 2026-09-16 (V14.14 — navigator refinement: clearance and destination preview)_

| Field | Value |
|---|---|
| Project | Built in Layers — Hakan Duyar portfolio |
| Repo | `C:\GitHub\portfolio` |
| Branch | `feature/owner-visual-acceptance-v14` — created from exactly `5670234` |
| Last application checkpoint | `76897e2` — V14.14 navigator refinement, the instrument's clearance and its destination preview (`.ai/handoffs/V14_14_NAVIGATOR_RETURN.md`; verify the tip with `git rev-parse HEAD`), on the V14.13 motion feel gate `5ccbf5c` / `d85bde4` (`.ai/handoffs/V14_13_MOTION_FEEL_RETURN.md`), on the V14.12 motion gate `1944e25` / `e287f90` (`.ai/handoffs/V14_12_MOTION_RETURN.md`), on the V14.11 engineering gate `e37e77b` / `0d350d0` (`.ai/handoffs/V14_11_ENGINEERING_RETURN.md`), on the V14.10 navigation refinement `60a6708` / `1ec2726` (`.ai/handoffs/V14_10_NAVIGATION_REFINE_RETURN.md`), on the V14.9 navigation gate `b244a4d` / `0f8ad8a` (`.ai/handoffs/V14_9_NAVIGATION_RETURN.md`), on the V14.8 visual gate `b385675` / `69d57f5` (`.ai/handoffs/V14_8_VISUAL_GATE_RETURN.md`), on the V14.7 Codex timing gate `2d40c65` / `518984a` (`.ai/handoffs/V14_7_CODEX_TIMING_RETURN.md`), on the V14.6 Codex motion gate `84fb5a9` / `bd3d840` (`.ai/handoffs/V14_6_CODEX_MOTION_RETURN.md`), on the V14.5 visual gate `b8ff8b8` / `516946a` (`.ai/handoffs/V14_5_VISUAL_GATE_RETURN.md`), on the V14.4 checkpoint `f9b0a72` / `ec37eb1` (`.ai/handoffs/V14_4_OWNER_CORRECTION_RETURN.md`), on the V14.3 Gate E checkpoint `51b3387` / `4810181` (`.ai/handoffs/V14_3_GATE_E_RETURN.md`), on the V14.3 Gate D checkpoint `5bbccb6` / `b4921e1` (`.ai/handoffs/V14_3_GATE_D_RETURN.md`), on the V14.2 Gate C checkpoint `5a4147d` / `2eb06c1` (`.ai/handoffs/V14_2_GATE_C_RETURN.md`), on the V14.2 Gate B checkpoint `de538bf` / `816b408` (`.ai/handoffs/V14_2_GATE_B_RETURN.md`), on the V14.1 Fable gate `f4bdab3` and its Opus QA `8c6045c`. That sits on the V14.1 engineering checkpoint `c2ba26a` / `fa7c72c`, which sits on the V14 visual candidate `35c2c58` (`.ai/handoffs/FABLE-V14-RETURN.md`) |
| Scroll safety tag | `safety-v14-scroll-baseline` → `35c2c58`, annotated and pushed — the governed scroll the owner accepted, recorded in `docs/review/v14-scroll-baseline/`. **Not touched by the Fable gate** (`V14_1_FABLE_TO_OPUS.md` §6) |
| Origin | verify with `git rev-parse origin/feature/owner-visual-acceptance-v14` |
| V13 | `feature/project-architecture-v13` at `5670234` — not mutated |
| `main` | `16d3ec0` — untouched, never merged to |
| Working tree | clean except the intentional untracked `docs/review/v12-codex-gate/codex-gate-checkpoint.bundle` (22.6 MB recovery bundle, deliberately not committed) and the git-ignored `docs/review/**/recordings/` |
| Baseline worktree | retired; recreate with `git worktree add --detach <dir> 5670234` (V13 baseline) or `<dir> fa7c72c` (the state before this gate) for any further A/B |

## Frozen systems

| System | Frozen at | Status on this branch |
|---|---|---|
| Desktop spatial | 2026-09-02, `0752883` | **Reopened by owner decision** (V14 brief §3; V14.1 brief). What moved and why: D-034 … D-040 (V14), D-043 … D-047 (V14.1), `docs/FROZEN_BOUNDARY.md` §6 and §6.1. The scroll files are byte-identical to `fa7c72c` |
| Case-study system | 2026-09-03, `5000201` | Frozen — reopened for colour only on the owner's Gate D instruction (no orange): hover tones, the active dot, the card boundary, the diagrams' accent strokes, one attribute on `Figure`; no layout touched (`docs/FROZEN_BOUNDARY.md` §6.4) |
| Mobile | 2026-09-04, `8a24e03` | Frozen — art direction untouched; the mobile route probe at the recorded step is identical to the V14.1 engineering record but for one 0.001 pixel-row mean at 320 (`V14_1_FABLE_TO_OPUS.md` §6) |

Fingerprints and the sanctioned-move ledger: `docs/FROZEN_BOUNDARY.md` (§1 list, §5 ledger, §6 the
V14 reopening, §6.1 the V14.1 gate). On this branch the §4 loop prints more than the ten `MOVED:`
lines §5 accounts for, by design; the standard for those moves is the owner's brief, not a measured
regression.

## Current phase

**V14 — owner visual acceptance recovery. V14.1 FABLE VISUAL GATE COMPLETE · FINAL OPUS QA
COMPLETE (PASS) · V14.2 VISUAL GATE B COMPLETE · V14.2 VISUAL GATE C COMPLETE · V14.3 VISUAL GATE D
COMPLETE · V14.3 VISUAL GATE E COMPLETE · V14.4 OWNER VISUAL CORRECTION COMPLETE · V14.5 VISUAL GATE
COMPLETE · V14.6 CODEX ENGINEERING GATE 1 (MOTION) COMPLETE · V14.7 CODEX ENGINEERING GATE 2
(TIMING + SPACING) COMPLETE · V14.8 VISUAL GATE COMPLETE · V14.9 NAVIGATION GATE COMPLETE · V14.10 NAVIGATION REFINEMENT COMPLETE · V14.11 ENGINEERING GATE COMPLETE · V14.12 MOTION GATE COMPLETE · V14.13 MOTION FEEL GATE COMPLETE · V14.14 NAVIGATOR REFINEMENT COMPLETE. Owner acceptance: PENDING.**

**V14.14 navigator refinement (Claude Opus 5, single writer; D-060,
`.ai/handoffs/V14_14_NAVIGATOR_RETURN.md`, package `docs/review/v14.14-navigator/README.md`).**
Both goals came from the independent V14.13 Codex review's two MINOR findings. THE INSTRUMENT NOW
CLEARS THE GROUND IT READS, AND ONLY THERE: through the route the camera's 14vh inset already leaves
its band empty, but below the pinned route the page is an ordinary document whose lines pass under
it — measured at 1920×1080 the Field Notes landing put the readout and rail on How I Build's last
line, glyph over glyph. A field of the page's own paper, sized to the cluster and masked away at its
rim (no full-bleed edge, no rule, no border, no shadow), exists only at and below the pin where the
ground is always paper, so it can never appear over the black transition; it sits outside the
difference-composited layer. Both sizes go from one uncovered line in the band to ZERO, and no
lower-world content moved. THE TICKS NAME THEIR DESTINATION under the pointer or on keyboard focus
and nowhere else, absolutely positioned and `aria-hidden` so the rail neither shifts nor gains a
second accessible name. Two defects were found while verifying and fixed: the preview inherited a raw
ink colour and rendered faint under difference compositing, and V14.11's ahead-state opacity rule was
forcing it visible on every station ahead of the reader. **MOTION IS FROZEN AND BYTE-IDENTICAL** —
`lib/spatial/**` and `SpatialCamera.tsx` have an empty diff. Unit 595/595; focused Chromium 128
passed / 2 skipped with axe; navigation 21 passed including four new contracts; first paint settled
at both sizes; zero mobile layout differences.

**V14.13 motion feel gate (Claude Opus 5, single writer; D-059,
`.ai/handoffs/V14_13_MOTION_FEEL_RETURN.md`, report `docs/review/v14.13-motion-feel/REPORT.md`).**
SPEED NOW FOLLOWS DEMAND WHILE DISTANCE STAYS BOUNDED. `ROUTE_MAX_RATE` was a flat ceiling doing two
jobs: the route could not be crossed in under ~9.5s however hard the reader pushed, and the same flat
rate drained the 540px intent queue, so letting go left the page travelling 1.6s. The per-frame
budget now scales with the squared fraction of the UNCHANGED lead cap that pending intent occupies —
1× at reading pace, 4× under sustained intent — so speed is granted and travel is not. Measured at
1536×864: route aggressive peak **431 → 1259 px/s**, coast 502 → 288px, reading pace 415 → 474 px/s,
geometry identical, and reverse IMPROVED from 2 notches to **1 notch at 0 wrong-way px**. A
controlled check proves the residual is bounded coast, not forward debt (0px after the queue
drains). A WHEEL NOW OUTRANKS AN IN-FLIGHT NAVIGATION: the governor used to read the browser's
re-applied smooth-scroll target as someone else driving and stand down, so a wheel 120ms into a
navigation still let the document travel 503px to the navigation's destination — now **0px over
6ms**. THE CAMERA RESPONSE IS DELIBERATELY UNCHANGED: two relaxations were built and measured; the
only one that produces a real trail at 60Hz costs the reverse guarantee (0 → 3px wrong-way), and the
other buys ~1px of trail, below perception, while breaking V14.12's 80ms settling contract. Product
diff is two files; camera tails ≤1.73px; first paint settled at both sizes; zero mobile layout
differences; unit 595/595; focused Chromium 113 passed / 2 skipped.

**V14.12 motion / readability gate (implemented by Codex CLI 0.153.4 under owner brief; Claude
orchestrator only; D-058, `.ai/handoffs/V14_12_MOTION_RETURN.md`, report
`docs/review/v14.12-motion/REPORT.md`).** THE CAMERA NOW TRACKS THE READER INSTEAD OF GLIDING AFTER
THEM. Measurement separated two mechanisms: the filter's own settling, and `glideStep`, which capped
VISUAL progress a second time after the document's wheel governor had already paced the input — the
reason a navigation jump left a large visual backlog. Desktop presentation no longer applies
`glideStep`, and the desktop filter branch responds in 12ms falling to 8ms per stage (was 48 → 22),
capped at 0.7 frame intervals; both fractional stages remain, so this is a tighter camera, not
pass-through, and MOBILE KEEPS the original response and the glide cap. Movement continuing after
the document stops, 1440×900: aggressive forward 71.17px/250.5ms → **1.96px/16.9ms**, navigation +
wheel 1496.51px/997.2ms → **0.49px/0ms**; the P95 pursuit gap falls 296.13 → 26.02px. Reverse now
turns on the NEXT presentation frame with 0px wrong-way travel (was 4 frames later after 27.95px).
No opacity curve, `Reveal`, `EditorialDrift` or departure scale was changed — the traces did not
implicate them — so `systemPov.ts` is untouched and the V14.7/V14.8 curves need no re-acceptance.
Product diff is 28 lines across `cameraFilter.ts` and `SpatialCamera.tsx`. First paint settled at
both sizes; mobile unchanged; unit 595/595; focused Chromium 128 passed / 2 skipped with axe.
**This is a real change of FEEL and needs the owner's eyes, not only the numbers.**

**V14.11 engineering gate (implemented by Codex CLI 0.153.4 under owner brief; Claude orchestrator
only; D-057, `.ai/handoffs/V14_11_ENGINEERING_RETURN.md`, report
`docs/review/v14.11-engineering/REPORT.md`).** THE INSTRUMENT NOW REPORTS THE CAMERA'S SUBJECT: a
scene station is selected from the camera's own filtered progress (published read-only by the new
`lib/spatial/routePresentation.ts`) using the ACQUIRED range the acquisition frame already applies,
while the lower world still uses document position — Kıvılcım is first named at 927ms with its
evidence INSIDE the viewport, where before it was named at 205ms with the evidence 2319px outside.
The navigator's marks composite against the material beneath them so it stays legible through the
interlocking black (274 px above mean channel 150 on a settled black frame, against 0) with
`SceneBreak` and the break timing untouched; the cue's cancellation is latched so it cannot restart,
and a disabled direction no longer animates. THE ROUTE/NATIVE HANDOFF IS A BLEND: a finite
0.75-viewport band below `pinnedEnd` mixes native displacement with the existing governed intent in
both directions, so downward steps ramp 20/48/48/56/48/48/53/70/108/207/341/400 where they jumped
64 → 452, and upward ramps instead of braking a viewport early; the lower world keeps native-order
speed (7273 px/s, 0 coast) and the route model is untouched. KIVILCIM'S FRAME REGISTERS ON ITS
EVIDENCE: −58.86px inside its diagram → +12.72px clear at 1440, −64.75 → +14.00 at 1920, matching
the other scenes, every evidence edge unmoved. Route geometry, `lib/spatial/{sceneRoute,scenes,
cameraFilter}.ts` and `SceneBreak` byte-identical; mobile zero layout differences; unit 593/593;
focused Chromium 128 passed / 2 skipped. **The camera-lag / perceived-blur problem is explicitly NOT
addressed here and still owes its own measured motion gate.**

**V14.10 navigation refinement (Opus 5; D-056, `docs/DESIGN_SYSTEM.md` §48,
`docs/FROZEN_BOUNDARY.md` §6.10, `.ai/handoffs/V14_10_NAVIGATION_REFINE_RETURN.md`).** THE GOVERNED
REGION NARROWED FROM THE DOCUMENT TO THE ROUTE: below the pinned route the wheel is handed back to
the browser, so the ordinary page has native rate, native momentum, no ceiling and no coast of ours.
Measured at 1536×864, the lower world goes 1543 → **8333 px/s** with coast 471 → **0**; the route
keeps its accepted model (aggressive 516 → 529 px/s, coast 494, reverse 2 notches / 0 wrong-way px,
geometry identical) and every module under `lib/spatial/` is byte-identical, so
`safety-v14-scroll-baseline` is not moved. The rail is centred on the frame with ticks and a readout
only; PREVIOUS and NEXT became one quiet chevron on each frame edge, stepping the same canonical
station list as the ticks and the arrow keys; and on a reader's first visit of a session both arrows
breathe twice and stop for good, the cue also ending the instant they scroll. First paint settled at
1440 and 1920; mobile untouched by construction and identical on every layout measure; unit
589/589; Chromium `navigation` 17 passed plus 111 passed / 2 skipped with axe.

**V14.9 navigation gate (Opus 5; D-055, `docs/DESIGN_SYSTEM.md` §47,
`.ai/handoffs/V14_9_NAVIGATION_RETURN.md`).** One shared source of truth
(`lib/spatial/routeNavigation.ts`): fourteen stations — the nine real camera scenes, the four real
drift sections, the finale — from which the navigator's ticks, the previous/next controls, the arrow
keys and the active readout are all derived, so none of them can disagree. A station must name a
real scene or section, so no animation state is addressable. The navigator is fixed at the lower
rail's `4vw` datum at `lg` and up: the current station's index and name, and the route drawn
horizontally in the world's own dotted-ahead / solid-behind grammar with one tick per destination
and the terminus mark at either end as PREVIOUS and NEXT. Navigation is ONE `window.scrollTo` on the
document — the mechanism `recenterOnScene` already uses — so the camera travels the real route
through the real cut; the active station is read from `window.scrollY` only, never set by the
control pressed, so free scrolling and the controls share one signal. ArrowLeft/ArrowRight step;
every other scrolling key is left to the browser. Absent below `lg`, under reduced motion, without
JS, and until the reader moves off the top. Measured: 5/5 stations arrive over 19–66 moving frames
(388–1150ms), zero teleports, free scroll resumes immediately; route geometry, first paint and the
mobile record are unchanged; unit 589/589; focused Chromium 125 passed / 2 skipped, axe included.

**V14.8 visual gate (started by Fable 5.1, completed by Opus 5 after the Fable limit was reached
mid-gate; D-054, `docs/DESIGN_SYSTEM.md` §46, `.ai/handoffs/V14_8_VISUAL_GATE_RETURN.md`).** Beneath
SYSTEMS the three straight rules now carry a classification — index, name and the real definition —
hung off a dotted descent, with each stratum's state at the word's right edge (SURFACE acquired,
FLOW and SYSTEM detected); on the black the same strata carry the state the cut changed them to
(SURFACE released, SYSTEM acquired, where UNDERNEATH lands). The acquisition frame's brackets stand
off a detected composition and close onto its edges as it is acquired, and the state word is a ruled
box that fills with ink. From `min-width: 1536px` the homepage's lower sections and the finale
re-resolve the type-scale theme variables through linear clamps floored at today's size (about +12%
at 1920, +33% at 2560, capped), with `--drift-w` and the finale's max-width on the same schedule;
1440 and 1536 are byte-identical. The V14.5 rails and timing, the V14.7 composition timing, the
scroll modules, Selected Systems and `tests/` are untouched; SYSTEMS verified forward and reverse;
first paint settled at 1440 / 1920 / 2560; mobile identical to the V14.6 record; unit 572/572;
focused Chromium 96 passed / 2 skipped. WebKit and the full matrix not run.

**V14.7 Codex engineering gate 2 — timing and spacing (implemented by Codex CLI 0.153.4 under owner
brief; Claude orchestrator only; `.ai/handoffs/V14_7_CODEX_TIMING_RETURN.md`, report
`docs/review/v14.7-codex-timing/REPORT.md`).** A scene's composition opacity was driven by
`sceneApproach()`, whose reach is the SHORTER of its two adjacent route segments: UNDERNEATH had
185px against Built in Layers' 433px, and the four-stops sentence read its 183px exit leg rather
than the 433px leg it actually arrives over. A new `sceneCompositionPresence()` maps composition
opacity for those two scenes from a window derived from the neighbouring focus progresses, leaving
the signed approach (and therefore the acquisition frame and depth) untouched. UNDERNEATH now holds
and releases over 174px / 209px, matching Built in Layers; four stops reaches full readability after
95px / 153px (was 241 / 329). About is centred in its existing 64vh stage (first/last text
16/173 → 100/89px at 1440×900) with Field Notes above the frame and the finale below it, unchanged.
`scenePresence` and `systemsWordPresence` are byte-identical; route geometry, Gate 1 wheel behaviour
and first paint reproduce their records; mobile geometry identical; unit 572/572; focused Chromium
96 passed / 2 skipped. WebKit and the full matrix not run.

**V14.6 Codex engineering gate 1 — motion (implemented by Codex CLI 0.153.4 under owner brief;
Claude orchestrator only; `.ai/handoffs/V14_6_CODEX_MOTION_RETURN.md`, report
`docs/review/v14.6-codex-motion/REPORT.md`).** Wheel: an isolated notch is eased in and out inside
the governor's existing budget (steps 2/4/6/7/8 rather than 8 from the first frame) with reach,
delivery and settle unchanged, and the lower world's aggressive peak is 1957 → 1657 px/s (−15%);
`routeSpan` 4500, `leadCapPx` 540 and reverse unchanged. First load: the pre-hydration tree painted
at `zoom: 1` with the hero 44px left / 56px down of its settled place; the boot script now sets
`data-world-preview="desktop"` and a boot-gated desktop CSS block lays the same scenes in the
camera's initial frame, so the first painted frame is pixel-identical to settled
(`compositionMaxDeltaPx` 0, `changedPixelsOver8` 0) with nothing hidden. Blur: the numeric probe
finds no per-frame acutance loss (1.0727 → 1.0702, moving measures sharper than rest); the
hydration repaint that read as softening is gone. Mobile byte-identical at 390×844; unit 569/569;
focused Chromium 83 passed / 2 skipped. WebKit and the full matrix not run.

**V14.5 visual gate (Fable-only; D-053, `docs/DESIGN_SYSTEM.md` §45,
`.ai/handoffs/V14_5_VISUAL_GATE_RETURN.md`).** SYSTEMS after `f4bdab3`: a short muted entrance then
whole two frames before focus, three straight rules with their names beneath the word, the V4
interlocking rails on desktop with the underlying system in paper on the black through the dwell;
the V14.4 opacity cover removed. The acquisition frame states DETECTED / ACQUIRED / RELEASED. The
terminus and finale registers are gone; Selected Systems is five entries on rules (station, name at
heading scale, classification, the record on one line, three labelled layer marks). Scroll modules
byte-identical; first paint, isolated impulses, runtime and the mobile probe reproduce the records;
Chromium 110 passed (two seam tests skipped) with `home` and `smoke` re-run green; unit 564/564.
Package: `docs/review/v14.5-visual-gate/README.md`. WebKit and the full matrix not run.

**V14.4 owner visual correction (Fable-only; D-052, `docs/DESIGN_SYSTEM.md` §44,
`.ai/handoffs/V14_4_OWNER_CORRECTION_RETURN.md`).** SYSTEMS is read whole a tenth into its approach
and held until the black state takes the frame; the cover is ink, decisive, carrying the underlying
system in paper; nothing is drawn beneath the word before the cut (the desktop seam, recess and
rising strata removed; the world's strata exist from the cut on; the cut strokes and landing corner
gone). The terminus and finale maps are typographic route registers; `RouteMap.tsx` is deleted.
Major beats open with 160px, About is a 64vh stage with the name at 7vw, the finale waits 80px,
How I Build's second floors drawing is gone (lower world 3194 → 3556 px at 1440×900). Scroll modules
byte-identical; first paint, isolated impulses, scroll contract, runtime and the mobile probe
reproduce the records; Chromium 111 passed (two seam tests skipped with reason); unit 569/569.
Package: `docs/review/v14.4-owner-correction/README.md`. WebKit and the full matrix not run.

**V14.3 Gate E (Fable, scoped to earlier clarity, lower-world breathing room, microtext; D-051,
`docs/DESIGN_SYSTEM.md` §43, `.ai/handoffs/V14_3_GATE_E_RETURN.md`).** On desktop a scene's
composition and its acquisition frame arrive a quarter of the approach earlier; the lower sections
reveal as their top enters, the register's marks are full by 16% of the passage at a readable
weight, About's name by 30%; the three major beats open with 128px above them and the finale with
32px more (lower world 3000 → 3194 px at 1440×900); the state word is gone, classifications and
the index link are label size, the verification line is ink. Mobile behaviour is byte-for-byte
(`useIsDesktop`). Scroll modules byte-identical; first paint, isolated impulses, runtime and the
mobile probe reproduce the records; Chromium 112/112; unit 569/569. Package:
`docs/review/v14.3-gate-e/README.md`. WebKit and the full matrix not run (targeted gate).

**V14.3 Gate D (Fable, scoped to duplicated corner marks, all visible orange, generic node-network
graphics; D-050, `docs/DESIGN_SYSTEM.md` §42, `.ai/handoffs/V14_3_GATE_D_RETURN.md`).** One corner
per corner: the registration tick is not drawn under a bracket on desktop, the plate ticks inside
the brackets are hidden on the tour, the affordance's borrowed corner is gone. The signal tokens
are retired and every usage is ink or graphite, the owned diagrams' accent strokes included; no
bright accent replaces them. The map under the opened SYSTEMS surface is removed (the strata and
the Gate B descent remain) and the branch junction ring is gone from the two maps that stay.
Scroll modules byte-identical; first paint, isolated impulses, runtime and the mobile geometry
reproduce the records (mobile pixel-row ink +0.001–0.005 where orange became ink); Chromium
224/224; unit 569/569. Package: `docs/review/v14.3-gate-d/README.md`. WebKit and the full matrix
not run (targeted gate). Gate E not started.

**V14.2 Gate C (Fable, scoped to Selected Systems, How I Build, Field Notes, About, the final CTA;
D-049, `docs/DESIGN_SYSTEM.md` §41, `.ai/handoffs/V14_2_GATE_C_RETURN.md`).** The lower world is
one system on desktop: Selected Systems is a section drawing (strata as floors, a descent per system
to the deepest documented layer, the record as footing; Professional Systems unsurveyed, nothing
fabricated); How I Build is the operator's method statement and the same floors beside the four
commitments; Field Notes is one entry on one rule; About is the operator set as the systems were
set; the finale stands on the rail's datum with its axis ending on the action and the caption
SYSTEM RESOLVED · COMPLEXITY MAPPED · OPERATOR ADDRESSABLE. Scroll modules byte-identical; page
length 7806 → 7561 at 1440×900; first paint, discrete isolated impulses, scroll contract, frame
time and the mobile route probe reproduce the records; Chromium 112/112; unit 569/569.
Package: `docs/review/v14.2-gate-c/README.md`. The full matrix and WebKit were not run (targeted
gate).

**V14.2 Gate B (Fable, scoped to SYSTEMS → UNDERNEATH, the landing, the return to the surface;
D-048, `docs/DESIGN_SYSTEM.md` §40, `.ai/handoffs/V14_2_GATE_B_RETURN.md`).** On desktop the cut is
no longer ink: the frame is covered by the underside of the surface — the recess, in the frame's own
space, carrying the section the reveal drew at rest (three strata, the descent to SYSTEM) — on the
same protected timing and opacity contract, arriving by opacity while the world's seam finishes
rising; UNDERNEATH stands on the same SYSTEM line; reverse is the same event backwards. Back on
the surface is a paper plane from the SURFACE rule down, rising into the frame as it resolves.
Mobile keeps the V4 rails. Scroll modules byte-identical; first paint, discrete scroll, scroll
contract, frame time and the mobile route probe reproduce the records; focused Chromium 99/99.
Package: `docs/review/v14.2-gate-b/README.md`. The full matrix was not run (targeted gate).

Record of V14.1:

**V14.1 Fable gate (art direction only).** The owner's remaining findings were corrected as
systems: the route as a track (ahead / travelled as different drawings, drawn only in the open;
D-043); the ground drawn, not filled, and presence as a state change (D-044); the acquired detail —
Software Factory, Kıvılcım and JointLedger frame the subsystem that is their argument, whole
drawing one INSPECT away (D-045); strata as floors, UNDERNEATH on the SYSTEM line, the terminus map
clear of the surface return (D-046); the route continued down the page as one rail with a station
at every section, Selected Systems as the map's index, How I Build as rows, About as a station, the
finale map carrying the lower page (D-047). Account: `.ai/handoffs/V14_1_FABLE_TO_OPUS.md`; the
design record `docs/DESIGN_SYSTEM.md` §39; the owner package `docs/review/v14.1-fable/README.md`.

**Scroll code changed: NO.** `lib/spatial/{cameraFilter,sceneRoute,scenes,worldFit,
planeChoreography,projectGround,editorialDrift}.ts`, `SceneBreak.tsx`, `SystemsWord.tsx`, `app/` are
byte-identical to `fa7c72c`; `SpatialCamera.tsx` gained one argument on one call (`scenePresence(value,
mobile)`) so the re-cut presence curve is desktop-only. Initial paint `FIRST PAINT == SETTLED`;
discrete scroll 120px per notch, delivered 1.000, coast 0; frame time 16.7 / 16.8 / 16.8ms a frame
(forward, second forward, reverse) against the recorded 17.2–17.3.

**V14.1 engineering (`c2ba26a`):** the initial-load flash fixed (D-041); sharpness and discrete
scroll measured and left alone (D-042). `.ai/handoffs/V14_1_ENGINEERING_TO_FABLE.md`.

Record of V14: `.ai/handoffs/FABLE-V14-RETURN.md`; brief `.ai/handoffs/V14-OWNER-BRIEF.md`; V14 owner
package `docs/review/v14-owner-visual/README.md`; independent QA `.ai/handoffs/OPUS-V14-QA-RETURN.md`
(PASS WITH DOCUMENTED NON-BLOCKERS).

**Final Opus QA (`.ai/handoffs/OPUS-V14_1-QA-RETURN.md`), independent, on its own fresh production
build of the application tree `f4bdab3`: PASS, no defect, no source change.** Protected invariants
re-verified against the recorded baselines: the scroll modules byte-identical; `FIRST PAINT ==
SETTLED` at 1440 / 1920 / 1366; every isolated wheel impulse 120px, delivered 1.000, coast 0, with
`routeSpan` 4500 and the 540px lead cap unmoved; reverse one notch, 0 wrong-way px; frame time
17.1 / 17.9 / 17.4ms on the route and **16.7ms with 0 frames over 25ms on the new lower page**;
mobile identical but for one 0.001 sampling mean. Chromium 224/224, WebKit 220/224 (the documented
four), console 0 on the content routes, hydration 0, overflow 0 of 99, CLS max 0.0418 (good).
Documented there and not acted on: the document is 69px taller at 1440×900 (composition, not
scroll — §3.1), and the Fable handoff's "seven break rails" is 11 in the DOM in code neither gate
touched (§3.2).

Validation at the Fable checkpoint (production build): typecheck 0 · lint 0 · `format:check` 0 ·
unit **562/562** · build ✓ · Chromium **224/224** · console/runtime/hydration 0 on the content
routes · images 0 broken / 0 unsized / 0 empty-alt · overflow **0 of 99** · scene fit clear at
1366 / 1440 / 1536 / 1920 / 2560 · mobile route probe identical to the engineering record (one
0.001 delta) · initial paint PASS · discrete scroll NORMAL · journeys recorded on an idle machine
(`docs/review/v14.1-fable/after/journey.json`, README §C). WebKit not re-run on this gate.

## Active blockers

None for the models. **The owner's visual acceptance is the gate.** Neither model may declare
FINAL FREEZE, OWNER ACCEPTED or READY TO MERGE; nothing merges to `main` without the owner.

## Accepted non-blockers

- **The cut (SYSTEMS → UNDERNEATH) is the V4 `SceneBreak`, unchanged**: the transition sheets show
  black frames at p≈0.70–0.73 — the designed ink field and seven break rails, verified by DOM probe,
  identical before and after this gate (D-046). Re-authoring the break itself would be an owner
  decision.
- WebKit: the two Phase 7 environment failures and the two cut-region arrival cases that fail
  identically on the baseline build (return §3a of V14; Opus return §6.2 for the test-side remedy).
  Not re-run on the Fable gate.
- Six console messages on the **404 route only**; the content routes are silent. Unchanged since
  Phase 7.
- Three mobile composition deltas from the Opus V14 QA, for the owner (`OPUS-V14-QA-RETURN.md`
  §6.1). The Fable gate added none.
- Decision *alternatives* render as a comma join rather than a list — owner-accepted 2026-09-03.
- Two `<nav>`s share `aria-label="Primary"` — pre-existing, axe-clean, no measured harm.
- Software Factory sits at `depth: "preview"`, outside case-study navigation until its content
  depth rises. Blocked on `docs/CONTENT_GAPS.md` gaps 1–2 (external repository out of scope).
- Case-study desktop figures have no inspector, by design; the spatial scene plates carry a desktop
  inspector (V14) and, from V14.1, a detail window on three diagrams (D-045).
- `blockJS` drops MDX `index={n}` FIG numbering (D-001) — content-side, pre-existing.
- The recordings in both review packages are git-ignored by the repository's
  `docs/review/**/recordings/` rule and live in the working tree; each `journey.json` carries their
  numbers and `tests/tools/v14-baseline.mjs` regenerates them.

## Next action

0. **The owner's review of `docs/review/v14.14-navigator/README.md`** (the navigator refinement),
   `docs/review/v14.13-motion-feel/REPORT.md` (the motion feel gate),
   `docs/review/v14.12-motion/REPORT.md` (the motion gate),
   `docs/review/v14.11-engineering/REPORT.md` (the engineering gate),
   `docs/review/v14.10-navigation-refine/README.md` (the refinement),
   `docs/review/v14.9-navigation/README.md` (the navigation gate),
   `docs/review/v14.8-visual-gate/README.md` (the V14.8 visual gate),
   `docs/review/v14.7-codex-timing/REPORT.md` (timing and spacing),
   `docs/review/v14.6-codex-motion/REPORT.md` (motion) and
   `docs/review/v14.5-visual-gate/README.md`, with V14.4
   (`docs/review/v14.4-owner-correction/README.md`) and Gates E, D, C and B. No further visual gate
   and no final QA is started automatically; Codex only as a separate engineering gate on the
   owner's instruction (scroll blur, wheel smoothing, max speed, first-load flash, the UNDERNEATH
   fade and four-stops reveal timing, About spacing); nothing merges.
1. ~~Opus 5 / High — engineering QA of the Fable checkpoint~~ — **done: PASS**,
   `.ai/handoffs/OPUS-V14_1-QA-RETURN.md`. Verified independently on its own fresh production build:
   protected-file diff empty, first paint settled, discrete scroll and route geometry unmoved,
   reverse correct, frame time at parity including the new lower page, mobile unchanged,
   Chromium 224/224, WebKit at the documented baseline. No defect, no source change.
2. The owner's review of `docs/review/v14.1-fable/README.md` — the only acceptance. The three
   mobile deltas of `OPUS-V14-QA-RETURN.md` §6.1 still need an owner decision.
