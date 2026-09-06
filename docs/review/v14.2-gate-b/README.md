# V14.2 Gate B — owner review package: SYSTEMS → UNDERNEATH, and back to the surface

Scope of this gate, by the owner's brief: the SYSTEMS → UNDERNEATH transition, the UNDERNEATH
landing, and the return to the surface. Nothing else moved. Decision D-048;
`docs/DESIGN_SYSTEM.md` §40; handoff `.ai/handoffs/V14_2_GATE_B_RETURN.md`.

Every sheet is eight or twelve **settled** frames between two beats of the route, tiled left to
right, the governed camera parked at each — a reader who stopped there would see exactly that
frame. Every still is full size. The scroll mathematics, the guarded break timing and the first
paint are untouched (handoff §4).

```
before/motion/     the state at 8c6045c, both directions
iterations/        every internal pass (iter1 … iter3), forward and reverse
after/motion/      the candidate, both directions, 1440 and 1920
after/stills/      full-size frames through the cover, the landing and the return
```

## 1 · SYSTEMS → UNDERNEATH

| | before | after |
|---|---|---|
| forward, 1440×900, 12 frames | `before/motion/1440--tail--to--reorient.png` | `after/motion/1440--tail--to--reorient.png` |
| **reverse**, 1440×900, 12 frames | `before/motion/1440--REVERSE--reorient--to--tail.png` | `after/motion/1440--REVERSE--reorient--to--tail.png` |
| forward, 1920×1080 | `before/motion/1920--tail--to--reorient.png` | `after/motion/1920--tail--to--reorient.png` |
| the approach to SYSTEMS | `before/motion/1440--dropspot--to--tail.png` | `after/motion/1440--dropspot--to--tail.png` (unchanged) |

What to look for. Before: at p≈0.709 eleven ink rails snap shut over a world that is already
mostly recess, two frames of solid black, the rails open onto UNDERNEATH; in reverse the same
block interrupts the return. After: the word recedes with its seam as before; the frame becomes
the recess; **the section stands** — SURFACE at the frame's top, FLOW, SYSTEM, and the descent from
the surface line to SYSTEM; UNDERNEATH appears at the foot of the descent, its own SYSTEM line and
depth rail taking over the cover's within a few pixels; the section dissolves as the camera
settles. No frame is black; no letter is touched; reverse is the same event backwards.

Full-size frames: `after/stills/1440x900--p0.700.png` (the seam finishing its rise under the
cover), `--p0.720.png` (the section at rest, the dwell), `--p0.734.png` and `--p0.742.png`
(UNDERNEATH standing under the section), and at 1920×1080 `--p0.720.png`, `--p0.742.png`.

## 2 · The UNDERNEATH landing and the handoff to Built in Layers

`after/motion/1440--reorient--to--approach.png` (the composition itself was not changed; it is
now read as the foot of the section just exposed, and Built in Layers as the definition of the
three strata the reader has just descended through).

## 3 · Back on the surface

| | before | after |
|---|---|---|
| handoff → terminus, 1440 | `before/motion/1440--handoff--to--1.png` | `after/motion/1440--handoff--to--1.png` |
| **reverse**, 1440 | — | `after/motion/1440--REVERSE--1--to--handoff.png` |
| 1920 | — | `after/motion/1920--handoff--to--1.png` |

What to look for. Before: four words fading in low in the frame while the frame is still the
recess. After: the junction is a **plane** — the rule is the SURFACE stratum, labelled once inside
the band as every stratum in the world is; from the rule down, the page's paper, opaque, running
to the frame's foot and on into the lower page without a seam; and it rises into the frame as it
resolves, so the terminus map climbs out from behind it. Above the line the world's recess; below
it the surface. Full size: `after/stills/1440x900--p0.977.png`, `--p0.990.png`, `--p1.000.png`,
`1920x1080--p1.000.png`.

## Metrics

Targeted, per the brief (`.ai/handoffs/V14_2_GATE_B_RETURN.md` §4): first paint `FIRST PAINT ==
SETTLED` at 1440 and 1920; discrete scroll identical to the record on every isolated impulse with
`routeSpan` / `leadCap` unmoved; scroll contract identical geometry, reverse one notch; frame time
16.7 / 17.0 / 16.8 ms on the route and 17.2 / 17.4 / 17.2 ms across the cut region; mobile route
probe identical to the engineering record.

Tools: `tests/tools/{transition-sheet,progress-stills,initial-paint-probe,discrete-scroll-probe,
scroll-contract-probe,frame-time-probe,mobile-route-probe,phase7-runtime-probe}.mjs`
(`docs/REVIEW_POLICY.md`).
