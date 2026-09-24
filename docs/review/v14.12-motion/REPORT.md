# V14.12 motion / readability gate

Work in progress; changes remain uncommitted. Application baseline is `e37e77b`;
HEAD `0d350d0` adds checkpoint documentation only. The known untracked
`tests/tools/v14-10-review-capture.mjs` is untouched. No other agent was running.

## Measurement method

Command: `$env:PROBE_PHASE='before'; node tests/tools/v14-12-motion-probe.mjs`.
Production Chromium, localhost:3200, 1440x900 and 1920x1080. Real wheel events;
requestAnimationFrame samples document scroll and evidence DOM rectangles.
Camera tail is accumulated Euclidean screen displacement of the arriving scene's
evidence after the last frame with >0.1px document movement. Settle means within
1px of the final rectangle. Durations have frame-resolution uncertainty.
Wheel-event coast and document-stop camera tail are separate quantities.
An abrupt programmatic document jump is a stress control, not a wheel gesture.
Bulk frame traces: `C:\Users\hakan\portfolio-review\v14.12-motion\before\`.
Compact measurements: `before.json` (written as each viewport completes).

## Initial findings

At 1440x900, aggressive forward wheel leaves 71.17px / 250.5ms of camera tail
after document stop; slow forward leaves 23.18px / 197.5ms. Aggressive reverse
leaves 77.56px / 283.3ms. These do not reproduce the supplied 519px case.
Navigation immediately followed by a wheel event leaves 1496.51px / 997.2ms;
an abrupt 0.17-to-0.30 route-progress document jump leaves 2204.48px / 1442.2ms.

There are two mechanisms in the camera: the lag cascade and `glideStep`, which
caps visual progress again after the document governor has already paced wheel
input. That second cap also limits navigation catch-up, allowing a large visual
backlog. Its constants are shared with accepted wheel pacing; changing those
constants would address the wrong mechanism. Mobile uses this same camera hook,
so any new camera response must explicitly select a desktop branch.

No composition opacity, Reveal, EditorialDrift, departure scale, layout, content,
route geometry, or wheel-governor changes have been made at this point.

## Objective 1 — camera lag: implemented and measured

After command: `$env:PROBE_PHASE='after'; node tests/tools/v14-12-motion-probe.mjs`.
Derive both summaries with the matching `PROBE_PHASE` and
`node tests/tools/v14-12-trace-summary.mjs`. The latter also corrects the capture
script's initial one-frame settle-boundary accounting; the JSON is authoritative.

Changed `cameraFilter.ts` to provide a desktop-only 12-to-8ms response per stage,
capped at 0.7 frame intervals on high-refresh displays. Both fractional stages
remain; this is not pass-through. The original 48-to-22ms response remains the
default/mobile branch. `SpatialCamera.tsx` selects the desktop response and stops
applying `glideStep` to desktop presentation: the document's wheel governor
already paces that input, while native smooth navigation supplies its own journey.
Mobile retains the visual glide cap. No wheel-handler code or pacing constants changed.

| Viewport / input | Before tail px | After tail px | Before ms | After ms |
|---|---:|---:|---:|---:|
| 1440 slow forward | 23.18 | 1.66 | 197.5 | 15.7 |
| 1440 aggressive forward | 71.17 | 1.96 | 250.5 | 16.9 |
| 1440 slow reverse | 17.87 | 1.07 | 183.8 | 19.5 |
| 1440 aggressive reverse | 77.56 | 0.65 | 283.3 | 0 |
| 1440 navigation + immediate wheel | 1496.51 | 0.49 | 997.2 | 0 |
| 1440 abrupt document jump (stress control) | 2204.48 | 366.69 | 1442.2 | 56.8 |
| 1920 slow forward | 18.57 | 0.93 | 183.4 | 0 |
| 1920 aggressive forward | 21.60 | 1.63 | 201.9 | 24.7 |
| 1920 slow reverse | 11.32 | 0.46 | 154.6 | 0 |
| 1920 aggressive reverse | 10.69 | 0.36 | 159.9 | 0 |
| 1920 navigation + immediate wheel | 1561.39 | 0.18 | 949.3 | 0 |
| 1920 abrupt document jump (stress control) | 2465.40 | 297.83 | 1466.7 | 59.0 |

Zero ms means already within the declared 1px tolerance, not zero smoothing.
Aggressive forward tail distance falls 97.2% / 92.5% at 1440 / 1920.
The supplied 519px result was not reproduced by these explicit input profiles.
Abrupt instant document jumps still make a large movement, now concentrated in
about 60ms; this control is not a claim that an instantaneous scroll jump is cinematic.
Navigation continues to use native smooth scrolling and the two-stage filter.

## Objective 2 — motion readability: measured, no additional effects changed

A defensible tracking proxy is the P95 distance between an on-screen, >=0.8-opacity
evidence rectangle and where the document's current route position says it should
be. The analysis executes unchanged `cameraPosition` and `worldFit` pure geometry,
anchors the rectangle at the final settled sample, and evaluates only frames up
to document stop. This measures pursuit lag, not human reading speed or acuity.

| Viewport / input | Before tracking gap px | After tracking gap px |
|---|---:|---:|
| 1440 slow forward | 109.27 | 23.86 |
| 1440 aggressive forward | 296.13 | 26.02 |
| 1440 slow reverse | 75.57 | 12.09 |
| 1440 aggressive reverse | 237.33 | 13.70 |
| 1920 slow forward | 84.45 | 9.70 |
| 1920 aggressive forward | 125.62 | 11.34 |
| 1920 slow reverse | 58.27 | 7.58 |
| 1920 aggressive reverse | 93.90 | 5.81 |

The aggressive-forward tracking gap falls 91.2% / 91.0%. Visible evidence continues
moving only 1.96 / 1.63px after document stop, versus 71.17 / 21.60px. This directly
reduces the need to follow content after the reader has stopped the document.

The measured problematic project-route intervals precede the departure scale and
the lower-world Reveal/EditorialDrift effects. Acquired evidence in the traces is
already opacity 1. No additional material contributor is established here, so none
of these effects was changed. No CSS blur/filter investigation was performed.
`systemPov.ts` is untouched: the V14.7 composition timing and V14.8 visual curves
are preserved, with no opacity retuning requiring a new acceptance measurement.
This does not claim the accepted route speed itself is easier to read at every instant;
the governor's speed and lead remain frozen, and real-wheel timings vary with frame delivery.

## Validation in progress

- `pnpm.cmd typecheck`: passed.
- `pnpm.cmd lint`: passed before the final probe additions; final check pending.
- Targeted Vitest: 5 files, 116 tests passed (`spatial-filter`, `route-navigation`,
  `route-boundary`, `spatial-route`, `spatial-system-pov`). Two new filter contracts
  cover smoothing/80ms settling/next-step reversal at 30–144Hz and monotonic cut crossing.
- `pnpm.cmd build`: passed. Initial sandbox build failed fetching the three existing
  Google Fonts; the authorized network-enabled rerun succeeded. No font code changed.
- Production server rebuilt and restarted on port 3200. Focused Chromium is running.

PowerShell blocks `pnpm.ps1`; commands use the equivalent installed `pnpm.cmd` shim.

## Objective 3 — preservation checks (updated as completed)

The fast-forward-to-reverse probe also found an existing camera discrepancy:
before, the document reversed but camera reversal followed 4 / 3 presentation
frames later, with 27.95 / 24.50px wrong-way horizontal travel. After, the camera
reverses on the next presentation frame at both sizes (51.1 / 60.5ms after the
wheel event, versus document reversal at 32.7 / 32.4ms). Wrong-way travel from that
next frame onward is 0px. The frame where document reversal is first observed
still contains 0.01 / 0.18px of prior presentation movement; this is disclosed
rather than rounded into an absolute zero claim.

Navigator timing in the navigation-plus-wheel case changes from 837.8 to 259.6ms
at 1440 and 833.6 to 246.6ms at 1920. At first naming, Kıvılcım's evidence is
genuinely intersecting the frame: after rectangles x/y/w/h are
751.18/483.04/867.03/545.80 and 1131.38/637.63/953.75/600.33, respectively, with
composition opacity 1. The navigator still observes filtered progress.

Lower native wheel input delivers exactly five 200px events (1000px total), with
0 extra document pixels at both sizes, before and after. After native peaks over
80–140ms windows are 3361 / 3842px/s, versus 3839 / 3113px/s before; this is native
order, not route-limited. The route governor's lead remains exactly 540 / 648px
under aggressive wheel input, before and after. The offscreen route camera's
lower-world tail entries are explicitly excluded from readability claims.

Cold first paint commands:
`$env:PROBE_VIEWPORT='1440x900'; node tests/tools/initial-paint-probe.mjs --out docs/review/v14.12-motion/initial-paint-1440.json`
and the corresponding `1920x1080` / `initial-paint-1920.json` command.
Both report **FIRST PAINT == SETTLED**; JSON evidence is retained here.

Focused Chromium command (only the requested six files):
`$env:PORT='3200'; pnpm.cmd exec playwright test --project=chromium tests/e2e/motion.spec.ts tests/e2e/spatial.spec.ts tests/e2e/spatial-v5.spec.ts tests/e2e/navigation.spec.ts tests/e2e/home.spec.ts tests/e2e/smoke.spec.ts`.
Playwright reports **113 passed, 2 skipped**, 1.1 minutes. PowerShell returned
status 1 because redirected Node `NO_COLOR`/`FORCE_COLOR` warnings became
`NativeCommandError`; the log contains no failed test. Full log is in the bulk
directory as `chromium.log`. No test contracts were weakened or changed.
The full acceptance matrix and WebKit were not run.
