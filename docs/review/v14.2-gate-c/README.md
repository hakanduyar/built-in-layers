# V14.2 Gate C — owner review package: the lower world as one system

Scope of this gate, by the owner's brief: Selected Systems, How I Build, Field Notes, About, the
final CTA — recomposed as one continuous system after SYSTEMS / UNDERNEATH, without increasing page
length or changing scroll physics. Nothing else moved. Decision D-049; `docs/DESIGN_SYSTEM.md` §41;
handoff `.ai/handoffs/V14_2_GATE_C_RETURN.md`.

Every sheet is the lower world walked at half a viewport a step — every frame from the surface
return to the end of the document, parked and settled, tiled left to right with the scroll position
under each frame (`tests/tools/lower-world-sheet.mjs`). Every still is full size. The scroll
mathematics, the first paint and the mobile composition are untouched (handoff §4).

```
before/stills/     the state at 816b408 (the Gate B checkpoint), 1440×900
before/motion/     the same state walked forward and in reverse at 1440, forward at 1920 (+ .json)
iterations/        the internal passes (iter1, iter2) at 1440
after/stills/      the candidate, 1440×900 and 1920×1080
after/motion/      the candidate walked forward and in reverse at 1440, forward at 1920 (+ .json)
metrics/           discrete scroll (record diff and same-machine A/B), scroll contract, first paint,
                   frame time (A/B), mobile route at the recorded step, runtime/overflow
```

## 1 · The lower world, as motion

| | before | after |
|---|---|---|
| forward, 1440×900, half-viewport steps | `before/motion/1440--forward--lower-world.png` (9 frames, 3245 px) | `after/motion/1440--forward--lower-world.png` (8 frames, 3000 px) |
| **reverse**, 1440×900 | `before/motion/1440--reverse--lower-world.png` | `after/motion/1440--reverse--lower-world.png` |
| forward, 1920×1080 | `before/motion/1920--forward--lower-world.png` (3411 px) | `after/motion/1920--forward--lower-world.png` (3166 px) |

What to look for. Before: a table under a five-name column header, four ruled rows, a heading for
one sentence, a two-column bio, a page-wide rule and a footer with a map. After: the same rail and
stations, and beside them the world's own drawing carried into the content — the strata as floors
with a descent per system, the method statement and the floors beside four commitments, one entry
on one rule, the operator set as the systems were set, and the finale on the rail's own datum with
its axis ending on the action. The lower world is shorter in both directions (245 px at 1440, 245 px
at 1920) and no interval or scroll constant moved.

## 2 · Section by section, full size

| Section | before | after (1440) | after (1920) |
|---|---|---|---|
| Back on the surface (Gate B, unchanged) | `before/stills/1440x900--surface-return.png` | `after/stills/1440x900--surface-return.png` | — |
| Selected Systems | `before/stills/1440x900--selected-systems.png` | `after/stills/1440x900--selected-systems.png` | `after/stills/1920x1080--selected-systems.png` |
| How I Build | `before/stills/1440x900--how-i-build.png` | `after/stills/1440x900--how-i-build.png` | `after/stills/1920x1080--how-i-build.png` |
| Field Notes | `before/stills/1440x900--field-notes.png` | `after/stills/1440x900--field-notes.png` | — |
| About | `before/stills/1440x900--about.png` | `after/stills/1440x900--about.png` | `after/stills/1920x1080--about.png` |
| Final CTA | `before/stills/1440x900--cta.png` | `after/stills/1440x900--cta.png` | `after/stills/1920x1080--cta.png` |

**Selected Systems.** The three strata run across the register as floors, named once in the gutter
as every band in the world is named. Each system stands on the surface as a station (the route's
own glyph: visited ring, or the branch's signal ring for Professional Systems) and descends to the
deepest layer its validated record reaches; filled marks where the record documents a floor, hollow
where it does not; provenance, verification and phase as the footing under SYSTEM. Professional
Systems stands on the surface with no descent: not yet surveyed. Nothing was added to any record.

**How I Build.** The operator's own statement of the movement (from `/about`: a system problem
wearing an interface — four open questions — worked through three layers, the last usually
underestimated), in the site's serif voice; beneath it the same floors with the descent ending on
the resolved corner at SYSTEM; beside it the four commitments as a list on rules. Not cards, not
stages.

**Field Notes.** One entry on one rule: heading, sentence, index, one baseline. A branch to an
external archive at a branch's weight.

**About.** Classification above the name, the name resolving, the routes out under it; the
statement in the serif voice, the honesty rule as the record. No accent bar.

**Final CTA.** The axis is the lower rail's x, from the footer's top edge to the action, closed by
the world's corner; the caption states the resolved state once (SYSTEM RESOLVED · COMPLEXITY MAPPED ·
OPERATOR ADDRESSABLE); the map beside, the action beneath; no page-wide rule opens it. Core copy
untouched.

## 3 · Iterations

`iterations/iter1--*`: the first composition — the descent ran through the first letters of each
title, the serif statements were set at the finale's scale (eleven lines), the finale's axis
started at the caption. `iterations/iter2--*`: names beside the descent, the statements at 1.375rem,
the axis from the footer's top; About's links still under the statement. The candidate moves the
links under the name and places one `nav` by the grid.

## Metrics

Targeted, per the brief (`.ai/handoffs/V14_2_GATE_C_RETURN.md` §4). Page length 7806 → 7561 at
1440×900 and 8872 → 8627 at 1920×1080 (`*/motion/*.json`). First paint `FIRST PAINT == SETTLED` at
1440 and 1920 (`metrics/initial-paint-*.json`). Discrete scroll: geometry identical (`routeStart` 61,
`routeEnd` 4561, `routeSpan` 4500, `leadCapPx` 540) and every isolated impulse identical to
`docs/review/v14.1-engineering/discrete-scroll/discrete-1440x900.json`; the sustained-12 rows move
run to run on this machine and the same-machine A/B (`metrics/before-discrete-1440x900.json` against
`metrics/discrete-1440x900.json`) shows the pre-gate build in the same band. Scroll contract at
1536×864: geometry 61 / 4381, routeAggressive 514 px/s with a 502 px coast inside the 540 px cap,
reverse one notch with 0 wrong-way px. Frame time 16.7 / 16.8 / 16.7 ms a frame against the
pre-gate 16.7 / 16.8 / 16.8 (`metrics/*frame-time*.json`). Mobile route probe at the recorded step:
identical to `docs/review/v14.1-engineering/mobile/metrics/mobile-route.json` on every recorded
viewport (`metrics/mobile-route.json`). Runtime: console noise 0 on every content route, hydration 0
on all 11 routes, overflow 0 of 99, CLS 0.0418 on `/` (`metrics/runtime.txt`).

Tools: `tests/tools/{lower-world-sheet,still-capture,initial-paint-probe,discrete-scroll-probe,
scroll-contract-probe,frame-time-probe,mobile-route-probe,phase7-runtime-probe}.mjs`
(`docs/REVIEW_POLICY.md`).
