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

### Step 2: Update photo-loader.js
Open `photo-loader.js` and add your photos to the `photos` array:

```javascript
const photos = [
    { file: 'photo-1.jpg', date: '2024-01-15' },
    { file: 'photo-2.jpg', date: '2024-02-20' },
    { file: 'photo-3.jpg', date: '2024-03-10' },
];
```

**Date Format:** Use `YYYY-MM-DD` format for dates
**File Format:** Supports JPG, PNG, WebP, etc.

### Step 3: That's It!
The gallery will automatically:
- Sort photos by date (oldest first in timeline)
- Create thumbnail stacks
- Enable smooth scrolling navigation
- Display photo dates
- Support keyboard navigation (arrow keys)

## Features

- **Main Photo Viewer**: Large, centered photo display
- **Timeline**: Horizontal scrollable timeline with stacked thumbnails
- **Date Display**: Shows the date of the currently selected photo
- **Keyboard Navigation**: Use arrow keys to navigate
- **Drag to Scroll**: Click and drag the timeline to browse
- **Auto-Centering**: Active photo centers in the timeline
- **Responsive**: Works on mobile and desktop

## Tips

- Use high-quality images for best results
- Photos are sorted chronologically by date
- The oldest photo's date will appear on the project card on the homepage
- Recommended image sizes: 2000px+ on longest side for main viewer
