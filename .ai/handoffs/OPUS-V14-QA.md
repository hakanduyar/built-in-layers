# OPUS V14 QA — independent engineering review of the Fable visual candidate

You are the independent ENGINEERING QA for the V14 owner-visual-acceptance candidate. You did not
write it. You are Claude Opus 5 at High effort.

Repository: `C:\GitHub\portfolio` — PORTFOLIO only. Do not touch any other repository.
Branch: `feature/owner-visual-acceptance-v14`. Review the committed tip (`git rev-parse HEAD`; the
Fable checkpoint is named in `.ai/HANDOFF.md`). Starting baseline: `5670234`. `main` is `16d3ec0`
and must stay untouched. Do not merge, force-push, reset destructively, or clean unknown work.
Do not delete `docs/review/v12-codex-gate/codex-gate-checkpoint.bundle`.

Port 3000 / PID 35732 is an unrelated stale process — do not touch it. Use 3100+ for your own
servers (Playwright's config reuses an existing server on 3100).

A detached, read-only worktree of the baseline `5670234` exists at
`C:/GitHub/portfolio-baseline-5670234` (already installed and built). Serve it with
`PORT=3300 pnpm start` from that directory for any A/B you want; do not modify it, and do not
remove it — Fable removes it after your return. The candidate's recordings are git-ignored by the
repository's `docs/review/**/recordings/` rule and exist only in this working tree; the committed
`journey.json` files carry the numbers.

## Read first

1. `CLAUDE.md`, `.ai/STATE.md`, `.ai/HANDOFF.md`
2. `.ai/handoffs/V14-OWNER-BRIEF.md` — the owner's brief, verbatim. §28 is your mandate.
3. `.ai/handoffs/FABLE-V14-RETURN.md` — the candidate's own account and its measurements
4. `docs/DECISIONS.md` D-034 to D-040, `docs/DESIGN_SYSTEM.md` §38

## Your mandate (brief §28)

Verify, do not redesign. You MAY fix engineering, mechanical, test, accessibility, runtime and
documentation defects, then validate, commit and push the branch (verify `local == origin`). You
MAY NOT redesign or reinterpret the art direction — if a remaining problem is visual/art-direction,
record it precisely for the owner instead of changing the composition. Never weaken an assertion to
make a gate pass. Do not declare FINAL FREEZE, OWNER ACCEPTED or READY TO MERGE: owner acceptance is
mandatory and pending.

Verify, independently and on your own production build:

- **scroll physics integrity** — `lib/spatial/cameraFilter.ts` `pageGearing` / `governorBudget` and
  their use in `useRouteGovernor`: the route's budget must be byte-identical to before
  (`ROUTE_MAX_RATE × routeSpan`), the page's budget geared from the route's arc length, the world
  unit and the fit; intent lead cap, sign collapse, break-event ownership and the edge hand-backs
  untouched. Re-run `tests/tools/scroll-contract-probe.mjs` and the V14 journey tool
  (`tests/tools/v14-baseline.mjs --out <your dir>`): route peak px/s unchanged from the baseline,
  page peak px/s geared, coast after input under a beat, reverse in one notch.
- **vertical pacing** — lower-world traverse time at a normal wheel vs the baseline's 10.1s at
  1440×900 (`docs/review/v14-owner-visual/baseline/journey.json`).
- **route math** — `pnpm test` (the spatial-route, filter, drift, POV, fit and dump suites); the
  route geometry itself was not changed, so `route-focus.json` must match the baseline's.
- **performance and motion sharpness** — the reveal is a 240vw × 200vh compositor layer gated on
  `visibility`; no `filter`, no scale on text, transform/opacity only. **Frame time is route
  speed** (D-040): the governor pays per frame, so run `tests/tools/frame-time-probe.mjs` against
  your build and against the baseline on 3300, sequentially, at the same load. Expect parity within
  about a millisecond a frame for all three traverses (the return's numbers: 17.2 / 18.1 / 17.2ms
  against 17.4 / 18.3 / 17.3ms). The first after-evidence caught a 25ms reverse traverse; the fix
  is the survey ticks drawn as one path per route inside the base-rail SVG, and the e2e
  sparse-structure test now asserts the attention group holds SVG only.
  `tests/tools/motion-sharpness-probe.mjs` exists as well.
- **desktop responsive** — 1366×768, 1440×900, 1536×864, 1920×1080, 2560×1440
  (`tests/tools/scene-fit-probe.mjs`: no composition may overflow its frame).
- **mobile regression** — the V13 mobile gate is frozen. Every V14 change claims to be
  desktop-scoped; prove it with `tests/tools/mobile-route-probe.mjs` (compare
  `docs/review/v13-mobile-gate/after/metrics/mobile-route.json`), `touch-target-probe.mjs`, and
  overflow at 320/360/375/390/430/768. The known mobile deltas are listed in the return; anything
  not listed is a finding.
- **overflow, accessibility, runtime** — `tests/tools/phase7-runtime-probe.mjs`; axe runs with no
  exclusions now; the desktop inspector controls are new buttons (one per scene plate).
- **tests / build** — typecheck, lint, format:check, `pnpm test`, production build, Chromium e2e;
  WebKit against its documented baseline (two environment failures at Phase 7).
- **artifact / current-code identity** — the committed `docs/review/v14-owner-visual/after/`
  artifacts must correspond to the committed code: rebuild and spot-check.

Classify every issue: PRODUCT / ENGINEERING / TEST / ARTIFACT / DOCUMENTATION / ENVIRONMENT /
ART-DIRECTION.

## Output

Write `.ai/handoffs/OPUS-V14-QA-RETURN.md` — reviewed SHA, any follow-up SHA you push, your own
measured numbers, the classified issue list, and what you did not finish — and end your final
message with exactly one of:

OPUS V14 QA: PASS
OPUS V14 QA: PASS WITH DOCUMENTED NON-BLOCKERS
OPUS V14 QA: RETURN TO FABLE
OPUS V14 QA: FAIL
