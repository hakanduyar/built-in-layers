import Link from "next/link";
import { navItems, siteOwner } from "@/data/site";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/ui/Container";

/**
 * Desktop: plain server-rendered inline nav, no motion, no client code.
 * Mobile: MobileNav (the one Client Component -- revised D-005).
 * No active-route highlight in MVP -- the page's own `h1` already states
 * location (ARCHITECTURE §3).
 */
export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <Container>
        <div className="flex items-center justify-between py-4">
          <Link
            href="/"
            className="font-mono text-mono-label tracking-mono-label uppercase text-ink"
          >
            {siteOwner}
          </Link>
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex gap-8">
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
        </div>
      </Container>
    </header>
  );
}
