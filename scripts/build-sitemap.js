#!/usr/bin/env node
/*
 * Generate sitemap.xml + robots.txt from data/projects.json (single source of
 * truth). Run as part of `npm run build`. URLs: the homepage plus every project
 * that has its own page (page: true) at /projects/<slug>/.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ORIGIN = 'https://blot.world';

const MONTHS = {
  january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
};

function lastmod(p) {
  const m = MONTHS[String(p.month || '').toLowerCase()];
  if (p.year && m) return `${p.year}-${m}-01`;
  return null;
}

function urlEntry(loc, mod, priority) {
  return `  <url>\n    <loc>${loc}</loc>\n`
    + (mod ? `    <lastmod>${mod}</lastmod>\n` : '')
    + `    <priority>${priority}</priority>\n  </url>`;
}

function main() {
  const data = require(path.join(ROOT, 'data', 'projects.json'));
  const projects = Array.isArray(data) ? data : data.projects || [];

  const urls = [urlEntry(`${ORIGIN}/`, null, '1.0')];
  for (const p of projects) {
    if (!p.page || !p.slug) continue; // skip homepage-only cards (e.g. blot-world)
    urls.push(urlEntry(`${ORIGIN}/projects/${p.slug}/`, lastmod(p), '0.8'));
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`
    + `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
    + urls.join('\n') + '\n</urlset>\n';
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);

  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`;
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots);

  console.log(`✓ sitemap.xml (${urls.length} URLs)`);
  console.log(`✓ robots.txt`);
}

main();
