import type { AnchorHTMLAttributes, ComponentProps, ReactElement, ReactNode } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import { DecisionCallout } from "@/components/ui/DecisionCallout";
import { Figure } from "@/components/ui/Figure";
import { Note } from "@/components/ui/Note";
import { cn } from "@/lib/utils/cn";

// D-001 (ACCEPTED FOR MVP): next-mdx-remote/rsc, pinned at 6.0.0. Only
// repository-owned, trusted local MDX is ever passed to this function — no
// remote or user-submitted content path exists anywhere in this project.

type WithChildren = { children?: ReactNode; className?: string };

// Controlled intrinsic-element mappings (ARCHITECTURE §6 allows h2, h3, p,
// ul, ol, li, a, strong as plain markdown output). Case-study bodies never
// carry their own className (MDX markdown syntax, not raw JSX), but props
// are still spread defensively so nothing is silently dropped.
//
// Typography roles are DESIGN_SYSTEM.md §3's own table, applied verbatim:
// h2 -> `heading-l` ("Page/case-study section headings"), h3 -> `heading-m`
// ("Sub-headings, card titles"), p -> `body` ("Default text"). No new token,
// no typography plugin, no global prose CSS.
//
// V13 (mobile gate, M2): running text carries `max-w-measure` -- the
// DESIGN_SYSTEM §3 reading measure as a token (styles/globals.css). Inside
// the 42rem case-study column it is inert on the desktop (42rem = 42rem) and
// shortens the line to 34rem below `lg`, where the column is the whole page.
// Figures are not running text and keep the column's full width.
function MdxH2({ children, className, ...props }: WithChildren) {
  return (
    <h2
      className={cn(
        "mt-12 max-w-measure first:mt-0 font-display text-heading-l text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

function MdxH3({ children, className, ...props }: WithChildren) {
  return (
    <h3
      className={cn("mt-8 max-w-measure font-display text-heading-m text-ink", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

function MdxP({ children, className, ...props }: WithChildren) {
  return (
    <p className={cn("mt-4 max-w-measure font-display text-body text-ink", className)} {...props}>
      {children}
    </p>
  );
}

// pl-5 (not ml-5): list markers are outside the li's content box but inside
// the ul's own box (list-style-position defaults to `outside`) — padding,
// not margin, is what gives them room to actually render, a common Tailwind
// preflight gotcha (preflight zeroes ul/ol padding).
function MdxUl({ children, className, ...props }: WithChildren) {
  return (
    <ul
      className={cn(
        "mt-4 max-w-measure list-outside list-disc space-y-2 pl-5 font-display text-body text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </ul>
  );
}

function MdxOl({ children, className, ...props }: WithChildren) {
  return (
    <ol
      className={cn(
        "mt-4 max-w-measure list-outside list-decimal space-y-2 pl-5 font-display text-body text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </ol>
  );
}

function MdxLi({ children, className, ...props }: WithChildren) {
  return (
    <li className={cn("pl-1", className)} {...props}>
      {children}
    </li>
  );
}

// Same weight discipline already used for inline emphasis in
// components/project/DecisionList.tsx ("Choice:"/"Trade-off:" labels):
// font-semibold (600), never the bold end of the approved 400-700 range.
function MdxStrong({ children, className, ...props }: WithChildren) {
  return (
    <strong className={cn("font-semibold text-ink", className)} {...props}>
      {children}
    </strong>
  );
}

// Mirrors components/ui/TextLink.tsx's own established underline/hover
// treatment (DESIGN_SYSTEM.md §10) exactly, without importing that
// component: MDX-authored links have no `external` flag to branch on, and
// external-link behavior (target/rel) is deliberately not invented here.
// The global `:focus-visible` outline (styles/globals.css) already covers
// the visible-focus requirement — nothing extra is needed for that.
function MdxA({
  children,
  className,
  ...props
}: WithChildren & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(
        "underline decoration-1 underline-offset-[3px] hover:text-signal-text hover:decoration-2",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

// V13 (mobile gate, M1): every case-study figure is a piece of evidence in a
// 42rem reading column, which below `lg` is 288-736px wide -- too narrow to
// read a 1600-unit diagram. The MDX `Figure` therefore opts into the
// inspector (components/ui/Figure.tsx `inspect`); the authored MDX is
// unchanged and cannot opt out, because an unreadable figure is never the
// author's intent. Same name, same whitelist entry, one more prop.
function MdxFigure(props: ComponentProps<typeof Figure>) {
  return <Figure {...props} inspect />;
}

// Restricted component whitelist (ARCHITECTURE §6): exactly the three named
// custom components, plus controlled styling for the plain markdown output
// ARCHITECTURE §6 already allows (h2, h3, p, ul, ol, li, a, strong). This is
// the single enforcement point — only names listed here may be used as
// custom elements in MDX; any other custom tag fails to resolve rather than
// rendering arbitrary injected markup. No new custom (PascalCase) component
// was added to this whitelist.
const components = {
  Figure: MdxFigure,
  Note,
  DecisionCallout,
  h2: MdxH2,
  h3: MdxH3,
  p: MdxP,
  ul: MdxUl,
  ol: MdxOl,
  li: MdxLi,
  strong: MdxStrong,
  a: MdxA,
} as const;

export async function compileProjectMDX(source: string): Promise<ReactElement> {
  const { content } = await compileMDX({
    source,
    components,
    options: {
      parseFrontmatter: false,
      // Binding D-001 conditions: explicit, not left to the unstated
      // default, even though blockJS defaults to true in 6.0.0.
      blockJS: true,
      blockDangerousJS: true,
    },
  });
  return content;
}
