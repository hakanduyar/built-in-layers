import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { homeWordmark, homePositioning } from "@/data/copy";

// No title: inherits the root layout's default title.
export const metadata: Metadata = buildMetadata({
  description:
    "Hakan Duyar — Frontend & Product Engineer. Interfaces on the surface. Systems underneath.",
  path: "/",
});

// Restrained shell placeholder only -- the full hero and homepage sections
// are TASK-003 (which depends on TASK-004's content system, ROADMAP Phase 4).
export default function Home() {
  return (
    <Container>
      <div className="py-16">
        <h1 className="text-heading-l uppercase text-ink">{homeWordmark}</h1>
        <p className="mt-4 font-mono text-mono-label tracking-mono-label uppercase text-ink-muted">
          {homePositioning}
        </p>
      </div>
    </Container>
  );
}
