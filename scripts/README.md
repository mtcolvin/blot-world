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
