"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useSettledReducedMotion } from "@/lib/utils/useSettledReducedMotion";
import { SystemNode } from "@/components/spatial/SystemNode";
import { TextLink } from "@/components/ui/TextLink";
import { Reveal } from "@/components/ui/motion/Reveal";
import { homePositioning, homeWordmark, pendingCopy } from "@/data/copy";
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
// It is deliberately WARMER than the sections above it: the supporting statement is
// set in the editorial serif that the world reserves for the site's own voice, and
// the structural grammar is reduced to the node's own register. No dossier, no
// clearance, no profile photo frame, no scanning gimmick -- the system stops
// classifying and simply names who it has been describing.
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
          design intent stated: name resolving left, introduction and the lower
          page's one signal accent on the right, hung at the name's cap line. */}
      <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
        <Reveal className="lg:col-span-6">
          {/* The resolution: the name the whole page has been evidence for. */}
          <div ref={ref} aria-hidden="true">
            <motion.p
              className="font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.88] uppercase text-ink"
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
            className="mt-5 font-mono text-mono-label tracking-mono-label uppercase text-ink-muted"
          >
            {homePositioning}
          </p>
        </Reveal>

        {/* One signal accent in the whole lower page, spent here: the system's
            route colour ends at the person. lg:mt-3 hangs the accent just under
            the name's cap line so the two columns read as one register. */}
        <div className="mt-10 lg:col-start-8 lg:col-span-5 lg:mt-3">
          <span aria-hidden="true" className="mb-5 block h-0.5 w-12 bg-signal" />
          <p className="max-w-[34rem] font-display text-body-l text-ink-muted">
            {pendingCopy.aboutPrefix}{" "}
            <TextLink href={contactUrl} external>
              LinkedIn
            </TextLink>
            .
          </p>
          <nav aria-label="About" className="mt-7">
            <TextLink href="/about">Visit the About page</TextLink>
          </nav>
        </div>
      </div>
    </SystemNode>
  );
}
