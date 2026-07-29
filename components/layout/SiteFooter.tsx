import { footerCtaHeading, footerCtaLabel, footerCtaSubline } from "@/data/copy";
import { contactUrl, siteName, siteOwner, socialLinks } from "@/data/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { TextLink } from "@/components/ui/TextLink";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <Container className="py-16">
        <h2 className="font-display text-display-l uppercase text-ink">{footerCtaHeading}</h2>
        <p className="mt-4 max-w-[42rem] font-display text-body-l text-ink">{footerCtaSubline}</p>
        <ButtonLink href={contactUrl} external className="mt-8">
          {footerCtaLabel}
        </ButtonLink>

        <nav aria-label="Social links" className="mt-16">
          <ul className="flex flex-wrap gap-6">
            {socialLinks.map((link) => (
              <li key={link.url}>
                <TextLink href={link.url} external>
                  {link.label}
                </TextLink>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-8 font-mono text-mono-meta tracking-mono-meta text-ink-muted">
          © {year} {siteOwner} — {siteName}
        </p>
      </Container>
    </footer>
  );
}
