#!/usr/bin/env node
/*
 * Build guard: every image the site serves via <picture> must have its AVIF and
 * WebP siblings on disk — a <source> pointing at a missing file renders broken
 * with no fallback. Checks both static <source> tags and the JS-rendered paths
 * (homepage cards from projects-data.js, gallery photos from photo-data.js).
 * Exits non-zero on any miss so `npm run build` fails loudly.
 */
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const ROOT = path.join(__dirname, '..');
const missing = [];

// 1) Static <source srcset="..."> in every page
for (const file of glob.sync(['index.html', 'projects/*/index.html'], { cwd: ROOT, absolute: true })) {
  const html = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);
  for (const m of html.matchAll(/<source\s+srcset="([^"]+)"/gi)) {
    if (m[1].includes('${') || m[1] === '') continue; // skip JS template literals / dynamic
    const abs = path.resolve(dir, m[1]);
    if (!fs.existsSync(abs)) missing.push(`${path.relative(ROOT, file)} → ${m[1]}`);
  }
}

// 2) JS-rendered: card previews (projects-data.js) + gallery photos (photo-data.js)
const pd = fs.readFileSync(path.join(ROOT, 'js', 'projects-data.js'), 'utf8');
const previews = [...pd.matchAll(/"image":\s*"([^"]+\.(?:jpe?g|png))"/g)]
  .map(m => m[1]).filter(s => s.startsWith('projects/'));

global.window = {};
require(path.join(ROOT, 'projects', 'photography', 'photo-data.js'));
const photos = (global.window.BLOT_PHOTOS || []).map(p => 'projects/photography/images/' + p.file);

for (const rel of [...new Set([...previews, ...photos])]) {
  for (const ext of ['avif', 'webp']) {
    const sib = rel.replace(/\.(jpe?g|png)$/i, '.' + ext);
    if (!fs.existsSync(path.join(ROOT, sib))) missing.push(`JS-rendered → ${sib}`);
  }
}

if (missing.length) {
  console.error(`✗ check-picture-sources: ${missing.length} missing <picture> source(s):`);
  missing.forEach(m => console.error('   ' + m));
  process.exit(1);
}
console.log('✓ check-picture-sources: all <picture> sources exist');
