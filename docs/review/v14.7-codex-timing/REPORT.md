# Engineering Gate 2 — timing and spacing

Engineering work complete; changes remain uncommitted. Owner scope: UNDERNEATH release,
four-stops acquisition, desktop About spacing only.

## Baseline and measurement method

- Branch: `feature/owner-visual-acceptance-v14`; HEAD `bd3d840`. `git diff 84fb5a9 HEAD --stat`
  contains only four orchestrator records; application source matches `84fb5a9`.
- Initial working tree clean. `collaboration.list_agents` showed only this writer;
  latest component/library/test mtimes were September 8, before this run.
- Read `CLAUDE.md`, active state/task, `docs/FROZEN_BOUNDARY.md` and `docs/REVIEW_POLICY.md`.
  The owner's current instruction authorizes this gate over the prior owner-review state.
- Windows uses `pnpm.cmd` because PowerShell execution policy blocks `pnpm.ps1`.
  Initial sandboxed `pnpm.cmd build` failed fetching Google Fonts. Retried with approved
  network access: PASS, with the actual fonts. No font or build configuration changed.
- Baseline production server: `pnpm.cmd exec next start -p 3200`.
- Before probe: `node tests/tools/timing-spacing-probe.mjs --out docs/review/v14.7-codex-timing/metrics/before.json`.
  The tool reads current route exports and samples rendered Chromium composition opacity.
  Binary searches resolve thresholds to adjacent integer scroll pixels after camera-transform
  stability. Full means computed opacity exactly 1; floor means <=0.340001.
  Entry means the first intersecting composition text line box, not the scene's empty footprint.
  About's first/last ink measurements use visible text Range line boxes, excluding decorative
  rules; they are not pixel-level glyph outlines. Primary viewing position centres the stage
  in the viewport. Both 1440×900 and 1920×1080 are measured.

This report was written incrementally: About results first, then each timing goal as its
after-numbers arrived, followed by validation and parity evidence.

## Goal 3 — About stage balance (measured and complete)

Before and after commands:

```powershell
node tests/tools/timing-spacing-probe.mjs --layout-only --out docs/review/v14.7-codex-timing/metrics/before-layout.json
node tests/tools/timing-spacing-probe.mjs --layout-only --out docs/review/v14.7-codex-timing/metrics/after-layout.json
```

The separate layout run adds the finale's text bounds to the full timing probe's layout
measurements and excludes screen-reader-only text. Raw output is in those two JSON files.

| Viewport | Stage height before → after | CSS margin top / bottom before → after | First text from stage top before → after | Last text to stage bottom before → after | Document height before → after |
|---|---:|---|---:|---:|---:|
| 1440×900 | 576 → 576 | 160 / 0 → 160 / 0 | 16 → 99.828 | 173.063 → 89.234 | 9504 → 9504 |
| 1920×1080 | 691.188 → 691.188 | 160 / 0 → 160 / 0 | 16 → 157.422 | 288.250 → 146.828 | 10865 → 10865 |

All distances are CSS pixels. The cause was top-aligned register/content inside a minimum-height
stage: spare height accumulated below the content. `SystemNode` now adds `lg:flex lg:flex-col
lg:justify-center` only when `stage` is true (About is its sole caller). The existing `64vh`
minimum, major interval and finale margin are unchanged. `AboutPreview.tsx` itself is untouched.
Text spacing is now within 10.594 pixels of equal above/below at both sizes; the small difference
reflects text line boxes inside the centred register/content boxes.

Isolation is preserved at the same primary scroll positions (7832 and 8909):

| Viewport | Stage top / bottom in frame, unchanged | Field Notes block bottom, unchanged | Finale first text top, unchanged |
|---|---:|---:|---:|
| 1440×900 | 162.328 / 738.328 | −51.672 | 968.344 (>900) |
| 1920×1080 | 194.109 / 885.297 | −30.688 | 1183.719 (>1080) |

Field Notes is entirely above the frame. The finale's text is still below it. Its empty container
edge enters near the viewport bottom (883.328 / 1030.297), as on the baseline; no finale content
competes. The stage's external gap to the footer is unchanged at 144px, including existing
lower-world spacing and the footer's own margin. No mobile class changed.

Nothing remains unresolved for this goal's engineering criteria; owner visual acceptance is separate.

## Goal 1 — UNDERNEATH release

Commands (run against freshly built baseline/candidate production servers):

```powershell
node tests/tools/timing-spacing-probe.mjs --out docs/review/v14.7-codex-timing/metrics/before.json
node tests/tools/timing-spacing-probe.mjs --out docs/review/v14.7-codex-timing/metrics/after.json
```

The baseline verifies the proposed cause. At 1440×900, reorient's adjacent segments occupy
185.115 and 473.512 scroll pixels; approach's occupy 473.512 and 433.118. `sceneApproach`
chooses their respective minima, 185.115 and 433.118. The same +0.2 full-hold and +0.2…+0.6
release curve therefore gives UNDERNEATH much less reading time. At 1920×1080 those segment
pairs are 222.138/568.214 and 568.214/519.741. They are unchanged in the candidate.

`sceneCompositionPresence` derives the reference scene's reach from the existing focus progresses
and applies it to UNDERNEATH's departure only. This preserves the reference's full-hold duration
and complete release, while the original signed approach still drives all acquisition-frame
language and depth. UNDERNEATH's entrance is unchanged. `scenePresence` and
`systemsWordPresence` themselves are byte-for-byte unchanged.

| Viewport | Scene | Full hold after focus, before → after (px) | Opacity 1 → 0.34, before → after (px) |
|---|---|---:|---:|
| 1440×900 | reorient | 37.474 → 86.474 | 75 → 174 |
| 1440×900 | approach | 86.962 → 86.962 | 174 → 174 |
| 1920×1080 | reorient | 44.469 → 103.469 | 90 → 209 |
| 1920×1080 | approach | 104.255 → 104.255 | 209 → 209 |

At 1440×900, UNDERNEATH is last fully opaque at scrollY 3557 (was 3508), and reaches its
0.34 floor at 3731 (was 3583). Built in Layers remains 4031…4205. The subpixel differences
between full-hold measurements reflect integer scroll thresholds at different fractional focus
positions; the new unit test compares the two curves at identical pixel offsets from focus.
Release still completes while UNDERNEATH text is on screen, well before the next scene's focus.
At 1920×1080 the new last-full/floor positions are 4256/4465 (baseline 4197/4287), while the
reference remains 4825/5034. Both viewports meet the release criterion; no unresolved issue.

## Goal 2 — four-stops acquisition

Commands: the same before/after timing probe above. Handoff's old acquisition reach comes from
its short exit (183.345 scroll pixels at 1440×900), although it arrives over the much longer
433.118-pixel leg from approach. This keeps it detected until late in its actual visible entry.

The composition now uses that incoming leg, with the same detected/full opacity values and a
0.12 presentation offset: full at halfway through the incoming leg, instead of near focus on
the exit-derived window. The handoff release is unchanged. No route or annotation curve moved.

| Viewport | First text on screen Y, before → after | First opacity 1 Y, before → after | Entry → full distance, before → after |
|---|---:|---:|---:|
| 1440×900 | 4067 → 4067 | 4308 → 4162 | 241 → 95px |
| 1920×1080 | 4829 → 4829 | 5158 → 4982 | 329 → 153px |

At 1440×900 this is full readability after 95 pixels of travel (10.6% of viewport height),
around 215 pixels before the unchanged focus. The computed opacity at first visible text is
0.573252, rising to exactly 1; it is not being declared readable from a subjective screenshot.
At 1920×1080 it is fully readable after 153 pixels (14.2% of viewport height), about 258 pixels
before focus, with entry opacity 0.45. Both sizes now acquire early in the visible passage;
no unresolved issue for this goal.

## Route and preserved boundaries

The before/after JSON records have identical geometry, all nine focus progresses and all nine
anchors at each viewport. The unchanged route is responsive, rather than a fixed 4500px at
every height:

| Viewport | routeStart | routeEnd | routeSpan | leadCapPx |
|---|---:|---:|---:|---:|
| 1440×900 | 60.5 | 4560.5 | 4500 | 540 |
| 1920×1080 | 60.5 | 5460.5 | 5400 | 648 |

Read-only `git diff --name-only 84fb5a9 --` for the following protected files returned no paths:
`lib/spatial/{sceneRoute,scenes,cameraFilter,wheelMotion,worldFit}.ts`,
`components/spatial/{SceneBreak,SystemsWord,SystemPOV,WorldGrammar}.tsx`,
`components/sections/{SelectedSystems,AboutPreview}.tsx`, and `styles/globals.css`.
The `SpatialCamera` diff is limited to the presence import and its derived motion value;
the governor call, smoothing, ceiling and first-load implementation are untouched.
The `systemPov` diff adds a composition helper and route imports; both existing presence
functions are unchanged. Project content, order, evidence, strata and no-orange tokens are untouched.
The required sanctioned-move row was added to `docs/FROZEN_BOUNDARY.md` §5.

## Validation

| Command | Result |
|---|---|
| `pnpm.cmd typecheck` | PASS, exit 0 |
| `pnpm.cmd lint` | PASS, exit 0 |
| `pnpm.cmd exec vitest run tests/unit/spatial-composition-timing.test.ts tests/unit/spatial-system-pov.test.ts tests/unit/spatial-route.test.ts` | PASS, 3 files, 66 tests |
| `pnpm.cmd build` | PASS baseline and candidate with network access for existing fonts; initial sandbox attempt failed as documented above |
| `$env:PORT='3200'; pnpm.cmd exec playwright test --project=chromium tests/e2e/motion.spec.ts tests/e2e/spatial.spec.ts tests/e2e/spatial-v5.spec.ts tests/e2e/home.spec.ts` | PASS, 95 passed / 2 existing skips, 1.3 minutes, candidate production server on port 3200 |
| Before/after timing/layout probes | PASS at both requested desktop viewports; raw threshold brackets and geometry in `metrics/` |
| Mobile route, `PROBE_STEP=2` | PASS geometry preservation at all six widths; 16 coverage-sample differences disclosed below |
| `node tests/tools/timing-spacing-mobile-check.mjs` | PASS: route geometry/focus/anchors identical; mobile geometry identical; zero computed effects from the added desktop stage classes |

The full acceptance matrix and WebKit were **not run**. No existing tests were changed,
weakened or deleted. The new three-test unit file checks equal scroll-offset release timing,
early handoff acquisition with its old release, and exact preservation of mobile/SYSTEMS/other
composition curves across the route.

The existing skips are `spatial-v5.spec.ts`'s “the cut runs at the camera route's own bearing”
and “the surface opens monotonically and stays open”, both already skipped for the retired
desktop seam. They were not edited.

## Mobile comparison and remaining measurement limits

```powershell
$env:PROBE_STEP='2'
$env:PROBE_OUT='docs/review/v14.7-codex-timing'
$env:PROBE_STILLS=''
node tests/tools/mobile-route-probe.mjs
git diff --no-index -- docs/review/v14.6-codex-motion/metrics/mobile-route.json docs/review/v14.7-codex-timing/metrics/mobile-route.json
node tests/tools/timing-spacing-mobile-check.mjs
```

All six widths ran: 320, 360, 375, 390, 430 and 768. Raw output is `metrics/mobile-route.json`;
`metrics/parity.json` records every differing value and the additional controls. Document heights,
tour offsets/heights, focus positions, focus steps, touch-target sizes and every sampled scene
bounding box are identical to Gate 1. No probe sample was unsettled.

The complete JSON is **not identical**: 16 values differ, all in lower-world coverage samples or
their means. Maximum absolute changes: pixel ink-row fraction 0.005, material-row fraction 0.007,
DOM coverage fraction 0.001, first/last ink position 0.002 viewport heights; lower-world mean
pixel ink-row fraction differs by at most 0.001. Route coverage and the entire 430×932 record
are identical. These differences are retained, not rounded away.

The probe waits for the camera transform, then takes DOM and raster samples separately; it does
not wait for every lower-section reveal. That makes animation-sampling variation a plausible
explanation, **not a separately proven cause** in this run. To test the actual layout edit,
the follow-up tool removes only the three new desktop stage classes in a browser task and
compares all 814 elements' boxes plus 15 computed properties before/after, at every mobile
width: **zero changes at every width**. The unit test separately proves the mobile opacity
functions are exactly unchanged throughout the route. Together with the identical route/scene
geometry, these establish that this gate's changes do not move the mobile composition; the
historical raster coverage record is not claimed to reproduce exactly.

PowerShell removes an environment variable when assigned an empty string, so the probe's default
320/375 still capture remained enabled. Those generated bulk stills were moved outside Git to
`C:\Users\hakan\AppData\Local\Temp\portfolio-v14.7-mobile-route-stills` (temporary storage, not
durable evidence). For future metrics-only runs use `$env:PROBE_STILLS='none'`. No screenshots or
per-animation-frame arrays are included in the change; the six-width raw JSON is about 130KB.

## Files left changed

- `lib/spatial/systemPov.ts` — desktop composition timing helper; existing curves preserved.
- `components/spatial/SpatialCamera.tsx` — composition opacity reads that helper.
- `components/spatial/SystemNode.tsx` — desktop stage centering; height/margins preserved.
- `tests/unit/spatial-composition-timing.test.ts` — timing and preservation contracts.
- `tests/tools/timing-spacing-probe.mjs` — reproducible rendered before/after measurements.
- `tests/tools/timing-spacing-mobile-check.mjs` — explicit JSON diff and desktop-class/mobile control.
- `docs/FROZEN_BOUNDARY.md` — required §5 sanctioned-move row.
- `docs/review/v14.7-codex-timing/REPORT.md` — this incremental report.
- `docs/review/v14.7-codex-timing/metrics/before.json`
- `docs/review/v14.7-codex-timing/metrics/after.json`
- `docs/review/v14.7-codex-timing/metrics/before-layout.json`
- `docs/review/v14.7-codex-timing/metrics/after-layout.json`
- `docs/review/v14.7-codex-timing/metrics/mobile-route.json`
- `docs/review/v14.7-codex-timing/metrics/parity.json`

No commit, push, branch, tag, worktree, merge or orchestrator-record edit was performed.
No pre-existing review evidence was modified. Owner visual acceptance remains the owner's decision.
