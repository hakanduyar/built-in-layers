import { ImageResponse } from "next/og";

// TASK-008 / D-007: "one global static fallback OG image... no runtime
// OG-image generation in the MVP" — D-007 rejected `next/og` specifically
// for *per-route, dynamically parameterized* generation (many images on
// demand). This file has no dynamic segments and no request-time params,
// so Next.js generates it exactly once at build time and serves the
// resulting PNG as a static asset from then on — the same "one static
// default image" outcome D-007 approved, using the only zero-dependency
// tool available in this environment to produce a real raster asset (no
// design software, no `sharp`/`canvas` — installing either would violate
// this task's "no runtime dependency" constraint). Colors are the exact
// approved DESIGN_SYSTEM §2 tokens; `--signal` is used only decoratively
// (a thin accent bar, never text), matching its "graphic use only" rule.
// Font families use the platform's generic sans-serif/serif-italic/
// monospace faces rather than self-hosting Archivo/Newsreader/IBM Plex
// Mono into `ImageResponse` (which requires fetching raw font binary
// buffers) — a disclosed simplification, not a new font-loading
// architecture for one social image.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "Built in Layers — Hakan Duyar, Frontend & Product Engineer. Interfaces on the surface. Systems underneath.";

// DESIGN_SYSTEM §8 item 5: "Layer registration mark: three stacked 2px
// bars (the visual shorthand for Surface/Flow/System)" — the one approved
// decorative element that actually represents this brand's core idea,
// used here instead of a generic accent line.
function LayerRegistrationMark() {
  const bars = [
    { width: 96, color: "#161616" },
    { width: 72, color: "#504e48" },
    { width: 48, color: "#ff4f1f" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {bars.map((bar) => (
        <div
          key={bar.width}
          style={{ display: "flex", width: bar.width, height: 4, backgroundColor: bar.color }}
        />
      ))}
    </div>
  );
}

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: "#f1efe8",
        padding: "0 80px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: "monospace",
          fontSize: 22,
          letterSpacing: 4,
          color: "#504e48",
          textTransform: "uppercase",
        }}
      >
        Built in Layers
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 24,
          fontSize: 80,
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: -1,
          color: "#161616",
          textTransform: "uppercase",
        }}
      >
        Hakan Duyar
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 14,
          fontSize: 42,
          fontWeight: 600,
          color: "#161616",
          textTransform: "uppercase",
        }}
      >
        Frontend &amp; Product Engineer
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 32, marginTop: 48 }}>
        <LayerRegistrationMark />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontStyle: "italic",
            fontSize: 32,
            lineHeight: 1.3,
            color: "#161616",
          }}
        >
          <div style={{ display: "flex" }}>Interfaces on the surface.</div>
          <div style={{ display: "flex" }}>Systems underneath.</div>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
