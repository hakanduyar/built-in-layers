import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { homePositioning, homeWordmark } from "@/data/copy";
import { buildMetadata } from "@/lib/seo/metadata";

// Minimal home stub only — full homepage (10 sections) is TASK-003.
export const metadata: Metadata = buildMetadata({
  description: "Hakan Duyar — Frontend & Product Engineer.",
  path: "/",
});

export default function Home() {
  return (
    <Container className="py-16">
      <h1 className="font-display text-display-xl tracking-display-xl uppercase text-ink">
        {homeWordmark}
      </h1>
      <p className="mt-4 font-display text-heading-m text-ink-muted">{homePositioning}</p>
    </Container>
  );
}
