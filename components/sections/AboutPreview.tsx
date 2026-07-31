import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/TextLink";
import { pendingCopy } from "@/data/copy";
import { contactUrl } from "@/data/site";

// IA section 9. Same pending copy already live on /about. Text cols 1-7,
// links block cols 8-13 (DESIGN_SYSTEM §15), stacked below lg.
export function AboutPreview() {
  return (
    <section className="mt-16 lg:mt-32">
      <SectionHeading index="08" label="About" />
      <h2 className="mt-4 font-display text-display-l uppercase text-ink">About</h2>
      <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-6">
        <p className="max-w-[42rem] font-display text-body-l text-ink-muted lg:col-span-7 lg:col-start-1">
          {pendingCopy.aboutPrefix}{" "}
          <TextLink href={contactUrl} external>
            LinkedIn
          </TextLink>
          .
        </p>

        <nav aria-label="About" className="mt-6 lg:col-span-4 lg:col-start-9 lg:mt-0">
          <TextLink href="/about">Read the full introduction</TextLink>
        </nav>
      </div>
    </section>
  );
}
