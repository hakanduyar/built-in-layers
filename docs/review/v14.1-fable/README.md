# V14.1 — owner visual review package (Fable visual correction gate)

The V14.1 Fable checkpoint on `feature/owner-visual-acceptance-v14` against the state it started
from — `fa7c72c`, the V14.1 engineering checkpoint — captured with the same tools, at the same
viewports, from production builds of each. Nothing here is a mock-up: every video is the governed
journey under real wheel input, every still is the built page parked at the route's own focus
positions, and every transition sheet is eight settled frames between two beats.

**Owner acceptance is pending.** Neither model has declared this accepted, frozen, or ready to
merge. The scroll was not changed (`.ai/handoffs/V14_1_FABLE_TO_OPUS.md` §6).

Recordings (`after/recordings/*.webm`) live in the working tree only: the repository ignores
`docs/review/**/recordings/` by rule. `after/journey.json` carries every number they were measured
for, and `tests/tools/v14-baseline.mjs` regenerates them from the build.

```
before/       the state at fa7c72c: stills, zoom, motion sheets, journey.json
after/        the checkpoint: stills (1440 / 1920 / 1366 and 390 mobile), zoom, motion sheets,
              metrics, runtime, mobile probe, journey.json, recordings (ignored)
iterations/   the motion sheets of every internal pass (iter1–iter6), the cut-probe frames,
              two 50% frames — the sequence the corrections were judged on
```

## A · Full desktop forward journey

`after/recordings/1440x900--forward.webm`, `after/recordings/1920x1080--forward.webm` — 120px
notches every 55ms from the top to the end of the route and on to the end of the document.
Before: `docs/review/v14-owner-visual/after/recordings/` (the V14 candidate's, unchanged scroll).

## B · Full desktop reverse journey

`after/recordings/1440x900--reverse.webm`, `1920x1080--reverse.webm`. Reverse is still one notch.

## C · Lower world, and the proof the scroll did not move

`after/recordings/1440x900--lower-world.webm`, `--lower-world-aggressive.webm` (also 1920×1080).

The journey tool records video, and its seconds depend on the machine on the day. So it was run
twice, back to back, idle, on the same machine: against this checkpoint and against a worktree of
`fa7c72c` (`after/metrics/journey--ab-baseline-fa7c72c--same-machine.json`). The V14 record of
2026-09-04 is the third column.

| 1440×900 | V14 record (2026-09-04) | `fa7c72c` today | checkpoint today |
|---|---|---|---|
| forward, route | 89 notches · 13.6s | 108 · 20.7s | 110 · 19.3s |
| forward, lower page | 23 · 3.5s | 22 · 4.1s | 23 · 4.2s |
| lower world, normal wheel | 27 · 3.8s | 27 · 4.9s | 28 · 5.1s |
| lower world, hard flick | 29 · 3.1s | 27 · 4.2s | 29 · 4.5s |
| reverse, route | 89 · 14.2s | 101 · 21.3s | 109 · 19.9s |

| 1920×1080 | V14 record | `fa7c72c` today | checkpoint today |
|---|---|---|---|
| forward, route | 108 · 18.9s | 123 · 30.2s | 123 · 27.3s |
| lower world, normal wheel | 28 · 4.4s | 28 · 6.3s | 29 · 6.3s |
| lower world, hard flick | 23 · 3.4s | 23 · 4.9s | 28 · 5.2s |

Notch for notch the two builds are the same journey; the seconds moved with the machine, not with
the gate. The route pixels are within 10px of each other at both viewports (`journey.json`). The
scroll contract, the discrete-scroll table and the frame-time probe reproduce the engineering
record (`after/metrics/scroll-contract.json`; handoff §6).

## D · Zoom-out

`after/zoom/1920x1080@{100,80,67,50}--<beat>.png` — the same eight beats at four zoom levels;
`before/zoom/` for the state before. What to look for: at 67 and 50 the route reads as a track
(dotted ahead, solid travelled, indexed stations), the ground as a drawn floor, the strata as
floors, and the lower page as the same rail continued — states as differences of form, not of alpha.

## E · Key focus frames

`after/stills/<viewport>--<beat>.png` at 1440×900, 1920×1080 and 1366×768, for every beat of the
route and the lower page; `after/mobile-stills/390x844--*.png` for the untouched mobile composition.
`before/stills/` for the state before.

## F · Motion — the transitions, on their intermediate frames

`after/motion/<viewport>--<from>--to--<to>.png`: eight settled frames tiled left to right, the
governed camera parked at each. `before/motion/` for the same beats before; `iterations/motion/`
for every pass in between (`iterN--…`).

- Project 01–04 focus sequence: `1440--hero--to--software-factory`, `1920--software-factory--to--
  kivilcim`, `1440--kivilcim--to--jointledger`, `1440--jointledger--to--dropspot`.
- SYSTEMS → UNDERNEATH: `1440--dropspot--to--reorient`. The black frames at p≈0.70–0.73 are the
  V4 `SceneBreak` — the ink field and seven rails that make the frame opaque while the route jumps —
  verified by DOM probe (`iterations/cut-probe/`) and identical in `before/`. Not changed.
- Lower world: `1440--reorient--to--approach`, `1440--approach--to--handoff`.
- Handoff → terminus: `1366`, `1440`, `1920--handoff--to--1` — the map rising clear of "Back on the
  surface" at all three.
- Reverse: `1440--kivilcim--to--software-factory`.
- Final CTA: `after/stills/*--cta.png`, `*--about.png`, and `after/zoom/*--cta.png`.

## Before / after, by system

| Owner finding | Before (`before/`) | After (`after/`) | Decision |
|---|---|---|---|
| Project transitions | 3 of 8 frames between the hero and 01 held a hairline only; a departing description orphaned while the arriving title was cut at the frame edge | presence as a state change; the rail carries the frame; the datum is detected before the composition (`motion/1440--hero--to--software-factory`) | D-044 |
| Project ground (§7) | a pale parallelogram sliding through the empty middle of every transition | datum, floor at the composition's foot, tread; laid by acquisition (`stills/*--software-factory`, `*--jointledger`) | D-044 |
| Evidence legibility | diagram body labels at 8–11 CSS px | the acquired detail: the delivery loop at the full measure, Kıvılcım's on-device core ≈1.7×, JointLedger's three tables; the whole drawing one INSPECT away | D-045 |
| Route / topology | rails through titles, dimmed at focus, gone at 50% | track states: dotted ahead, solid travelled, only in the open; indexed, viewport-scaled stations (`zoom/*@50--*`) | D-043 |
| SYSTEMS → UNDERNEATH | UNDERNEATH bare after the cut; a fourth unlabelled line; the map into "Back on the surface" | strata as floors, UNDERNEATH on the SYSTEM line, the horizon stopped before the reveal, the map clear at 1366 / 1440 / 1920 | D-046 |
| Lower world | "a spatial first half followed by an editorial website" | one rail continued down the page, a station and an arm per section; Selected Systems as the map's index; How I Build as rows; About as a station; the finale map's tail 05–08 | D-047 |
| Final CTA | copy unchanged, map without the lower page | copy unchanged; SYSTEM RESOLVED → COMPLEXITY MAPPED → OPERATOR ADDRESSABLE in one drawing (`stills/*--cta`) | D-047 |

## Metrics (the evidence behind the frames)

- `after/metrics/scene-fit.json` — every composition's ink against its frame at 1366 / 1440 / 1536 /
  1920 / 2560: clear everywhere (worst clearance −42px, Kıvılcım at 1440).
- `after/metrics/scroll-contract.json`, the discrete-scroll and initial-paint runs (handoff §6).
- `after/runtime/` — console / hydration / CLS / images / overflow across nine widths: overflow
  0 of 99, images 0 broken.
- `after/mobile/metrics/mobile-route.json` — the mobile route probe at the recorded step; identical
  to `docs/review/v14.1-engineering/mobile/metrics/mobile-route.json` but for one 0.001 pixel-row
  mean at 320×568.
- `after/journey.json`, `after/metrics/journey--ab-baseline-fa7c72c--same-machine.json` — §C.

Tools: `tests/tools/{v14-baseline,still-capture,transition-sheet,scene-fit-probe,
mobile-route-probe,phase7-runtime-probe,scroll-contract-probe,discrete-scroll-probe,
initial-paint-probe,frame-time-probe}.mjs` (`docs/REVIEW_POLICY.md`).
