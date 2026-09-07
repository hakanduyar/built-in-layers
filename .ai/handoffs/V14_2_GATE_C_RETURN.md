# V14.2 Gate C — the lower world as one system

**From:** Fable 5.1 (visual gate, scoped) · **Date:** 2026-09-07 · **Branch:**
`feature/owner-visual-acceptance-v14` · **Base:** `816b408` (the Gate B checkpoint `de538bf` and its
record) · **Checkpoint:** see `.ai/STATE.md` (verify the tip with `git rev-parse HEAD`), pushed,
`local == origin`.

Owner acceptance is **PENDING**. Not a freeze, not an acceptance, not a merge. `main` = `16d3ec0`.

## 1. Scope, and only that

The owner's finding: the route continues through the lower world, but the content does not — it
still reads as a conventional editorial website placed after the spatial project world. Selected
Systems as a dashboard table; How I Build as conventional editorial rows; Field Notes too weak for a
scene; About as a standard bio; the final CTA as a large footer with a diagram beside it. Target:
SYSTEMS / UNDERNEATH → larger-world context → Selected Systems → method → notes → operator reveal →
resolved final state, as one continuous system, with page length and scroll physics preserved.
Not touched: scroll mathematics, the first-paint fix, the project scenes, evidence and grounds, the
Gate B cut and surface return, the mobile art direction, the external repositories, the route
globally.

## 2. What changed (D-049, `docs/DESIGN_SYSTEM.md` §41) — desktop, `lg` and above

- **Selected Systems is a section drawing** (`components/sections/SelectedSystems.tsx`): the three
  strata as floors across the register, named once in a gutter; each system a station on the
  surface (the route's own glyph) with a descent to the deepest layer its validated record reaches
  (`projectDepth`, new), filled marks on documented floors, hollow on the rest, the record as the
  footing. Professional Systems stands unsurveyed — no descent, hollow marks, "Not yet verified" —
  nothing fabricated. The five-name column header is gone. CSS subgrid keeps the floors level.
- **How I Build is the method inside the same section** (`components/sections/HowIBuild.tsx`): the
  operator's statement of the movement (`aboutIntro.method`, existing content from `/about`) in the
  serif voice; the floors again, with the descent ending on the resolved corner at SYSTEM; the four
  principles beside it as commitments on rules. No stages, no cards.
- **Field Notes is one entry on the route** (`components/sections/FieldNotes.tsx`; `SystemNode`
  gained a `compact` interval): heading at the register's heading scale, sentence and index on one
  baseline, one rule.
- **About is the operator revealed in the systems' grammar** (`components/sections/AboutPreview.tsx`):
  classification above the name, the name resolving as before, the two routes out under it; the
  statement (`aboutIntro.lead`) in the serif voice; the honesty rule as the record; the accent bar
  removed; one `nav`, placed by the grid.
- **The finale is the resolved final state** (`components/layout/SiteFooter.tsx`,
  `styles/globals.css`): on the homepage the finale stands on the lower rail's datum, its axis from
  the footer's top edge (clipped there) to the action, closed by the world's corner; the caption
  states SYSTEM RESOLVED · COMPLEXITY MAPPED · OPERATOR ADDRESSABLE; the page-wide rule that opened
  the footer is dropped. Core copy untouched. Off the homepage the caption, axis and map hide
  together and the CTA stands as before; below `lg` the caption stays "End of route", verbatim.
- **Not changed, deliberately:** `LowerRoute`, `RouteMap`, the drift table and approach intervals
  (`lib/spatial/editorialDrift.ts` byte-identical), the register states, "Resolved by layer and
  record" and "The systems, indexed".

## 3. Files

Product: `components/sections/{SelectedSystems,HowIBuild,FieldNotes,AboutPreview}.tsx`,
`components/spatial/SystemNode.tsx` (one optional prop), `components/layout/SiteFooter.tsx`,
`styles/globals.css` (homepage-scoped finale rules).
Tests: `tests/unit/selected-systems.test.ts` (two `projectDepth` cases).
Tools: `tests/tools/lower-world-sheet.mjs` (new, `docs/REVIEW_POLICY.md`).
Docs: `DECISIONS.md` D-049, `DESIGN_SYSTEM.md` §41, `FROZEN_BOUNDARY.md` §6.3, `REVIEW_POLICY.md`,
`.ai/{STATE,ACTIVE_TASK,HANDOFF}.md`, this file, `docs/review/v14.2-gate-c/README.md`.

## 4. Protected behaviour — verified on the checkpoint build

- `git diff --name-only 816b408 HEAD -- lib/spatial app components/spatial/{SceneBreak,SpatialCamera,
  SpatialExperience,LowerRoute,WorldGrammar,SystemsWord,RouteMap}.tsx` → **empty**.
- **Page length:** docMax 7806 → 7561 at 1440×900 (lower world 3245 → 3000 px); 8872 → 8627 at
  1920×1080 (3411 → 3166 px). Shorter, not longer; no interval or constant moved.
- **First paint:** `FIRST PAINT == SETTLED` at 1440×900 and 1920×1080, cold.
- **Discrete scroll** (diffed against `docs/review/v14.1-engineering/discrete-scroll/
  discrete-1440x900.json`): `routeStart` 61, `routeEnd` 4561, `routeSpan` 4500, `leadCapPx` 540
  identical; every isolated impulse identical (120 px, delivered 1.000, coast 0). The sustained-12
  rows read 0.708 / 0.786 against the record's 0.769 — and the pre-gate build, measured on the same
  machine minutes earlier, reads 0.703 / 0.692 (`metrics/before-discrete-1440x900.json`): that row
  is machine state, not the gate. Gate B reported the same rows as "inside the cap as before".
- **Scroll contract** (1536×864): geometry 61 / 4381 identical; routeAggressive 514 px/s, coast
  502 px inside the 540 px cap; **reverse one notch, 0 wrong-way px**.
- **Frame time** (1440×900, route): 16.7 / 16.8 / 16.7 ms a frame (forward, second forward,
  reverse) against the pre-gate build's 16.7 / 16.8 / 16.8 on the same machine.
- **Mobile** (`mobile-route-probe.mjs` at the recorded 2vh step, diffed against
  `docs/review/v14.1-engineering/mobile/metrics/mobile-route.json`): identical on every recorded
  viewport. The first candidate differed by 5 px of document height at 320×568 because the new
  finale caption wrapped there; the caption is now `lg:` only and the V9 line stays below `lg`.
- **Runtime:** console noise 0 on every content route (the six on the 404 route are the known
  ones), hydration 0 on all 11 routes, overflow 0 of 99, CLS 0.0418 on `/` — unchanged.
- **Focused Chromium** (`spatial`, `spatial-v5`, `a11y`, `smoke`, `motion`, `home`): 112/112 on the
  final build.
- typecheck 0 · lint 0 · format 0 · unit 569/569 · build ✓.

The full acceptance matrix was not run and WebKit was not run, per the brief.

## 5. Owner review

`docs/review/v14.2-gate-c/README.md` — before / iterations / after; the lower world walked forward
and in reverse at 1440×900 and forward at 1920×1080; full-size stills of every section at 1440 and
1920; the metrics.

## 6. Remaining, for the owner

- **Selected Systems' records wrap** to three or four lines at the column measure ("Verified
  against / source / Active development"). Legible and truthful; a shorter verification label would
  be a copy decision.
- **About's second row** (the links under the name, the honesty rule under the statement) opens
  ~100 px of paper between the statement and its record at 1440. It is the grid's own row and reads
  as a register; tightening it would mean placing the links by measurement.
- **Field Notes** carries its full register (index, label, state) for a one-line entry; the register
  is what makes it a station. If it still reads as too much chrome for one line, the next step is to
  fold the entry into About's station, which changes the IA (the finale tail lists 07).
- The three owner-pending mobile deltas (`OPUS-V14-QA-RETURN.md` §6.1) remain pending.

NEXT: owner visual review. Not continued automatically. No further gate, no final Opus QA, no merge.
