"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useSettledReducedMotion } from "@/lib/utils/useSettledReducedMotion";
import { SystemNode } from "@/components/spatial/SystemNode";
import { TextLink } from "@/components/ui/TextLink";
import { Reveal } from "@/components/ui/motion/Reveal";
import { aboutIntro, homePositioning, homeWordmark } from "@/data/copy";
import { contactUrl } from "@/data/site";

// IA section 9. Same pending copy already live on /about.
//
// V6.7 COMPLETION PASS -- WHERE THE SYSTEM RESOLVES TO A PERSON.
//
// This section carries the narrative turn the whole page has been building:
// products -> systems -> principles -> observations -> PERSON. Through
// V6.7-partial it was a heading and one sentence of pending copy in a 12-column
// grid, which is the one place on the page where the reader most needs to feel a
// human and instead met the thinnest composition on it.
//
// The redesign is a RESOLUTION rather than a new device. It reuses two things the
// page has already said and states them here as identity rather than as thesis:
// the approved wordmark, at display scale, as the answer the system arrives at; and
// the approved positioning line beneath it. Both are already-approved copy from
// data/copy.ts -- nothing about the person is invented here, and no biography is
// fabricated to fill space.
//
// V14.2 GATE C (owner) -- THE OPERATOR BEHIND THE SYSTEM IS REVEALED.
//
// V14.1's station still composed as a portfolio bio: the name on the left, a
// paragraph on the right under an accent bar, two links. What changes at
// `lg` is the grammar, not the content. The operator is set exactly as the
// systems were set at their stations -- classification above the name, as
// every project scene reads identity under its category line; the name
// resolving as it did; and, where a system carried its description, the
// operator's own statement (`aboutIntro.lead`) in the editorial serif the
// world keeps for the site's own voice -- the voice the finale then speaks
// in. The honesty rule stands under it as the record, in the same register
// the index gave every system's record. The accent bar is gone: signal is
// the route's colour, and it is spent where the route is. Restrained on
// purpose: the last station names who the route has been describing, in the
// route's own terms. The mobile composition below `lg` is the V13 gate's.
export function AboutPreview() {
  const [givenName = "Hakan", familyName = "Duyar"] = homeWordmark.split(" ");
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useSettledReducedMotion();
  // V6.8 (§10): IDENTITY RESOLUTION AS BEHAVIOUR. The name does not fade in --
  // it FOCUSES: letterspacing narrows from dispersed to set as the section
  // crosses the viewport, the same "resolves as the system closes on it" motion
  // every destination in the world has, applied to the one destination that is a
  // person. Driven by the section's own real passage; settles once resolved and
  // never reverts. Quantised so the text relayouts a handful of times, not per
  // frame; reduced motion renders the resolved state statically.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end 0.4"] });
  const resolve = useTransform(scrollYProgress, [0.1, 0.75], [0, 1]);
  const tracking = useTransform(resolve, (v) => {
    const q = Math.round(Math.min(1, Math.max(0, v)) * 24) / 24;
    return `${(0.09 - 0.125 * q).toFixed(4)}em`;
  });
  const settle = useTransform(resolve, [0, 1], [0.55, 1]);

  return (
    <SystemNode index="08" label="About">
      <h2 className="sr-only">About</h2>

      {/* FINAL REMEDIATION: the earlier build's comment claimed the introduction
          "fills the right column at the name's own cap height" while the markup
          stacked it BELOW the name -- at the owner's real viewport the identity
          frame's right two-thirds was bare paper. The layout now does what the
          design intent stated: name resolving left, introduction on the right,
          hung at the name's cap line. */}
      <div className="lg:mt-5 lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
        <Reveal className="lg:col-span-6 lg:row-start-1">
          {/* V14.2 Gate C: the classification line stands ABOVE the name at
              `lg`, as it does above every system's title in the world; below
              `lg` it stays under the name, the V13 composition. */}
          <p
            aria-hidden="true"
            className="hidden font-mono text-mono-label tracking-mono-label uppercase text-ink-muted lg:mb-5 lg:block"
          >
            {homePositioning}
          </p>
          {/* The resolution: the name the whole page has been evidence for. */}
          <div ref={ref} aria-hidden="true">
            <motion.p
              // V14.1 (owner §17): a station, not a second hero. The hero states
              // the name at 9.5rem; the operator's reveal at the last station
              // states it at the world's display-l scale, resolving as before.
              className="font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.88] uppercase text-ink lg:text-[clamp(2.25rem,5vw,4.25rem)] lg:leading-[0.9]"
              style={
                reduceMotion
                  ? { letterSpacing: "-0.035em" }
                  : { letterSpacing: tracking, opacity: settle }
              }
            >
              <span className="block">{givenName}</span>
              <span className="block lg:ml-[10%]">{familyName}</span>
            </motion.p>
          </div>
          {/* Both the name and the role are DECORATIVE ECHOES here: the hero states
              each of them once as real accessible content. Repeating them in the
              accessibility tree would make a screen-reader user hear the page's
              identity three times. A sighted reader sees the name resolve; an
              assistive-technology user hears it once, in the hero. */}
          <p
            aria-hidden="true"
            className="mt-5 font-mono text-mono-label tracking-mono-label uppercase text-ink-muted lg:hidden"
          >
            {homePositioning}
          </p>
        </Reveal>

        {/* V9 (§P0): a real introduction. The right column used to carry one
            sentence saying the introduction had not been written yet, plus a
            LinkedIn link -- so the page's own About section admitted to being a
            placeholder. It now carries the lead and the honesty rule from
            `aboutIntro`, which is assembled only from facts this repository
            already asserts (see the note on that export). The remaining two
            paragraphs live on /about; this is the preview, not the page. */}
        {/* V14.2 Gate C: at `lg` this wrapper dissolves (`contents`) and its
            children take the grid directly -- the statement beside the name,
            the record under it, and the two routes out under the NAME, in the
            left column's second row, where a station's own links belong. One
            nav in the DOM; below `lg` the wrapper is the V13 block. */}
        <div className="mt-10 lg:contents">
          {/* Below lg the V13 accent bar and body-scale lead; at lg the
              operator's statement in the site's own voice. */}
          <span aria-hidden="true" className="mb-5 block h-0.5 w-12 bg-signal lg:hidden" />
          <p className="max-w-[34rem] font-display text-body-l text-ink lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:max-w-[30rem] lg:font-serif lg:text-[1.375rem] lg:italic lg:leading-[1.45]">
            {aboutIntro.lead}
          </p>
          <p className="mt-4 max-w-[34rem] font-display text-body text-ink-muted lg:col-span-6 lg:col-start-7 lg:row-start-2 lg:mt-6 lg:max-w-[30rem]">
            {aboutIntro.honesty}
          </p>
          {/* V13 (mobile gate, M4): 180x24 and 76x24 targets on phones;
              `touch-link` gives each 44px below `lg`. As flex items the two
              links are blockified, and the negative margins still cancel the
              padding, so the row and the gap between them are unchanged
              (docs/FROZEN_BOUNDARY.md §5). */}
          <nav
            aria-label="About"
            className="mt-7 flex flex-wrap items-baseline gap-x-8 gap-y-3 lg:col-span-6 lg:col-start-1 lg:row-start-2 lg:mt-6 lg:self-start"
          >
            <TextLink href="/about" className="max-lg:inline-block max-lg:touch-link">
              Read the full introduction
            </TextLink>
            <TextLink href={contactUrl} external className="max-lg:inline-block max-lg:touch-link">
              LinkedIn
            </TextLink>
          </nav>
        </div>
      </div>
    </SystemNode>
  );
}
