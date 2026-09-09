# V14.8 visual gate — review package

Scope, by the owner's brief: improve the supporting composition beneath SYSTEMS while keeping the
restored interlocking black transition; strengthen the Person of Interest / Machine atmosphere
through behaviour and visual grammar; improve the wide-screen presence of the final sections.
Nothing else moved. Decision D-054; `docs/DESIGN_SYSTEM.md` §46; handoff
`.ai/handoffs/V14_8_VISUAL_GATE_RETURN.md`.

Per `docs/REVIEW_POLICY.md` the numbers are in Git and the bulk is not. The sheets and stills named
below are in `C:\Users\hakan\portfolio-review\v14.8-visual-gate\` — `before/` captured at the V14.7
checkpoint, `after/` on the candidate build. Every sheet is settled frames between two beats, the
governed camera parked at each; every still is full size.

```
before/{2560x1440,1920x1080}/            the state at 2d40c65
after/{2560x1440,1920x1080,1440x900}/    the candidate: every scene and lower-world landmark
after/1440--dropspot--to--tail.png       the approach to SYSTEMS, 8 frames
after/1440--tail--to--reorient.png       SYSTEMS, the rails, UNDERNEATH, 12 frames
after/1440--REVERSE--reorient--to--tail.png   the same event backwards, 12 frames
after/1920--tail--to--reorient.png       the same at 1920, 8 frames
after/2560--tail.png                     SYSTEMS at 2560, 4 frames
after/1440--software-factory--acquire.png     the frame closing on its subject, 6 frames
metrics/mobile-route.json                the mobile route probe at the recorded 2vh step
```

## 1 · Beneath SYSTEMS, and on the black

`after/1440--dropspot--to--tail.png`, `after/1440--tail--to--reorient.png`, and the REVERSE sheet.

The word arrives and stands clean. Beneath it three rules carry `01 SURFACE / interface and
interaction / ACQUIRED`, `02 FLOW / behavior, states, and user journeys / DETECTED`, `03 SYSTEM /
architecture, data, and constraints / DETECTED`, with the dotted descent down the left. The rails
then close, and on the black the same strata read `01 SURFACE | RELEASED`, `02 FLOW | DETECTED`,
`03 SYSTEM | ACQUIRED` — the state the cut changed, and the stratum UNDERNEATH lands on. Reverse is
the same event backwards, checked frame by frame. No seam, no recess, no map, no orange.

## 2 · The Machine's behaviour

`after/1440--software-factory--acquire.png` and the scene stills: the four brackets stand off the
composition while it is detected and close onto its edges as it is acquired; the state word is a
ruled box that fills with ink while acquired and stands open otherwise. Same signed approach, no new
signal, no telemetry, no HUD.

## 3 · Wide screen

`before/2560x1440/*` against `after/2560x1440/*`, and the same pair at 1920. The finale's question,
About's name, How I Build's statement, Selected Systems and the field-note line all gain scale and
measure; the hierarchy and the intervals between sections are unchanged. 1440 is unchanged —
`after/1440x900/*` against the V14.5 record.

## Validation

typecheck 0 · lint 0 · format 0 · unit 572/572 · build ✓ · focused Chromium (`motion`, `spatial`,
`spatial-v5`, `home`, `smoke`) 96 passed / 2 skipped — the two skipped are the V6.6 seam tests
skipped since V14.5 · first paint `FIRST PAINT == SETTLED`, cold, at 1440×900, 1920×1080 and
2560×1440 · the mobile route probe is identical to the V14.6 record on every geometry and layout
measure (five pixel-row sampling means moved by 0.004 or less).

The full acceptance matrix and WebKit were not run, per the brief.
