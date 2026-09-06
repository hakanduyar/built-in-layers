import {
  footerCtaHeading,
  footerCtaLabel,
  footerCtaSubline,
  howIBuildHeading,
  sectionIndex,
  selectedSystemsHeading,
  workIndexLabel,
} from "@/data/copy";
import { contactUrl, siteName, siteOwner, socialLinks } from "@/data/site";
import { RouteMap } from "@/components/spatial/RouteMap";
import { ButtonLink } from "@/components/ui/ButtonLink";
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
 * V14 (owner finding §14) -- THE FINALE IS THE RESOLVED MAP.
 *
 * V6.8-V13 drew four hairlines converging to a node above the headline -- one
 * per route the reader had travelled, each in its own stroke grammar. The
 * intent was "complex topology -> convergence -> simplicity"; the owner's
 * reading of the frame was "four hairline scratches" over an oversized footer,
 * and the baseline still bears it out: at 5:1 the bearings are near-parallel
 * and the thing they converge on is a 7px square.
 *
 * The finale now states the same claim with the thing itself. The whole
 * journey is drawn once more (RouteMap, `resolved`) -- both routes solid,
 * every station visited, the branch to the Work index, the terminus closed --
 * still, complete, beside the question. Complexity mapped; the operator
 * addressable beneath it. It is the fourth and last state of the one topology
 * the world draws under its route, opens at SYSTEMS and shows at the handoff,
 * so the ending is the map the reader has been travelling, finished.
 *
 * The map is meaningful only where the journey exists, so it is hidden by
 * `styles/globals.css` on pages without the spatial tour -- the same `:has()`
 * scoping the finale's height already uses. The station indices are the route's
 * own presentation order (ROUTE_ONE_IDS), not content.
 */
const FINALE_STATIONS = [
  { id: "software-factory", index: "01" },
  { id: "kivilcim", index: "02" },
  { id: "jointledger", index: "03" },
  { id: "dropspot", index: "04" },
] as const;

/** V14.1: the lower page's stations, so the resolved map is the whole journey
 *  -- the sections' real IA indices and labels, in their real order. */
const FINALE_TAIL = [
  { index: sectionIndex.selectedSystems, label: selectedSystemsHeading },
  { index: sectionIndex.howIBuild, label: howIBuildHeading },
  { index: "07", label: "Field notes" },
  { index: "08", label: "About" },
] as const;

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
        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-10 lg:pl-[4%]">
          <div className="lg:col-span-7">
            {/* A true system statement, not fake telemetry: the route rails end
                here and the map beside this block shows them ended. aria-hidden:
                the heading below is the accessible content. */}
            <p
              aria-hidden="true"
              className="mb-4 font-mono text-mono-label tracking-mono-label uppercase text-ink-muted"
            >
              End of route
            </p>
            {/* V9 (§14): the axis runs past the headline and terminates ON the
                action, with the world's own closed corner at its foot. */}
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
          {/* The journey, resolved: every station visited, both routes solid,
              the branch drawn, the terminus closed. Hidden off the homepage by
              styles/globals.css -- a map of a journey the page does not contain
              would be decoration. */}
          <div
            aria-hidden="true"
            className="finale-map mt-16 hidden lg:col-span-5 lg:col-start-8 lg:mt-3 lg:block"
          >
            <RouteMap
              state="resolved"
              stations={FINALE_STATIONS}
              branch={[workIndexLabel]}
              tail={FINALE_TAIL}
              labels
              className="w-full"
            />
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
