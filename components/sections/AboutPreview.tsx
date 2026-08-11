import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/TextLink";
import { Reveal } from "@/components/ui/motion/Reveal";
import { pendingCopy } from "@/data/copy";
import { contactUrl } from "@/data/site";

// IA section 9. Same pending copy already live on /about. Text cols 1-7,
// links block cols 8-13 (DESIGN_SYSTEM §15), stacked below lg. TASK-007:
// the text block gets a section-level reveal on scroll, matching
// PositioningStatement's grid-column-carrying Reveal; the small persistent
// nav link stays static (it is chrome, not reading content).
export function AboutPreview() {
  return (
    <section className="mt-16 lg:mt-32">
      <SectionHeading index="08" label="About" />
      <h2 className="mt-4 font-display text-display-l uppercase text-ink">About</h2>
      <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-6">
        <Reveal className="max-w-[42rem] lg:col-span-7 lg:col-start-1">
          <p className="font-display text-body-l text-ink-muted">
            {pendingCopy.aboutPrefix}{" "}
            <TextLink href={contactUrl} external>
              LinkedIn
            </TextLink>
            .
          </p>
        </Reveal>

        <nav aria-label="About" className="mt-6 lg:col-span-4 lg:col-start-9 lg:mt-0">
          <TextLink href="/about">Read the full introduction</TextLink>
        </nav>
      </div>
    </section>
  );
}
