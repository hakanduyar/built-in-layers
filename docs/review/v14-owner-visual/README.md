# V14 — owner visual review package

The candidate on `feature/owner-visual-acceptance-v14` against the accepted technical baseline
`5670234`, captured with the same tools, at the same viewports, from production builds of each.
Nothing here is a mock-up: every video is the governed journey under real wheel input, and every
still is the built page parked at the route's own focus positions.

**Owner acceptance is pending.** Neither model has declared this accepted, frozen, or ready to merge.

The recordings (`*/recordings/*.webm`) live in the working tree only: this repository ignores
`docs/review/**/recordings/` by rule, as it did for every earlier gate. The committed
`journey.json` beside each set carries every number the recordings were measured for, and
`tests/tools/v14-baseline.mjs` regenerates the videos from either build.

## A · Full desktop forward journey

| | baseline `5670234` | candidate |
|---|---|---|
| 1440×900 | `baseline/recordings/1440x900--forward.webm` | `after/recordings/1440x900--forward.webm` |
| 1920×1080 | `baseline/recordings/1920x1080--forward.webm` | `after/recordings/1920x1080--forward.webm` |

Wheel: 120px notches every 55ms (a normal reader), from the top to the end of the route, then on to
the end of the document. The notch counts and seconds each half cost are in `journey.json` beside
the recordings.

## B · Full desktop reverse journey

`{baseline,after}/recordings/1440x900--reverse.webm`, `1920x1080--reverse.webm` — from the end of
the document back to the top at the same cadence.

## C · Lower-world / vertical scroll

`{baseline,after}/recordings/1440x900--lower-world.webm` and `--lower-world-aggressive.webm`
(also at 1920×1080): the traversal from the exact point the world hands over to the end of the
page, once at a normal wheel and once at a hard flick (400px notches at 16ms). The two baseline
recordings take the same time, which is the finding F the owner reported; the candidate's are in
`after/journey.json`.

## D · Zoom-out

`{baseline,after}/zoom/1920x1080@{100,80,67,50}--{software-factory,kivilcim-to-jointledger,dropspot,systems,underneath,handoff,lower-world,cta}.png`
— the same route beats at the same four zoom levels (emulated as the CSS viewport a 1920×1080
display reports at each zoom: 1920, 2400, 2866 and 3840 wide).

## E · Key focus frames

`{baseline,after}/stills/{1440x900,1920x1080}--<beat>.png` for hero, software-factory, kivilcim,
jointledger, dropspot, tail (SYSTEMS), reorient (UNDERNEATH), approach (Built in Layers), handoff,
surface-return, selected-systems, how-i-build, field-notes, about, cta. The candidate set also
carries 1366×768 (the laptop case the brief names first).

## Before / after, by system

| System | Compare |
|---|---|
| Project transition grammar | `stills/1440x900--{software-factory,kivilcim,jointledger,dropspot}.png`; in motion, the forward recordings between the four stations |
| Grounds | the same four stills — the plane's constructed edge up-route of each composition, running off-frame down-route, against the baseline's offset rectangle |
| SYSTEMS | `stills/1440x900--tail.png`, `zoom/1920x1080@50--systems.png` |
| UNDERNEATH → Built in Layers → handoff | `stills/1440x900--{reorient,approach,handoff,surface-return}.png` |
| Lower world | `stills/1440x900--{selected-systems,how-i-build,field-notes,about,cta}.png`; `metrics/dead-scroll-1440x900.json` |
| Zoom-out | `zoom/1920x1080@50--{kivilcim-to-jointledger,dropspot,handoff}.png` |
| Vertical scroll pacing | `recordings/*--lower-world*.webm`; `journey.json`; `metrics/scroll-contract-1440x900.json` |
| Motion cost (frame time) | `metrics/frame-time-1440x900.json` in both sets — the mean frame interval while the route is driven forward on a fresh page, forward again, and in reverse; the candidate must sit within a millisecond of the baseline in all three (D-040) |

## Metrics (the evidence behind the videos)

- `journey.json` — notches, seconds, distance, peak px/s per journey half, per viewport
- `metrics/scroll-contract-1440x900.json` — peak px/s gentle/aggressive in route and page, coast
  after input, reverse latency
- `metrics/dead-scroll-1440x900.json` — content fill per 120px of scroll, dead runs
- `metrics/scene-fit.json` (candidate) — every composition against its frame at five viewports
- `metrics/frame-time-1440x900.json` — mean / p95 rAF interval and slow-frame count per traverse;
  the governor pays per frame, so this is the route's speed in disguise (D-040)
- `metrics/frame-time-webkit-{route,cut}-1440x900.json` (both sets) — the same probe on WebKit,
  whole route and the cut region alone (`PROBE_BROWSER=webkit`, `PROBE_SPAN=0.6,0.85`)
- `metrics/route-focus.json` — the route's focus table and arc lengths, written from the module
- `metrics/runtime.txt` (candidate) — console / hydration / CLS / images / overflow
- `mobile/metrics/mobile-route.json` (candidate) — the mobile route economy smoke at 320 / 390 / 768

Intermediate iterations (`iter1` … `iter4`) are kept as the working record of the pass; the
comparison of record is `baseline` against `after`.
