#!/usr/bin/env node
/*
 * Codemod for static <img src="*.jpg|png"> in project pages:
 *   - WRAP in <picture> (AVIF → WebP → original) when both siblings exist.
 *   - UNWRAP (back to a plain <img>) any image opted out via data/no-optimize.json,
 *     so flat brand graphics serve their pristine original.
 * Skips nav-logo marks. Idempotent.
 */
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const { isSkipped } = require('./lib/skip-list');

const ROOT = path.join(__dirname, '..');
const IMG_RE = /<img\b[^>]*\bsrc="([^"]+\.(?:jpe?g|png))"[^>]*>/gi;
// A <picture> previously emitted by this script: optional <source>s then one <img>.
const PIC_RE = /<picture>(?:\s*<source\b[^>]*>)*\s*(<img\b[^>]*\bsrc="([^"]+\.(?:jpe?g|png))"[^>]*>)\s*<\/picture>/gi;

function relSrc(dir, src) {
  return path.relative(ROOT, path.resolve(dir, src)).split(path.sep).join('/');
}

async function run() {
  const files = await glob('projects/*/index.html', { cwd: ROOT, absolute: true });
  let wrapped = 0, unwrapped = 0;

  for (const file of files) {
    let html = fs.readFileSync(file, 'utf8');
    const dir = path.dirname(file);
    let w = 0, u = 0;

    // 1) Unwrap opted-out images (revert <picture> → <img>).
    html = html.replace(PIC_RE, (full, imgTag, src) => {
      if (src.includes('${') || !isSkipped(relSrc(dir, src))) return full;
      u++;
      return imgTag;
    });

    // 2) Wrap eligible images not opted out.
    html = html.replace(IMG_RE, (tag, src, offset, str) => {
      if (/\/logo\//.test(src)) return tag;
      if (isSkipped(relSrc(dir, src))) return tag;
      if (str.slice(Math.max(0, offset - 200), offset).includes('<picture')) return tag;
      const avifSrc = src.replace(/\.(jpe?g|png)$/i, '.avif');
      const webpSrc = src.replace(/\.(jpe?g|png)$/i, '.webp');
      if (!fs.existsSync(path.resolve(dir, avifSrc)) || !fs.existsSync(path.resolve(dir, webpSrc))) return tag;
      w++;
      return `<picture><source srcset="${avifSrc}" type="image/avif">`
        + `<source srcset="${webpSrc}" type="image/webp">${tag}</picture>`;
    });

    if (w || u) {
      fs.writeFileSync(file, html);
      console.log(`✓ ${path.relative(ROOT, file)}: wrapped ${w}, unwrapped ${u}`);
      wrapped += w; unwrapped += u;
    }
  }
  console.log(`\nWrapped ${wrapped}, unwrapped ${unwrapped}.`);
}

run().catch(e => { console.error(e); process.exit(1); });
