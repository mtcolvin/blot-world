#!/usr/bin/env node
/*
 * Content-hash cache busting. Rewrites every local CSS/JS reference in the site
 * HTML to `?v=<hash>` where <hash> is derived from the referenced file's current
 * contents. Returning visitors fetch a fresh file whenever (and only when) it
 * actually changed — no more manual ?v bumps or stale-cache 404s.
 *
 * Run LAST in the build (after minify), so the hashes reflect final output.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { glob } = require('glob');

const ROOT = path.join(__dirname, '..');
// href="..."/src="..." for local .css/.js (skip absolute URLs and protocol-relative).
const REF_RE = /(href|src)="(?!https?:|\/\/)([^"?]+\.(?:css|js))(?:\?v=[^"]*)?"/gi;

function hashFile(abs) {
  const buf = fs.readFileSync(abs);
  return crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
}

async function run() {
  const files = await glob(['index.html', 'projects/*/index.html'], { cwd: ROOT, absolute: true });
  let totalRefs = 0;

  for (const file of files) {
    let html = fs.readFileSync(file, 'utf8');
    const dir = path.dirname(file);
    let n = 0;

    html = html.replace(REF_RE, (full, attr, ref) => {
      const abs = path.resolve(dir, ref);
      if (!fs.existsSync(abs)) return full; // leave unresolved refs untouched
      n++;
      return `${attr}="${ref}?v=${hashFile(abs)}"`;
    });

    if (n > 0) {
      fs.writeFileSync(file, html);
      totalRefs += n;
    }
    console.log(`  ${path.relative(ROOT, file)}: ${n} refs versioned`);
  }
  console.log(`✓ cache-bust: ${totalRefs} CSS/JS references hashed`);
}

run().catch(e => { console.error(e); process.exit(1); });
