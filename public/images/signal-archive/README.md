# Temporary signal archive photography

These 216 photographs are decorative placeholder imagery for the signal corridor.
They do **not** depict Hakan Duyar's projects, clients, deliverables, or evidence.
They should be replaced with approved project media when available.

## Sources and license

- Retrieved on 2026-11-04 from [Lorem Picsum](https://picsum.photos/), which identifies its image source as Unsplash.
- Each photograph has its original Unsplash page, photographer, fixed Picsum download URL, local filename, SHA-256 checksum, and byte size in `provenance.json`.
- The [Unsplash License](https://unsplash.com/license) permits free downloading, modification, distribution, and commercial/noncommercial use. Attribution is appreciated; it is retained here for every photograph. The photos are not offered for sale or as a competing image library.
- The collection was visually screened from 400 small preview images for architecture, infrastructure, landscape, and technology. Portraits and people-centered lifestyle scenes were excluded. Some environmental scenes contain incidental distant people.
- No stock photo is labeled as original portfolio work. There are no credentials, paid services, runtime hotlinks, or image-generation claims.

## Files and optimization

Each selected source has one local 320 × 200 WebP thumbnail, recompressed at quality 67.
Selection uses 216 distinct source image IDs; different crops of one source are not counted as different images.
The 216 files total **1,760,956 bytes** (about 1.68 MiB); the largest file is 21,350 bytes.

The typed application registry is `lib/spatial/archiveFrames.ts`, exporting `archiveFrames`.
`provenance.json` is the full attribution record; the registry retains photographer/source/license metadata too.

## Verification

`node public/images/signal-archive/verify-assets.cjs` verifies count, unique source URLs,
unique source IDs, unique encoded and decoded pixel hashes, checksums, byte sizes,
successful full WebP decoding, and 320 × 200 dimensions. It uses the Sharp dependency
already installed transitively by Next.js; no extra package is required.
