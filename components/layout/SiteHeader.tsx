import Link from "next/link";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/ui/Container";
import { navItems, siteOwner } from "@/data/site";

// No active-route highlighting in MVP (TASK-002 scope) — the page h1
// already states location.
//
// V13 (mobile gate, M4): below `lg` the wordmark and the primary nav items
// carry `touch-link` (styles/globals.css) -- a 44px hit box with no change to
// the header's height or rhythm. The nav items take a wider horizontal slop
// than the default because at 13px mono "Lab" is 27px wide; `gap-8` leaves
// 8px between neighbouring hit boxes at 0.75rem. The nav is `md:block`, so
// this reaches exactly the tablet band (768-1023) where it is shown to touch.
export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <Container className="flex items-center justify-between py-4">
        <Link
          href="/"
          className="font-display text-heading-m uppercase text-ink max-lg:inline-block max-lg:touch-link"
        >
          {siteOwner}
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-mono text-mono-label tracking-mono-label uppercase text-ink hover:text-signal-text max-lg:inline-block max-lg:touch-link max-lg:[--touch-slop-x:0.75rem]"
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
