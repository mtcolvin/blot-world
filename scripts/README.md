# Scripts Documentation

## Photo Management

### Adding New Photos to the Gallery

When you add new photos to `projects/photography/images/`, follow these steps:

```bash
# 1. Resize photos to 1200px for IP protection (preserves EXIF metadata)
npm run resize:photos

# 2. Sync photos array (auto-generates entries with dates from EXIF metadata)
npm run sync:photo-array

# 3. Minify the updated JavaScript
npm run minify:js

# 4. Restart your local server and hard refresh browser (Ctrl+Shift+R)
