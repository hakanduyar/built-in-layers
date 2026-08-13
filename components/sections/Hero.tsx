import { ExposedGridLines } from "@/components/ui/ExposedGridLines";
import { LayerRegistrationMark } from "@/components/ui/LayerRegistrationMark";
import { Reveal } from "@/components/ui/motion/Reveal";
import { heroPrimaryLine, homePositioning, homeWordmark } from "@/data/copy";

// IA section 2. The only h1 on the page. `firstWord`/`remainder` (derived
// below) split the exact same `homeWordmark` string on its first space --
// no new copy, no hard-coded "Hakan"/"Duyar" literals (would break the
// moment the approved name copy ever changes). A literal `{" "}` text node
// sits between the two spans specifically so `h1.textContent` stays
// "Hakan Duyar" (with the space Playwright's toHaveText/getByRole
// assertions require) even though visually the words sit on separate grid
// rows -- CSS Grid drops whitespace-only text runs from layout, so the
// space has zero visual effect but real DOM presence.
//
// PROTOTYPE V2 (Layered Editorial Systems, visual-only): V1's hero was
// visual-review-verdict "large name + technical grid background + small
// annotation" -- an enlarged block, not a composition. V2 recomposed it
// instead of enlarging it further: `remainder` ("Duyar") sits one grid step
// right of `firstWord` ("Hakan") on desktop (col 1 -> col 4) with a slight
// negative margin so the two lines interlock -- the same offset-as-depth
// idiom Built in Layers uses, now established in the first thing a visitor
// sees. On mobile the same idea becomes a plain indent (no grid columns
// available at that width).
//
// PROTOTYPE V3: the owner's visual review of V2 read the result as "large
// staggered name + small supporting type + sparse technical fragments" --
// four elements that shared a page but not a real relationship. V3 doesn't
// touch the HAKAN/DUYAR interlock itself (that part worked); it resolves
// everything *after* it into one continuous cascade down "Duyar"'s own
// column: role line and annotation cluster close to "Duyar," primary line
// one more step down the same column. Margins tightened throughout.
//
// PROTOTYPE V4 (final convergence pass): V3 was coherent but, per the
// owner's real 1440px screenshot, still read as "a centered/interlocked
// cluster inside a much larger unused canvas" -- the fix isn't a bigger
// name, it's making a second region of the canvas participate. The name +
// role + annotation stay exactly where V3 put them (that relationship was
// approved); what changes is the primary line, the brief's own named
// candidate for "at least one supporting typographic voice" to strengthen:
//
// - Column span widened from 7 to 9 (col-start-4 still, matching "Duyar"'s
//   own column -- the path from identity to editorial idea stays legible,
//   it isn't relocated), now reaching the container's right edge instead
//   of stopping around column 10. This alone closes most of the "empty
//   right two-thirds of the canvas" the owner's screenshot showed.
// - A second, disclosed, prototype-scoped font-size override (the same
//   pattern already used on the h1, see below) takes it past
//   `--text-statement`'s own clamp ceiling (2.25rem/36px, already reached
//   at 1440px) to clamp(1.75rem, 3.2vw, 3rem) -- roughly 46px at 1440px, a
//   real step up, while staying far below the h1's own ceiling (9rem) so
//   it cannot be mistaken for competing with the name.
// Together: HAKAN/DUYAR/role/annotation form one primary region (top-left,
// compact, high-contrast); the widened, strengthened primary line forms one
// genuine secondary region (wide, still clearly subordinate). Checked with
// `ExposedGridLines` mentally/visually removed: the composition still reads
// as authored through alignment (shared column-start) and scale contrast
// alone, not through the grid marks -- the grid remains secondary evidence,
// exactly as the brief requires.
//
// The primary line stays Newsreader italic, one of exactly two serif-
// statement uses on the page (DESIGN_SYSTEM §17 criterion 5), the other
// being the Layer Explorer's Flow definition.
//
// TASK-007: DESIGN_SYSTEM §13's "Hero intro: one staggered reveal on load,
// total <=700ms" -- three Reveal instances (name, positioning, primary
// line), delays 0/60/120ms, unchanged, still well inside the 5-item/<=90ms
// stagger cap. `onLoad` still marks these as always-on-screen-at-load
// content. Grid placement (col-start/row-start, no `order`) leaves DOM
// order untouched: h1, positioning line, primary line -- the aria-hidden
// annotation cluster's DOM position doesn't affect reading order.
//
// Typography governance (feature-branch pass): both fluid clamp() values
// below were previously opaque `style={{}}` props. Neither is a candidate
// for the shared `--text-*` token system in `styles/globals.css` -- that
// file's own header says tasks "may not invent tokens... without a
// corresponding entry in that document," and promoting an experimental,
// not-yet-approved-for-propagation hero scale into the tokens every other
// component reads from would be a real architecture decision, not a
// cleanup. Instead both moved into Tailwind's arbitrary-value utilities
// (`text-[clamp(...)]` / `leading-[...]` / `tracking-[...]`) -- an existing,
// already-used pattern in this codebase (e.g. `max-w-[36rem]` elsewhere),
// so the values are now visible in the class list like every other style
// decision here instead of living in a separate `style` prop, while
// staying exactly as component-scoped and reversible as before. Recorded
// in DESIGN_SYSTEM.md §18 (experimental, this branch only).
export function Hero() {
  const [firstWord = homeWordmark, ...restWords] = homeWordmark.split(" ");
  const remainder = restWords.join(" ");

  return (
    <section className="relative lg:grid lg:grid-cols-12 lg:gap-x-6">
      <ExposedGridLines lines={[4, 9]} className="absolute inset-x-0 top-0 hidden h-48 lg:grid" />

      <Reveal onLoad className="lg:col-span-12 lg:col-start-1 lg:row-start-1">
        <h1 className="text-[clamp(3.5rem,11vw,9rem)] leading-[0.9] tracking-[-0.02em] font-display uppercase text-ink lg:grid lg:grid-cols-12 lg:gap-x-6">
          <span className="block lg:col-start-1 lg:row-start-1">{firstWord}</span>{" "}
          {remainder && (
            <span className="block pl-8 lg:col-start-4 lg:row-start-2 lg:-mt-3 lg:pl-0">
              {remainder}
            </span>
          )}
        </h1>
      </Reveal>

      <Reveal
        onLoad
        delayMs={60}
        className="mt-4 lg:col-span-6 lg:col-start-4 lg:row-start-2 lg:mt-2"
      >
        <p className="font-display text-heading-m text-ink-muted">{homePositioning}</p>
      </Reveal>

      <div
        aria-hidden="true"
        className="hidden lg:col-span-3 lg:col-start-9 lg:row-start-2 lg:flex lg:flex-col lg:items-start lg:gap-3 lg:self-start"
      >
        <LayerRegistrationMark />
        <span className="border-t border-line pt-2 font-mono text-mono-meta tracking-mono-meta text-ink-muted">
          01 / SURFACE
        </span>
      </div>

      {/* The Hero's second region: same column as "Duyar" and the role
          line above it (the path stays legible), but now wide enough to
          reach the container's right edge and set at a genuinely
          strengthened scale -- see the file-level comment for the exact
          rationale and numbers. Still a border marking depth, not a second
          headline-weight statement competing with the h1. */}
      <Reveal
        onLoad
        delayMs={120}
        className="mt-6 border-l-2 border-line pl-6 lg:col-span-9 lg:col-start-4 lg:row-start-3 lg:mt-8"
      >
        <p className="max-w-[44rem] text-[clamp(1.75rem,3.2vw,3rem)] leading-[1.25] font-serif italic text-ink">
          {heroPrimaryLine}
        </p>
      </Reveal>
    </section>
  );
}
