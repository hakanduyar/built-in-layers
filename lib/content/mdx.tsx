import type { AnchorHTMLAttributes, ReactElement, ReactNode } from "react";
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
function MdxH2({ children, className, ...props }: WithChildren) {
  return (
    <h2
      className={cn("mt-12 first:mt-0 font-display text-heading-l text-ink", className)}
      {...props}
    >
      {children}
    </h2>
  );
}

function MdxH3({ children, className, ...props }: WithChildren) {
  return (
    <h3 className={cn("mt-8 font-display text-heading-m text-ink", className)} {...props}>
      {children}
    </h3>
  );
}

function MdxP({ children, className, ...props }: WithChildren) {
  return (
    <p className={cn("mt-4 font-display text-body text-ink", className)} {...props}>
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
        "mt-4 list-outside list-disc space-y-2 pl-5 font-display text-body text-ink",
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
        "mt-4 list-outside list-decimal space-y-2 pl-5 font-display text-body text-ink",
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

// Restricted component whitelist (ARCHITECTURE §6): exactly the three named
// custom components, plus controlled styling for the plain markdown output
// ARCHITECTURE §6 already allows (h2, h3, p, ul, ol, li, a, strong). This is
// the single enforcement point — only names listed here may be used as
// custom elements in MDX; any other custom tag fails to resolve rather than
// rendering arbitrary injected markup. No new custom (PascalCase) component
// was added to this whitelist.
const components = {
  Figure,
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
