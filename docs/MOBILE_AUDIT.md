# MOBILE AUDIT — PHASE 6

Engineering-first audit of the portfolio at mobile and tablet widths. No art direction was
performed; findings that require composition work are recorded for Fable Gate 4.

- Branch: `feature/project-architecture-v13`, audited at `7d622c1`
- Date: 2026-09-03
- Build: production (`pnpm build`, 15/15 routes), served on `:3200`
- Probe: [`tests/tools/mobile-audit-probe.mjs`](../tests/tools/mobile-audit-probe.mjs)
- Measurements: [`docs/review/phase6-mobile-audit/metrics/mobile-audit.json`](review/phase6-mobile-audit/metrics/mobile-audit.json)
- Stills: [`docs/review/phase6-mobile-audit/stills/`](review/phase6-mobile-audit/stills/)

> **Status (2026-09-04): the four P1 findings are resolved by Fable Gate 4** on
> `feature/project-architecture-v13` — M1 by D-031 (the figure inspector), M2 by D-032 (the measure
> token), M3 by D-030 (the mobile world unit and route two's mobile legs), M4 by D-033
> (`touch-link` and the tour CTA's world-space floor); `docs/DESIGN_SYSTEM.md` §37 is the account,
> `.ai/handoffs/FABLE-MOBILE-RETURN.md` the return — **not yet written**: the gate reached its
> session limit before committing, the orchestrator checkpointed the validated tree as `b23284e`
> on its behalf, and Fable still owes that document. The independent verification of this
> checkpoint is `.ai/handoffs/OPUS-MOBILE-QA-RETURN.md`. The gate re-ran this probe on its own builds at
> the starting HEAD and at the candidate — `docs/review/v13-mobile-gate/{before,after}/metrics/
> mobile-audit.json` — so the before/after numbers in the return are the gate's own measurements,
> not this audit's carried over. After: measure at 768 `/work` 88 / case studies 63–68 / `/about` 66 (per-element
> 544px, `after/measure-768.txt`); sub-44 targets 6–20 per route → the sr-only skip link and the
> inline-sentence links only (`after/tap-targets.txt`); homepage near-empty route frames
> 3 / 5 / 5 / 4 → 0 / 0 / 2 / 1 at 360 / 390 / 430 / 768 with page height unchanged
> (`after/metrics/mobile-route.json`); every diagram label ≥ 12.25px inside the inspector. The P2
> items (M5–M7) are recorded in §37.7 as left as found. The findings below are kept as written: they
> are the audit's evidence, at `7d622c1`.

## Viewports

Real device sizes, not one artificial height. 768 is treated as tablet-class, not "large mobile".

| Width | Height | Class |
|---|---|---|
| 320 | 568 | smallest supported phone |
| 360 | 800 | common Android |
| 375 | 667 | iPhone SE / 8 |
| 390 | 844 | iPhone 12–15 |
| 430 | 932 | iPhone Pro Max |
| 768 | 1024 | tablet portrait |

`deviceScaleFactor: 2`, `isMobile: true`, `hasTouch: true`.

## Surfaces

All 8 routes × 6 widths = 48 measured states: `/`, `/work`, the five case-study destinations
(`software-factory`, `kivilcim`, `jointledger`, `dropspot`, `professional-systems`), `/about`.

**This closes the gap that motivated the phase:** V13's five case-study destinations had never been
rendered below 1024px. They have now been measured at all six widths and inspected visually.

---

## Verdict

**Homepage mobile: P1** — legible and identity-preserving, but structurally wasteful.
**Case-study mobile: P1** — sound structure, unreadable evidence.
**P0 findings: none.** Nothing is broken or unusable.
**Objective mechanical defects: none.** Every finding below is compositional, which is precisely why
this phase cannot fix them and Fable Gate 4 is required.

---

## PASS — verified, no action

| Area | Evidence |
|---|---|
| Horizontal overflow | **0px** at all 6 widths × 8 routes. The V8 result still holds. |
| Console / runtime | **0 errors, 0 page errors** across all 48 states |
| Touch scrolling | Works without a wheel. Touch-drag advanced `scrollY` 0 → 1200 and brought `hero`, `software-factory`, `kivilcim` into view. **No wheel-only dependency.** |
| `ProjectNeighbours` responsive logic | **Correct.** Stacks at ≤430 (`stacked: true`, height 187px), returns to two columns at 768 (height 94px). The desktop two-column assumption does *not* leak onto phones. |
| Heading hierarchy | `H1 → H2 → H3` with no skipped levels on the homepage |
| Landmarks | `main` 1, `header` 1, `footer` 1, named navs present |
| Reduced motion | 0 overflow, 0 page errors, 13.8 screens |
| Professional Systems composition | Clean stacking, readable record row, clear CTA — see `cs-professional-systems--375x667--full.png` |
| Case-study heroes | Title legible at 36px, no oversized empty bands, lead figure present above the fold |

---

## P1 — material weaknesses (Fable Gate 4)

### M1 — Diagram evidence is unreadable on every phone width

Every case-study diagram renders at **0.18–0.24 of its intrinsic width**:

| Project | Natural | Rendered @375 | Scale |
|---|---|---|---|
| Kıvılcım | 1600px | 333px | **0.21** |
| JointLedger | 1600px | 333px | **0.21** |
| Software Factory | 1600px | 333px | **0.21** |
| DropSpot | 1400px | 250–333px | **0.18–0.24** |

Internal labels — "React + Vite + TypeScript", "Made only if the person supplies their own API key",
"No automatic cloud sync" — land at roughly **5–6 CSS px**. Confirmed visually in
`clip-kivilcim-diagram-375.png`.

This is the most serious finding. These are *verified architecture diagrams*: they are the case
studies' actual evidence, the thing that distinguishes this portfolio from a gallery. On a phone
that evidence is present but cannot be read. Shrinking them further is not an option, and enlarging
them inside a 375px column is impossible — this needs a mobile diagram strategy (dedicated mobile
artwork, a zoom/scroll affordance, a simplified mobile variant, or an explicit "view on a larger
screen" treatment). That is an art-direction decision, not a mechanical one.

### M2 — Tablet measure is too wide at 768

Characters per line, where ~45–75 is the readable band:

| Route | 320 | 375 | 430 | **768** |
|---|---|---|---|---|
| `/work` | 39 | 46 | 54 | **95** |
| case studies | 35 | 41–43 | 48–50 | **82–84** |
| `/about` | 35 | 42 | 49 | **83** |
| `/` | 33 | 39 | 45 | **74** |

At 768 the body copy runs 82–95 characters per line — past the readable maximum, and `/work` at
**95ch** is the worst surface in the portfolio at any width. The measure constraint evidently
arrives at the `lg` breakpoint, leaving tablet portrait unconstrained. Choosing the cap is a
typographic decision.

### M3 — Homepage route geometry is vertically expensive on mobile

The homepage runs **11.3–14.8 screens** (14.8 at 320, 11.9 at 390). Inspecting
`clip-home-project-375.png`, a project scene arrives with roughly **67% of the viewport empty above
it** — the desktop route's travel distance, translated directly to a phone where vertical space is
the scarcest resource.

The scenes themselves are good: "CASE 01 / 04", a large readable title, a legible description, the
tech line, the ground plane. The identity survives. The *spacing between* them does not earn its
cost on a phone.

**Homepage mobile viability: the current system is viable but not designed.** It is understandable
and controllable; it is desktop geometry rendered narrow.

### M4 — Tap targets below the 44px minimum

6–20 sub-44px targets per route (WCAG 2.5.8):

- Homepage project links (`Software Factory ↗`, `Kıvılcım ↗`, …): **185×24, 95×24, 136×24**
- Case-study navigation links: **96×31, 120×31, 148×31**
- "See every system": **184×43** — 1px short
- Footer/social links: similar

None is unusable — they are wide, and only short — but they sit below the standard, and the
homepage project links are the *primary* path into the work on mobile. Fixing this means adding
vertical hit area, which changes rhythm, so it belongs with composition rather than here.

---

## P2 — polish

- **M5** 12px mono meta text: tech lines (`React · TypeScript · Vite · Tailwind CSS`) and
  `Verified against source · Active development`. Small, but they are labels, not prose.
- **M6** At 320 the measure is 33–39ch — tight, though workable at that width.
- **M7** Kıvılcım costs **23.5 screens at 320** and 17.9 at 375, the longest route in the portfolio.

## Accepted / deferred, unchanged

- Two `<nav>`s share `aria-label="Primary"` on mobile. The previously accepted non-blocker; this
  audit found **no additional mobile harm**, so it stays deferred rather than reopened cosmetically.
- Decision *alternatives* rendered as a comma join — owner-accepted 2026-09-03.

## WebKit

Not re-litigated in this phase, per instruction. The documented five-failure software-rendering
baseline stands. **No mobile-specific WebKit failure was introduced** — this phase changed no
application source.

---

## Fable Gate 4 decision

**REQUIRED.**

Not because mobile is broken — it demonstrably is not: zero overflow, zero console errors, working
touch, correct responsive navigation stacking, valid heading order. It is required because every
remaining finding is a composition decision, and Opus fixing them would be art direction by another
name.

### Bounded scope for Fable

1. **Mobile diagram strategy (M1)** — make verified diagram evidence readable at 320–430. The
   highest-value item.
2. **Tablet measure at 768 (M2)** — cap the line length; `/work` at 95ch is the worst case.
3. **Homepage route economy on mobile (M3)** — reduce dead travel without flattening the spatial
   narrative into generic cards.
4. **Tap-target rhythm (M4)** — give primary project links and case-study navigation ≥44px of
   vertical hit area within the existing type system.
5. Optionally M5–M7.

### Out of scope for Fable

Desktop composition, the frozen spatial system's desktop behaviour, project order, project content,
and any external repository. Mobile-scoped responsive logic only; the 30 fingerprinted files in
`docs/FROZEN_BOUNDARY.md` §1 stay unchanged unless a measured mobile regression justifies a move,
recorded to the same standard as the hero-clipping fix.
