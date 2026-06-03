#!/usr/bin/env node
/*
 * One-off codemod: wrap static <img src="*.jpg|png"> in project pages with a
 * <picture> serving AVIF → WebP → original. Only wraps an <img> when BOTH the
 * .avif and .webp siblings exist on disk (a <picture> <source> pointing at a
 * missing file renders broken — there is no automatic fallback), and skips
 * nav-logo marks and anything already inside a <picture>.
 *
 * Idempotent: re-running makes no further changes once everything is wrapped.
 */
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const ROOT = path.join(__dirname, '..');
const IMG_RE = /<img\b[^>]*\bsrc="([^"]+\.(?:jpe?g|png))"[^>]*>/gi;

async function run() {
  const files = await glob('projects/*/index.html', { cwd: ROOT, absolute: true });
  let totalWrapped = 0;

  for (const file of files) {
    let html = fs.readFileSync(file, 'utf8');
    const dir = path.dirname(file);
    let wrapped = 0;

    html = html.replace(IMG_RE, (tag, src, offset, full) => {
      // Skip nav-logo marks and already-wrapped imgs.
      if (/\/logo\//.test(src)) return tag;
      if (full.slice(Math.max(0, offset - 200), offset).includes('<picture')) return tag;

      const avifSrc = src.replace(/\.(jpe?g|png)$/i, '.avif');
      const webpSrc = src.replace(/\.(jpe?g|png)$/i, '.webp');
      const avifAbs = path.resolve(dir, avifSrc);
      const webpAbs = path.resolve(dir, webpSrc);
      if (!fs.existsSync(avifAbs) || !fs.existsSync(webpAbs)) return tag;

      wrapped++;
      return `<picture>`
        + `<source srcset="${avifSrc}" type="image/avif">`
        + `<source srcset="${webpSrc}" type="image/webp">`
        + tag
        + `</picture>`;
    });

    if (wrapped > 0) {
      fs.writeFileSync(file, html);
      console.log(`✓ ${path.relative(ROOT, file)}: wrapped ${wrapped} <img>`);
      totalWrapped += wrapped;
    } else {
      console.log(`· ${path.relative(ROOT, file)}: nothing to wrap`);
    }
  }
  console.log(`\nWrapped ${totalWrapped} images total.`);
}

run().catch(e => { console.error(e); process.exit(1); });
