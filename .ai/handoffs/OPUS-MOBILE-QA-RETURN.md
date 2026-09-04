# OPUS INDEPENDENT FINAL MOBILE QA — V13 MOBILE GATE

- **Reviewed SHA:** `b23284e81b725008e0c7472167722b2e18ae1469` (`feature/project-architecture-v13`)
- **Parent / baseline for the diff:** `180c07c` (Phase 6 mobile audit)
- **Frozen desktop baseline:** `243db393` · **`main`:** `16d3ec0` — both untouched, both equal to origin
- **Follow-up SHA pushed by this QA:** see §9
- **Reviewer:** `claude-opus-5`, independent session. I wrote none of this code.
- **Date:** 2026-09-04

## 0. Verdict

**PASS WITH DOCUMENTED NON-BLOCKERS.**

All four P1 findings of `docs/MOBILE_AUDIT.md` are closed, verified on my own clean build at
320 / 360 / 375 / 390 / 430 / 768. The frozen desktop boundary holds: **44 of 44 route × viewport
parity walks at parity**, measured against a separately built baseline, extending the gate's own
run to all five case studies. No assertion was weakened, nothing was fabricated, and every
committed artifact corresponds to the current code.

Two checks are **incomplete and stated as such** (§8): the WebKit suite and the reduced-motion
desktop-parity walk. Neither blocks; both are named openly rather than implied.

### Why this verification is load-bearing

Fable reached its session limit before committing and before writing
`.ai/handoffs/FABLE-MOBILE-RETURN.md`. The orchestrator validated and checkpointed the tree on its
behalf. **There is no self-report to check the work against** — so nothing below is taken on trust
from a claim; every number is one I measured. Where I reproduce a committed number, I say so.

## 1. What I ran

Clean build of the checkpoint (`rm -rf .next && pnpm build`, `BUILD_ID 4d1DJtRXtETGM7W4kZgvV` —
my own, not the gate's `mNkR9V8fwCm0nsmFjB2N2`), served on `:3210` and `:3100`. The baseline
`180c07c` was built in a separate `git worktree` (`BUILD_ID Cvs_b6WoU3JA6JJqyRrkQ`) and served on
`:3300`. Port 3000 was left alone as instructed.

| Gate | Claimed | **My measurement** |
|---|---|---|
| `pnpm typecheck` | 0 | **0** |
| `pnpm lint` | 0 | **0** |
| `pnpm test` | 553/553 | **553/553** (28 files) |
| `pnpm build` | 15/15 | **15/15**, exit 0 |
| `npx playwright test --project=chromium --workers=2` | 219/219 | **219/219** (2.6 min) |
| `prettier --check` on every file the gate changed | clean | **clean** (37 files) |

## 2. M1 — diagram legibility (D-031) · CLOSED

The derivation, checked at source rather than accepted: all **13** verified diagrams are
`width="1600"`, and the smallest `font-size` in the set is **14**, in
`public/images/projects/jointledger/book-data-model-diagram.svg`. At `INSPECT_PLATE_WIDTH = 1400`
that label renders at `14 / 1600 × 1400 =` **12.25px**, against the `mono-meta` floor of
`0.75rem = 12px` declared in `styles/globals.css`. The floor is cleared, not approximated.

Measured live on `/work/kivilcim` at every audited width:

| Width | Trigger | Plate | Smallest label | Modal | Pan | Overflow | Console |
|---|---|---|---|---|---|---|---|
| 320×568 | 44.00px | 1400px | **12.25px** | `:modal` true | 1122×432 | 0 | 0 |
| 360×800 | 44.00px | 1400px | **12.25px** | true | 1082×200 | 0 | 0 |
| 375×667 | 44.00px | 1400px | **12.25px** | true | 1067×333 | 0 | 0 |
| 390×844 | 44.00px | 1400px | **12.25px** | true | 1052×156 | 0 | 0 |
| 430×932 | 44.00px | 1400px | **12.25px** | true | 1012×68 | 0 | 0 |
| 768×1024 | 44.00px | 1400px | **12.25px** | true | 674×0 | 0 | 0 |

Accessibility and runtime behaviour, all verified at all six widths: the dialog is a genuine
platform modal (`:modal` matches), it carries an accessible name via `aria-labelledby` → the
caption, the plate `<img>` has a real `alt`, focus moves to **Close** on open and returns to the
**trigger** on Escape, the plate `<img>` is **unmounted** on close, and the page never gains
horizontal overflow while open. Rendered output inspected directly, not only measured: the
committed inspector stills show labels — "React + Vite + TypeScript", "PWA / Workbox — Service
worker, offline capability" — plainly readable, and the panned still confirms both axes pan.

Two further claims tested rather than assumed:

- **No-JS.** With JavaScript disabled at 375×667: 5 triggers present in the DOM, **0 visible**
  (the `<noscript>` rule works), and all 5 figures still render. The no-JS page is the page as
  before.
- **The plate keeps its place.** Figure rendered geometry is byte-identical before → after at
  320/375/430/768 on both `cs-kivilcim` and `cs-dropspot` (e.g. 278×174 → 278×174, 710×444 →
  710×444). Nothing in the column moved.

## 3. M2 — tablet measure (D-032) · CLOSED

The mechanism was checked in the compiled CSS first, because this fix only works if the utility
stays a variable reference: `.max-w-measure{max-width:var(--container-measure)}`, with
`--container-measure:42rem` and `--container-measure:34rem` both present. Tailwind did **not**
inline the literal, so the media-query re-declaration takes effect.

The gate's per-element table cites a `measure768.mjs` that is **not in the repository** (§7,
ARTIFACT-1), so I reproduced the number of record with my own measurement — leaf prose blocks
only, ≥14px, excluding container elements:

| Route @768 | Distinct widths | Blocks wider than 544px | Real ch/line min / med / max |
|---|---|---|---|
| `/work` | 544 | **0** | 42 / 62 / 65 |
| `/work/kivilcim` | 348, 524, 544 | **0** | 30 / 65 / 78 |
| `/work/jointledger` | 348, 524, 544 | **0** | 38 / 65 / 74 |
| `/work/dropspot` | 348, 524, 544 | **0** | 30 / 67 / 75 |
| `/about` | 544 | **0** | 36 / 60 / 65 |
| `/notes`, `/lab`, `/nope` | 544 | **0** | 40 / 44 / 52 |

**Every prose block on every route is at or under the 34rem cap.** The audit probe's `/work` figure
of 88 is an averaging artefact over `<li>` card containers and 12px mono meta lines — the gate says
this itself, and it is correct: no line of prose on `/work` is wider than 544px. Route means
reproduced exactly: `/work` 95 → 88, case studies 82–84 → 63–68, `/about` 83 → 66, `/` 74 → 74.

## 4. M3 — homepage route economy (D-030) · CLOSED

`--world-vh` resolves live in the DOM to `max(0.78vh, min(1vh, 7px))` at 320, 430 and 768 — the new
`WORLD_UNIT_MOBILE`, actually in force rather than merely declared.

Independent measurement, same method applied to both builds (DOM ink union / viewport height, the
probe's `< 0.12` near-empty threshold, half-viewport steps across the route):

| Width | Near-empty route frames | Mean route ink | Page height |
|---|---|---|---|
| 390×844 | **1 → 0** | 38% → **44%** | 10021 → 10021 (**byte-identical**) |
| 430×932 | **1 → 0** | 36% → **42%** | 10541 → 10541 (**byte-identical**) |

Direction, magnitude and the "page is not one pixel shorter" claim all confirmed. My absolute
near-empty counts are lower than the gate's (which used rendered pixel rows at a finer sweep; DOM
ink counts a text block's full box and so reads higher) — the improvement is the same, and page
height is unchanged to the byte, which was the load-bearing part.

**Sharpness.** The world-fit scale is desktop-only (`useWorldFit(mounted && isDesktop)`), so the
mobile unit change is position-only. Confirmed empirically: the 18 scaled elements inside the tour
carry **identical** scale values (0.9720, 0.5500, …) at 320, 430 and 768. M3 introduced no new text
resampling.

## 5. M4 — tap targets (D-033) · CLOSED

| Width | Standalone targets under 44px | Remaining |
|---|---|---|
| 320 | **0** | inline-sentence links only |
| 360 | **0** | inline-sentence links only |
| 375 | **0** | inline-sentence links only |
| 390 | **0** | inline-sentence links only |
| 430 | **0** | inline-sentence links only |
| 768 | **0** | inline-sentence links only |

Across 8 routes × 6 widths. The only sub-44 anchors left are links inside running sentences
(`hakanduyar.medium.com`, `work index`, `LinkedIn`, `ezBookkeeping`) — WCAG 2.5.8's explicit inline
exception, and making them blocks would reflow the sentence.

Independent tally reproduces the committed inventory exactly: **193 boxes — 181 at 45.00px, 12 at
44.98px, none under 44.** The 44.98 values are Chromium's 1/64px line-box snapping at body size,
as documented.

**The layout did not move.** Full-page capture with the M4 classes stripped from the live DOM is
**0px different** from the page as built, on every route at 320 / 375 / 768, with the strip verified
(wordmark 45 → 27.5px, so a zero diff cannot be a strip that never happened). Menu rows 27.5 → 45px
inside an unchanged 51.5px pitch, with `<li>` and text rects identical. Confirmed visually in the
committed hit-area stills: the boxes grow to fill the pitch while every glyph stays put.

The tour CTA, laid out in world space under a 0.89–0.995 plane scale, measures 47–49px at handoff
focus at all six widths (committed route metrics), against 41–43px on the baseline.

## 6. FROZEN BOUNDARY — the check that mattered most

**(a) The ledger accounts for every move.** The §4 loop prints exactly **ten** `MOVED:` lines, and
every blob SHA matches the "now" column of `docs/FROZEN_BOUNDARY.md` §5 — five from the desktop
art-direction gate, seven from the mobile gate, two (`SpatialExperience.tsx`, `SelectedSystems.tsx`)
under both. **No unexplained MOVED line.** No file was added to or removed from the 30.

**(b) Every move is genuinely mobile-scoped.** Read line by line in `git diff 180c07c..b23284e`:

| File | Scoping | Desktop side |
|---|---|---|
| `AboutPreview.tsx`, `FieldNotes.tsx`, `SelectedSystems.tsx` | `max-lg:inline-block max-lg:touch-link` only | untouched |
| `SpatialExperience.tsx` | `max-lg:min-h-12.5` only | untouched |
| `SpatialCamera.tsx` | `isDesktop ? WORLD_UNIT : WORLD_UNIT_MOBILE` | desktop branch textually unchanged |
| `scenes.ts` | `mobileWorld` for `approach`/`handoff` + `TURN_MOBILE_WORLD` | every desktop `world` anchor **byte-identical** |
| `worldFit.ts` | pure addition of `WORLD_UNIT_MOBILE` | `WORLD_UNIT` untouched |

Verified in the **compiled** CSS, not only the source: `.max-lg\:touch-link`,
`.max-lg\:inline-block` and `.max-lg\:min-h-12\.5` all sit inside
`@media not all and (min-width:64rem)`. They cannot reach the desktop.

**(c) Desktop output is provably unchanged — re-measured, not read.** I rebuilt `180c07c` in a
separate worktree and re-ran `tests/tools/desktop-parity-probe.mjs` against it rather than reading
`after/desktop-parity.txt`. I also **extended** the run from the gate's 8 pages to 11, adding the
three case studies it never tested.

**Result: 44 of 44 route × viewport walks at parity** (11 routes × 1280×800 / 1440×900 / 1536×864 /
1920×1080).

- Every non-spatial route: **pixels identical**.
- All five case studies: **pixels identical**, geometry differing only by `+1` element per
  inspectable figure in the initial DOM — software-factory +1, kivilcim +2, jointledger +2,
  dropspot +4, professional-systems +1 — exactly D-031's caption `<span>`. The three case studies
  the gate never tested behave identically to the two it did.
- Spatial homepage: **geometry identical at every step, at every viewport**, page height identical.
- Two homepage steps were flagged by the 4px-cell test and re-examined with 3+3 fresh captures:
  1536×864 at y=1728 (same-build cell max **14.3** vs cross-build max **14.3**) and 1920×1080 at
  y=2160 (same-build **3.3**, cross-build 0.1–**3.3**). In both the same-build floor equals the
  cross-build maximum — Chromium's own raster jitter, not the candidate. This independently
  reproduces the one step the gate's committed run flagged and resolved the same way.

**No desktop regression is hiding inside this mobile pass.**

## 7. Classified issue list

Nothing in this list blocks. No P0, no P1, no functional defect of any kind was found.

**Fixed by this QA (see §9):**

| # | Class | Issue |
|---|---|---|
| DOC-1 | DOCUMENTATION | The asset cited as M1's derivation source was named `jointledger/book-data-model.svg` in four places; the file is `book-data-model-diagram.svg`. The *number* (14 units → 12.25px) is correct — I verified it at source — but the citation pointed at a path that does not exist. Corrected in `FigureInspect.tsx`, `figure-inspect.test.tsx`, `DECISIONS.md` D-031 and `DESIGN_SYSTEM.md` §37.1. |
| DOC-2 | DOCUMENTATION | `.ai/handoffs/FABLE-MOBILE-RETURN.md` is referenced by `MOBILE_AUDIT.md` and `FROZEN_BOUNDARY.md` §5 as if it existed. It does not — Fable never wrote it. Both references now say so and point here instead. |
| DOC-3 | DOCUMENTATION | `REVIEW_POLICY.md`'s probe inventory was five tools out of date (it listed none of `fable-gate-probe`, `mobile-audit-probe`, `mobile-route-probe`, `touch-target-probe`, `desktop-parity-probe`). Table updated, with the `PROBE_OUT` / `PROBE_BASE_A|B` conventions noted. |
| DOC-4 | DOCUMENTATION | `docs/PROGRESS.md` had **no entry** for either the Phase 6 mobile audit or Gate 4, though `CLAUDE.md` §3.6 requires one per task. Both added, with this QA's measured numbers and its open items. |

**Recorded, not fixed:**

| # | Class | Issue |
|---|---|---|
| ART-1 | ART-DIRECTION | On `/work`, the five `ProjectCard` thumbnails render the same 1600-unit diagrams at **0.19–0.22 scale** with no inspector — `ProjectCard`'s `Figure` deliberately does not opt in (D-031: "a `ProjectCard` thumbnail, which is itself a link, does not"). The reasoning is sound and the card routes to a page where the figure *is* inspectable, so this is not a defect. But `/work` remains a surface where verified diagram evidence is present and unreadable. **Fable's call, not mine** — recorded for its return. |
| A11Y-1 | PRODUCT (minor) | A case study renders up to five INSPECT buttons whose accessible name is exactly `"Inspect"`. In reading order the preceding `<figcaption>` disambiguates them, so this is not a WCAG AA failure; in a screen reader's *buttons list* they are indistinguishable. A one-attribute fix (`aria-label` carrying the caption) would close it with no visual change. I did **not** apply it: it is not a conformance failure and the component is the gate's own. |
| ART-2 | ART-DIRECTION | Narrowing the measure lengthens the tablet: `/work/kivilcim` at 768 grows **8865 → 9618px** (+8.5%). An accepted consequence of M2 and consistent with §37.7's M7 note, but the specific tablet cost is not written down anywhere. Recorded for Fable's return. |
| ARTIFACT-1 | ARTIFACT | `after/measure-768.txt` names its tool as "scratchpad `measure768.mjs`", which lives outside the repository. The number of record for M2 therefore cannot be regenerated from a clean clone. I reproduced it independently (§3), and noted the rule in `REVIEW_POLICY.md`. |
| ENV-1 | ENVIRONMENT | `pnpm format:check` reports 98 files repo-wide, including `tsconfig.json` and many files this gate never touched. Cause is `core.autocrlf=true` with no `.gitattributes`, i.e. a CRLF checkout on this machine — **pre-existing**, not introduced here. Every one of the 37 files the gate changed is Prettier-clean. I did not run `--write` across 98 untouched files. |
| ENV-2 | ENVIRONMENT | One `ERR_NO_BUFFER_SPACE` appeared on `/work/dropspot` at 768 during a run where I had several Playwright processes in flight — Windows socket exhaustion from my own load. Re-checked in isolation at 768/430/375: **0 overflow, 0 console errors, 0 failed requests**. Not a product fault. |

## 8. What I did not finish

Stated plainly rather than implied:

1. **WebKit suite — not run.** The documented five-failure software-rendering baseline is not this
   phase's problem and this phase changed no engine-level behaviour, but the **+3 new inspector
   tests are unmeasured on WebKit**. `FigureInspect` uses a native `<dialog>` with `showModal()`,
   which Safari has supported since 15.4, so I have no specific reason to expect a failure — but I
   did not measure it. Worth one run before merge.
2. **Reduced-motion desktop parity — not re-run.** I verified the related mobile claim directly
   instead: the reduced-motion homepage is **+6px at every width below `lg` and exactly 0px at
   1280**, which is precisely the consequence §37.4 discloses, and confirms the reduced-motion tree
   is untouched on desktop. The full committed walk (`after/desktop-parity-reduced-motion.txt`) I
   read but did not reproduce.
3. **`tests/tools/mobile-route-probe.mjs` — not re-run in full.** Its viewport list is hard-coded,
   so I could not scope it down; I wrote and ran an equivalent measurement at the two decisive
   widths instead (§4). The other four widths rest on the committed metrics, which I did verify
   match both the documented tables and the current code.

## 9. Changes made, validated and pushed

Documentation and comments only — **no product behaviour, no styling, no test assertion touched.**
I did not redesign or reinterpret any part of the mobile art direction.

- `components/ui/FigureInspect.tsx` — comment only (DOC-1)
- `tests/unit/figure-inspect.test.tsx` — comment only (DOC-1)
- `docs/DECISIONS.md`, `docs/DESIGN_SYSTEM.md` — asset filename (DOC-1)
- `docs/MOBILE_AUDIT.md`, `docs/FROZEN_BOUNDARY.md` — the missing return document (DOC-2)
- `docs/REVIEW_POLICY.md` — probe inventory + the tool-in-Git rule (DOC-3, ARTIFACT-1)
- `docs/PROGRESS.md` — the two missing entries (DOC-4)
- `.ai/handoffs/OPUS-MOBILE-QA-RETURN.md` — this document

Re-validated after the edits: typecheck, lint, unit tests, production build, Prettier on every
changed file. Results in §9.1 of the commit message.

## 10. Fabrication check

**None found.** No content, data or asset file changed in this gate — `git diff --stat
180c07c..b23284e -- content/ data/ public/` is empty, and `content/` has not moved since D-027. No
invented project fact, metric, testimonial, date or URL. Every metric in `DESIGN_SYSTEM.md` §37 and
`DECISIONS.md` D-030–D-033 that I checked against the committed JSON matched exactly, including
D-030's full consequence table. The out-of-repo evidence the docs cite really exists
(`C:\Users\hakan\portfolio-review\v13-mobile-gate\` with `before-HEAD-180c07c` and
`final-build-mNkR9V8fwCm0nsmFjB2N2`, 460 files), and all ten committed decision stills are present
and show what they claim.

The gate also documented against its own interest in two places I checked and confirmed: the
`/work` "88ch" figure it could have quietly omitted, and the +6px reduced-motion cost.

## 11. For Fable

You still owe `.ai/handoffs/FABLE-MOBILE-RETURN.md`. Your implementation verifies clean; the return
is the missing piece, not the work. Three items are yours to rule on, none blocking:

- **ART-1** — `/work` card thumbnails: verified diagrams at 0.19–0.22 scale with no inspector.
- **ART-2** — the tablet grew 8.5% on Kıvılcım as a cost of the 34rem measure; worth writing down.
- **A11Y-1** — five identically-named INSPECT buttons per case study; one attribute would fix it,
  and it is your component.

---

*Independent QA by `claude-opus-5`. I did not write the code under review. Every number in this
document is one I measured on my own build; where I reproduce a committed figure I say so.*
