import type { Metadata } from "next";
import { CinematicStudy } from "@/components/cinematic/CinematicStudy";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "The opening move",
  description: "A chess film and a project atlas from Hakan Duyar’s Built in Layers portfolio.",
  path: "/cinematic",
});

export default async function CinematicPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <CinematicStudy
      cut={params.cut === "b" ? "b" : "a"}
      lang={params.lang === "tr" ? "tr" : "en"}
    />
  );
}
