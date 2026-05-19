# Photography — Quick Reference

Cheat sheet for the most common task: adding a photo. Full docs in `README.md`.

## Add a photo (3 steps)

```bash
# 1. Drop file in images/
cp ~/Downloads/IMG_XXXX.jpg projects/photography/images/

# 2. Edit projects/photography/photo-data.js — add one line:
#    { file: 'IMG_XXXX.jpg', date: '2026-MM-DD', location: 'City, ST' },

# 3. Compute its color
npm run sync:photo-colors
```

Hard-refresh the page. Done.

## All the photography commands

```bash
npm run resize:photos       # Shrink raw photos to 1200px for IP protection
npm run sync:photo-colors   # Extract dominant color per photo → photo-colors.js
npm run minify:js           # Minify JS (auto-runs in `npm run build`)
npm run serve               # Local server at http://localhost:8080
npm run build               # Full prod build (includes sync:photo-colors)
```

## File map

```
projects/photography/
├── photography.html        ← The page itself
├── photo-data.js           ← Edit this when adding/removing/relocating photos
├── photo-colors.js         ← Auto-generated, don't edit by hand
├── images/                 ← Photo files live here
└── README.md               ← Full docs
```

## Date format

`YYYY-MM-DD` always — `'2026-01-18'`, never `'1/18/2026'`. The page sorts chronologically by string comparison.

## Location format

- US: `'Denver, CO'` — state code auto-expands to "Colorado" when a month has 3+ locations and the section header collapses to regions
- International: `'Naples, Italy'` — works as-is
- Unknown: `''` — caption hides the location line

## Troubleshooting

| Symptom | Fix |
|---|---|
| New photo doesn't appear | Did you add it to `photo-data.js`? Then hard-refresh. |
| No color halo on a new month | Run `npm run sync:photo-colors` |
| `BLOT_PHOTO_COLORS is undefined` error | `photo-colors.js` is missing — run `npm run sync:photo-colors` |
| Cross-Origin Request Blocked in console for `.png` | Mobile-only logo mask issue when opening via `file://`. Harmless on desktop. |
