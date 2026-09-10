# ACTIVE TASK

One assignment. Replace it when it completes, or set `TASK: NONE`.

**TASK:** V14 — owner visual acceptance recovery. **Stage: OWNER REVIEW of V14.10 (navigation refinement), V14.9 (navigation gate), V14.8 (visual gate), V14.7 (Codex timing), V14.6 (motion) and the V14.5 visual gate
(the older SYSTEMS restored with the interlocking rails, the Machine's state stated, Selected
Systems as a file, registers removed), with V14.4 and Gates E, D, C and B.** Fable V14 checkpoint `35c2c58`; Opus QA
`27c4fca`; V14.1 engineering `c2ba26a` / `fa7c72c`; V14.1 Fable gate `f4bdab3`
(`.ai/handoffs/V14_1_FABLE_TO_OPUS.md`).

**STATUS:** `V14.1 FABLE VISUAL GATE COMPLETE` · `FINAL OPUS QA COMPLETE — PASS` · `V14.2 VISUAL
GATE B COMPLETE` (D-048; `.ai/handoffs/V14_2_GATE_B_RETURN.md`; package
`docs/review/v14.2-gate-b/README.md`) · `V14.2 VISUAL GATE C COMPLETE` (D-049, checkpoint
`5a4147d`; `.ai/handoffs/V14_2_GATE_C_RETURN.md`; package `docs/review/v14.2-gate-c/README.md`) ·
`V14.3 VISUAL GATE D COMPLETE` (D-050, checkpoint `5bbccb6`; `.ai/handoffs/V14_3_GATE_D_RETURN.md`;
package `docs/review/v14.3-gate-d/README.md`) · `V14.3 VISUAL GATE E COMPLETE` (D-051, checkpoint
`51b3387`; `.ai/handoffs/V14_3_GATE_E_RETURN.md`; package `docs/review/v14.3-gate-e/README.md`) ·
`V14.4 OWNER VISUAL CORRECTION COMPLETE` (D-052, checkpoint `f9b0a72`;
`.ai/handoffs/V14_4_OWNER_CORRECTION_RETURN.md`; package `docs/review/v14.4-owner-correction/README.md`).
· `V14.5 VISUAL GATE COMPLETE` (D-053, checkpoint `b8ff8b8`; `.ai/handoffs/V14_5_VISUAL_GATE_RETURN.md`;
package `docs/review/v14.5-visual-gate/README.md`).
· `V14.6 CODEX ENGINEERING GATE 1 (MOTION) COMPLETE` (checkpoint `84fb5a9`;
`.ai/handoffs/V14_6_CODEX_MOTION_RETURN.md`; report `docs/review/v14.6-codex-motion/REPORT.md`).
· `V14.7 CODEX ENGINEERING GATE 2 (TIMING + SPACING) COMPLETE` (checkpoint `2d40c65`;
`.ai/handoffs/V14_7_CODEX_TIMING_RETURN.md`; report `docs/review/v14.7-codex-timing/REPORT.md`).
· `V14.8 VISUAL GATE COMPLETE` (checkpoint `b385675`;
`.ai/handoffs/V14_8_VISUAL_GATE_RETURN.md`; package `docs/review/v14.8-visual-gate/README.md`).
· `V14.9 NAVIGATION GATE COMPLETE` (checkpoint `b244a4d`;
`.ai/handoffs/V14_9_NAVIGATION_RETURN.md`; package `docs/review/v14.9-navigation/README.md`).
· `V14.10 NAVIGATION REFINEMENT COMPLETE` (checkpoint `60a6708`;
`.ai/handoffs/V14_10_NAVIGATION_REFINE_RETURN.md`; package
`docs/review/v14.10-navigation-refine/README.md`).
Owner acceptance **PENDING**. Do not merge. Do not start another gate or the final QA without the
owner.

**V14.1 FABLE GATE (art direction only):** the owner's remaining findings corrected as systems —
D-043 (the route as a track), D-044 (the ground drawn; presence as a state change), D-045 (the
acquired detail), D-046 (strata as floors; UNDERNEATH on its line; the map clear of the surface
return), D-047 (the route continued down the page; the map's index; the finale tail). Scroll code
changed: **NO** — the scroll files are byte-identical to `fa7c72c`. Mobile: identical to the V14.1
engineering record at the recorded step. Handoff: `.ai/handoffs/V14_1_FABLE_TO_OPUS.md`.

**BRIEF:** `.ai/handoffs/V14-OWNER-BRIEF.md` (V14) and the owner's V14.1 correction brief as given
in session; `.ai/handoffs/V14_1_ENGINEERING_TO_FABLE.md` §4 is the scroll behaviour no gate may alter.

**BRANCH:** `feature/owner-visual-acceptance-v14`, from exactly `5670234`. V13 stays at `5670234`.
`main` at `16d3ec0` stays untouched.

**WHAT EXISTS NOW**

- The V14.1 Fable checkpoint, committed and pushed (verify `local == origin`): D-043 … D-047 in
  `docs/DECISIONS.md`, `docs/DESIGN_SYSTEM.md` §39, `docs/FROZEN_BOUNDARY.md` §6.1.
- The owner review package: `docs/review/v14.1-fable/README.md` — `before/` (the state at
  `fa7c72c`), `after/` (the checkpoint), `iterations/` (the motion sheets of every internal pass).
- The Fable → Opus handoff: `.ai/handoffs/V14_1_FABLE_TO_OPUS.md` — decisions, files, structural
  problems addressed, remaining issues, the protected-scroll proof, first-paint and mobile status.
- Earlier records: `FABLE-V14-RETURN.md`, `OPUS-V14-QA-RETURN.md`, `V14_1_ENGINEERING_TO_FABLE.md`.

**FOR THE OWNER (this stage):** review `docs/review/v14.1-fable/README.md` — the forward, reverse
and lower-world journeys, the zoom sets, the focus frames, the transition sheets and the
before/after by system. Two decisions are yours and are not model decisions: the SYSTEMS →
UNDERNEATH `SceneBreak` cut (unchanged since V4), and the three mobile deltas in
`OPUS-V14-QA-RETURN.md` §6.1, still pending.

**NEXT MODEL:** none. Both gates have run and stopped: the Fable visual correction
(`V14_1_FABLE_TO_OPUS.md`) and the final Opus engineering QA (`OPUS-V14_1-QA-RETURN.md`, PASS).
Acceptance, rework or rejection is the owner's alone.
