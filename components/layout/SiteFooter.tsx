import { footerCtaHeading, footerCtaLabel, footerCtaSubline } from "@/data/copy";
import { contactUrl, siteName, siteOwner, socialLinks } from "@/data/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import {
  EXIT_FROM,
  EXIT_TURN,
  routeScreenAngle,
  sceneFocusProgress,
  workBranch,
} from "@/lib/spatial/sceneRoute";
import { VW_PER_VH } from "@/lib/spatial/scenes";
import { Container } from "@/components/ui/Container";
import { TextLink } from "@/components/ui/TextLink";

// Spatial Portfolio V6.1 (feature/spatial-portfolio-v5, not merged to main --
// see docs/DESIGN_SYSTEM.md §21). §23-24.
//
// WHAT WAS WRONG
//
// This was a `py-16` container holding a display-l heading, then a social nav,
// then a copyright line -- i.e. a conventional website footer. On the homepage
// that meant a spatial journey with its own physics resolved into the same block
// every generic portfolio ends with: the site did not finish, it ran out of
// sections.
//
// WHAT IT IS NOW
//
// A final SCENE. The CTA owns a real viewport composition (min-h-[76vh],
// vertically centred) with a display-xl scale and room around it, and the
// secondary material -- social links, copyright -- is separated below a rule as a
// calm strip rather than competing with it (§25's "may remain calmer and
// secondary").
//
// Controlled asymmetry rather than dead centre (§24): the block is centred
// vertically and indented from the left on desktop, with a structural rule
// running in from the margin. Nothing here is centred pixel-perfect.
//
// V6.2 -- BLAST RADIUS (§20). V6.1 gave this a `min-h-[76vh]` viewport
// composition, which applied to EVERY page. Reviewed on /work and /notes, a
// three-quarter-viewport CTA under a short content page reads as a page that ran
// out of content, not as a finale: the tall composition needs a journey behind it
// to resolve.
//
// So the tall treatment is now scoped to pages that actually contain the spatial
// journey, via `body:has(...)` in styles/globals.css. The markup is identical
// everywhere -- one component, one CTA, no duplication, no route prop threaded
// through the root layout -- and the composition simply stops claiming a full
// screen where there is no journey to conclude. The route termination that hands
// off into it lives in EditorialDrift's DriftSettle.
/**
 * V6.8 (§12) -- THE CONVERGENCE, drawn from the journey's own geometry.
 *
 * The finale's claim is "complex topology -> convergence -> simplicity -> action",
 * so the complexity the lines carry is the page's real topology rather than a
 * decorative fan: each incoming line enters at the mean screen bearing of one of
 * the four routes the reader actually travelled or was shown --
 *
 *   route one          hero -> the cut          (the evidence descent)
 *   route two          underneath -> handoff    (the thinking climb)
 *   the exit diagonal  handoff -> the turn      (the traverse)
 *   the work branch    the route not taken
 *
 * All four converge to one point; from that point a single vertical drops to the
 * headline's first character. Derived at module load from the same functions the
 * world draws its rails with, so if the route is ever re-aimed the finale re-aims
 * with it. Compressed into the panel's aspect (x0.28) so the steepest bearing
 * still fits; relative order and sign are preserved, which is what matters.
 */
const CONVERGE = (() => {
  const branch = workBranch();
  const branchBearing =
    (Math.atan2(
      branch[branch.length - 1]!.y - branch[0]!.y,
      (branch[branch.length - 1]!.x - branch[0]!.x) * VW_PER_VH,
    ) *
      180) /
    Math.PI;
  const bearings = [
    routeScreenAngle(0, sceneFocusProgress("tail")),
    routeScreenAngle(sceneFocusProgress("reorient") + 0.01, sceneFocusProgress("handoff")),
    routeScreenAngle(EXIT_FROM, EXIT_TURN),
    branchBearing,
  ];
  // ITERATION 2. The first pass mapped each bearing to an entry ordinate by
  // literal compressed tangent, and the capture showed why that fails as a
  // composition: three of the four bearings are within 45 degrees of each other,
  // so the "fan" collapsed into near-parallel hairlines and the steepest line
  // left the panel entirely. The entry ordinates are now a MONOTONE REMAP of the
  // real bearings onto the panel's full height -- order and sign preserved (the
  // branch, the one negative bearing, is the one line that arrives from BELOW the
  // axis), magnitudes normalised so the topology is legible. The data still steers
  // the drawing; the panel no longer pretends to be a protractor.
  const P = { x: 1.2, y: 33 };
  const sorted = [...bearings].sort((a, b) => a - b);
  const SPREAD_YS = [44, 22, 12, 3]; // ascending bearing -> entry ordinate
  // ITERATION 3: each line arrives wearing ITS OWN route's registered grammar --
  // the exact stroke vocabulary the world above draws it with. Route one is the
  // solid ink rail; route two and the exit traverse are the dashed signal rails;
  // the work branch is the fine-dashed ink line that was never taken. A reader who
  // has just travelled the page can literally recognise which line is which -- the
  // convergence is the journey's four routes arriving, not four decorative
  // hairlines.
  const GRAMMAR = [
    { dash: undefined, tone: "ink", opacity: 0.5 }, // route one
    { dash: "2.5 3", tone: "signal", opacity: 0.75 }, // route two
    { dash: "2.5 3", tone: "signal", opacity: 0.55 }, // exit traverse
    { dash: "1.2 3", tone: "ink", opacity: 0.4 }, // the branch not taken
  ] as const;
  // Ragged entry abscissae: review caught all four lines starting on one hard
  // invisible vertical, which read as an overflow mask rather than lines arriving.
  const ENTRY_XS = [100, 96.5, 100, 93];
  return bearings.map((bearing, index) => {
    const rank = sorted.indexOf(bearing);
    return { x1: ENTRY_XS[index]!, y1: SPREAD_YS[rank]!, x2: P.x, y2: P.y, ...GRAMMAR[index]! };
  });
})();

const CONVERGE_POINT = { x: 1.2, y: 33 };

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      {/* FINAL REMEDIATION -- the finale must OWN the last viewport. At the
          owner's real ~1200px-tall display the 74vh composition plus the
          furniture strip left ~290px of the previous section hanging above the
          page's final frame, which is why the review read the CTA as "sitting
          too low". 82vh + rebalanced padding centres the conclusion optically
          higher and leaves only a sliver of tail at 900 and 1200 alike. */}
      {/* V9 (§14): REBALANCED, not resized. `justify-center` with `pb-48` is a
          contradiction — it centres the block and then pushes it back up, which
          is what left the measured band of empty paper between the action and
          the furniture strip while the composition sat high in the frame. The
          bottom padding now only separates the finale from the strip below it,
          and the centring does the placing. Height is untouched. */}
      <Container className="spatial-finale flex min-h-[82vh] flex-col justify-center pb-20 pt-10 lg:pb-24 lg:pt-12">
        <div className="lg:pl-[8%]">
          {/* The journey's four routes, arriving and resolving. The vertical that
              leaves the convergence point lands exactly on the headline's leading
              edge -- the point ESTABLISHES the axis the conclusion is set on.
              Height raised h-40 -> h-52 at lg: at the container cap the panel ran
              ~7:1, flat enough that the four bearings read as near-horizontal
              scratches; at ~5:1 the convergence is legible as an event. */}
          <div aria-hidden="true" className="relative -mb-2 h-32 w-full lg:h-52">
            <svg viewBox="0 0 100 44" preserveAspectRatio="none" className="h-full w-full text-ink">
              {CONVERGE.map((line, index) => (
                <line
                  key={index}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={line.tone === "signal" ? "var(--color-signal)" : "currentColor"}
                  strokeWidth={1}
                  strokeOpacity={line.opacity}
                  strokeDasharray={line.dash}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <line
                x1={CONVERGE_POINT.x}
                y1={CONVERGE_POINT.y}
                x2={CONVERGE_POINT.x}
                y2="44"
                stroke="currentColor"
                strokeWidth={1}
                strokeOpacity={0.7}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {/* The node as an HTML element: `preserveAspectRatio="none"` stretches
              the box ~9x horizontally, so an SVG circle renders as a smudged
              ellipse (review finding). A positioned square stays crisp at any
              width, and the filled square is the world's own terminus form
              (DriftSettle's closed mark). Centred on the convergence point:
              x = 1.2% of the panel, y = 33/44 of its height. */}
            <span
              className="absolute h-[7px] w-[7px] bg-ink"
              style={{ left: "calc(1.2% - 3px)", top: "calc(75% - 3px)" }}
            />
          </div>

          {/* A true system statement, not fake telemetry: the route rails end
              here, the four lines above are the routes arriving, and the drop
              lands on this block. The system marks its own terminus. aria-hidden:
              the heading below is the accessible content. */}
          <p
            aria-hidden="true"
            className="mb-4 font-mono text-mono-label tracking-mono-label uppercase text-ink-muted"
          >
            End of route
          </p>
          {/* V9 (§14) -- THE CONVERGENCE NOW REACHES THE ACTION.
              The owner's reading was that the geometry, the empty territory and
              a small action did not resolve into one final state, and the frame
              showed why: the vertical dropping out of the convergence node
              stopped at the headline, so the last third of the composition --
              the subline and the button, i.e. the actual decision -- stood
              beside the drawing rather than at the end of it.

              The axis now continues past the headline and terminates ON the
              action, with the world's own closed corner at its foot. Nothing new
              was invented: it is the same single line the four routes already
              converge into, drawn to the place it was always pointing. */}
          <div className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-6 top-0 hidden w-px bg-ink opacity-25 lg:block"
              style={{ height: "calc(100% - 0.75rem)" }}
            />
            <span
              aria-hidden="true"
              className="absolute -left-6 hidden h-px w-4 bg-ink opacity-45 lg:block"
              style={{ bottom: "0.75rem" }}
            />
            <h2 className="max-w-[24ch] font-display text-[clamp(2.5rem,7vw,6rem)] leading-[0.9] tracking-[-0.03em] uppercase text-ink">
              {footerCtaHeading}
            </h2>
            <p className="mt-8 max-w-[42rem] font-serif text-statement italic text-ink">
              {footerCtaSubline}
            </p>
            <ButtonLink href={contactUrl} external className="mt-12">
              {footerCtaLabel}
            </ButtonLink>
          </div>
        </div>
      </Container>

      {/* Secondary strip: deliberately quiet, and below a rule so it reads as
          site furniture rather than as part of the finale. */}
      <div className="border-t border-line">
        <Container className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
          <nav aria-label="Social links">
            <ul className="flex flex-wrap gap-6">
              {socialLinks.map((link) => (
                <li key={link.url}>
                  {/* V13 (mobile gate, M4): 44px hit boxes below `lg`; the
                      strip's rhythm is unchanged (styles/globals.css). */}
                  <TextLink
                    href={link.url}
                    external
                    className="max-lg:inline-block max-lg:touch-link"
                  >
                    {link.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </nav>

          <p className="font-mono text-mono-meta tracking-mono-meta text-ink-muted">
            © {year} {siteOwner} — {siteName}
          </p>
        </Container>
      </div>
    </footer>
  );
}
