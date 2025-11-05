# Photography Images Folder

## 📸 Add Your Photos Here

Drop your image files into this folder, then update the `photo-loader.js` file in the parent directory.

### Example Structure
```
images/
├── photo-2024-01.jpg
├── photo-2024-02.jpg
├── vacation-beach.jpg
└── sunset-view.jpg
```

### Supported Formats
- JPG/JPEG
- PNG
- WebP
- Any browser-supported image format

**Note**: Convert HEIC files to JPG before adding them to this folder.

### Recommended Specs
- **Resolution**: 2000px+ on longest side
- **Aspect Ratio**: Any (gallery adapts)
- **File Size**: Optimize for web (< 2MB recommended)

### Remember!
After adding images here, update `../photo-loader.js` with:
```javascript
const photos = [
    { file: 'photo-2024-01.jpg', date: '2024-01-15' },
    { file: 'photo-2024-02.jpg', date: '2024-02-20' },
];
```

The gallery will auto-load and display them!
