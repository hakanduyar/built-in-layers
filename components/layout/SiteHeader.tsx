import Link from "next/link";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/ui/Container";
import { navItems, siteOwner } from "@/data/site";

// No active-route highlighting in MVP (TASK-002 scope) — the page h1
// already states location.
export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <Container className="flex items-center justify-between py-4">
        <Link href="/" className="font-display text-heading-m uppercase text-ink">
          {siteOwner}
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-mono text-mono-label tracking-mono-label uppercase text-ink hover:text-signal-text"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <MobileNav items={navItems} />
      </Container>
    </header>
  );
}
