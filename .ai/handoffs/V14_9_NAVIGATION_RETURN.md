# V14.9 navigation gate — the route navigator

**From:** Opus 5 · **Date:** 2026-09-09 · **Branch:** `feature/owner-visual-acceptance-v14` ·
**Base:** `69d57f5` (the V14.8 visual checkpoint `b385675`) · **Checkpoint:** `b244a4d`, pushed,
`local == origin`.

Owner acceptance is **PENDING**. Not a freeze, not an acceptance, not a merge. `main` = `16d3ec0`.

## 1. Scope, and only that

Three goals: a restrained fixed desktop navigator showing the current logical section with clickable
stations; previous/next controls moving section to section through the existing spatial route; and
ArrowLeft/ArrowRight navigation coexisting with completely free scrolling — all reading one shared
section/scene source of truth. Not touched: the V14.8 SYSTEMS composition, the black transition, the
POI grammar, scroll physics and max speed, route geometry, project content, lower-world spacing,
first-paint behaviour, the no-orange rule and the mobile art direction.

## 2. What was built (D-055, `docs/DESIGN_SYSTEM.md` §47)

- **One list.** `lib/spatial/routeNavigation.ts` holds the journey as a single ordered array of
  fourteen stations: the nine real camera scenes, the four real drift sections, the finale. Ticks,
  controls, keys and readout are all pure functions of it. A station must name a real `SceneId`, a
  real `DriftSectionId` or the finale, so an animation state cannot be a destination — the brief's
  "no stops for minor animation states" enforced by the data's shape, asserted by unit test.
- **Labels and indices are the product's own.** The hero line's two state words, the world's first
  stratum, the projects' real frontmatter titles, the real section headings, and `footerCtaLabel`
  without its destination. Indices appear only where the product already assigns one: 01..04 for the
  cases, 05..08 for the IA; the hero, route two's three framework scenes and the finale carry none,
  matching the rule `WorldGrammar` already applies.
- **The navigator.** Fixed at the lower rail's own `4vw` datum, at the top of the frame, `lg` and
  up, in the band the camera's 14vh inset leaves empty — no bar, no background, no border. The
  current station's index and name in mono, and beneath it the route drawn horizontally in the
  world's own two states (dotted ahead, solid ink behind) with one 24px station tick per
  destination. PREVIOUS and NEXT are the terminus mark the world closes a rail with, at either end,
  disabled at the ends rather than wrapping.
- **Navigation is one `window.scrollTo`, not a second engine.** The camera is a pure function of
  document scroll, so moving the document IS moving the camera — the real route, the real cut, the
  real filter and governor. It is the mechanism `SpatialCamera` already uses for keyboard focus
  (`recenterOnScene` → `scrollToProgress`), same `behavior: "smooth"`, same next-frame re-assert.
- **Free scroll is the only source of state.** The active station is read from `window.scrollY` by
  `activeStationIndex`, never set by the control that was pressed, so a reader can interrupt a
  navigation mid-flight with the wheel and the navigator stays correct. ArrowLeft/ArrowRight step
  the route; ArrowUp/ArrowDown, PageUp/PageDown, Home/End and space are untouched — they are the
  reader's own scrolling and the break guard already treats them as real input.
- **It stands down where it would mean nothing:** below `lg`, under reduced motion, without
  JavaScript, and at the very top until the reader has moved, so the first painted frame is exactly
  what it was. Hidden with `visibility`, not opacity, so its buttons are never focusable over the
  hero.

## 3. Files

New: `lib/spatial/routeNavigation.ts`, `components/spatial/RouteNavigator.tsx`,
`tests/unit/route-navigation.test.ts`, `tests/e2e/navigation.spec.ts`,
`tests/tools/route-navigation-probe.mjs`, `docs/review/v14.9-navigation/`.
Touched, without changing what renders: `components/spatial/SpatialCamera.tsx` (one attribute,
`data-route-spacer`), `data/copy.ts` (`sectionIndex.fieldNotes`, `sectionIndex.about`),
`FieldNotes.tsx` and `AboutPreview.tsx` (read those constants instead of the identical literals),
`app/page.tsx` (mounts the navigator).
Docs: `DECISIONS.md` D-055, `DESIGN_SYSTEM.md` §47, `FROZEN_BOUNDARY.md` §6.9, `REVIEW_POLICY.md`
(the new tool), this file.

## 4. Measured

- **Travel is controlled, never a teleport** (`metrics/route-navigation-1440x900.json`): five
  stations reach their target over 19–66 moving frames, settling in 388–1150 ms; zero teleports.
  About crosses the cut and the whole lower world in one travel (3471 → 7916). Free scroll resumed
  immediately after (1359 → 1875 on six notches).
- **Route geometry unchanged:** `tourStart` 61, spacer 5400, document 9504 at 1440×900 — identical
  to the record.
- **First paint:** `FIRST PAINT == SETTLED`, cold, at 1440×900 and 1920×1080.
- **Mobile:** the route probe at the recorded 2vh step is identical to the V14.8 record on every
  geometry and layout measure; three pixel-row sampling means moved by ≤0.005. The navigator does
  not exist below `lg`.
- typecheck 0 · lint 0 · format 0 · unit **589/589** (17 new contracts) · build ✓ · focused Chromium
  (`navigation`, `motion`, `spatial`, `spatial-v5`, `home`, `smoke`, `a11y`) **125 passed, 2
  skipped** — the two skipped are the V6.6 seam tests skipped since V14.5, and the axe pass covers
  the navigator.

The full acceptance matrix and WebKit were not run, per the brief.

## 5. One defect found and fixed during the checks

The navigator first used `data-route-station`, which the world's own rail already owns for its
station rings — every click selector matched two elements. The navigator's attributes are now
`data-nav-*`; the world's are untouched. A second failure in the same run was in my own test helper,
not the product: `settle()` reused a stability counter across calls and could return before a click
had started moving the document. Both are fixed and the suite is green.

## 6. Remaining, for the owner

- Under reduced motion and without JavaScript the navigator is absent by design: there is no camera
  route to address there, and the page is an ordinary document. If the owner wants it present in
  that mode, addressing the linear scenes by element position is a contained follow-up.
- The finale's station is labelled "Get in touch", derived from `footerCtaLabel`. If a different
  word is wanted for the last stop, it is one string.

NEXT: owner review. No further gate, no final QA, no merge.
