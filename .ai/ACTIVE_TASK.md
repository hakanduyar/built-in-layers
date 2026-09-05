# ACTIVE TASK

One assignment. Replace it when it completes, or set `TASK: NONE`.

**TASK:** V14 — owner visual acceptance recovery. **Stage: Fable checkpoint committed → Opus 5 /
High engineering QA → owner review.**

**STATUS:** `FABLE VISUAL CANDIDATE READY`. Owner acceptance **PENDING**. Do not merge.

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
- A read-only baseline worktree for A/B: `C:\GitHub\portfolio-baseline-5670234` (port 3300).

**FOR OPUS (this stage):** read `CLAUDE.md`, `.ai/STATE.md`, `.ai/HANDOFF.md`, then the QA brief.
Verify scroll physics, vertical pacing, route math, frame time, desktop responsive, mobile
regression, overflow / accessibility / runtime, tests / build, artifact identity. Fix engineering,
test, runtime and documentation defects only; record art-direction observations for the owner.
End with exactly one of the four verdict lines in the brief.

**STOP WHEN:** the Opus return is written and pushed, the final return in the brief's §33 format
is produced with both checkpoints, origin is synced, and owner acceptance is `PENDING`. Neither
model declares FREEZE, OWNER ACCEPTED or READY TO MERGE.
