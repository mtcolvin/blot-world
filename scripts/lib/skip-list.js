/*
 * Shared "do not optimize" matcher, driven by data/no-optimize.json. Images that
 * match a `skip` glob (and not a `keep` glob) are served as their pristine
 * original — no AVIF/WebP, no recompression, no <picture> wrapping. Intended for
 * flat brand graphics where lossy AVIF causes visible banding/color shift.
 *
 * Usage:
 *   const { isSkipped } = require('./lib/skip-list');
 *   if (isSkipped(absOrRelPath)) continue;
 */
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const ROOT = path.join(__dirname, '..', '..');

function expand(patterns) {
  const set = new Set();
  for (const p of patterns || [])
    for (const f of glob.sync(p, { cwd: ROOT, nodir: true })) set.add(f.split(path.sep).join('/'));
  return set;
}

let cache = null;
function load() {
  if (cache) return cache;
  const cfgPath = path.join(ROOT, 'data', 'no-optimize.json');
  if (!fs.existsSync(cfgPath)) return (cache = { skip: new Set(), keep: new Set() });
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  return (cache = { skip: expand(cfg.skip), keep: expand(cfg.keep) });
}

// Normalize any absolute/relative, back/forward-slash path to a repo-root-relative
// POSIX path so it can be compared against the glob-expanded sets.
function toRel(p) {
  const abs = path.isAbsolute(p) ? p : path.join(ROOT, p);
  return path.relative(ROOT, abs).split(path.sep).join('/');
}

function isSkipped(p) {
  const { skip, keep } = load();
  const rel = toRel(p);
  return skip.has(rel) && !keep.has(rel);
}

module.exports = { isSkipped };
