import { ImageResponse } from "next/og";

// V3 favicon: reuses the DESIGN_SYSTEM §8 item 5 registration-mark identity
// (three stacked bars, the same visual shorthand app/opengraph-image.tsx
// already draws for Surface/Flow/System) as the site's favicon, via
// Next.js's native `app/icon.tsx` file convention -- no new logo, no new
// dependency (next/og is already used by opengraph-image.tsx), and Next
// auto-injects the resulting <link rel="icon"> itself, so no manual
// `metadata.icons` entry is needed. Kept self-contained (not importing from
// opengraph-image.tsx or components/ui/LayerRegistrationMark.tsx) so this
// file carries zero risk to either of those already-shipped, tested paths.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  const bars = [
    { width: 20, color: "#161616" },
    { width: 14, color: "#504e48" },
    { width: 8, color: "#ff4f1f" },
  ];
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 3,
        backgroundColor: "#f1efe8",
        paddingLeft: 6,
      }}
    >
      {bars.map((bar) => (
        <div
          key={bar.width}
          style={{ display: "flex", width: bar.width, height: 3, backgroundColor: bar.color }}
        />
      ))}
    </div>,
    { ...size },
  );
}
