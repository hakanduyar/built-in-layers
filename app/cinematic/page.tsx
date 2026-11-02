import type { Metadata } from "next";
import { CinematicStudy } from "@/components/cinematic/CinematicStudy";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Built in Layers — Project atlas",
  description:
    "Explore five projects from the Built in Layers portfolio and watch The Opening Move, a chess film in two cuts.",
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
