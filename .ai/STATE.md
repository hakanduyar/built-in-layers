# STATE — current truth only

Replace entries when they go stale. History belongs in Git and `docs/`, not here.

_Updated: 2026-09-07 (V14.3 Gate D — one mark, one meaning; no orange; every line a fact)_

| Field | Value |
|---|---|
| Project | Built in Layers — Hakan Duyar portfolio |
| Repo | `C:\GitHub\portfolio` |
| Branch | `feature/owner-visual-acceptance-v14` — created from exactly `5670234` |
| Last application checkpoint | `5bbccb6` — V14.3 Gate D (`.ai/handoffs/V14_3_GATE_D_RETURN.md`; verify the tip with `git rev-parse HEAD`), on the V14.2 Gate C checkpoint `5a4147d` / `2eb06c1` (`.ai/handoffs/V14_2_GATE_C_RETURN.md`), on the V14.2 Gate B checkpoint `de538bf` / `816b408` (`.ai/handoffs/V14_2_GATE_B_RETURN.md`), on the V14.1 Fable gate `f4bdab3` and its Opus QA `8c6045c`. That sits on the V14.1 engineering checkpoint `c2ba26a` / `fa7c72c`, which sits on the V14 visual candidate `35c2c58` (`.ai/handoffs/FABLE-V14-RETURN.md`) |
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
COMPLETE. Owner acceptance: PENDING.**

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

0. **The owner's review of `docs/review/v14.3-gate-d/README.md`** (Gate D), with Gate C
   (`docs/review/v14.2-gate-c/README.md`) and Gate B (`docs/review/v14.2-gate-b/README.md`). Gate E
   (earlier-section clarity, breathing room, microtext/contrast) only on the owner's instruction. No
   final Opus QA is started automatically; nothing merges.
1. ~~Opus 5 / High — engineering QA of the Fable checkpoint~~ — **done: PASS**,
   `.ai/handoffs/OPUS-V14_1-QA-RETURN.md`. Verified independently on its own fresh production build:
   protected-file diff empty, first paint settled, discrete scroll and route geometry unmoved,
   reverse correct, frame time at parity including the new lower page, mobile unchanged,
   Chromium 224/224, WebKit at the documented baseline. No defect, no source change.
2. The owner's review of `docs/review/v14.1-fable/README.md` — the only acceptance. The three
   mobile deltas of `OPUS-V14-QA-RETURN.md` §6.1 still need an owner decision.
