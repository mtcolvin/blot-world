# Photography Gallery - Quick Setup Guide

## ✅ What's Been Created

Your photography gallery is ready! Here's what was set up:

```
/projects/photography/
├── photography.html      # Main gallery page
├── photo-loader.js       # Auto-loading system
├── images/              # Put your photos here
├── README.md            # Full documentation
└── SETUP.md             # This file
```

## 🚀 Quick Start (3 Steps)

### 1. Add Your Photos
Drop your image files into the `images/` folder:
```
/projects/photography/images/
├── sunset-beach.jpg
├── city-lights.jpg
└── mountain-view.jpg
```

### 2. Update photo-loader.js
Open `photo-loader.js` and add your photos to the array (around line 10):

```javascript
const photos = [
    { file: 'sunset-beach.jpg', date: '2024-01-15' },
    { file: 'city-lights.jpg', date: '2024-02-20' },
    { file: 'mountain-view.jpg', date: '2024-03-10' },
];
```

**That's it!** The gallery will automatically:
- Sort by date (oldest first)
- Create the timeline
- Enable navigation

### 3. Add a Preview Image (Optional)
For the homepage project card, add a preview image:
```
/images/previews/photography-preview.jpg
```

Recommended size: 800x600px or similar aspect ratio

## 🎨 Features

- **Large Photo Viewer**: Main focus on selected image
- **Stacked Timeline**: Horizontal scroll with overlapping thumbnails
- **Keyboard Navigation**: Use ← → arrow keys
- **Drag to Scroll**: Click and drag the timeline
- **Auto-Centering**: Active photo centers automatically
- **Responsive**: Works on all devices

## 📝 Example Setup

```javascript
// photo-loader.js
const photos = [
    { file: 'photo-2024-01.jpg', date: '2024-01-01' },
    { file: 'photo-2024-02.jpg', date: '2024-02-15' },
    { file: 'vacation-01.jpg', date: '2024-06-20' },
    { file: 'vacation-02.jpg', date: '2024-06-21' },
    { file: 'fall-colors.jpg', date: '2024-10-15' },
];
```

## 🔗 Links

- Gallery Page: `/projects/photography/photography.html`
- Project Card: Added to homepage automatically
- Full Docs: See `README.md` in this folder

## ⚡ Tips

- Use YYYY-MM-DD format for dates
- Supports JPG, PNG, WebP, etc.
- High-res images recommended (2000px+)
- Photos sort chronologically
- Oldest photo's date shows on project card

## 🎯 Current Status

- ✅ Gallery page created
- ✅ Auto-loader system ready
- ✅ Project card added to homepage
- ⚠️ **TODO**: Add your photos to `images/` folder
- ⚠️ **TODO**: Update `photo-loader.js` with photo list
- ⚠️ **TODO**: Add `photography-preview.jpg` to `/images/previews/`

---

Need help? Check the full `README.md` for detailed documentation!
