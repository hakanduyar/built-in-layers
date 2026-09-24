# V14.3 Gate D — one mark, one meaning; no orange; every line a fact

**From:** Fable 5.1 (visual gate, scoped) · **Date:** 2026-09-07 · **Branch:**
`feature/owner-visual-acceptance-v14` · **Base:** `2eb06c1` (the Gate C checkpoint `5a4147d` and its
record) · **Checkpoint:** `5bbccb6`, pushed, `local == origin` (verify the tip with `git rev-parse HEAD`).

Owner acceptance is **PENDING**. Not a freeze, not an acceptance, not a merge. `main` = `16d3ec0`.

## 1. Scope, and only that

Three findings: duplicated project/frame corner marks (one mark = one meaning; especially the
redundant second top-left corner); all visible orange, replaced only with the existing neutral
system; an audit of generic connected-dot / node-network graphics, especially at SYSTEMS and the
finale, where every remaining line, dot or bracket must represent a real route/station, state,
boundary, dependency, registration, classification, handoff or surface/layer relationship. Not
touched: scroll physics and pacing, the first-paint fix, presence/fade timing, vertical spacing,
project evidence and content, the Gate B transition, the Gate C lower-world IA, the mobile art
direction. Gate E's findings (earlier-section clarity, breathing room, microtext/contrast) were
not started.

## 2. What changed (D-050, `docs/DESIGN_SYSTEM.md` §42)

- **Duplicate corners** (`WorldGrammar.tsx`, `Figure.tsx` + `styles/globals.css`,
  `SpatialProjectScene.tsx`): on desktop the world's registration tick is not drawn at the four
  project scenes, where the acquisition bracket already marks the same corner; it stays at the hero,
  SYSTEMS and route two, and everywhere on mobile. Inside the tour the evidence plate's four
  `Figure` ticks are hidden at `lg` (they made a second corner inside each bracket); off the tour
  the primitive is unchanged. The OPEN affordance's borrowed corner is gone; the rule and the word
  are the affordance.
- **Orange retired** (`--color-signal`, `--color-signal-text`, `--color-signal-ui` removed from the
  theme): route two, its stations and the landing corner are ink in the world and on both maps;
  the surface-return dash, the case-index dash, Selected Systems' branch ring, the About bar below
  `lg`, the mobile break rails' hairline, the Layer Explorer's active dot, the Work index card's
  hover boundary and the OG image's rule are ink / graphite (`--ink-muted`); text-link hover is
  graphite and the primary button's hover is graphite under paper. The accent strokes inside the
  thirteen owned D-019 diagrams (`public/images/projects/**/*.svg`, 22 substitutions) are graphite;
  their content and geometry are untouched. Nothing bright replaces the accent.
- **Every line a fact** (`SystemsWord.tsx`, `RouteMap.tsx`): the route map under the opened SYSTEMS
  surface is removed — the surface exposes the strata, and the Gate B cover then draws the descent;
  the `revealed` state is gone with its caller. On the two remaining maps the branch junction ring
  is removed. Kept, each with its meaning: rails, stations, the dotted ahead state, the cut's two
  strokes, the landing corner, the brackets, the strata, the branch and its destination corner, the
  lower rail and its stations, Selected Systems' descents.

## 3. Files

Product: `components/spatial/{WorldGrammar,RouteMap,SystemsWord,SceneBreak,SystemPOV,
SpatialProjectScene,SpatialExperience}.tsx`, `components/sections/{SelectedSystems,AboutPreview}.tsx`,
`components/ui/{Figure,FigureInspect,TextLink,ButtonLink}.tsx`,
`components/project/{ProjectCard,LayerExplorer,ProjectNeighbours}.tsx`, `components/layout/SiteHeader.tsx`,
`lib/content/mdx.tsx`, `app/opengraph-image.tsx`, `styles/globals.css`, thirteen owned SVG diagrams.
The case-study system's files moved on the owner's explicit instruction (colour and one attribute
only; `docs/FROZEN_BOUNDARY.md` §6.4).
Docs: `DECISIONS.md` D-050, `DESIGN_SYSTEM.md` §1, §2, §8, §10, §42, `FROZEN_BOUNDARY.md` §6.4,
`.ai/{STATE,ACTIVE_TASK,HANDOFF}.md`, this file, `docs/review/v14.3-gate-d/README.md`.

## 4. Protected behaviour — verified on the checkpoint build

- `git diff --name-only 2eb06c1 -- lib/spatial components/spatial/{SpatialCamera,LowerRoute,
  SystemNode,ProjectPlane}.tsx` → **empty**; `app/` differs only in the OG image's rule colour.
- **First paint:** `FIRST PAINT == SETTLED` at 1440×900 and 1920×1080, cold.
- **Discrete scroll** (diffed against `docs/review/v14.1-engineering/discrete-scroll/
  discrete-1440x900.json`): geometry identical; every isolated impulse identical (120 px, delivered
  1.000, coast 0). The sustained rows read 0.697 / 0.753, in the same run-to-run band the Gate C
  A/B established for this machine.
- **The cut:** `[data-systems-cut] svg polyline` count 0 against the ceiling of 2; every cover and
  rail contract unchanged; the transition sheets both ways show the same timing as the Gate B
  record with the strata alone under the surface.
- **Mobile** (`mobile-route-probe.mjs` at the recorded 2vh step, diffed against the engineering
  record): document heights, scene positions and every DOM-rect measure identical on every recorded
  viewport; the pixel-row ink measure moved by 0.001–0.005 on the frames where orange hairlines
  became ink — colour only, no geometry.
- **Runtime:** console noise 0 on every content route, hydration 0 on all 11 routes, overflow 0 of
  99, CLS 0.0418 on `/` — unchanged.
- **Chromium, the whole project** (every spec, since the hover colours and the Figure attribute
  reach the case studies): 224/224; unit 569/569.
- typecheck 0 · lint 0 · format 0 · build ✓.

The full acceptance matrix and WebKit were not run, per the brief.

## 5. Owner review

`docs/review/v14.3-gate-d/README.md` — before / after by finding; 3× crops of the corners; the cut
forward and reverse at 1440 and the 1920 smoke; the finale forward and reverse; the metrics.

## 6. Remaining, for the owner

- The closed corner with an inset mark still means "resolved registration" in four places (route
  two's anchors, the landing, the section registers, the rail's terminus). One glyph, one meaning —
  but it is a composite glyph, and if it reads as two nested corners it is a Gate E question.
- The station rings and the strata labels in the world are the only non-text marks left in the
  travel space; nothing else was found to remove without removing a fact.
- The diagrams' emphasis is now graphite on ink: still legible as emphasis, and the owner may
  prefer a weight change instead of a tone change inside the assets.

NEXT: owner visual review. Not continued automatically. Gate E not started. No merge.
