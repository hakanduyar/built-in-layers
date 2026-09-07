# V14.3 Gate E — readable on arrival

**From:** Fable 5.1 (visual gate, scoped) · **Date:** 2026-09-07 · **Branch:**
`feature/owner-visual-acceptance-v14` · **Base:** `b4921e1` (the Gate D checkpoint `5bbccb6` and its
record) · **Checkpoint:** see `.ai/STATE.md` (verify the tip with `git rev-parse HEAD`), pushed,
`local == origin`.

Owner acceptance is **PENDING**. Not a freeze, not an acceptance, not a merge. `main` = `16d3ec0`.

## 1. Scope, and only that

Three findings: sections remain faded for too long and become fully clear only near the middle of
the viewport; the lower world feels slightly too compressed; microtext and secondary contrast — make
information readable, reduce texture, nothing washed-out, nothing heavy. Not touched: scroll physics
and the discrete-wheel behaviour, the first-paint fix, the Gate B transition, the Gate C structure,
the Gate D rules (no orange, one mark one meaning, semantic-only grammar), project evidence and
content, the mobile art direction, the project scenes' compositions, SYSTEMS, the CTA, the route
geometry, the IA.

## 2. What changed (D-051, `docs/DESIGN_SYSTEM.md` §43) — desktop, `lg` and above

- **Earlier presence** (`lib/spatial/systemPov.ts` `scenePresence` desktop branch, `SystemPOV.tsx`,
  `Reveal.tsx` `early`, `SystemNode.tsx`, `AboutPreview.tsx`): a project scene's composition is
  detected at 0.45 and acquired between approach −0.66 and −0.38 instead of −0.42 to −0.14, its
  brackets and facts on the same window; a lower section's reveal fires when the element's top is
  10% of the viewport inside it instead of when a fifth of it is visible; the register's presence is
  full by 16% of the section's passage instead of a third; About's name is resolved by 30% of its
  passage instead of 75%. Release curves unchanged. Measured at 1440×900: the register marks and
  About's name at full presence with the section's top at 65% of the viewport (before: 50% for the
  marks, 30% for the name); Kıvılcım nearly present at frame 5 of its approach (before: a third).
- **Breathing room** (`SystemNode` `major`, `styles/globals.css`): Selected Systems, How I Build and
  About open with 128px above the register instead of 80; Field Notes keeps 56; the finale gains
  32px on the homepage. Lower world 3000 → 3194 px at 1440×900 (the pre-Gate-C 3245 is not
  returned to). Approach intervals in `editorialDrift.ts` untouched.
- **Microtext** (`SystemNode`, `SelectedSystems`, `FieldNotes`): the state word beside every
  register removed on desktop; the register's marks at 0.85 / 0.55; classifications at label size,
  the verification line in ink, the Field Notes index link at label size. Nothing else enlarged or
  darkened.
- **Mobile kept byte-for-byte in behaviour** through `lib/utils/useIsDesktop.ts` (new): every curve,
  weight and word below `lg` is the V13 composition's; the compact acquisition frame keeps its
  V14.1 timing.

## 3. Files

Product: `lib/spatial/systemPov.ts`, `lib/utils/useIsDesktop.ts` (new), `components/ui/motion/Reveal.tsx`,
`components/spatial/{SystemNode,SystemPOV}.tsx`,
`components/sections/{SelectedSystems,HowIBuild,FieldNotes,AboutPreview}.tsx`, `styles/globals.css`.
Tools: `tests/tools/entry-state-probe.mjs` (new, `docs/REVIEW_POLICY.md`).
Docs: `DECISIONS.md` D-051, `DESIGN_SYSTEM.md` §43, `FROZEN_BOUNDARY.md` §6.5, `REVIEW_POLICY.md`,
`.ai/{STATE,ACTIVE_TASK,HANDOFF}.md`, this file, `docs/review/v14.3-gate-e/README.md`.

## 4. Protected behaviour — verified on the checkpoint build

- `git diff --name-only b4921e1 -- lib/spatial/{cameraFilter,sceneRoute,scenes,worldFit,
  planeChoreography,projectGround,editorialDrift}.ts components/spatial/{SceneBreak,SpatialCamera,
  SpatialExperience,WorldGrammar,RouteMap,ProjectPlane,LowerRoute}.tsx app/` → **empty**.
- **First paint:** `FIRST PAINT == SETTLED` at 1440×900 and 1920×1080, cold.
- **Discrete scroll** (diffed against `docs/review/v14.1-engineering/discrete-scroll/
  discrete-1440x900.json`): geometry identical (`routeStart` 61, `routeEnd` 4561, `routeSpan` 4500,
  `leadCapPx` 540); every isolated impulse identical (120 px, delivered 1.000, coast 0); the
  sustained rows 0.736 / 0.703, inside the run-to-run band the Gate C A/B established.
- **Mobile** (`mobile-route-probe.mjs` at the recorded 2vh step, diffed against the Gate D record):
  document heights, scene positions and every DOM-rect measure identical on every viewport but for
  one 0.001 at 390×844; pixel-row ink within ±0.004 on four frames (sampling).
- **Runtime:** console noise 0 on every content route, hydration 0 on all 11 routes, overflow 0 of
  99, CLS 0.0418 on `/` — unchanged.
- **Focused Chromium** (`spatial`, `spatial-v5`, `a11y`, `smoke`, `motion`, `home`) and the unit
  suite: see `.ai/STATE.md` for the counts.
- typecheck 0 · lint 0 · format 0 · build ✓.

The full acceptance matrix and WebKit were not run, per the brief.

## 5. Owner review

`docs/review/v14.3-gate-e/README.md` — entry frames before / after; the approach sheets at 1440 and
1920; the lower world forward and in reverse; the entry-state numbers; the metrics.

## 6. Remaining, for the owner

- The register marks now peak at 0.85: present, still lighter than text. If they should be full
  ink, that is one constant.
- The approach intervals in `editorialDrift.ts` (0 / 6 / 4 / 6 vh) were left as they are; the room
  was added at the sections' own margins. If the beats want a different rhythm rather than more of
  the same, that table is where it lives.
- Selected Systems' records still wrap to three lines at the column measure (Gate C §6), now in ink.

NEXT: owner visual review. Not continued automatically. No further gate, no final Opus QA, no merge.
