# Performance Optimization

This document outlines the performance optimizations implemented for the BLOT.WORLD portfolio site.

## Summary

The site has been optimized for faster loading times, better user experience, and improved Lighthouse scores.

### Key Improvements

| Optimization | Reduction | Impact |
|-------------|-----------|--------|
| **CSS Minification** | 28% (100.86 KB → 72.92 KB) | Faster stylesheet loading |
| **JavaScript Minification** | 49% (86.19 KB → 43.74 KB) | Faster script execution |
| **Image Optimization** | 63% (46.74 MB → 17.52 MB) | Reduced bandwidth usage |
| **WebP Conversion** | 91% (46.74 MB → 4.26 MB) | Dramatically faster image loading |

**Total potential savings: ~42 MB** on initial page load!

## Optimizations Implemented

### 1. Image Optimization & WebP Conversion

- **Converted all JPG/PNG images to WebP format** (91% size reduction)
- **Optimized original images** using Sharp (63% size reduction)
- **Implemented `<picture>` elements** for graceful WebP fallback
- **Added lazy loading** to all below-the-fold images

**Largest improvements:**
- `mockup-2.png`: 15.28 MB → 845 KB (WebP)
- `mockup-1.png`: 9.61 MB → 378 KB (WebP)
- `full-body.jpg`: 4.3 MB → 1.43 MB (WebP)

### 2. CSS Minification

- **Minified all CSS files** using CSSO
- **Reduced file sizes by 28%** (28 KB saved)
- **Preserved source files** for future editing

### 3. JavaScript Minification

- **Minified all JS files** using Terser
- **Reduced file sizes by 49%** (42 KB saved)
- **Optimized main.js** from 27 KB to 15 KB

### 4. Resource Loading Optimization

- **Added `defer` attribute** to main JavaScript for non-blocking loading
- **Implemented async font loading** to prevent render blocking
- **Updated preload hints** to use WebP images
- **Used `<picture>` elements** for optimal image delivery

### 5. Lazy Loading

- **All project preview images** use native lazy loading
- **Below-the-fold content** only loads when needed
- **Reduced initial page weight** significantly

## Build Scripts

The project now includes automated build scripts for optimization:

### Available Commands

```bash
# Run all optimizations
npm run build

# Individual optimizations
npm run optimize:images  # Convert to WebP & optimize
npm run minify:css       # Minify CSS files
npm run minify:js        # Minify JavaScript files

# Development server
npm run serve           # Start local server on port 8080
```

### Build Process

1. **First-time setup:**
   ```bash
   npm install
   ```

2. **Run optimizations:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   - Deploy the entire project directory
   - Both original and optimized assets are included
   - The HTML automatically uses minified versions

## File Structure

```
blot-world/
├── scripts/
│   ├── optimize-images.js  # Image optimization script
│   ├── minify-css.js       # CSS minification script
│   └── minify-js.js        # JS minification script
├── images/
│   └── **/*.webp          # WebP versions (auto-generated)
├── css/
│   ├── *.css              # Source CSS files
│   └── *.min.css          # Minified CSS (auto-generated)
└── js/
    ├── *.js               # Source JavaScript files
    └── *.min.js           # Minified JS (auto-generated)
```

## Performance Metrics

### Expected Lighthouse Improvements

- **Performance:** +15-25 points
- **Best Practices:** Improved resource optimization
- **SEO:** Better load times = better rankings

### Key Performance Indicators

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total Page Weight | ~50 MB | ~8 MB | 84% reduction |
| CSS Size | 101 KB | 73 KB | 28% reduction |
| JS Size | 86 KB | 44 KB | 49% reduction |
| Images (WebP) | 47 MB | 4.3 MB | 91% reduction |

## Browser Support

- **WebP:** Supported by all modern browsers (95%+ coverage)
- **Fallback:** Automatic fallback to JPG/PNG for older browsers
- **Picture element:** Fully supported since 2015

## Maintenance

### When Adding New Images

1. Add the original image to the appropriate directory
2. Run `npm run optimize:images` to generate WebP and optimize
3. Update HTML to use `<picture>` elements with WebP

### When Editing CSS/JS

1. Edit the source files (`.css` or `.js`)
2. Run `npm run minify:css` or `npm run minify:js`
3. The minified versions will be regenerated automatically

### Before Deploying

Always run the full build process:

```bash
npm run build
```

This ensures all assets are optimized and up-to-date.

## Future Optimization Opportunities

- **Critical CSS extraction:** Inline critical CSS for faster first paint
- **Service Worker:** Implement offline caching
- **Resource hints:** Add more `dns-prefetch` and `preconnect` hints
- **Font subsetting:** Load only required character sets
- **Code splitting:** Break JavaScript into smaller chunks (if needed)
- **HTTP/2 Server Push:** Push critical resources proactively

## Technical Details

### Tools Used

- **Sharp:** High-performance image processing
- **Terser:** Industry-standard JavaScript minifier
- **CSSO:** Advanced CSS optimizer
- **Glob:** File pattern matching

### Compression Settings

- **JPEG Quality:** 85 (optimal quality/size balance)
- **WebP Quality:** 82 (slightly lower, imperceptible difference)
- **PNG Compression:** Level 9 (maximum compression)

### Why WebP?

- **Superior compression:** 25-35% smaller than JPEG
- **Lossless & lossy:** Supports both modes
- **Transparency:** Supports alpha channel (replaces PNG)
- **Broad support:** 95%+ browser compatibility

## Results

These optimizations deliver:

✅ **84% reduction in total page weight**
✅ **Faster load times** for users on slow connections
✅ **Better SEO rankings** due to improved performance
✅ **Improved user experience** with faster interactivity
✅ **Reduced bandwidth costs** for hosting

---

**Last updated:** November 2025
**Maintained by:** Matthew Colvin
