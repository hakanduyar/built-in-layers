# OPUS V14 QA RETURN — independent engineering review of the Fable visual candidate

Claude Opus 5 / High, one fresh session, engineering QA only. I did not write the candidate and I
did not change its composition. **Owner acceptance remains PENDING** — nothing here declares FINAL
FREEZE, OWNER ACCEPTED or READY TO MERGE.

| | |
|---|---|
| Branch | `feature/owner-visual-acceptance-v14` |
| Reviewed SHA (Fable checkpoint) | `35c2c58` — "V14: owner visual candidate — the six systems reworked" |
| Starting baseline | `5670234` (Phase 7) |
| QA follow-up SHA | `dbe21ec` — pushed; `local == origin`. Two non-behavioural fixes (a probe's output path, one policy row) plus this return and its STATE / HANDOFF rows. No product file changed |
| `main` | `16d3ec0` — untouched, never merged to, not compared against |
| V13 | `feature/project-architecture-v13` at `5670234` — not touched |
| Baseline worktree | `C:\GitHub\portfolio-baseline-5670234` — served read-only on 3300; `git status` clean after every A/B; not removed (Fable's to remove) |
| Recovery bundle | `docs/review/v12-codex-gate/codex-gate-checkpoint.bundle` — untouched, still untracked |

Everything below was measured by me, on **my own production build** of `35c2c58`
(`pnpm build`, build id `AjdS-3BQh290H0jq3mBHv`), against the baseline worktree's own build on
port 3300, sequentially, at the same machine load. Ports 3100/3200 held Fable's build when I
started; I replaced them with mine before measuring anything (§7 records what that comparison
proved).

**Verdict: PASS WITH DOCUMENTED NON-BLOCKERS.** Every claim in `.ai/handoffs/FABLE-V14-RETURN.md`
that I re-measured reproduced. Two things the return does not account for are recorded in §6: an
unlisted set of **mobile composition deltas** (ART-DIRECTION, for the owner, not fixed — see the
reasoning) and the WebKit environment failures, which I reproduced **on the baseline build** and
therefore confirm are not a V14 regression.

---

## 1. Scroll physics integrity — VERIFIED

**Code.** `lib/spatial/cameraFilter.ts` adds exactly two exported functions and touches nothing
else in the filter. The whole behavioural diff in `useRouteGovernor`
(`components/spatial/SpatialCamera.tsx:686-748`) is:

- `box()` additionally returns `pinnedEnd` (`spacer` top + `routeSpan`, i.e. the scroll position at
  progress 1) and `gearing = pageGearing(routeWorldLength(false), unitPx, fit, routeSpan)`;
- `const maxStep = ROUTE_MAX_RATE * bounds.routeSpan * (dt / 1000)` became
  `governorBudget(y, pinnedEnd, routeSpan, gearing, dt)`, which is **the identical expression**
  multiplied by `gearing` only when `y >= pinnedEnd`;
- `fit` joined the effect's dependency array.

`INTENT_LEAD_VH`, sign collapse, the `opposes`/`from` intent rule, the lead cap, the wheel-only
scope, `breakPlayingRef`'s ownership of the break band, the backward-escape `scrollBy(-140)`, the
adopt-a-foreign-scroll rule and both edge hand-backs are byte-identical to `5670234`. The route
budget is therefore byte-identical below the pinned end, by construction rather than by assertion —
and `tests/unit/spatial-filter.test.ts` "V14 page gearing" asserts exactly that (`inside ==
ROUTE_MAX_RATE × routeSpan × dt/1000` to 9 decimals; `atEnd == inside × gearing`).

**Measured — scroll contract, 1440×900, my build vs the baseline build, same load:**

| Measure | baseline `5670234` | candidate `35c2c58` |
|---|---|---|
| geometry (routeTop / routeEnd / docMax) | 61 / 4561 / **8665** | 61 / 4561 / **7737** |
| routeGentle peak px/s | 496 | 500 |
| routeAggressive peak px/s | 511 | 496 |
| routeAggressive coast after input | 524px · 0.58vh · 900ms | 516px · 0.57vh · 900ms |
| lowerGentle peak px/s | 486 | 438 |
| lowerAggressive peak px/s | 533 | **1963** |
| lowerAggressive coast after input | 516px · 0.57vh · 900ms | **132px · 0.15vh · 0ms** |
| reverse latency | 1 notch · 0px wrong-way · 114ms | 1 notch · 0px wrong-way · 96ms |

The route span is identical (4500px) and the route's ceiling did not move: gentle 500 against 496,
aggressive 496 against 511 — inside the probe's documented run-to-run spread, and in the direction
of *slower*, never faster. The page's ceiling is the geared one, 1963 against 533 (≈3.7×; the
derived gearing at this viewport is 3.82). **Coast is under a beat and shorter than the baseline's**
— 132px and no measurable dwell, against the baseline's 516px over 900ms. Reverse is one notch with
zero wrong-way travel, faster than the baseline's.

**Journey tool (`tests/tools/v14-baseline.mjs`), 1440×900, both builds, my runs:**

| Journey | baseline | candidate |
|---|---|---|
| route forward | 12.9s · 86 notches · 5112px · peak 598 | 13.2s · 91 · 5073px · peak 577 |
| lower world forward (continuing) | 8.7s · 68 · 3553px · peak 622 | **3.5s** · 23 · 2664px · peak 1429 |
| lower world from the handover | **9.9s** · 81 · 4104px · peak 674 | **3.9s** · 27 · 3176px · peak 1429 |
| lower world, hard flick (400px/16ms) | **9.9s** · 122 · 4104px · peak 585 | **3.1s** · 27 · 3176px · peak 1957 |
| lower world reverse | 10.0s · 79 · 4612px · peak 596 | 3.9s · 27 · 3240px · peak 1500 |
| route reverse | 11.5s · 73 · 4053px · peak 600 | 13.3s · 88 · 4497px · peak 1052 |
| document / route span | 8665px / 4500px | 7737px / 4500px |

At 1920×1080 on the candidate: route forward 18.3s, lower from the handover **4.2s**, hard flick
**3.2s**, document 8802px.

Per pixel the route's pace is unchanged or slightly slower: forward 396 px/s (baseline) against 384
(candidate); reverse 352 against 338. The reverse route half starts higher on the candidate (4497
against 4053) exactly as the return explains — the baseline's ungeared page coasts ~470px past the
handover, the candidate's coasts ~44px.

## 2. Vertical pacing — VERIFIED

Owner finding F, measured by me at 1440×900 from the handover: **9.9s → 3.9s** at a normal wheel and
**9.9s → 3.1s** at a hard flick. (The return records 10.1s / 10.2s → 3.8s / 3.1s; my baseline run
reads 9.9s for both, and the point the finding rests on reproduces exactly: on the baseline the
normal wheel and the hard flick take *the same* time, because the ceiling binds and effort buys
nothing, and on the candidate they do not.) The lower page is 4104px → 3176px, the document
8665px → 7737px, and the shortening (D-037) is genuinely taken before the gearing (D-039), in the
order the brief's §17 asks for.

No per-region constant exists. `pageGearing` is a pure function of `routeWorldLength × unitPx × fit
/ routeSpan`, clamped at 1 from below, and every input is read from the route module, the world unit
and the world fit at runtime.

## 3. Route math — VERIFIED

- `pnpm test`: **562 / 562** across 29 files, including the spatial-route, filter, drift, POV, fit
  and dump suites.
- The route geometry is untouched: the whole diff of `lib/spatial/sceneRoute.ts` is the new
  `routeWorldLength()`, and of `lib/spatial/scenes.ts` the deletion of `SCENE_SCALE_FAR` /
  `SCENE_SCALE_FOCUS`. No anchor, segment, easing or focus value moved.
- I regenerated `route-focus.json` from the module on the committed code
  (`ROUTE_FOCUS_OUT=… vitest run tests/unit/route-focus-dump.test.ts`). It is **byte-identical to
  the committed `after/metrics/route-focus.json` and byte-identical to the committed
  `baseline/metrics/route-focus.json`.**

## 4. Performance and motion sharpness — VERIFIED

**Frame time, 1440×900, my build on 3200 and the baseline on 3300, run back to back:**

| Traverse | baseline | candidate |
|---|---|---|
| forward-1 | 17.4ms mean · p95 16.8 · 24/584 over 25ms · 10.2s / 84 notches | 17.2ms · p95 16.8 · 18/586 · 10.1s / 82 |
| forward-2 | 18.1ms · p95 33.3 · 16/187 · 3.5s / 26 | 17.8ms · p95 33.3 · 11/188 · 3.4s / 30 |
| reverse | 17.3ms · p95 16.8 · 22/584 · 10.2s / 82 | 17.4ms · p95 16.8 · 26/582 · 10.2s / 89 |

Parity within **0.3ms a frame in all three traverses**, the candidate ahead in two of the three.
The 25ms reverse traverse D-040 was written for does not exist on the committed code: reverse runs
10.2s on both builds. The e2e guard is real — `tests/e2e/spatial.spec.ts:687` asserts the
attention group has no non-SVG child and that both `data-rail-survey` paths exist — and it passes.

**Motion sharpness** (`tests/tools/motion-sharpness-probe.mjs`, at rest and while the camera
translates, 1366×768 / 1536×864 / 1920×1080 / 2560×1440): heading scale 1/1 and image scale 1/1 in
**every** state at **every** viewport, zero `filter`/`clip-path` exceptions, zero console errors.
There is no `filter` or `blur` anywhere left in `components/spatial/` outside comments. The reveal
is gated on `visibility` (not opacity) and animates `transform` only, with `contain: paint` on the
travelling layer.

## 5. Desktop responsive, overflow, accessibility, runtime, tests, build — VERIFIED

**Scene fit** — my run reproduces the committed `after/metrics/scene-fit.json` exactly, value for
value, at all five viewports: worst overflow −37px at 1366×768, −12px at 1440×900, −16px at
1536×864, −78px at 1920×1080, −387px at 2560×1440. Nothing overflows its frame anywhere.

**Overflow / runtime / images / CLS** (`phase7-runtime-probe.mjs`, 11 routes × 9 widths including
320 / 360 / 375 / 390 / 430 / 768 — the sub-1024 matrix Fable did not run):

- horizontal overflow **0 of 99** route × width combinations;
- console / runtime / hydration **0** across the ten content routes; the 404 route reports 6
  messages (its own 404 response plus font-preload notices) — identical to the committed
  `after/metrics/runtime.txt` and to the Phase 7 record;
- CLS ≤ 0.0388 (home), 0.0005 or 0 elsewhere; images 0 broken / 0 unsized / 0 empty-alt.

**Accessibility.** `pnpm exec playwright test --project=chromium` runs the axe suite with **no
exclusion** (the V14 removal is real; `tests/e2e/a11y.spec.ts` also asserts the decorative-depth
marker is gone from the page) — zero violations on all ten routes, the 404 page, the open mobile
nav, every Layer Explorer tab and keyboard-focus state.

I checked the **new desktop inspector buttons** specifically, because they drop the 44px floor
(`hidden lg:inline-flex lg:min-h-0`). Measured: 48 × 14.1px at 1366×768, 56.2 × 16.5px at 1440×900,
61.9 × 18.2px at 1920 and 2560. That is below WCAG 2.2 SC 2.5.8's 24 × 24 CSS px — **but the
spacing exception is satisfied**: the nearest other interactive element's centre is 556–1082px away
at 1440×900, so no two 24px target circles can intersect. The suite's declared bar is WCAG 2.1 AA
plus best-practice, under which target size is AAA and not in scope. **Not a defect.** Below `lg`
the same buttons are `display: none` — inert, unfocusable, and correctly reported as 0×0 by the
mobile probe.

**Touch targets** (`touch-target-probe.mjs`, 8 pages × 320/360/375/390/430/768): **0 standalone
targets under 44px** in all 48 combinations; the only sub-44 elements are inline-sentence links,
exempt under 2.5.8.

**Tests and build, all on my own build of `35c2c58`:** typecheck 0 · lint 0 · `format:check` pass ·
unit **562/562** · production build **15/15 routes** · Chromium e2e **224/224** · WebKit e2e
**220/224** (§6.2).

**Artifact / current-code identity — VERIFIED.** Three independent checks:

1. The server Fable left running served HTML **byte-identical** to my fresh rebuild's prerendered
   `/` except for the Next build id — i.e. the committed code reproduces the artifact-producing
   build deterministically.
2. `route-focus.json` and `scene-fit.json` regenerate byte-identical to the committed files.
3. My `phase7-runtime-probe` run reproduces `after/metrics/runtime.txt` line for line (noise 6 on
   the 404 route only, CLS 0.0388 home, overflow 0 of 99).

The git-ignored recordings named in `README.md` all exist in the working tree; the committed
`journey.json` files carry numbers my own runs reproduce.

## 6. Findings

### 6.1 ART-DIRECTION (mobile) + DOCUMENTATION — three unlisted mobile deltas. Recorded, not changed.

`FABLE-V14-RETURN.md` §4 says every V14 change is desktop-scoped and lists the mobile deltas that
exist anyway. Running the V13 mobile gate's own probe at the V13 gate's own step (**0.5vh, all six
viewports** — the candidate's run was 2vh at three) I found three mobile changes the list does not
account for. All three come from shared markup, not from a mobile decision:

**(a) Every project scene is taller below `lg`, by one `gap-8` (32px).** The scene grid
(`components/spatial/SpatialProjectScene.tsx`) went from two children to three — the identity row
became its own `lg:col-span-12` child. `gap-8` carries no `lg:` prefix, so on mobile, where the grid
is one column, the identity → description interval doubled from 32px to 64px (the detail block's own
`mt-8` plus the new grid gap). Measured scene block heights, mine, candidate vs baseline build:

| | 320×568 | 768×1024 |
|---|---|---|
| software-factory | 625.3 → 639.7px | 733.9 → 763.2px |
| kivilcim | 527.8 → 575.0px | 716.9 → 769.5px |
| jointledger | 574.5 → 623.0px | 746.0 → 799.5px |
| dropspot | 486.7 → 500.7px | 716.6 → 737.3px |

At focus, in the probe's own units (V13 gate → candidate), where the `72vh` floor does not already
absorb it: kivilcim 0.96 → 1.01vh and jointledger 1.04 → 1.10vh at 320×568; kivilcim 0.82 → 0.87vh
at 375×667; +0.02–0.03vh on three of four scenes at 768×1024.

**(b) The arrival scale was removed on mobile too.** On `5670234` the `SCENE_SCALE_FAR → FOCUS`
(0.972 → 1) transform was applied to *every* scene, with no `isDesktop` gate. Deleting it (D-035,
argued as a desktop sharpness fix) also removed mobile's arrival resolve: measured at the top of the
page, a mobile scene renders at 294.4px wide on the candidate against 286.1px on the baseline —
exactly the 0.972 factor. Mobile foreground text is no longer resampled while arriving, which is
very likely an improvement, but it is a change to a frozen layer and it is not in the list.

**(c) Software Factory's case action changed on mobile:** `mt-8 flex` → `mt-4 inline-flex` (the
`lg:mt-8` / `lg:mt-6` split). On mobile the action is now shrink-to-content and 16px closer to the
text above it.

**No mobile health metric regressed.** At 0.5vh across all six viewports: route half exactly 6
screens on both builds at every width; `unsettled` 0 everywhere on both; `nearEmptyVh` identical to
V13 (0 / 0 / 0 / 0 / 1 / 1); the document is shorter at every width (8385 → 8034 at 320, 10917 →
10702 at 768); "sharp: yes"; 0 of 99 overflow at 320–768; 0 standalone sub-44 touch targets; the
V13 mobile e2e cases all pass.

**Why I did not fix it.** There is no *measured* regression, and `CLAUDE.md` forbids reopening a
frozen system without one or without an explicit new phase; brief §23 says the same. A 32px interval
inside a composition is art direction, and §28 tells me to record art direction rather than change
it. The minimal mechanical repair does exist and is small — scoping the detail block's `mt-8` to
`lg:` restores the frozen 32px on mobile and provably cannot touch desktop, where the detail is a
separate column — but making that call, and the calls on (b) and (c), belongs to the owner.

### 6.2 ENVIRONMENT + TEST — WebKit 220/224, and I reproduced two of them on the baseline

My WebKit run failed exactly the four the return names:

1. `shell.spec.ts` "skip link is the first Tab stop" — the Phase 7 environment case (Safari's Tab
   default);
2. `spatial.spec.ts` "focusing a not-yet-reached project link re-centers the camera" — the Phase 7
   governed-arrival case;
3. `spatial-v5.spec.ts` "the surface opens monotonically and stays open";
4. `spatial.spec.ts` "every break rail closes onto the frame at the cut" (`best` = 1440, the rails
   fully open).

I then served **the baseline build `5670234` on the same port** and ran (3) and (4) from the same
spec files — which are unchanged between `5670234` and `35c2c58` — on the same WebKit: **both fail,
with the same values.** That is an independent confirmation of the return's §3a: this is the
machine's software-rendered WebKit leaving the camera stationary after a large `scrollTo`, and the
tests' settle heuristic (six identical 120ms reads after ten polls) reading that stall as arrival.
**Not a V14 regression.** Chromium passes all four.

**I did not change the heuristic**, and this is deliberate. The sound repair is to require the read
value to have *changed at least once* since the jump before accepting stability — a stall then can
never be mistaken for arrival. But this sweep takes 13 samples inside a 120s WebKit budget, its poll
already caps at 10.8s per sample, and the file's own history records this heuristic being retuned
twice; a third tuning that I cannot validate against a stable WebKit would trade an honest, twice-
reproduced environment failure for a possible timeout in a suite about to go to owner review. It is
written down here instead, with the remedy, for a pass that can validate it. No assertion was
weakened or touched.

### 6.3 TEST / tooling — FIXED

`tests/tools/phase7-runtime-probe.mjs` hard-coded its output to `docs/review/phase7/runtime.txt`,
a **committed** artifact, with no override. Running it to check this build silently rewrote the
Phase 7 record (a CLS line moved 0.0000 → 0.0005 on `/work/dropspot`, ordinary run-to-run noise);
the only sign was a dirty working tree. I restored the file with `git checkout` and added an
optional `--out <file>` flag, defaulting to the same path so every existing invocation is unchanged,
and a row in `docs/REVIEW_POLICY.md` saying a later gate must pass it. Verified: with `--out` the
probe writes elsewhere and leaves the tree clean.

### 6.4 Observations, no action

- **Scene fit at 1440×900 clears by 12px.** `software-factory` is the binding composition and its
  margin is −12px (−16px at 1536×864, −37px at 1366×768). It clears, and `WORLD_REFERENCE.height`
  990 is set from exactly this measurement — but the margin is thin enough that any future growth in
  that scene's identity row or plate will clip it before any other check notices. Worth a re-run of
  `scene-fit-probe.mjs` after any content change to the flagship.
- **The forward-2 traverse is ungoverned for its first notches on both builds** — the return's §5
  observation reproduces here (3.4s against 3.5s, p95 33.3ms on both). Identical on the baseline;
  not a V14 behaviour.
- **`.ai/STATE.md` said "three font-preload console notices" on the 404 route**; the measured count
  is 6 messages (the route's own 404 response and the preload notices). Corrected in `STATE.md` as
  part of this return.
- **Two `<nav>`s share `aria-label="Primary"`** — pre-existing, axe-clean, unchanged by V14.

## 7. What I did not do

- I did not change any composition, on desktop or mobile, and did not reinterpret any art direction.
- I did not touch `main`, V13, the recovery bundle, the baseline worktree (verified clean after
  every A/B), or any external repository. I did not remove the baseline worktree — that is Fable's.
- I did not run the WebKit frame-time probes; the return's WebKit numbers are Fable's and I did not
  re-measure them. I verified WebKit only through the e2e suite and the baseline A/B in §6.2.
- I did not re-capture the review package's recordings, zoom stills or focus frames. I verified the
  numbers behind them (§5, artifact identity), not the images.
- I did not run Firefox (D-010 keeps it a manual/later check).
- I did not fix the three mobile deltas in §6.1 or the WebKit settle heuristic in §6.2, for the
  reasons given in each.
- I did not declare FINAL FREEZE, OWNER ACCEPTED or READY TO MERGE, and nothing was merged.

## 8. Changes I pushed

Two files, neither behavioural, neither touching the product:

- `tests/tools/phase7-runtime-probe.mjs` — an optional `--out <file>` flag (§6.3).
- `docs/REVIEW_POLICY.md` — the matching row, and a note that the probe covers the sub-1024 widths
  the e2e overflow suite does not reach.

Plus this return and the `STATE.md` / `HANDOFF.md` rows that point at it.

Re-validated after the edits: typecheck 0 · lint 0 · `format:check` pass. The product bundle is
untouched, so the build and e2e results in §5 stand for the pushed tip.

## 9. Verdict

**OPUS V14 QA: PASS WITH DOCUMENTED NON-BLOCKERS.**

The scroll physics is intact and the route's ceiling is byte-identical; the vertical pacing finding
is real, is fixed by a derived gearing rather than a constant, and I measured 9.9s → 3.9s myself;
the route geometry did not move; frame time is at parity within 0.3ms; motion carries no scale or
filter on foreground content; every desktop viewport fits; overflow, runtime, images, CLS,
accessibility and touch targets are clean; the committed artifacts reproduce from the committed
code. The non-blockers are the three unlisted mobile composition deltas in §6.1 — which the owner
should see, because mobile was declared untouched — and the four WebKit failures in §6.2, two of
which I reproduced on the baseline build.

**Owner acceptance is the gate and it is pending.** Nothing here authorises a merge.
