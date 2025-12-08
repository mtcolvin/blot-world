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

## IP Protection

Before committing new photos, resize them to 1200px wide for IP protection:

```python
python -c "
from PIL import Image
import os

target_width = 1200
base_path = r'projects/photography/images'

for img_name in os.listdir(base_path):
    if img_name.lower().endswith(('.jpg', '.jpeg', '.png')):
        img_path = os.path.join(base_path, img_name)
        img = Image.open(img_path)
        if img.width > target_width:
            ratio = target_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((target_width, new_height), Image.LANCZOS)
            img.save(img_path, quality=85)
            print(f'Resized: {img_name}')
"
```

This reduces resolution to prevent high-quality reproduction while maintaining good web display quality. Right-click is also disabled on the photography page.
