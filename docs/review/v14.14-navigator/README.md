# V14.14 navigator refinement — review package

Scope, by the owner's brief: give the fixed navigator a reliable unobstructed reading area without
turning it into a header bar, and give its station ticks a restrained visible destination preview.
Motion is frozen and untouched. Decision D-060; handoff
`.ai/handoffs/V14_14_NAVIGATOR_RETURN.md`.

Per `docs/REVIEW_POLICY.md` the numbers are in Git and the bulk is not: the stills are in
`C:\Users\hakan\portfolio-review\v14.14-navigator\stills\`.

```
navigator-check.json      the measured band/clearance result at both sizes
mobile-route.json         the mobile route probe at the recorded 2vh step
stills/1440x900/, 1920x1080/   field-notes.png, about.png, tick-hover.png
```

## 1 · The collision

**What was wrong.** Through the route the camera's own 14vh inset leaves the band the navigator
reads in empty, so nothing collides. Below the pinned route the page is an ordinary document and its
lines pass straight under the instrument. Measured at 1920×1080, the Field Notes landing put the
readout and the rail directly on top of How I Build's last line — glyph over glyph. Difference
compositing keeps the marks dark but cannot separate two sets of letterforms in the same pixels.

**What changed.** The instrument clears the ground it needs to read, and only there. It is
deliberately not a bar: no full-bleed edge, no rule, no border, no shadow — a field of the page's own
paper, sized to the cluster and masked away at its rim, so it has no edge to read as chrome. It
exists only at and below the pin, where the ground is always paper, so it can never appear over the
black transition, and it sits outside `.route-navigator` because that layer composites with
difference and a clearance inside it would invert itself.

`tests/tools/v14-14-navigator-check.mjs` measures every piece of page text that reaches the band the
readout and the rail occupy, and whether the clearance covers the part of it that does:

| | before | after |
|---|---|---|
| 1440×900, Field Notes landing | 1 line intersecting, **1 uncovered** | 1 intersecting, **0 uncovered** |
| 1920×1080, Field Notes landing | 1 line intersecting, **1 uncovered** | 1 intersecting, **0 uncovered** |
| Both sizes, About passage | 0 intersecting | 0 intersecting |

Lower-world content was not moved or redesigned; the clearance box is 768×128 px, centred.

## 2 · The destination preview

Station ticks were anonymous to a sighted reader — their accessible names were correct, but choosing
a distant station meant remembering the order. Each tick now names its destination under the pointer
or on keyboard focus, and nowhere else: the same answer the edge chevrons already gave. It uses the
canonical station name from `lib/spatial/routeNavigation.ts`, is absolutely positioned so revealing
it cannot move the rail by a pixel, and is `aria-hidden` so the tick keeps exactly one accessible
name (verified: `08, About`). The rail gains no permanent labels.

## 3 · Two defects found while verifying

- The preview inherited a raw ink colour instead of the navigator's remapped token, so under the
  layer's difference compositing it rendered faint rather than dark. Bound to `text-ink`, as the
  readout already was.
- V14.11's rule `[data-nav-state="ahead"] > span[aria-hidden] { opacity: 0.35 }` was written when
  the tick mark was the only `aria-hidden` child of a station button. The new preview is also one,
  so it was being **forced visible on every station still ahead of the reader**. The tick mark is now
  named `data-nav-mark` and the selector targets it.

## Validation

typecheck 0 · lint 0 · format 0 · unit **595/595** · build ✓ · focused Chromium (`navigation` **21
passed** including four new V14.14 contracts, plus `a11y`, `spatial`, `spatial-v5`, `motion`, `home`,
`smoke`) **128 passed, 2 skipped** — the two skipped are the V6.6 seam tests skipped since V14.5 ·
first paint `FIRST PAINT == SETTLED` cold at 1440×900 and 1920×1080 · mobile route probe **zero
layout differences** against the V14.13 record.

**Motion:** `lib/spatial/**` and `components/spatial/SpatialCamera.tsx` are byte-identical to
`5ccbf5c`. The product diff is `RouteNavigator.tsx` and six lines of `globals.css`.

The full acceptance matrix and WebKit were not run, per the brief.
