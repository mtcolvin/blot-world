#!/usr/bin/env node
/*
 * Add intrinsic width/height to static <img> in project pages so the browser
 * can reserve layout space (reduces CLS). Safe alongside object-fit / CSS
 * sizing — the attributes only establish the aspect ratio. Skips nav-logo
 * marks and any <img> that already has width or height. Idempotent.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { glob } = require('glob');

const ROOT = path.join(__dirname, '..');
const IMG_RE = /<img\b[^>]*\bsrc="([^"]+\.(?:jpe?g|png))"[^>]*>/gi;

async function run() {
  const files = await glob('projects/*/index.html', { cwd: ROOT, absolute: true });
  let total = 0;

  for (const file of files) {
    let html = fs.readFileSync(file, 'utf8');
    const dir = path.dirname(file);
    const matches = [...html.matchAll(IMG_RE)];
    let added = 0;

    for (const m of matches) {
      const tag = m[0], src = m[1];
      if (/\/logo\//.test(src)) continue;            // skip nav-logo marks
      if (/\b(width|height)=/i.test(tag)) continue;  // already dimensioned
      const abs = path.resolve(dir, src);
      if (!fs.existsSync(abs)) continue;
      let meta;
      try { meta = await sharp(abs).metadata(); } catch { continue; }
      if (!meta.width || !meta.height) continue;
      const newTag = tag.replace(/<img\b/i, `<img width="${meta.width}" height="${meta.height}"`);
      html = html.replace(tag, newTag);
      added++;
    }

    if (added > 0) {
      fs.writeFileSync(file, html);
      console.log(`✓ ${path.relative(ROOT, file)}: dimensioned ${added} <img>`);
      total += added;
    }
  }
  console.log(`\nAdded dimensions to ${total} images.`);
}

run().catch(e => { console.error(e); process.exit(1); });
