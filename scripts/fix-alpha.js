#!/usr/bin/env node
/*
 * One-off corrective: some AVIF/WebP (inherited from an earlier optimization
 * pass) were flattened — they lost the alpha channel of their transparent PNG
 * source, so logos rendered on a solid background once served via <picture>.
 * Regenerate every AVIF/WebP whose source PNG has alpha but the derived file
 * does not, preserving transparency. Handles full-size and -<width> variants.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { glob } = require('glob');

const ROOT = path.join(__dirname, '..');

async function run() {
  const files = glob.sync(['images/**/*.{avif,webp}', 'projects/**/*.{avif,webp}'], { cwd: ROOT, absolute: true });
  let fixed = 0;

  for (const f of files) {
    const ext = path.extname(f);            // .avif / .webp
    const stem = f.slice(0, -ext.length);   // .../icon-full-color  OR .../preview-480
    const m = stem.match(/^(.*)-(\d+)$/);   // detect -<width> variant
    const srcBase = m ? m[1] : stem;
    const width = m ? parseInt(m[2], 10) : null;
    const srcPng = srcBase + '.png';
    if (!fs.existsSync(srcPng)) continue;   // only PNG sources can carry alpha

    const [srcMeta, outMeta] = await Promise.all([
      sharp(srcPng).metadata(), sharp(f).metadata().catch(() => ({})),
    ]);
    if (!srcMeta.hasAlpha || outMeta.hasAlpha) continue; // source opaque, or already has alpha

    // Encode to a buffer, then overwrite in place (avoids same-file read/write
    // and Windows/OneDrive rename locks). Source is the PNG, not the target.
    let pipe = sharp(srcPng);
    if (width) pipe = pipe.resize({ width, withoutEnlargement: true });
    if (ext === '.avif') pipe = pipe.avif({ quality: 65, effort: 5 });
    else pipe = pipe.webp({ quality: 82 });
    const buf = await pipe.toBuffer();
    // OneDrive can transiently lock files mid-sync; retry a few times.
    let written = false;
    for (let attempt = 0; attempt < 5 && !written; attempt++) {
      try { fs.writeFileSync(f, buf); written = true; }
      catch (e) {
        if (attempt === 4) { console.warn(`⚠ skip (locked): ${path.relative(ROOT, f)}`); break; }
        await new Promise(r => setTimeout(r, 500));
      }
    }
    if (written) { console.log(`✓ ${path.relative(ROOT, f)} (alpha restored)`); fixed++; }
  }
  console.log(`\nRestored alpha on ${fixed} file(s).`);
}

run().catch(e => { console.error(e); process.exit(1); });
