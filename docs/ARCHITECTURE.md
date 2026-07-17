# ARCHITECTURE — Built in Layers

Status: APPROVED WITH REVISIONS (2026-07-17) — revised per Hakan's conditional approval; D-001 remains provisional pending the TASK-001 spike
Owner: Hakan Duyar
Derived from: `CLAUDE.md` (technical contract), `docs/PROJECT_SPEC.md`, `docs/CONTENT_INVENTORY.md`

This document defines the technical structure a separate engineering agent can implement without making product-level decisions. It does not replace the technical contract in `CLAUDE.md`; it refines it.

## 1. Stack (fixed by contract)

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router), latest stable at TASK-001 time |
| Language | TypeScript, `strict: true` |
| Package manager | pnpm |
| Styling | Tailwind CSS v4 + CSS custom properties for design tokens (D-002, accepted) |
| Content | Local MDX + typed frontmatter, no CMS. MDX pipeline per D-001 (provisional): preferred `next-mdx-remote/rsc`, verified by a mandatory TASK-001 spike; documented fallback `@next/mdx` |
| Rendering | Server Components by default. **All publishable routes are pre-rendered at build time.** |
| Motion | `motion` (Motion for React) — installed only in TASK-007 |
| Validation | Zod for frontmatter/content schemas |
| Unit/component tests | Vitest + React Testing Library |
| E2E/smoke tests | Playwright — Chromium + WebKit in MVP (D-010 revised); Firefox is a later or manual quality check |
| Formatting / linting | Prettier / ESLint (`eslint-config-next`) |
| Deployment target | Vercel-compatible pre-rendering. `output: "export"` is **not** configured in the MVP unless a later deployment decision explicitly requires it |

## 2. Directory structure (final proposal)

Refines the target in `CLAUDE.md §9` without changing responsibilities:

```text
app/
  layout.tsx              # Root layout: fonts, header, footer, skip link
  page.tsx                # Home
  work/
    page.tsx              # Work index
    [slug]/
      page.tsx            # Case-study route (SSG, dynamicParams = false)
  lab/
    page.tsx              # Honest placeholder / experiments index
  notes/
    page.tsx              # Notes index (external Medium links in MVP)
  about/
    page.tsx
  not-found.tsx           # Custom 404
  sitemap.ts              # TASK-008
  robots.ts               # TASK-008
  opengraph-image.png     # Static default OG image (TASK-008; asset required)
components/
  layout/                 # SiteHeader, SiteFooter, SkipLink,
                          # MobileNav ("use client" — revised D-005)
  sections/               # Homepage sections (Hero, SelectedSystems, ...)
  project/                # Case-study building blocks (CaseStudyHero,
                          # LayerSection, LayerExplorer, DecisionList,
                          # ProjectCard, NextProject, ...)
  ui/                     # Primitives: Container, SectionHeading, MonoLabel,
                          # TextLink, ButtonLink, Figure, Prose, PendingNote, Tag
content/
  work/
    <slug>/
      index.mdx           # Frontmatter (full metadata) + narrative sections
      surface.mdx         # SURFACE layer body
      flow.mdx            # FLOW layer body
      system.mdx          # SYSTEM layer body
  notes/                  # Reserved for future local MDX articles (empty in MVP)
  lab/                    # Reserved for future experiments (empty in MVP)
data/
  site.ts                 # Nav items, social links, footer/contact data
  notes.ts                # Typed external-article list (MVP notes source)
  copy.ts                 # Homepage/UI chrome copy (translation-ready seam)
lib/
  content/
    schemas.ts            # Zod schemas + inferred TS types (single source)
    work.ts               # Loaders: getAllProjects, getProjectBySlug, ...
    mdx.ts                # MDX compile + restricted component map
    validate.ts           # Publication gates (placeholder scan, layer checks)
  seo/
    metadata.ts           # buildMetadata helper, title template, canonical
  utils/
    cn.ts                 # Tiny class-join helper (local, no dependency)
public/
  images/
    projects/
      kivilcim/
      dropspot/
      jointledger/
      professional/
      archive/
styles/
  globals.css             # Tailwind v4 @theme tokens + base styles
docs/
  tasks/
tests/
  e2e/                    # Playwright specs
  unit/                   # Vitest specs for lib/ (component tests colocated
                          # or here — one convention, chosen in TASK-001)
```

Rules:

- No `src/` directory.
- No barrel files unless they define a real import boundary (none planned in MVP).
- Page-specific components stay in their domain folder (`sections/`, `project/`); only genuinely reused primitives go in `ui/`.

## 3. Server / client component boundaries

Default: **every component is a Server Component.**

Client Components must remain **minimal and purpose-driven**, but their exact count is not fixed before implementation (revised D-005 — the former "exactly two client boundaries" rule is removed). Each client boundary is recorded in `docs/DECISIONS.md` with its purpose. Currently planned:

| Component | Why it must be client | Introduced in |
|---|---|---|
| `components/layout/MobileNav.tsx` | Mobile MENU trigger opening an accessible full-screen/panel navigation: keyboard operation, Escape-to-close, managed focus (revised D-005) | TASK-002 |
| `components/project/LayerExplorer.tsx` | Tab state, keyboard interaction (ARIA tabs, manual activation — revised D-006) | TASK-007 (static stacked version is server-rendered until then) |
| `components/ui/motion/*` (e.g. `Reveal.tsx`) | Motion for React wrappers, `useReducedMotion` | TASK-007 |

Navigation (revised D-005): **inline navigation on desktop; a visible MENU trigger on mobile** opening an accessible full-screen or panel navigation with keyboard operation, Escape-to-close, managed focus (into the panel on open, back to the trigger on close), and visible focus states. Progressive enhancement: the server renders the full link list; without JavaScript every navigation link remains reachable.

No global state library. No React context in MVP.

## 4. Page and route map

| Route | Source file | Rendering | h1 | Notes |
|---|---|---|---|---|
| `/` | `app/page.tsx` | Static | Hero name/title | 10 sections per PROJECT_SPEC §7 |
| `/work` | `app/work/page.tsx` | Static | "Selected systems" (final copy from spec) | Tiered lists, never one flat grid |
| `/work/[slug]` | `app/work/[slug]/page.tsx` | SSG via `generateStaticParams`; `dynamicParams = false` | Project title | 11-section case-study template |
| `/about` | `app/about/page.tsx` | Static | About heading | Verified facts only |
| `/notes` | `app/notes/page.tsx` | Static | Notes heading | External Medium links |
| `/lab` | `app/lab/page.tsx` | Static | Lab heading | Honest empty/preview state |
| `*` (unknown) | `app/not-found.tsx` | Static | 404 message | Includes nav back to Home/Work |

Unknown `/work/<slug>` values 404 via `dynamicParams = false`. No other dynamic routes in MVP. No route handlers/API routes in MVP.

Translation readiness: routes stay unprefixed in MVP. All chrome/homepage strings live in `data/copy.ts`; MDX content lives under `content/`, whose layout allows a future locale level (e.g. `content/tr/work/...`) without moving code. No i18n library until the Turkish phase is approved.

## 5. Content loading approach

- Loaders in `lib/content/work.ts` read `content/work/*/` with `node:fs` at build time — server-only module (never imported from a Client Component).
- Frontmatter parsed with `gray-matter`, validated with Zod (`lib/content/schemas.ts`). Invalid content **fails the build** with a message naming the file and the failing field.
- MDX bodies compiled inside Server Components using a **restricted component map** (see §6). Pipeline per D-001 (provisional): preferred `next-mdx-remote/rsc` (`compileMDX`) — **pinned to a compatible version with its JavaScript-blocking security options explicitly enabled** — verified by the mandatory TASK-001 spike; if the spike fails, the documented fallback is the official `@next/mdx` pipeline. Only repository-owned, trusted local MDX is ever compiled; user-submitted or remotely supplied MDX is not supported.
- Loaders wrapped in React `cache()` so repeated calls within a build are free.
- Listing pages (Home, Work) read frontmatter only; body compilation happens only on `/work/[slug]`.
- Notes: `data/notes.ts` is a typed array validated by the same Zod pattern — the single MVP source for notes. `content/notes/` stays empty until local articles are approved (see D-008).

No content is fetched at request time. No hard-coded project data inside presentation components — pages call loaders and pass typed props down.

## 6. MDX / frontmatter schema

Full schemas live in `docs/CONTENT_MODEL.md`; `lib/content/schemas.ts` is their executable form and the single source of truth at runtime. Summary:

- `index.mdx` frontmatter: identity (slug, title, category label), tier, case-study depth, provenance and disclosure, verification status, publication status, contribution statement, tech list, links, images, decisions array, layer summaries.
- Body of `index.mdx`: narrative sections (one-minute summary, why it exists, constraints, evolution, reflection) marked by `h2` headings in a fixed order.
- `surface.mdx` / `flow.mdx` / `system.mdx`: layer bodies. Each must be substantive (validation enforces a minimum — see CONTENT_MODEL §7) so the layer switch never becomes a decorative tab.

Allowed MDX components (whitelist enforced by the component map in `lib/content/mdx.ts`):

`h2`, `h3`, `p`, `ul`, `ol`, `li`, `a`, `strong`, `em`, `blockquote`, `code`, `pre`, plus custom: `Figure` (image + required alt + mono caption), `Note` (aside), `DecisionCallout`. Anything else fails review. Raw HTML in MDX is not allowed.

## 7. Content validation strategy

**Build gates reduce the risk of publishing incomplete, duplicated, or unverified content, but do not replace human review.**

Three gates, all build-time (no runtime validation needed for static output). The marker scan and the layer-meaning gate block builds **only for content with `status: "published"`** — draft and preview content never blocks a production build:

1. **Schema gate** — Zod parse of every frontmatter/data file; build fails on error.
2. **Marker gate** — `lib/content/validate.ts` scans published content for `[CONTENT REQUIRED` markers. A project with `status: "published"` containing a marker in rendered text fails the build. Draft content may contain markers and is excluded from production lists.
3. **Layer-meaning gate** — published projects with a full or short case study must have three layer files whose bodies are non-identical and meet the minimum-substance rule (CONTENT_MODEL §7). This automated distinctness check detects empty or duplicated layer content; it does **not** claim to verify factual truth — that remains Hakan's review.

These gates run inside the loaders (so `pnpm build` exercises them) and are unit-tested in Vitest.

## 8. Image strategy

- All images via `next/image` with explicit `width`/`height` or `fill` inside fixed-aspect containers → zero CLS from media.
- Case-study images live in `public/images/projects/<slug>/`; every image referenced from frontmatter carries required `alt` text (schema-enforced) and a `placeholder: true|false` flag.
- **No invented or AI-generated final screenshots.** Until Hakan provides approved assets, slots render a labelled development placeholder: a locally created flat SVG that literally says `PLACEHOLDER — asset pending` (allowed in drafts; blocked in published content by the truthfulness gate unless the surrounding copy honestly labels it).
- Aspect ratios standardized per slot (defined in DESIGN_SYSTEM §9). `sizes` attribute specified per slot to avoid oversized downloads.
- Diagrams are preferred as SVG authored from real architecture; also treated as assets requiring approval.

## 9. SEO and metadata strategy

- `lib/seo/metadata.ts` exposes `buildMetadata({ title, description, path, ogImage? })` used by every page's `export const metadata` / `generateMetadata`.
- Title template: `%s — Hakan Duyar` (home: `Hakan Duyar — Frontend & Product Engineer`).
- Canonical URLs from a single **typed site-URL configuration** (`SITE_URL`, env-driven) with a **safe development value** (e.g. `http://localhost:3000`). The production domain is never invented; it is **not** a Phase 0 or TASK-001 blocker and must be confirmed by Hakan before TASK-008 completion.
- Open Graph: one static default image in MVP (`app/opengraph-image.png`); per-project OG images only when real assets exist. Dynamic `ImageResponse` generation is deferred post-MVP (D-007).
- `sitemap.ts` and `robots.ts` in TASK-008, listing only published routes.
- JSON-LD: a single `Person` object on `/` and `/about` containing only verified fields (name, job title, GitHub/LinkedIn/Medium URLs). No organization, employer, or address claims.
- Notes page links out with `rel="noopener"`; external links marked visually and for screen readers (DESIGN_SYSTEM §10).

## 10. Testing layers

| Level | Tool | Scope | Runs in |
|---|---|---|---|
| 0 | Zod (build) | Every content file parses; gates in §7 | `pnpm build`, `pnpm test` |
| 1 | Vitest | `lib/content` loaders, validators, `lib/seo`, `lib/utils` | `pnpm test` |
| 2 | Vitest + RTL | Interactive components only (LayerExplorer: roles, keyboard, reduced-motion branch) | `pnpm test` |
| 3 | Playwright (Chromium + WebKit, D-010) | Smoke: every route renders with expected h1; nav works incl. mobile menu open/close/Escape/focus; 404; keyboard-only layer switch; `prefers-reduced-motion` emulation | `pnpm test:e2e` |
| Manual | QA_CHECKLIST.md | Responsive widths, focus visibility, content truthfulness | Each task's completion report |

Canonical scripts (created in TASK-001):

```text
pnpm dev            # next dev
pnpm build          # next build  (includes content gates)
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint .
pnpm format:check   # prettier --check .
pnpm test           # vitest run
pnpm test:e2e       # playwright test
```

No CI pipeline in MVP; all gates run locally per task (D-013 — proposal to add GitHub Actions post-MVP).

## 11. Error handling

- **Build-time first**: content errors fail `pnpm build` with actionable messages (file path + field). This is the primary error surface for a static site.
- `app/not-found.tsx`: custom 404 with links back to Home and Work; triggered by unknown routes and `dynamicParams = false`.
- No `error.tsx`/`global-error.tsx` in MVP: all routes are static with no request-time data fetching, so runtime error boundaries have nothing meaningful to catch. Revisit if any dynamic data source is ever approved.
- External links never fetched at build; no link-rot checking in MVP (manual check in QA).

## 12. Accessibility architecture

- Semantic landmarks: one `header`, `nav`, `main` (with `id="main"`), `footer` per page; skip link as first focusable element targeting `#main`.
- Exactly one `h1` per page; heading levels never skip.
- Global `:focus-visible` style from design tokens (DESIGN_SYSTEM §11); never removed.
- Layer switch implements the WAI-ARIA Tabs pattern as a progressive enhancement with **manual activation** (revised D-006): `tablist`/`tab`/`tabpanel` roles and relationships correct; roving tabindex; **Left/Right Arrow move tab focus, Home/End move to first/last tab, Enter/Space activate the focused tab**; 44px minimum targets. Until TASK-007, layers render as stacked, labelled `h2`/`h3` sections; afterwards that stacked rendering remains the no-JS output — without JavaScript all three layer sections stay **visible, ordered, labelled, and readable**. The page never depends on JavaScript to expose project content.
- Mobile navigation (revised D-005): the MENU trigger and panel are fully keyboard operable, Escape closes, focus is managed, and focus states are visible; without JavaScript all navigation links remain reachable.
- Color usage constrained by contrast rules in DESIGN_SYSTEM §2 (the raw `--signal` accent fails text contrast on paper and is restricted to decoration that carries no meaning; `--signal-text` is the accessible text variant, `--signal-ui` the accessible variant for meaningful control boundaries and indicators).
- All meaning conveyed by color also conveyed by text/weight/underline.
- Images: required alt text (schema-enforced); decorative rules/ticks are CSS or `aria-hidden` SVG.
- Automated axe scan via `@axe-core/playwright` added in TASK-008 (dev dependency, pre-approved in budget).

## 13. Reduced-motion strategy

Two enforcement levels, both required:

1. **CSS**: `@media (prefers-reduced-motion: reduce)` in `globals.css` collapses transition/animation durations to `0.01ms` and disables scroll-behavior smoothness.
2. **JS**: every Motion for React usage goes through wrappers in `components/ui/motion/` that call `useReducedMotion()` and render the final (non-animated) state when reduction is requested. Raw `motion.*` elements outside these wrappers are forbidden.

Rule: no content, layout, or meaning may depend on an animation having played. Playwright runs the smoke suite once with `reducedMotion: 'reduce'` emulation.

## 14. Dependency budget

Runtime dependencies (complete list — anything else requires approval + DECISIONS entry):

| Package | Purpose | Added in |
|---|---|---|
| `next`, `react`, `react-dom` | Framework | TASK-001 |
| `zod` | Content validation | TASK-001 (D-001 spike; used fully from TASK-004) |
| `gray-matter` | Frontmatter parsing for listing pages | TASK-001 (D-001 spike; used fully from TASK-004) |
| `next-mdx-remote` | MDX compilation in RSC (`/rsc` entry) — **pinned version, JavaScript-blocking security options enabled** | TASK-001 (D-001 spike) |
| `motion` | Motion for React | TASK-007 |

If the D-001 spike fails, `next-mdx-remote` is removed and replaced by the official `@next/mdx` pipeline (and this table is updated with a DECISIONS entry).

Dev dependencies (complete list):

| Package | Purpose | Added in |
|---|---|---|
| `typescript`, `@types/react`, `@types/react-dom`, `@types/node` | Types | TASK-001 |
| `tailwindcss`, `@tailwindcss/postcss` | Styling (v4) | TASK-001 |
| `eslint`, `eslint-config-next` | Linting | TASK-001 |
| `prettier` | Formatting | TASK-001 |
| `vitest`, `@vitejs/plugin-react`, `jsdom` | Unit/component tests | TASK-001 |
| `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` | Component tests | TASK-001 |
| `@playwright/test` | E2E | TASK-001 |
| `@axe-core/playwright` | Automated a11y scan | TASK-008 |

Explicitly **not** in budget: i18n libraries, `clsx`/`tailwind-merge` (local `cn` util suffices), state libraries, GSAP, Three.js, analytics, icon packs (inline SVG only), CSS-in-JS, contentlayer/velite, date libraries.

Fonts add no packages: loaded via `next/font/google` (self-hosted at build). Families fixed at three: Archivo, Newsreader, IBM Plex Mono (all SIL OFL — re-verify at TASK-001; see D-003, accepted provisionally: TASK-001 must verify the actual `next/font` imports compile and that the selected variants and subsets are available; no additional family without approval).

## 15. Rules for adding a new project

1. Create `content/work/<slug>/` with `index.mdx` (+ `surface/flow/system.mdx` if case-study depth is `full` or `short`).
2. Complete all required frontmatter, including provenance, disclosure, contribution, and verification status. Facts must trace to the repository or Hakan's explicit statements.
3. Add approved images to `public/images/projects/<slug>/`; every image needs alt text.
4. Set `status: "draft"` until Hakan approves publication.
5. Run `pnpm test && pnpm build` — the content gates must pass.
6. **No code changes are needed to add a project.** If a new component or layout seems required, stop: that is a design change needing approval.

## 16. Rules for adding a new page

1. Requires an approved task — pages are product scope, never incidental.
2. Add `app/<route>/page.tsx` using existing layout primitives; export metadata via `buildMetadata`.
3. Add nav/footer entry in `data/site.ts` only if the IA change is approved.
4. Add the route to the Playwright smoke spec and (TASK-008 onward) `sitemap.ts`.
5. One `h1`, landmarks intact, QA checklist run.

## 17. Rules for creating reusable components

1. A primitive enters `components/ui/` only after the same pattern exists in **two or more** real places — no speculative abstraction.
2. Props are typed; no `any`; no default-exported anonymous functions.
3. Server Component unless it appears in the §3 client allowlist (or an approved decision extends that list).
4. Styling only via Tailwind classes referencing design tokens — no hex values inside components.
5. Do not fragment trivial markup: a component under ~10 lines used once belongs inline.
6. Interactive primitives ship with an RTL test covering keyboard behavior.

## 18. Deliberately excluded from the MVP

CMS, database, authentication, admin panel, contact-form backend, analytics, dark mode, i18n library / Turkish content, Three.js/WebGL, GSAP, custom cursor, background video, scroll hijacking, parallax, dynamic OG image generation, RSS feed, comments, search, service worker/PWA for the portfolio itself, CI pipeline (proposed post-MVP), `error.tsx` boundaries, every repository as content, testimonials/metrics of any kind unless verified.
