# ACTIVE TASK

One assignment. Replace it when it completes, or set `TASK: NONE`.

**TASK:** V14 — owner visual acceptance recovery. **Stage: owner review, after the V14.1
engineering gate.** Fable checkpoint `35c2c58`; Opus QA `27c4fca` (PASS WITH DOCUMENTED
NON-BLOCKERS); V14.1 engineering checkpoint `c2ba26a`.

**STATUS:** `FABLE VISUAL CANDIDATE READY` · `OPUS QA COMPLETE` · `V14.1 ENGINEERING COMPLETE`.
Owner acceptance **PENDING**. Do not merge.

**V14.1 (engineering only, no art direction):** the initial-load flash is fixed — the world's fit is
now known before the first paint (D-041). Motion sharpness and discrete scroll were measured and
left alone (D-042); the scroll the owner accepted is tagged `safety-v14-scroll-baseline` at
`35c2c58` and recorded in `docs/review/v14-scroll-baseline/`. Handoff for the next art-direction
gate: `.ai/handoffs/V14_1_ENGINEERING_TO_FABLE.md`.

**BRIEF:** `.ai/handoffs/V14-OWNER-BRIEF.md` — the owner's instruction, verbatim, and the authority
for this task. §28 is the Opus mandate; §29 owner acceptance; §33 the final return format.

**BRANCH:** `feature/owner-visual-acceptance-v14`, from exactly `5670234`. V13 stays at `5670234`.
`main` at `16d3ec0` stays untouched.

**WHAT EXISTS NOW**

- The candidate, committed and pushed (verify `local == origin`): the six systems A–F reworked,
  recorded in `docs/DECISIONS.md` D-034 … D-040 and `docs/DESIGN_SYSTEM.md` §38.
- The Fable return: `.ai/handoffs/FABLE-V14-RETURN.md` — before/after by system and by number.
- The owner review package: `docs/review/v14-owner-visual/README.md`.
- The Opus QA brief: `.ai/handoffs/OPUS-V14-QA.md` — engineering verification only, no redesign;
  its return goes to `.ai/handoffs/OPUS-V14-QA-RETURN.md`.
- The Opus QA return: `.ai/handoffs/OPUS-V14-QA-RETURN.md` — verified independently; three
  mobile composition deltas (§6.1) and the WebKit settle-heuristic remedy (§6.2) await the owner.

**FOR THE OWNER (this stage):** review `docs/review/v14-owner-visual/README.md` — the forward,
reverse and lower-world recordings, the zoom stills, the focus frames, the before/after by system.
Decide on the three mobile deltas in the Opus return §6.1. Acceptance, rework or rejection is the
owner's alone; the models have stopped.

**NEXT MODEL:** Fable 5.1 · Max, for the art-direction gate — its handoff is
`.ai/handoffs/V14_1_ENGINEERING_TO_FABLE.md`, whose §4 lists the scroll behaviour it must not
alter. Anything else waits on the owner's verdict.
