# QA CHECKLIST — Built in Layers

Used by every task's completion report and fully executed in TASK-008. Check items honestly: `passed / failed / not applicable`. Never mark an item passed without running or inspecting it.

## 1. Automated gates (run for every task)

- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm lint` — zero errors/warnings
- [ ] `pnpm format:check` — clean
- [ ] `pnpm test` — all unit/component tests pass
- [ ] `pnpm build` — production build succeeds (includes content gates)
- [ ] `pnpm test:e2e` — smoke suite passes on Chromium + WebKit (D-010; once Playwright exists, TASK-001+). Firefox stays a manual/later check

## 2. Content truthfulness (every task touching content)

- [ ] No `[CONTENT REQUIRED` marker renders in production output
- [ ] No invented metrics, clients, outcomes, testimonials, dates, or screenshots
- [ ] Every technical claim traced to the repository audit or Hakan's explicit statement
- [ ] Provenance labels correct (personal / professional / internship / learning / fork); upstream credited where `fork`
- [ ] AI-assisted work disclosed where applicable
- [ ] Featured projects state Hakan's specific contribution
- [ ] Pending/placeholder areas use approved honest wording (CONTENT_MODEL §8)
- [ ] Old CV data not presented as current

## 3. Accessibility (manual, every UI task)

- [ ] Keyboard-only pass: every interactive element reachable, operable, in logical order; no traps
- [ ] Skip link appears on first Tab and jumps to `#main`
- [ ] Visible focus state on every interactive element (DESIGN_SYSTEM §11)
- [ ] Exactly one `h1`; heading levels don't skip; landmarks present
- [ ] Mobile MENU (revised D-005): trigger visible and keyboard operable; panel opens with focus managed into it; Escape closes and returns focus to the trigger; all links reachable without JS
- [ ] Layer switch (revised D-006, manual activation): Left/Right Arrow move tab focus without activating; Home/End go to first/last tab; Enter/Space activate; `tablist`/`tab`/`tabpanel` roles correct; state announced (`aria-selected`)
- [ ] All images have meaningful alt text (or empty alt if truly decorative)
- [ ] Color contrast (approved D-004): normal text ≥ 4.5:1; meaningful control boundaries and indicators ≥ 3:1; measured against the DESIGN_SYSTEM §2 table
- [ ] Color is never the only indication of selection, focus, status, or interaction
- [ ] Touch targets ≥ 44×44px
- [ ] Page fully understandable with JavaScript disabled; all three layer sections visible, ordered, labelled, and readable without JS

## 4. Reduced motion (every task from TASK-007 on)

- [ ] OS-level `prefers-reduced-motion: reduce`: no reveals, no panel animation, content complete
- [ ] Playwright suite passes with `reducedMotion: 'reduce'` emulation
- [ ] No content or meaning depends on an animation having played

## 5. Responsive (manual, every UI task)

Check at 375px, 768px, 1024px, 1440px (and 320px for overflow only):

- [ ] No horizontal overflow or scrollbar
- [ ] Grid columns per DESIGN_SYSTEM §4 (4 / 8 / 12)
- [ ] Homepage sections match DESIGN_SYSTEM §15 behavior
- [ ] Images keep aspect ratio; no layout shift while loading (fixed dimensions)
- [ ] Text remains readable (no clipped clamp values, measure ≤ 42rem)

## 6. Visual system compliance (every UI task)

- [ ] Only approved tokens used — no raw hex values in components
- [ ] Decorative elements limited to DESIGN_SYSTEM §8 vocabulary
- [ ] `--signal` used only decoratively where it carries no meaning — never text, never a meaningful indicator; text accents use `--signal-text`, meaningful boundaries/indicators use `--signal-ui` (D-004)
- [ ] Radius ≤ 4px; no box shadows; no gradients
- [ ] Anti-generic criteria (DESIGN_SYSTEM §17) reviewed and recorded

## 7. Architecture compliance (every code task)

- [ ] Server Components by default; client components only from the approved allowlist
- [ ] No project data hard-coded in presentation components
- [ ] No unapproved dependency added (`package.json` diff matches ARCHITECTURE §14)
- [ ] No barrel files, no speculative abstractions
- [ ] Changed files limited to the active task's expected list (deviations reported)

## 8. SEO / metadata (TASK-002 baseline, TASK-008 full)

- [ ] Unique title + description per route via `buildMetadata`
- [ ] Canonical URLs correct; OG image present
- [ ] `sitemap.xml` lists exactly the published routes; `robots.txt` sane
- [ ] JSON-LD Person contains only verified fields
- [ ] External links: `rel="noopener noreferrer"`, new-tab indication

## 9. Release gate (TASK-008 only)

- [ ] axe scan (all routes): zero violations
- [ ] Lighthouse (mobile emulation): Performance ≥ 90, Accessibility ≥ 95 (target 100), Best Practices ≥ 95, SEO ≥ 95
- [ ] CLS ≈ 0 on all routes; no font-swap layout jumps
- [ ] Total JS on `/` within budget (TASK-008 records the number; target < 120KB gzipped client JS)
- [ ] 404 route works on the deployment target
- [ ] Full manual pass of sections 2–8 on the production build
