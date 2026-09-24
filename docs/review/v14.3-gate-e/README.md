# V14.3 Gate E — owner review package: readable on arrival

Scope of this gate, by the owner's brief: sections fully readable much earlier after entering the
viewport; controlled breathing room between the lower-world sections; meaningful microtext at a
readable weight and texture removed. Nothing else moved. Decision D-051; `docs/DESIGN_SYSTEM.md`
§43; handoff `.ai/handoffs/V14_3_GATE_E_RETURN.md`.

The sheets are settled frames between two beats (the governed camera parked at each) or the lower
world walked at half a viewport a step. The entry stills park a section's top at 65% of the viewport
height — the frame a reader sees a short travel after the section enters. The numbers behind them
are in `metrics/entry-before.txt` and `metrics/entry-after.txt` (`tests/tools/entry-state-probe.mjs`).

```
before/stills/     entry frames at b4921e1 (Gate D): the section's top at 65% of the viewport
before/motion/     the approach to Kıvılcım at b4921e1, 8 settled frames
after/stills/      the candidate: the same entry frames, and every lower section at rest
after/motion/      the approach to Kıvılcım and to DropSpot at 1440, the lower world forward and in
                   reverse at 1440, the 1920 smoke of both
metrics/           entry states before / after, first paint, discrete scroll, mobile route, runtime
```

## 1 · Earlier clarity

| | before | after |
|---|---|---|
| Selected Systems, top at 65% | `before/stills/selected-systems--top65.png` | `after/stills/selected-systems--top65.png` |
| About, top at 65% | `before/stills/about--top65.png` | `after/stills/about--top65.png` |
| a project scene arriving (Kıvılcım) | `before/motion/1440--software-factory--to--kivilcim.png` | `after/motion/1440--software-factory--to--kivilcim.png` |
| a second arrival (DropSpot) | — | `after/motion/1440--jointledger--to--dropspot.png` |
| 1920×1080 smoke | — | `after/motion/1920--software-factory--to--kivilcim.png` |

What to look for. Before: with a section's top at 65% of the viewport its register marks sit at
half weight, About's name at 0.7, and the index drawing under Selected Systems is not yet drawn;
frame 5 of the approach shows a third of Kıvılcım in frame at a third of its presence. After: the
marks are at full weight and the name is set by the same point; the reveals fire as the element's
top enters; at frame 5 Kıvılcım is nearly present, at frame 6 fully. Departure is unchanged.

## 2 · Breathing room

`after/motion/1440--forward--lower-world.png` and `--reverse--` against the Gate C record
(`docs/review/v14.2-gate-c/after/motion/`). Gaps at 1440×900, before → after: Selected Systems
→ How I Build 134 → 181 px; How I Build → Field Notes 92 → 93; Field Notes → About 134 → 181;
About → finale 64 → 96; the surface return → Selected Systems 80 → 128. Lower world 3000 → 3194 px,
under the 3245 the owner found long.

## 3 · Microtext

`after/stills/1440x900--selected-systems.png`, `--field-notes.png`, `--about.png`. Removed: the
state word beside every register. Raised: the register's marks to 0.85 / 0.55; the classifications
and the index link to label size; the verification line to ink. Unchanged: strata names, indices,
captions (muted, label size, 7.2:1).

## Metrics

See `.ai/handoffs/V14_3_GATE_E_RETURN.md` §4 and `metrics/`.
