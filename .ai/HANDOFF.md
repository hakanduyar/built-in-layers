# HANDOFF

What the next model needs, and nothing else. No transcripts, no test logs, no restated rules.

**CHECKPOINT:** the V14 Fable visual candidate — the tip of `feature/owner-visual-acceptance-v14`
(`git rev-parse HEAD`; commit subject begins `V14: owner visual candidate`). Verify `local == origin`.
**VERDICT:** `FABLE VISUAL CANDIDATE READY`. Owner acceptance **PENDING**. Do not merge. Full
account: `.ai/handoffs/FABLE-V14-RETURN.md`; the owner's brief: `.ai/handoffs/V14-OWNER-BRIEF.md`.

**OPUS QA: COMPLETE** — `.ai/handoffs/OPUS-V14-QA-RETURN.md`, **PASS WITH DOCUMENTED NON-BLOCKERS**.
Independently re-measured on its own production build: the route's governor budget byte-identical,
lower world 9.9s → 3.9s at a normal wheel and → 3.1s at a flick, frame time within 0.3ms of the
baseline in all three traverses, `route-focus.json` regenerating byte-identical, scene fit and
`runtime.txt` reproducing exactly, Chromium 224/224, WebKit 220/224 with two of the four reproduced
on the **baseline** build. Two non-behavioural fixes pushed (a probe `--out` flag and its policy
row). Three unlisted mobile composition deltas recorded for the owner, not changed (§6.1).

**NEXT:** the owner's visual review of `docs/review/v14-owner-visual/README.md` — the only
acceptance. The baseline worktree has been retired (`git worktree prune`); recreate it with
`git worktree add --detach <dir> 5670234` for any further A/B.

**CHANGED** — the desktop visual and narrative layer, by owner decision (D-034 … D-040):

- Removed: `SystemField`, `DirectionalField`, `TravelMaterial`, the hero SURFACE ghost,
  `MeasureScale`, CONVERGE, `DriftRoute`, `DriftSettle`. One structural motif remains — the route's
  topology in four states (`components/spatial/RouteMap.tsx`, new).
- `WorldGrammar.tsx` (rails travelled / ahead, stations, survey as one path per route, state
  changes, strata, terminus map, attention), `SystemsWord.tsx` (the surface opens beside an intact
  word), `ProjectPlane.tsx` (constructed edge instead of an offset rectangle),
  `SpatialProjectScene.tsx` (four compositions recomposed; desktop inspector buttons),
  `SpatialCamera.tsx` (presence by opacity, no scale; page gearing in the governor),
  `SpatialExperience.tsx`, `EditorialDrift.tsx`, `SystemPOV.tsx`, `HowIBuild.tsx`, `SiteFooter.tsx`.
- `lib/spatial/cameraFilter.ts` — `pageGearing`, `governorBudget` (D-039); `sceneRoute.ts` —
  `routeWorldLength`; `systemPov.ts` — `scenePresence`; `worldFit.ts` — reference height 990;
  `planeChoreography.ts`, `editorialDrift.ts` (desktop gaps only), `scenes.ts` (scale constants
  deleted).
- Tests: `spatial-filter` (gearing), `route-focus-dump` (new), `spatial-drift` (scan list),
  `a11y` (no axe exclusion; decorative-depth marker must be absent), `spatial` (attention group
  holds SVG only). Tools: `v14-baseline.mjs`, `scene-fit-probe.mjs`, `frame-time-probe.mjs`.
- Docs: `DECISIONS.md` D-034 … D-040, `DESIGN_SYSTEM.md` §38, `FROZEN_BOUNDARY.md` §6,
  `REVIEW_POLICY.md`; the review package `docs/review/v14-owner-visual/` (recordings git-ignored).

**RESOLVED**

- Owner findings A–F addressed as systems, not screenshots; F measured: lower world **10.1s →
  3.8s** normal, **10.2s → 3.1s** aggressive at 1440×900, route pace unchanged, reverse one notch.
- D-040: the first after-evidence caught the reverse traverse a third slower (25ms frames); the
  survey ticks moved from ninety spans under a per-frame opacity into one SVG path per route;
  frame time back at parity (17.2 vs 17.3ms).

**OPEN** (none blocking the QA; the owner's acceptance is the gate)

- WebKit 220/224: the two Phase 7 environment failures, plus two cut-region arrival cases
  (`spatial-v5` "surface opens monotonically", `spatial` "every break rail closes") that fail
  identically on the **baseline** build on this machine today (4 of 5 runs): WebKit's camera sits
  still for >2s after a large `scrollTo` jump and the tests' settle heuristic reads it as arrival.
  ENVIRONMENT + TEST, not a V14 regression — return §3a. If Opus takes it, the fix is the tests'
  arrival detection, not an assertion.
  Reproduced by the Opus QA on the baseline build served on the same port: same two tests, same
  values. The remedy (require the read value to have changed once since the jump) is written up in
  `OPUS-V14-QA-RETURN.md` §6.2 and deliberately not taken there.
- ~~Not run by Fable: the touch-target probe and the 320–768 overflow matrix~~ — both run by the
  Opus QA: 0 standalone sub-44 targets across 8 pages × 6 widths, overflow 0 of 99.
- Three unlisted mobile composition deltas, for the owner: `OPUS-V14-QA-RETURN.md` §6.1.
- Observation, both builds identical: a forward traverse begun ~400ms after a programmatic
  `scrollTo` runs ungoverned for its first notches (return §5).

**VALIDATION:** typecheck 0 · lint 0 · format:check 0 · unit 562/562 · build 15/15 · Chromium
224/224 · WebKit 220/224 · console/hydration 0 across 10 content routes · CLS ≤ 0.0388 · overflow
0 of 99 · scene fit clear at five viewports · mobile smoke 14.1 / 11.6 / 10.5 screens, sharp.

**ARTIFACTS**

- `.ai/handoffs/FABLE-V14-RETURN.md` — the account, with every measurement
- `.ai/handoffs/OPUS-V14-QA-RETURN.md` — the independent QA, its own measurements and findings
- `docs/review/v14-owner-visual/README.md` — the owner review package index
- `docs/review/v14-owner-visual/{baseline,after}/` — journeys, zoom, stills, metrics

**NEXT:** the owner reviews the package. Neither model declares FREEZE, OWNER ACCEPTED or READY TO
MERGE.
