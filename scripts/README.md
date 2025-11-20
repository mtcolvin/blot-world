# Scripts Documentation

## Photo Management

### Adding New Photos to the Gallery

When you add new photos to `projects/photography/images/`, follow these steps:

```bash
# 1. Sync photos array (auto-generates entries with dates from EXIF metadata)
npm run sync:photo-array

# 2. Minify the updated JavaScript
npm run minify:js

# 3. Restart your local server and hard refresh browser (Ctrl+Shift+R)
```

The `sync:photo-array` script will:
- Scan all JPG files in the images folder
- Extract capture dates from EXIF metadata (DateTimeOriginal or CreateDate)
- Check for corresponding HEIC files (which preserve original metadata)
- Generate the photos array in `photo-loader.js` automatically
- Sort photos by date (oldest first)

### Adding EXIF Metadata to Photos

If you need to manually add metadata to a photo (like the vlcsnap example):

```bash
npm run update:photo-metadata
```

Edit `scripts/add-vlcsnap-metadata.js` first to specify the image path and metadata.

## Build Commands

### Full Build

```bash
npm run build
```

This runs:
1. `optimize:images` - Optimizes and converts images to WebP
2. `minify:css` - Minifies CSS files
3. `minify:js` - Minifies JavaScript files

### Individual Build Steps

```bash
# Optimize images only
npm run optimize:images

# Minify CSS only
npm run minify:css

# Minify JavaScript only
npm run minify:js
```

## Development Server

```bash
npm run serve
```

Starts a Python HTTP server on port 8080.

## Notes

- Always run `sync:photo-array` after adding new photos
- The script reads dates from EXIF metadata, falling back to file modification time if unavailable
- Minified files are gitignored - they're regenerated during build
- Hard refresh your browser (Ctrl+Shift+R) after regenerating minified files
