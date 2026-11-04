/* Run from the repository root. No network requests or filesystem changes. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const packageRoot = path.join(process.cwd(), 'node_modules/.pnpm');
const sharpPackage = fs.readdirSync(packageRoot).find((name) => name.startsWith('sharp@'));
assert(sharpPackage, 'Next.js Sharp dependency must be installed');
const sharp = require(path.join(packageRoot, sharpPackage, 'node_modules/sharp'));
const root = __dirname;
const { images } = JSON.parse(fs.readFileSync(path.join(root, 'provenance.json'), 'utf8'));
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

(async () => {
  assert.equal(images.length, 216);
  const encoded = new Set();
  const pixels = new Set();
  let totalBytes = 0;
  assert.equal(new Set(images.map((image) => image.id)).size, images.length);
  assert.equal(new Set(images.map((image) => image.sourceUrl)).size, images.length);
  assert.equal(fs.readdirSync(root).filter((name) => name.endsWith('.webp')).length, images.length);
  for (const image of images) {
    const file = fs.readFileSync(path.join(root, path.basename(image.src)));
    assert.equal(hash(file), image.sha256);
    assert.equal(file.length, image.bytes);
    const decoded = await sharp(file).raw().toBuffer({ resolveWithObject: true });
    assert.equal(decoded.info.width, 320);
    assert.equal(decoded.info.height, 200);
    encoded.add(hash(file));
    pixels.add(hash(decoded.data));
    totalBytes += file.length;
  }
  assert.equal(encoded.size, images.length);
  assert.equal(pixels.size, images.length);
  assert(totalBytes < 5_000_000);
  console.log(JSON.stringify({ count: images.length, encodedUnique: encoded.size, decodedUnique: pixels.size, totalBytes, dimensions: '320x200', result: 'PASS' }));
})().catch((error) => { console.error(error); process.exitCode = 1; });
