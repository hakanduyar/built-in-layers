import fs from "node:fs";
import path from "node:path";

type Dimensions = { width: number; height: number };

// Every project SVG asset (see public/images/projects/**) declares explicit
// width/height on its root <svg> element -- read directly, no XML parser.
function readSvgDimensions(buffer: Buffer): Dimensions | null {
  const openTag = buffer.toString("utf8", 0, 2000).match(/<svg\b[^>]*>/)?.[0];
  const width = openTag?.match(/\swidth="(\d+(?:\.\d+)?)"/)?.[1];
  const height = openTag?.match(/\sheight="(\d+(?:\.\d+)?)"/)?.[1];
  if (!width || !height) return null;
  return { width: Math.round(Number(width)), height: Math.round(Number(height)) };
}

// Project raster assets are lossless (VP8L) or lossy (simple VP8) WebP --
// read whichever bitstream header is present directly, no decoder library.
// Cross-verified against every current asset via an independent decoder
// before relying on this (see TASK-008 2026-08-12 log). Extended VP8X
// (alpha/animation/ICC container) returns null -- no current asset uses it,
// and Figure falls back to its prior (no explicit size) behavior rather
// than guessing.
function readWebpDimensions(buffer: Buffer): Dimensions | null {
  if (buffer.length < 30) return null;
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    return null;
  }
  const fourCC = buffer.toString("ascii", 12, 16);
  if (fourCC === "VP8L") {
    // Signature byte 0x2f, then a packed little-endian uint32: 14 bits
    // width-1, 14 bits height-1.
    if (buffer[20] !== 0x2f) return null;
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (fourCC === "VP8 ") {
    // 3-byte frame tag, then the fixed 3-byte start code 0x9d 0x01 0x2a,
    // then 14-bit width and 14-bit height, each little-endian uint16.
    if (buffer[23] !== 0x9d || buffer[24] !== 0x01 || buffer[25] !== 0x2a) return null;
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }
  return null;
}

/**
 * Reads a locally-stored public/ image's real intrinsic pixel dimensions
 * directly from the file, so callers can set explicit width/height HTML
 * attributes and let the browser reserve layout space before the asset
 * loads (TASK-008: this was the missing piece behind a measured, real CLS
 * regression on /work -- ARCHITECTURE §9 already documented explicit
 * width/height as the CLS mechanism, but Figure never actually set them).
 * Returns null on any unrecognized format or read failure; callers must
 * degrade gracefully, not throw.
 */
export function readIntrinsicDimensions(publicSrc: string): Dimensions | null {
  let buffer: Buffer;
  try {
    buffer = fs.readFileSync(path.join(process.cwd(), "public", publicSrc));
  } catch {
    return null;
  }
  if (publicSrc.endsWith(".svg")) return readSvgDimensions(buffer);
  if (publicSrc.endsWith(".webp")) return readWebpDimensions(buffer);
  return null;
}
