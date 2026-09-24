# FABLE MOBILE RETURN — V13 MOBILE GATE (FABLE GATE 4)

| | |
|---|---|
| **Model / effort** | `claude-fable-5-1`, effort `max`, autonomous (authorized run), one session (`888a4bb7`) throughout |
| **Gate** | Fable Gate 4 — mobile art direction on `feature/project-architecture-v13`: resolve the four P1 findings of `docs/MOBILE_AUDIT.md` (M1–M4) within the scope its "Fable Gate 4 decision" set; the brief itself was the owner's message, not a file under `.ai/handoffs/` |
| **Starting HEAD (gate)** | `180c07c` — the Phase 6 mobile audit, the last commit before the gate |
| **Checkpoint** | `b23284e` — the gate's validated tree, committed **by the orchestrator** after the gate's second session-limit pause (§1) |
| **Independent QA** | `4c788b4` — `.ai/handoffs/OPUS-MOBILE-QA-RETURN.md`, `claude-opus-5`: PASS with documented non-blockers |
| **Starting HEAD (this pass)** | `4c788b4` |
| **Final HEAD** | the commit that carries this document (`git log -1 -- .ai/handoffs/FABLE-MOBILE-RETURN.md`), pushed to `origin/feature/project-architecture-v13`; local == origin verified in the pass's final message |
| **Frozen desktop base** | `243db393` (`docs/FROZEN_BOUNDARY.md` §1); `main` untouched |
| **Dates** | 2026-09-03 → 2026-09-04 (local, UTC+3) |
| **Verdict** | **FREEZE** (§11) |

## 0. What this document is

The gate's own account of its work: what was measured before, what was changed, what was measured
after, what was deliberately left alone, which frozen files moved and why, and what remains. The
implementation was checkpointed and independently verified before this was written (§1), so where
a number below is also the QA's, the QA's is the independent one; every number here was measured
by this session on a build it served itself, and §2 says which build.

Two reading aids. `docs/DESIGN_SYSTEM.md` §37 is the design account (§37.1–37.4 the four
findings, §37.5 the six-width loop, §37.6 desktop parity, §37.7 left as found, §37.8 this pass);
`docs/DECISIONS.md` D-030–D-033 are the decisions, with this pass's addenda on D-031 and D-032.
This return does not repeat their reasoning; it records the measurements, the moves and the
verdict, and points.

## 1. Where the gate stands, and how it got here

1. **2026-09-03, 23:14 local — gate opened** at `180c07c`. Before anything changed, the starting
   HEAD was built and served by this session and the mobile probes were run on it — the gate's
   own **before**.
2. **M1–M4 implemented, measured, iterated** through the night on production builds served on
   `:3200` / `:3210` (never the dev server), with the six-width loop (§37.5) and two changes from
   what it showed.
3. **First pause** — session limit, reset 03:40; resumed after 06:15 on the orchestrator's
   CONTINUE. The orchestrator had snapshotted the uncommitted tree
   (`C:\Users\hakan\fable-gate4-paused-20260904`, 911 files, a 39KB patch); the tree was resumed
   as left, nothing lost.
4. **Desktop parity proved, docs written, validation run** (08:18–08:20 local: typecheck, lint,
   unit twice — see §8 — build, Chromium e2e 219/219), then **second pause** — session limit,
   reset 11:10 — before the commit and before this document. The orchestrator validated the tree
   and committed it as `b23284e` on the gate's behalf.
5. **Independent QA** (`claude-opus-5`) at `b23284e` on its own clean build: all four findings
   closed, 44/44 desktop-parity walks against its own baseline build, no assertion weakened,
   nothing fabricated; four documentation corrections pushed as `4c788b4`; three items left for
   the gate to rule on (A11Y-1, ART-1, ART-2) and one artifact rule (ARTIFACT-1).
6. **This bounded final pass** (resumed after 16:10 on the owner's CONTINUE) from `4c788b4`:
   write this return; close A11Y-1 and ART-1; rule on ART-2; nothing else reopened. §7.

## 2. Provenance of every number

| Build | What | Where |
|---|---|---|
| own build of `180c07c` | **before** — the mobile probes at 320×568 / 360×800 / 375×667 / 390×844 / 430×932 / 768×1024; a second build of it was the desktop-parity baseline | `docs/review/v13-mobile-gate/before/metrics/`; the full still matrix outside the repo (§9) |
| `mNkR9V8fwCm0nsmFjB2N2` | **after** — the gate's candidate, the tree that became `b23284e`: the same probes, the desktop-parity walks | `docs/review/v13-mobile-gate/after/` (`metrics/`, `tap-targets.txt`, `desktop-parity.txt`, `desktop-parity-reduced-motion.txt`, the checkpoint's `measure-768.txt`) |
| `4d1DJtRXtETGM7W4kZgvV` | the QA's own clean build of `b23284e` (its baseline: `Cvs_b6WoU3JA6JJqyRrkQ`) | `.ai/handoffs/OPUS-MOBILE-QA-RETURN.md` |
| `Mq6FB1tNUNie_1D-OvUb8` | **this pass's baseline** — `4c788b4` built in a separate worktree, served on `:3300` | `after/desktop-parity-final-pass.txt` (A), `after/figure-inspect.txt` (A) |
| `ylJ7vp5r0If_WQBLNsV0P` | **this pass's candidate** — A11Y-1 + ART-1 applied, served on `:3210` | `after/desktop-parity-final-pass.txt` (B), `after/figure-inspect.txt` (B), `after/measure-768.txt` (regenerated), `after/tablet-length-768.txt`, `after/tap-targets-work-final-pass.txt`, `stills/ART-1--*` |
| `u_zSwFNQs6qbWPiQGfEeQ` | **the final build** of the committed tree (the candidate plus comments, tests and docs), served on `:3100` for the Chromium suite | §8 |

Numbers of record are DOM measurements produced by tools under `tests/tools/`
(`docs/REVIEW_POLICY.md`): `mobile-audit-probe.mjs`, `mobile-route-probe.mjs`,
`touch-target-probe.mjs`, `desktop-parity-probe.mjs`, and from this pass `measure-768-probe.mjs`
and `figure-inspect-probe.mjs`. Stills illustrate; they decide nothing on their own.

## 3. The four findings — before → after

### M1 — diagram evidence unreadable on phones → the figure opens (D-031)

| | before (`180c07c`) | after |
|---|---|---|
| a 1600-unit diagram in a 288–398px phone column | 0.18–0.25 of its size; labels **3–6 CSS px** | unchanged in the column — the plate keeps its place at column width |
| a way to read it | none; §9 of the design system had recorded this as "expected" | **INSPECT** in the caption row below `lg`: a native modal `<dialog>`, the same asset at `INSPECT_PLATE_WIDTH = 1400`, panning on both axes with `overscroll-contain` |
| the smallest label in the set (`jointledger/book-data-model-diagram.svg`, 14 units) | 2.5–3.5px | **12.25px** on the plate — the `mono-meta` floor (12px) cleared, at every width, since the plate is 1400px at every width |
| a second copy of the asset on the page | — | none: the plate `<img>` mounts only while the dialog is open |
| without JavaScript | — | the trigger is hidden by a `<noscript>` rule; the figures render as before |
| the homepage's frozen tour | — | renders `Figure` without `inspect`: markup byte-identical |

Refused: redrawn "mobile diagrams" (invented evidence), crops or simplified variants (hidden
evidence), a "view on a larger screen" notice, a lightbox dependency. Stills:
`stills/M1--{before,after}--375x667--kivilcim-lead-figure.png`,
`M1--after--375x667--kivilcim-inspector{,-panned}.png`.

### M2 — 82–95 characters a line at 768 → the measure is a token, 34rem below `lg` (D-032)

`--container-measure` (`max-w-measure`): 42rem, re-declared 34rem under `@media (width < 64rem)`;
the compiled CSS keeps the utility as `var(--container-measure)`, so the re-declaration takes
effect (the QA checked this at the CSS). Applied to running text only; figures keep the column;
phones never reach the cap. The case-study record's `<dl>` is two columns between `sm` and `lg`.

| route @768 | before — the audit's route mean, ch/line | after — the audit's route mean | after, per element (`after/measure-768.txt` for the widths, `after/tablet-length-768.txt` for the lines: body mean / longest ch per line) |
|---|---|---|---|
| `/work` | 95 | 88 — an averaging artefact: card `<li>` containers and 12px meta lines are averaged in; no prose line is wider than 544px | **44 / 65** |
| `/work/kivilcim` | 82–84 (the case studies) | 63–68 | every running-text block **544px**; **64 / 78** |
| `/work/dropspot` | " | " | 544px; **64 / 75** |
| `/work/jointledger` | " | " | 544px; **64 / 74** |
| `/work/software-factory` | " | " | 544px; **60 / 68** |
| `/work/professional-systems` | " | " | 544px; **52 / 58** |
| `/about` | 83 | 66 | 544px; **56 / 65** |
| `/` | — | — | no `max-w-measure` box: the homepage's own body copy already sits at 34rem |

The tablet's length under the narrower measure is ART-2 — measured alone and accepted in §7.
Stills: `stills/M2--{before,after}--768x1024--kivilcim-body.png`.

### M3 — the homepage route vertically expensive on phones → the mobile world unit (D-030)

`WORLD_UNIT_MOBILE.y = max(0.78vh, min(1vh, 7px))` — exactly `1vh` up to the 700px-tall
reference frame the route was composed on, 7px above it, a `0.78vh` floor (the one-scene-per-frame
guarantee on the tallest phones; densification capped at 22%) — and route two's mobile legs cut to
the smallest distance at which two beats' ink never overlaps at 320×568 (`reorient → approach`
128 → 64, `approach → handoff` 124 → 90, `handoff → turn` 58 → 48, `TURN_MOBILE_WORLD`
1058 → 950; the 8% frame-to-frame speed ceiling holds at 7.79%, and 928 units would fail it at
8.13%). Position only: scene frames, the camera inset, the spacer and the page's height are
untouched; route one's mobile anchors, the cut, and every desktop `world` anchor are
byte-identical.

| `metrics/{before,after}/mobile-route.json` | 320×568 | 360×800 | 375×667 | 390×844 | 430×932 | 768×1024 |
|---|---|---|---|---|---|---|
| near-empty route frames | 0 → 0 | **3 → 0** | 0 → 0 | **5 → 0** | **5 → 2** | **4 → 1** |
| mean route ink, DOM ranges | 52 → 54% | 34 → 40% | 42 → 43% | 32 → 39% | 30 → 37% | 35 → 44% |
| mean route ink, rendered rows | 29 → 30% | 18 → 23% | 25 → 28% | 18 → 24% | 17 → 23% | 21 → 27% |
| the 130-unit project step, px | unchanged | 1040 → 910 | unchanged | 1097 → 910 | 1212 → 945 | 1331 → 1039 |
| page height / screens | unchanged | unchanged | unchanged | unchanged | unchanged | unchanged |

The frames that remain near-empty are the end-of-route release (§10.1). Stills:
`stills/M3--{before,after}--430x932--4.00vh.png`.

### M4 — 6–20 sub-44px targets a route → the hit box grows, the layout does not (D-033)

`touch-link`: `padding-block: max(0px, calc((2.8125rem − 1lh) / 2))` given straight back as a
negative `margin-block`, `--touch-slop-x` (0.5rem) the same horizontally. Every standalone link
below `lg` carries `max-lg:inline-block max-lg:touch-link` (menu rows `touch-link block`); links
inside running sentences are left alone (WCAG 2.5.8's inline exception). The tour's world-space
CTA gets `max-lg:min-h-12.5` (50px in world space) because it is drawn under a 0.893–0.995 plane
scale.

| `after/tap-targets.txt` | before (`180c07c`) | after |
|---|---|---|
| standalone targets under 44px, 8 routes × 6 widths | 6–20 a route (the audit's census: register project titles 185×24, menu rows 27.5px, footer links 21px, the tablet's primary nav 17px) | **0** — only the sr-only skip link and inline-sentence links remain in the probe's list |
| the 193 standalone boxes, 8 routes × 3 widths | as above | **181 at 45.00px, 12 at 44.98px, none under 44** |
| mobile menu rows | 27.5px in a 51.5px pitch | 45px in the same 51.5px pitch |
| "See every system" (world space) | 184×43 by the audit; 39–44px on screen across the stretch it is visible | 47–49px at handoff focus at all six widths, 44.6px at the plane's lowest on-screen scale |
| the page with the M4 classes stripped from the live DOM, re-captured | — | **pixel-identical** on every route at 320, 375 and 768 |
| the reduced-motion homepage (static tree, the CTA in flow) | — | +6px below `lg`, 0px at 1280 — disclosed in §37.4 |

Stills: `stills/M4--{before,after}--320x568--menu-hit-areas.png`.

## 4. What was deliberately preserved

- **The desktop composition, in full.** Every change is mobile-scoped — a `max-lg:` class, a
  `!isDesktop` branch, a `mobileWorld` anchor, or a token re-declared under `@media (width <
  64rem)` — and where it lives in a frozen file the desktop output was measured, not asserted
  (§6, and §7's parity re-run). No desktop art direction was opened, in the gate or in this pass.
- **The verified diagrams as drawn.** No asset was redrawn, cropped, simplified or re-labelled; no
  content, data or public file changed (`git diff --stat 180c07c -- content data public` is
  empty on the final tree).
- **The route's length and the page's height.** M3 moved paper from between the beats, not out
  of the page: page height unchanged at all six widths; the spacer, the frames and the camera
  inset untouched.
- **Type and rhythm below `lg`.** M4 grew hit boxes with zero layout movement (pixel-identical
  strip-and-recapture); M2 applied the measure to running text only.
- **The 8% frame-to-frame speed ceiling** (`tests/unit/spatial-route.test.ts`) and the spatial
  contracts (`spatial-route`, `spatial-filter`, `spatial-drift`, `spatial-system-pov`); route
  one's mobile anchors and the cut.
- **The homepage tour's markup**: `Figure` without `inspect` there, so the frozen scenes are
  byte-identical.
- **The site's own floors**: `mono-meta` 12px on every plate label; 44px on every standalone
  target; the audit's P2 items (M5–M7) left as found and written down (§10).

## 5. Contracts, and none weakened

Added by the gate (checkpoint `b23284e`; `git diff --numstat 180c07c b23284e -- tests/` is
+1494 / −0): `tests/unit/figure-inspect.test.tsx`, `measure-token.test.tsx`,
`spatial-world-fit.test.ts`, `touch-link.test.tsx`; `tests/e2e/work.spec.ts` "figure inspector"
(three tests); the three probes. Unit 527 → 553 (24 → 28 files), Chromium 216 → 219.

Added by this pass (+180 / −7 under `tests/`, plus the two new tools): the A11Y-1 naming
contracts — unit: the name is `Inspect: {alt}` with the visible word first; two same-caption
figures get two names; every card's control is named for its own figure — e2e: on Kıvılcım,
JointLedger and DropSpot at 375 every control's name is `Inspect: {its figure's alt}` and distinct
names == distinct assets, DropSpot pinned at 4 controls / 3 assets; and the ART-1 index contracts
— unit: every card's thumbnail carries exactly one control, `lg:hidden` — e2e: at 375 the five
controls are ≥ 44px tall and Kıvılcım's opens a ≥ 1000px-wide plate of `product-areas-map.svg`
with the caption in the dialog, Escape returns focus to the trigger and the card keeps one `<img>`;
at 1440 the index has no `Inspect` button. Unit 553 → 556, Chromium 219 → 224.

The seven removed lines are not assertions: an import widened to include `inspectName`, and two
`figcaption` regexes in `project-card-images.test.tsx` that would no longer match a caption row
with a control in it, replaced by a `cardCaption()` helper that reads the caption `<span>` — the
assertions on it (`not.toContain("not a")`, `toMatch(/not a (product )?screenshot/)`) are the same
strings as before. The speed ceiling, the spatial contracts and every gate contract are untouched.

## 6. The seven frozen-file moves

`docs/FROZEN_BOUNDARY.md` §5 ledgers each move — blob at `243db393`, blob now, the decision that
granted it, the measured evidence — and §4's loop prints exactly ten `MOVED:` lines on this
branch: five granted by the desktop art-direction gate and seven by this one, two files
(`SpatialExperience.tsx`, `SelectedSystems.tsx`) under both. The ledger is not repeated here; the
justification for each move, in one line, with the file's §5 row as the reference:

| # | File (§5 row) | Granted by | Why it had to be this file |
|---|---|---|---|
| 1 | `lib/spatial/worldFit.ts` | D-030 (M3) | the mobile world unit is defined where the world unit is defined; `WORLD_UNIT` and the `isDesktop` branch untouched |
| 2 | `lib/spatial/scenes.ts` | D-030 (M3) | route two's legs are its `mobileWorld` anchors; only those values changed, every `world` anchor byte-identical; the speed ceiling re-derived at 7.79% |
| 3 | `components/spatial/SpatialCamera.tsx` | D-030 (M3) | the two `--world-vw` / `--world-vh` declarations read `WORLD_UNIT_MOBILE` on the `!isDesktop` side only; the desktop side textually unchanged |
| 4 | `components/spatial/SpatialExperience.tsx` | D-033 (M4) | the tour CTA is laid out in world space under the plane's scale, so its 44px floor has to be set here, from that scale: one `max-lg:min-h-12.5` class; the desktop button untouched |
| 5 | `components/sections/SelectedSystems.tsx` | D-033 (M4) | the five system-title links — the primary path into the work on a phone — 24 → 45px; `max-lg:` classes only, pixel-identical strip-and-recapture |
| 6 | `components/sections/FieldNotes.tsx` | D-033 (M4) | "See all notes" 15 → 45px; same classes, same proof |
| 7 | `components/sections/AboutPreview.tsx` | D-033 (M4) | "Read the full introduction" and "LinkedIn" 24 → 45px; same classes, same proof |

The proof the boundary demands — desktop output identical — is `after/desktop-parity.txt` and
`after/desktop-parity-reduced-motion.txt` (the gate, against a separate build of `180c07c`: 32
route × viewport walks at parity, the reduced-motion homepage pixel-identical over 24 steps), the
QA's own 44-walk re-run against its own baseline build, and this pass's
`after/desktop-parity-final-pass.txt` (§7). **This pass moved nothing frozen**: the §4 loop prints
the same ten lines before and after it, every blob equal to its §5 value, and no file under
`lib/spatial/`, `components/spatial/` or `components/sections/` is in its diff.

## 7. This pass — the QA's three rulings, and the artifact rule

Everything here is outside `docs/FROZEN_BOUNDARY.md` §1 and was proved so anyway:
`after/desktop-parity-final-pass.txt` walks eleven routes × four desktop viewports against a
separate build of `4c788b4` — **44 of 44 at parity**: `/work` pixel-identical with its geometry
differing by exactly the five caption `<span>`s ART-1 adds (131 → 136 elements, at all four
viewports); every case study and every static route identical in geometry and pixels; the spatial
homepage geometry-identical at every step, with three cell-test flags (1440×900 at 1350, 1536×864
at 1728, 1920×1080 at 2160) re-examined with three fresh captures a side and found at the
same-build ceiling (§10.11).

### A11Y-1 — each INSPECT control is named for its figure (D-031 addendum 2)

A case study renders up to five `INSPECT` buttons whose accessible name was the visible word, so a
screen reader's buttons list could not tell the figures apart. `FigureInspect` now sets
`aria-label={inspectName(alt)}` = `"Inspect: {alt}"`: the visible label first (WCAG 2.5.3), then
the figure's own description — the alt, because it is the one string distinct for every distinct
figure (captions repeat: "Verified architecture diagram, not a product screenshot." twice on
JointLedger's and DropSpot's system layers). A figure shown twice is named twice, deliberately —
the hero lead repeats one layer figure, and on DropSpot that layer is the default Surface tab, so
`/work/dropspot` reads 4 controls / 3 names / 3 assets, and both of the same-named controls open
the same plate. The dialog keeps the caption as its name (`aria-labelledby`). Nothing rendered
changed: `after/figure-inspect.txt` lists every control's text, name and asset on the baseline
(every name "Inspect", no `aria-label`) and on the candidate; the parity file above is the pixel
proof. Rejected: numbering ("Inspect figure 3" — `blockJS` drops the MDX `index`, §10.3),
`aria-describedby` to the caption (a description is not a name), a visually-hidden suffix (a
second string to maintain).

### ART-1 — the `/work` index thumbnail opts into the inspector below `lg` (D-031 addendum 1)

The index rendered the same verified diagrams at a fifth of their size — `after/figure-inspect.txt`:
278/1600 = **0.17** at 320, 310/1600 = **0.19** at 375, 430 and 768 (the DropSpot screenshot
278/1400 = 0.20 and 310/1400 = 0.22) — under a caption calling them verified evidence, with no way
to read them; and the reason recorded for leaving the thumbnail out — "itself a link" — was false:
the card's title is the link. `ProjectCard` now sets `inspect` on its `Figure`, so below `lg` the
caption row carries the same control the case studies carry, opening the same 1400px plate; at
`lg` and above the control does not render and the index is the index it was (0.19 there too, no
control — a desktop question, §37.7). Five new 44px targets and no sub-44 ones
(`after/tap-targets-work-final-pass.txt`, 320/375/768). The card's asset is `images[0]`, which on
three of the five projects is not the hero's lead, so the readable copy of what the index shows
was a tap and a tab away before. Stills:
`stills/ART-1--{before,after}--375x667--work-kivilcim-card.png`,
`ART-1--after--375x667--work-kivilcim-inspector.png`. Rejected: leaving the index out (the false
premise), a larger thumbnail (the `max-w-xs` cap is the card's composition), dropping the thumbnail
(the index would lose its evidence).

### ART-2 — the tablet's length under the 34rem measure, measured alone and accepted (D-032 addendum)

The QA measured `/work/kivilcim` at 768×1024 at **8865 → 9618px (+8.5%)** — the whole checkpoint
against `180c07c`, not the measure alone — and asked for the measure's share to be accepted with a
reason or adjusted. `tests/tools/measure-768-probe.mjs` (`length` mode) isolates it: the page as
built, then with `--container-measure` re-declared to 42rem below `lg` from an injected rule, the
override verified by the widest `max-w-measure` box going 544 → 672px, the difference read after
the same settle (`after/tablet-length-768.txt`):

| route @768×1024 | cost of the 34rem measure alone | body mean / longest ch per line, 34rem → 42rem |
|---|---|---|
| `/work/kivilcim` | **+821px (9.3%)** | 64 / 78 → 76 / 94 |
| `/work/jointledger` | +614px (8.1%) | 64 / 74 → 74 / 90 |
| `/work/dropspot` | +580px (7.3%) | 64 / 75 → 74 / 91 |
| `/work/software-factory` | +112px (3.6%) | 60 / 68 → 69 / 80 |
| `/about` | +106px (6.2%) | 56 / 65 → 72 / 90 |
| `/work` | +52px (1.5%) | 44 / 65 → 53 / 86 |
| `/work/professional-systems` | +29px (1.2%) | 52 / 58 → 66 / 84 |
| `/` | +0px (no `max-w-measure` box) | — |

**Accepted, not adjusted.** The alternative is the finding M2 opened with — 94 characters on the
longest 16px line of a tablet, outside the 45–75 band and the worst measure on the site at any
width; a middle value (38rem — in proportion, about 87 characters at that longest line) is still
outside the band and a third measure to maintain; larger type at 768 was refused in D-032. A
longer page at a readable line is the ordinary cost of a measure on a one-column frame, and the M3
route work, not the measure, is what governs how far a reader scrolls. Recorded in D-032 and
§37.8.

### ARTIFACT-1 — the number of record has its tool in Git

`after/measure-768.txt` cited a scratch script outside the repository. It is regenerated on this
pass's candidate by the versioned `measure-768-probe.mjs` (`measure` mode): **every paragraph row
identical** to the checkpoint's file; only the five `/work` `<li>` container rows differ, because
the caption row now carries the control and its closed `<dialog>` (whose title and hint count
toward `textContent` without being rendered) — never numbers of record. The A11Y-1 / ART-1
listings come from `figure-inspect-probe.mjs`. `docs/REVIEW_POLICY.md` lists both tools and keeps
the rule.

## 8. Validation

| Check | Gate, pre-pause (08:18–08:20 local, on the tree that became `b23284e`) | Checkpoint / QA | **This pass, final build `u_zSwFNQs6qbWPiQGfEeQ`** |
|---|---|---|---|
| `pnpm typecheck` | 0 | 0 / 0 | **0** |
| `pnpm lint` | 0 | 0 / 0 | **0** |
| `pnpm test` | first run 552/554 — two 5s timeouts (`jointledger-content`, `touch-link`) with probes and the e2e suite running alongside; re-run 554/554 (29 files: the 28 committed plus a temporary reporting harness, `tests/unit/.tmp-mobile-route-report.test.ts`, deleted before the checkpoint as marked) | 553/553 | **556/556** (28 files, +3), nothing else running |
| `pnpm build` | 15/15 | 15/15 | **15/15**, exit 0 |
| Chromium e2e | 219/219 | 219/219 | **224/224** (+5), against this session's own `:3100` server of the final build (`BUILD_ID` unchanged after the run — Playwright reused it) |
| Prettier | clean on every changed file | clean (37 files) | **clean** on every changed code file, checked on the LF content Git commits — one working copy (`project-card-images.test.tsx`) is CRLF on disk, ENV-1 (§10.14), pre-existing |
| `docs/FROZEN_BOUNDARY.md` §4 loop | ten `MOVED:` lines | ten | **the same ten**, every blob equal to its §5 ledger value; no frozen file in the diff |
| WebKit | not run | not run (QA §8) | **not run** (§10.13) |

## 9. Artifacts

**In Git** (`docs/review/v13-mobile-gate/`):

- `before/metrics/{mobile-audit,mobile-route}.json` — the gate's own before at six widths.
- `after/metrics/{mobile-audit,mobile-route}.json`, `after/tap-targets.txt`,
  `after/desktop-parity.txt`, `after/desktop-parity-reduced-motion.txt` — the checkpoint.
- `after/measure-768.txt` (regenerated), `after/tablet-length-768.txt`, `after/figure-inspect.txt`,
  `after/tap-targets-work-final-pass.txt`, `after/desktop-parity-final-pass.txt` — this pass.
- `stills/` — thirteen decision stills: one before/after pair per finding, the inspector open and
  panned (M1), and the three ART-1 stills.
- Tools: `tests/tools/{mobile-route,touch-target,desktop-parity,measure-768,figure-inspect}-probe.mjs`
  (with `mobile-audit-probe.mjs` from Phase 6).

**Outside the repository** (`docs/REVIEW_POLICY.md`): `C:\Users\hakan\portfolio-review\v13-mobile-gate\`
— `before-HEAD-180c07c\` (the full before matrix, 138 files), `final-build-mNkR9V8fwCm0nsmFjB2N2\`
(the full after matrix and contact sheets, 127 files), `session-scratch-logs-and-tools\` (the
gate's build, server, probe, unit and e2e logs and its scratch scripts, 195 files; this pass's 16
in `final-pass\`: the baseline / candidate / final build and server logs, the unit and Chromium
logs, the stills-and-listing script with its output, the raw length and tap-target output, the
changed-files list).

## 10. Remaining objective engineering findings

None blocks. Each is either outside this gate's scope, a documented consequence, or an
environment fact; each is written down so nobody has to rediscover it.

1. **The end-of-route release frame.** About 1vh of paper (1.04–1.14vh) between the handoff CTA
   leaving the frame and the lower world's first line, at every mobile width; the desktop shows
   1.39vh by the same mechanism. Closing it moves paper into the argument or breaks the speed
   ceiling (§37.7).
2. **The audit's P2 items, left as found:** M5 (12px mono meta on phones), M6 (33ch at 320 — the
   site's floor on a 288px column), M7 (Kıvılcım at 23.6 screens at 320×568 — five figures and a
   decision list; the inspector is what makes them worth scrolling).
3. **MDX `index={n}` FIG numbering never renders**: under D-001's `blockJS` a JSX expression
   attribute is dropped before `Figure` sees it, so authored captions carry no "FIG 01 —" prefix.
   Pre-existing, content-side; it is also why A11Y-1 could not number the controls.
4. **Desktop figures at ~0.51 in the 42rem column, and the index thumbnails at 0.19 at 1024 and
   1440 with no control** — a desktop question, outside this gate; the inspector is `lg:hidden`.
5. **The audit probe's measure is a route mean over containers**: `/work` reads 88 because card
   `<li>`s and 12px meta are averaged in; the per-element file is the number of record.
6. **The closed `<dialog>` is text to a DOM probe**: its title and hint `<p>`s are in the DOM
   unrendered, so `textContent`-based counts (the `/work` `<li>` rows in `measure-768.txt`, any
   small-text census) include them. A probe that wants rendered text should test `getClientRects()`.
7. **The sr-only skip link** is the one "sub-44" element the target probe still lists on every
   route: visually hidden by design, not a touch target.
8. **Reduced motion, homepage, +6px below `lg`**: the static tree keeps the tour CTA in flow, so
   M4's 50px floor is 6px of page there; 0px at 1280 (§37.4).
9. **`DecisionList` terms at 720px on a tablet** — the definition is capped at the measure, the
   term is not; a term is one line, so read as acceptable at 768.
10. **Chromium's 1/64px layout** snaps a fractional line height down: `touch-link` at exactly
    2.75rem measured 43.98px, so the utility is 2.8125rem and boxes read 45.00 (181) or 44.98 (12).
11. **Raster jitter on the spatial homepage** in the parity walks: on identical geometry, a
    first-pass capture pair can differ by up to 19.9/255 in a 4px cell (1440×900 at 1350 this
    pass); the probe's tolerance is calibrated against two walks of the same build, and every
    flagged step is re-examined with three fresh captures a side — this pass's same-build ceilings
    at the three flagged steps were 4.9, 14.3 and 18.7, with the cross-build differences within
    them. Zero under reduced motion.
12. **The unit suite is load-sensitive**: two 5s timeouts at 08:18 with Playwright work running
    alongside, clean on every idle run (554/554, 553/553, 556/556). A `testTimeout` bump would hide
    this rather than fix it; run the suite alone.
13. **WebKit not run** — by the gate, the QA or this pass. The documented five-failure WebKit
    baseline (211/216 at the desktop gate) is unchanged by mobile-scoped work,
    `<dialog>.showModal()` has been in Safari since 15.4, and the eight inspector e2e tests (three
    from the gate, five from this pass) are unmeasured there. One run before merge.
14. **ENV-1 — CRLF checkout**: `core.autocrlf=true` and no `.gitattributes`, so `pnpm
    format:check` flags files repo-wide that Git commits as LF; pre-existing, not touched.
15. **Reduced-motion desktop parity was not re-walked in this pass**: the pass changed
    `FigureInspect`, `Figure` and `ProjectCard` only — none of them rendered by the reduced-motion
    homepage tree — and the motion=no-preference walk covers all eleven routes; the QA did not
    re-run that walk either (its §8).

## 11. Verdict

**FREEZE.** The four P1 findings are closed on production builds at six widths, with the numbers
above and the QA's independent ones agreeing; the desktop is proved unchanged at 44 of 44 walks
against the QA-verified checkpoint and at 32 of 32 against the gate's own baseline; the seven
frozen moves are ledgered with their evidence; the QA's three rulings are made and measured;
every number of record has a tool in Git; typecheck, lint, unit, build and the Chromium suite pass
on the final build; nothing was fabricated and no assertion weakened. What remains (§10) is written
down and is not this gate's to reopen. D-030–D-033 stay accepted under the gate's delegated
authority on `feature/project-architecture-v13` only; they are not in force on `main`.
