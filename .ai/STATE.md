# STATE — current truth only

Replace entries when they go stale. History belongs in Git and `docs/`, not here.

_Updated: 2026-09-06 (V14.1 engineering gate)_

| Field | Value |
|---|---|
| Project | Built in Layers — Hakan Duyar portfolio |
| Repo | `C:\GitHub\portfolio` |
| Branch | `feature/owner-visual-acceptance-v14` — created from exactly `5670234` |
| Last application checkpoint | `c2ba26a` — V14.1 engineering stabilization (`.ai/handoffs/V14_1_ENGINEERING_TO_FABLE.md`). The V14 visual candidate it sits on is `35c2c58` (`.ai/handoffs/FABLE-V14-RETURN.md`). Verify the tip with `git rev-parse HEAD` |
| Scroll safety tag | `safety-v14-scroll-baseline` → `35c2c58`, annotated and pushed — the governed scroll the owner accepted, recorded in `docs/review/v14-scroll-baseline/` |
| Origin | verify with `git rev-parse origin/feature/owner-visual-acceptance-v14` |
| V13 | `feature/project-architecture-v13` at `5670234` — not mutated |
| `main` | `16d3ec0` — untouched, never merged to |
| Working tree | clean except the intentional untracked `docs/review/v12-codex-gate/codex-gate-checkpoint.bundle` (22.6 MB recovery bundle, deliberately not committed) and the git-ignored `docs/review/v14-owner-visual/*/recordings/` |
| Baseline worktree | retired after the Opus QA return (`git worktree prune` run); recreate with `git worktree add --detach <dir> 5670234` for any further A/B |

## Frozen systems

| System | Frozen at | Status on this branch |
|---|---|---|
| Desktop spatial | 2026-09-02, `0752883` | **Reopened by owner decision** (V14 brief §3: the owner's visual verdict overrides the model freeze). What moved and why: D-034 … D-040, `docs/FROZEN_BOUNDARY.md` §6 |
| Case-study system | 2026-09-03, `5000201` | Frozen — untouched |
| Mobile | 2026-09-04, `8a24e03` | Frozen — art direction untouched; regression verified by the mobile smoke (return §4 lists the deltas) |

Fingerprints and the sanctioned-move ledger: `docs/FROZEN_BOUNDARY.md` (§1 list, §5 ledger, §6 the
V14 reopening). On this branch the §4 loop prints more than the ten `MOVED:` lines §5 accounts for,
by design; the standard for those moves is the owner's brief, not a measured regression.

## Current phase

**V14 — owner visual acceptance recovery. FABLE VISUAL CANDIDATE READY · OPUS QA COMPLETE ·
V14.1 ENGINEERING COMPLETE. Owner acceptance: PENDING.**

**V14.1 (engineering only, `c2ba26a`).** The owner's initial-load flash is fixed: the world's fit is
published before the first paint instead of arriving a commit after the world mounts, so
`FIRST PAINT == SETTLED` at 1440×900, 1920×1080 and 1366×768, cold and warm (D-041). Motion
sharpness and discrete scroll were measured and deliberately left unchanged (D-042) — no scroll
constant, the governor, the intent model or the wheel handler was touched, and the accepted scroll
is tagged. Full account and the protected-scroll list:
`.ai/handoffs/V14_1_ENGINEERING_TO_FABLE.md`.

Record: `.ai/handoffs/FABLE-V14-RETURN.md` (what changed by system A–F, the measured before/after,
the mobile deltas, the frame-time finding). Brief: `.ai/handoffs/V14-OWNER-BRIEF.md`. Owner review
package: `docs/review/v14-owner-visual/README.md`. Independent engineering QA:
`.ai/handoffs/OPUS-V14-QA-RETURN.md` — **PASS WITH DOCUMENTED NON-BLOCKERS**, its brief
`.ai/handoffs/OPUS-V14-QA.md`.

Validation at the checkpoint (production build of the committed code): typecheck 0 · lint 0 ·
`format:check` 0 · unit **562/562** · build 15/15 · Chromium **224/224** · WebKit **220/224**
(two Phase 7 environment cases plus two cut-region arrival cases that fail identically on the
baseline build today — return §3a) · console/runtime/hydration **0** across 10 content routes · CLS ≤ 0.0388 · images 0
broken / 0 unsized / 0 empty-alt · overflow **0 of 99** · scene fit clear at 1366 / 1440 / 1536 /
1920 / 2560 · mobile smoke 14.1 / 11.6 / 10.5 screens at 320 / 390 / 768, sharp, 0vh near-empty.

Owner finding F, measured at 1440×900: the lower world **10.1s → 3.8s** at a normal wheel and
**10.2s → 3.1s** at a hard flick; the route's own pace unchanged; reverse still one notch. Frame
time at parity with the baseline (17.2 vs 17.3ms a frame on the reverse traverse) after D-040.

## Active blockers

None for the models. **The owner's visual acceptance is the gate.** Neither model may declare
FINAL FREEZE, OWNER ACCEPTED or READY TO MERGE; nothing merges to `main` without the owner.

## Accepted non-blockers

- WebKit: the two Phase 7 environment failures remain (Safari's Tab default for the skip-link
  test; one governed-camera arrival case). Two further cut-region arrival cases (`spatial-v5`
  "surface opens monotonically", `spatial` "every break rail closes") fail on this machine's
  software-rendered WebKit on **both** builds — 4 of 5 baseline runs today, identical values — because
  the camera sits still for over two seconds after a large `scrollTo` jump and the tests' settle
  heuristic reads that as arrival. Geometry is identical on both engines; the candidate's cut
  region renders 2.7× faster than the baseline on WebKit. ENVIRONMENT with a TEST component
  (return §3a); a remedy would be in the tests' arrival detection.
- Six console messages on the **404 route only** — the route's own 404 response plus the
  font-preload notices; the ten content routes are silent. Unchanged since Phase 7.
- Three mobile composition deltas the Fable return does not list, found by the Opus QA and left for
  the owner (no measured regression, so the frozen mobile layer was not reopened): every project
  scene is 32px taller below `lg` (the scene grid gained a third child and `gap-8` is unprefixed);
  the 0.972 → 1 arrival scale was removed on mobile as well as desktop; Software Factory's mobile
  case action moved `mt-8 flex` → `mt-4 inline-flex`. Detail and measurements:
  `.ai/handoffs/OPUS-V14-QA-RETURN.md` §6.1.
- Decision *alternatives* render as a comma join rather than a list — owner-accepted 2026-09-03.
- Two `<nav>`s share `aria-label="Primary"` — pre-existing, axe-clean, no measured harm.
- Software Factory sits at `depth: "preview"`, outside case-study navigation until its content
  depth rises. Blocked on `docs/CONTENT_GAPS.md` gaps 1–2 (external repository out of scope).
- Case-study desktop figures have no inspector, by design; the spatial scene plates gained a
  desktop inspector button in V14 (B — evidence legibility).
- `blockJS` drops MDX `index={n}` FIG numbering (D-001) — content-side, pre-existing.
- The recordings in the review package are git-ignored by the repository's
  `docs/review/**/recordings/` rule and live in the working tree; `journey.json` carries their
  numbers and `tests/tools/v14-baseline.mjs` regenerates them.

## Next action

1. ~~Opus 5 / High engineering QA~~ — done: `.ai/handoffs/OPUS-V14-QA-RETURN.md`, PASS WITH
   DOCUMENTED NON-BLOCKERS. Re-measured independently on its own production build: route ceiling
   byte-identical, lower world 9.9s → 3.9s normal and → 3.1s at a flick, frame time within 0.3ms of
   the baseline, `route-focus.json` unchanged, Chromium 224/224, WebKit 220/224 (two of the four
   reproduced on the baseline build).
2. The owner's review of `docs/review/v14-owner-visual/README.md` — the only acceptance. Read
   `OPUS-V14-QA-RETURN.md` §6.1 first: three mobile composition deltas need an owner decision.
