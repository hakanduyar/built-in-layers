import { Container } from "@/components/ui/Container";
import { TextLink } from "@/components/ui/TextLink";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { socialLinks, siteName, siteOwner } from "@/data/site";
import { footerCtaHeading, footerCtaSubline, footerCtaLabel } from "@/data/copy";

/**
 * Contact CTA: email and CV are excluded (unconfirmed). LinkedIn is the
 * only verified, functional contact channel available, so the CTA button
 * targets it.
 */
export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <Container>
        <div className="py-16">
          <p className="font-display text-display-l uppercase tracking-display-l text-ink">
            {footerCtaHeading}
          </p>
          <p className="font-display text-display-l uppercase tracking-display-l text-ink">
            {footerCtaSubline}
          </p>
          <ButtonLink href="https://www.linkedin.com/in/hakanduyar/" external className="mt-8">
            {footerCtaLabel}
          </ButtonLink>

          <hr className="my-12 border-line" />

          <nav aria-label="Social">
            <ul className="flex gap-6">
              {socialLinks.map((link) => (
                <li key={link.url}>
                  <TextLink href={link.url} external>
                    {link.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </nav>

          <p className="mt-8 font-mono text-mono-meta text-ink-muted">
            © {new Date().getFullYear()} {siteOwner} — {siteName}
          </p>
        </div>
      </Container>
    </footer>
  );
}
