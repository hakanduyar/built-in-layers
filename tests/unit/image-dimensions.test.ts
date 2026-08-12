import { describe, expect, it } from "vitest";
import { readIntrinsicDimensions } from "@/lib/utils/imageDimensions";

// TASK-008 (2026-08-12): a real CLS regression (0.068, measured on /work)
// traced to Figure's <img> never carrying explicit width/height. This
// verifies the binary/XML dimension reader against every real registered
// project asset's true pixel size (cross-checked independently via Python
// Pillow before these expected values were written), not just that it
// returns *something* -- a wrong-but-present width/height would silently
// reintroduce the same CLS bug with false confidence.
describe("readIntrinsicDimensions — real project assets", () => {
  it("reads SVG width/height from the root <svg> element", () => {
    expect(readIntrinsicDimensions("/images/projects/kivilcim/product-areas-map.svg")).toEqual({
      width: 1600,
      height: 1000,
    });
  });

  it("reads lossy (simple VP8) WebP dimensions from the bitstream header", () => {
    // DropSpot's browse-drops.webp was resized/re-encoded lossy this pass
    // (338KB lossless -> 75KB, Hakan-approved, see docs/PROGRESS.md).
    expect(readIntrinsicDimensions("/images/projects/dropspot/browse-drops.webp")).toEqual({
      width: 1400,
      height: 637,
    });
  });

  it("returns null for a path that does not exist on disk", () => {
    expect(readIntrinsicDimensions("/images/projects/does-not-exist.svg")).toBeNull();
  });

  it("returns null for an unrecognized extension", () => {
    expect(readIntrinsicDimensions("/images/projects/kivilcim/product-areas-map.txt")).toBeNull();
  });
});
