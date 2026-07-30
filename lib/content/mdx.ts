import type { ReactElement } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import { DecisionCallout } from "@/components/ui/DecisionCallout";
import { Figure } from "@/components/ui/Figure";
import { Note } from "@/components/ui/Note";

// D-001 (ACCEPTED FOR MVP): next-mdx-remote/rsc, pinned at 6.0.0. Only
// repository-owned, trusted local MDX is ever passed to this function — no
// remote or user-submitted content path exists anywhere in this project.
//
// Restricted component whitelist (ARCHITECTURE §6): exactly the three named
// components. This is the single enforcement point — only names listed here
// may be used as custom elements in MDX; any other custom tag fails to
// resolve rather than rendering arbitrary injected markup.
const components = {
  Figure,
  Note,
  DecisionCallout,
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
