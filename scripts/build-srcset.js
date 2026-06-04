#!/usr/bin/env node
/*
 * Generate responsive width variants (AVIF + WebP) for the surfaces that render
 * with srcset: the photography gallery and the homepage card previews. Photos
 * are full-camera-res (~4032px) shown in small frames; serving sized renditions
 * cuts mobile data dramatically. The full-size .avif/.webp (from optimize:images)
 * stays as the lightbox/large source.
 *
 * Naming: <base>-<width>.<ext>  e.g. IMG_2780-960.avif, preview-480.webp
 * Never upscales (skips a width when the source is already narrower).
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { glob } = require('glob');
const { isSkipped } = require('./lib/skip-list');

const ROOT = path.join(__dirname, '..');
const AVIF_Q = 60;
const WEBP_Q = 80;

// Gallery photos need a large rendition (lightbox-ish); card previews are tiny.
const TARGETS = [
  { glob: 'projects/photography/images/*.{jpg,jpeg,JPG,png}', widths: [480, 960, 1600] },
  { glob: 'projects/*/preview.{jpg,png}', widths: [480, 960] },
  // Homepage-only card image (blot-world card) lives outside projects/.
  { glob: 'images/previews/*.{jpg,png}', widths: [480, 960] },
];

async function variant(src, width) {
  const ext = path.extname(src);
  const base = src.slice(0, -ext.length);
  let made = 0;
  for (const [fmt, opts] of [['avif', { quality: AVIF_Q, effort: 5 }], ['webp', { quality: WEBP_Q }]]) {
    const out = `${base}-${width}.${fmt}`;
    if (fs.existsSync(out)) continue;
    // Cap at the source width (withoutEnlargement) so the variant always exists
    // even for images narrower than this width — the srcset never 404s.
    await sharp(src).resize({ width, withoutEnlargement: true })[fmt](opts).toFile(out);
    made++;
  }
  return made;
}

async function run() {
  let total = 0, files = 0;
  for (const t of TARGETS) {
    for (const src of glob.sync(t.glob, { cwd: ROOT, absolute: true })) {
      if (isSkipped(src)) continue; // opted out — serve pristine original
      let made = 0;
      for (const w of t.widths) made += await variant(src, w);
      if (made) { files++; total += made; }
    }
  }
  console.log(`✓ build-srcset: generated ${total} variants across ${files} images`);
}

run().catch(e => { console.error(e); process.exit(1); });
