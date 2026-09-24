# V14.11 engineering gate

Work is uncommitted. Application baseline `60a6708`; actual HEAD `1ec2726` differs only in orchestrator records. Only the known capture script was untracked at entry; it is untouched. No other active agents were present.

## Before measurements

Commands (PowerShell, production server on 3200):

```powershell
$env:PROBE_BASE='http://127.0.0.1:3200'; $env:PROBE_OUT='docs/review/v14.11-engineering/before'; node tests/tools/scroll-contract-probe.mjs
$env:PROBE_OUT='C:/Users/hakan/portfolio-review/v14.11-engineering/before'; node tests/tools/v14-11-engineering-probe.mjs
```

Small records: `before/objectives.json`, `before/scroll-contract-1536x864.json`. Per-frame traces: `C:/Users/hakan/portfolio-review/v14.11-engineering/before/`.

Navigator first names Kivilcim at 205ms (1440x900), evidence left 2319.68 / top 1171.30; at 1920x1080, 177ms, left 2744.66 / top 1408.98. Both sizes restart the cue after returning to the top; disabled PREVIOUS runs `nav-cue-breathe`.

1440x900 boundary: pinnedEnd 4560.5, start 60.5, span 4500. Downward 400px notches, 100ms waits: `52,64,72,64,452,400,400,400,400,400,400,400,400,389,0,0,0,0,0,0,0,0,0,0`. Upward: `-400,-400,0,-136,-204,-206,-82,-80,-72,-72,-80,-72,-72,-72,-80,-72,-72,-80,-72,-72,-72,-47,-67,-56`. Steps include scheduling variation; exact before/after positions are in the JSON.

1536x864 scroll contract: route aggressive peak 520px/s, coast 502px; lower aggressive peak 8333px/s, coast 0px. Reverse 2 notches, 6px wrong-way travel (the old audit's zero did not reproduce in this run).

Frame minus evidence right edge, pixels:

| Size | Scene | Frame right | Evidence right | Difference |
|---|---|---:|---:|---:|
|1440x900|Software Factory|1190.85|1178.13|12.72|
|1440x900|Kivilcim|1191.61|1250.47|-58.86|
|1440x900|JointLedger|1190.65|900.65|290.00|
|1440x900|DropSpot|1191.18|1178.44|12.73|
|1920x1080|Software Factory|1495.33|1481.33|14.00|
|1920x1080|Kivilcim|1495.05|1559.80|-64.75|
|1920x1080|JointLedger|1494.00|1175.00|319.00|
|1920x1080|DropSpot|1494.31|1480.29|14.02|

Only Kivilcim protrudes past the right frame. JointLedger's text occupies the area to the right of its evidence, so that positive clearance is intentional.

## Objective 3 ? actual composition registration

Cause: SystemPOV inset to the composition wrapper, excluding evidence that extends past it. A desktop-only ResizeObserver now measures the union of the wrapper and every evidence source, converts screen bounds back to local units, and supplies only the horizontal frame overhang. The composition and its design overhang are unchanged. This common mechanism covers all four scenes; only Kivilcim requires extra width.

After command: `$env:PROBE_OUT='C:/Users/hakan/portfolio-review/v14.11-engineering/after'; node tests/tools/v14-11-engineering-probe.mjs`.

| Size | Scene | Frame right | Evidence right | Difference |
|---|---|---:|---:|---:|
|1440x900|software-factory|1190.85|1178.13|12.72|
|1440x900|kivilcim|1263.19|1250.47|12.72|
|1440x900|jointledger|1190.65|900.65|290.00|
|1440x900|dropspot|1191.18|1178.44|12.73|
|1920x1080|software-factory|1495.33|1481.33|14.00|
|1920x1080|kivilcim|1573.80|1559.80|14.00|
|1920x1080|jointledger|1494.00|1175.00|319.00|
|1920x1080|dropspot|1494.31|1480.29|14.02|

Every evidence right edge is identical to baseline. Kivilcim now has 12.72px / 14px clearance, consistent with its vertical clearance. The other three frames are unchanged.

## Objective 1 — observed presentation and instrument legibility

Cause: the old readout applied a 0.35-viewport lead to raw scroll while the visible scene and acquisition word followed filtered camera progress. A read-only bridge now publishes the existing filtered MotionValue without changing it. The canonical station list selects a scene when its signed approach enters the existing ACQUIRED range (-0.35 through 0.2), retaining the last subject between acquisitions. Lower sections continue to use document position. Ticks, chevrons and keys still step the same canonical array, and navigation still only scrolls the document.

After the same probe command, Kivilcim is first named at 927ms at 1440x900, evidence left 979.97 / top 592.40 (inside the viewport); at 1920x1080, 930ms, left 1232.84 / top 691.07. This is an acquisition report, not a claim that the composition has stopped moving; camera lag remains outside this gate. The cancellation latch is now part of the observable snapshot, so returning to the top cannot restart the cue. Animation completion also ends eligibility. PREVIOUS has no cue and animationName is none; returned-to-top NEXT also has animationName none, at both sizes.

The navigator's painted marks use paper with difference compositing against the actual material under each mark. This handles a partly interlocked cover without a timing switch or background. SceneBreak is unchanged. Command: `$env:PROBE_OUT='C:/Users/hakan/portfolio-review/v14.11-engineering/ink'; node tests/tools/v14-11-ink-probe.mjs`. On a settled black frame at progress 0.72, a 340x66 navigator crop has 274 pixels above mean channel 150 (peak 215.33). Restoring the old navigator colors and normal compositing on the same frame gives 0 (peak 127.67). This is a controlled **baseline-style reconstruction**, not a screenshot collected from the original production build. Both crops are in the external ink directory; the after crop was visually inspected.

## Objective 2 ? finite route/native blend

Cause: the wheel handler released downward input at a binary pinnedEnd test and reacquired upward input a full viewport early with the old geared page budget. The finite 0.75-viewport band below pinnedEnd now mixes native displacement with the existing governed intent. The native contribution increases continuously across the band; remaining intent decreases by the complementary share. Beyond the band, the browser owns the event and pending governed motion is discarded. The route-side budget, lead cap, reverse sign collapse and break absorber are unchanged. No camera filter or geometry constants moved.

Final after command: PROBE_OUT=C:/Users/hakan/portfolio-review/v14.11-engineering/final node tests/tools/v14-11-engineering-probe.mjs (set the environment variable in PowerShell as above).

Downward steps: 20, 48, 48, 56, 48, 48, 53, 70, 108, 207, 341, 400, 400, 400, 400, 400, 400, 400, 400, 30, 0, 0, 0, 0.

Upward steps: -400, -400, -232, -89, -64, -64, -56, -48, -48, -48, -56, -56, -64, -56, -56, -56, -56, -56, -64, -56, -64, -56, -64, -64.

The pin remains 4560.5 at 1440x900 and 5460.5 at 1920x1080; routeStart 60.5, routeSpan 4500 / 5400. The unchanged INTENT_LEAD_VH=0.6 gives lead caps 540 / 648px. Protected sceneRoute.ts, scenes.ts, cameraFilter.ts and SceneBreak.tsx have empty diffs against 60a6708.

After scroll-contract command: same as before with PROBE_OUT=docs/review/v14.11-engineering/after. At 1536x864, route aggressive peak 431px/s (before 520), coast 502px (same), reverse 2 notches / 0px wrong-way (before 2 / 6). Lower aggressive peak 7273px/s (before 8333), coast 0px (same). This is native-order speed, not a return to the old 1543px/s ceiling. Wall-clock rates varied; the route model was not retuned to compensate. The route and document geometry in the contract JSON are identical.

Final navigator confirmation: first acquisition at 937ms / 1141ms, with evidence already intersecting each viewport. Frame measurements and cue outcomes reproduce the first after run exactly.
