# Photography Gallery

A visual timeline showcase for your photography with smooth scrolling and stacked thumbnail navigation.

## How to Add Photos

### Step 1: Add Image Files
Place your photo files in the `images/` folder:
```
projects/photography/images/
  ├── photo-1.jpg
  ├── photo-2.jpg
  └── photo-3.jpg
```

**Important:**
- Photos MUST have EXIF metadata (Date Taken, GPS) for dates and locations to display
- Avoid spaces or parentheses in filenames (use underscores instead)

### Step 2: Resize for IP Protection
Resize photos to 1200px wide to prevent high-quality reproduction:

```bash
npm run resize:photos
```

This preserves EXIF metadata while reducing resolution.

### Step 3: Sync the Photo Array
Auto-generate the photos array from EXIF metadata:

```bash
npm run sync:photo-array
```

### Step 4: Minify JavaScript
```bash
npm run minify:js
```

### Step 5: Test and Commit
Hard refresh your browser (Ctrl+Shift+R) to see changes, then commit.

## Features

- **Main Photo Viewer**: Large, centered photo display
- **Timeline**: Horizontal scrollable timeline with stacked thumbnails
- **Date Display**: Shows the date from EXIF metadata
- **Location Display**: Shows location from GPS coordinates (reverse geocoded)
- **Keyboard Navigation**: Use arrow keys to navigate
- **Drag to Scroll**: Click and drag the timeline to browse
- **Auto-Centering**: Active photo centers in the timeline
- **Responsive**: Works on mobile and desktop
- **IP Protection**: Right-click disabled, images resized to 1200px

## Tips

- Photos are sorted chronologically by EXIF date
- The oldest photo's date will appear on the project card on the homepage
- If a photo shows wrong date, check its EXIF "Date Taken" metadata
- If location doesn't show, verify the photo has GPS coordinates in EXIF
