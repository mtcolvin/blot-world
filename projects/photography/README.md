# Photography Gallery

A magazine-style chronological archive of photos, grouped by month into viewport-snapped sections with horizontal filmstrips and per-month color halos derived from each month's photos.

## How It's Built

The gallery is data-driven from two files:

| File | Maintained by | Purpose |
|---|---|---|
| `photo-data.js` | **You (by hand)** | Source of truth: filename, date, location per photo |
| `photo-colors.js` | **Build script** | Pre-computed dominant color per photo |

The page (`photography.html`) reads both at load time, groups photos by year/month, renders sections, and aggregates per-month mood color from the per-photo hex values.

## Adding a New Photo

### 1. Drop the file in `images/`

```
projects/photography/images/
  └── IMG_XXXX_result.jpg
```

**Filename tips:**
- Avoid spaces, parentheses — use underscores
- JPG / PNG / WebP are all fine
- High-res is fine but `npm run resize:photos` will shrink to 1200px for IP protection

### 2. Add an entry to `photo-data.js`

```javascript
window.BLOT_PHOTOS = [
    // ...
    { file: 'IMG_XXXX_result.jpg', date: '2026-MM-DD', location: 'City, ST' },
];
```

- **`date`** — YYYY-MM-DD format. Doesn't need to be from EXIF; manually curated is fine.
- **`location`** — free-form string. Use `'City, ST'` for US (state codes auto-expand to full names in multi-region collapse) or `'City, Country'` for international. Leave `''` if unknown.
- **Order doesn't matter** — photos sort chronologically at render time.

### 3. Compute the dominant color

```bash
npm run sync:photo-colors
```

This reads `photo-data.js`, runs each photo through a hue-histogram dominant-color extractor (using sharp), and writes hex values to `photo-colors.js`.

### 4. Refresh the page

Hard-refresh (Ctrl+Shift+R / Cmd+Shift+R) to pick up the new data + color.

For production: `npm run build` runs the color sync + minification in one shot.

## Why a Pre-compute Step?

The gallery is designed to work via `file://` (open `photography.html` directly in a browser, no server needed). Browsers treat `file://` resources as cross-origin, which blocks the in-browser canvas pixel reads we'd need to extract colors at runtime. So we extract at build time with Node + sharp instead.

Per-month color aggregation (voting per-photo colors into hue bins, picking the dominant family, boosting saturation) still happens in the browser at page load — it just operates on the pre-computed hex values rather than canvas pixel data.

## Location Display Rules

When rendering each month's section header:

| Unique locations | Shown as |
|---|---|
| 1 | `"Naples, FL"` |
| 2 | `"Florida Keys · Miami, FL"` |
| 3+ | Collapsed to unique parent regions — e.g., 11 Italian cities → `"Italy"`, mixed cities → `"Colorado · Utah"` |

US state codes (`CO`, `UT`, `FL`, etc.) auto-expand to full names when collapsing. The state lookup table is at the top of the inline script in `photography.html` — extend it there for new states or non-US regions.

## Removing a Photo

1. Remove the entry from `photo-data.js`
2. Delete the file from `images/` (optional — keeps disk clean)
3. Re-run `npm run sync:photo-colors` (so `photo-colors.js` doesn't have a stale entry)

## Features

- **Magazine layout** — each month is its own viewport-snapped section
- **Horizontal filmstrip** — uniform-height photos with scroll snap and a custom progress bar
- **Sticky spine nav** — left-side index of year/month, click to jump
- **Per-month color halo** — dominant color of the month's photos, rendered as a soft gradient in the top-left
- **Lightbox** — click any photo, navigate with arrows / keyboard, close with Esc
- **Full-image display** — no cropping; aspect ratios preserved everywhere
- **Mobile responsive** — spine hides, layout reflows to a single column

## Legacy Files

`photo-loader.js`, `photo-loader.min.js`, and `npm run sync:photo-array` are leftovers from the previous EXIF-driven gallery. They are **not loaded by the current page**. Safe to delete if you want to clean up.
