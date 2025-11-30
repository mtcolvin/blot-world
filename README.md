# BLOT.WORLD Portfolio

A modern, single-page portfolio website showcasing web design, branding, photography, poetry, and blog content. Built with vanilla JavaScript, semantic HTML, and optimized CSS.

**Live Site:** [BLOT.WORLD](https://blot.world)
**Author:** Matthew Colvin
**Contact:** mtcolvin99@gmail.com

---

## 📁 Project Structure

```
blot-world/
├── index.html                    # Main single-page app
├── css/
│   ├── root.css                  # CSS variables & theming
│   ├── main.css                  # Primary styles
│   ├── about-section.css         # About page styles
│   ├── minimal-nav.css           # Navigation component
│   └── *.min.css                 # Minified versions
├── js/
│   ├── main.js                   # Core application logic
│   ├── blog-loader.js            # Blog system (legacy)
│   └── *.min.js                  # Minified versions
├── blog/
│   ├── posts/                    # Markdown blog posts
│   ├── images/                   # Blog post images
│   └── css/                      # Blog-specific styles
├── projects/
│   ├── photography/              # Photography gallery
│   └── poetry/                   # Poetry showcase
├── images/                       # All site images
├── scripts/                      # Build & automation scripts
└── docs/                         # Documentation

```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Build everything
npm run build

# Start local server
npm run serve
```

Visit `http://localhost:8080`

---

## 📝 Content Management

### Adding Blog Posts

Blog posts are written in Markdown with YAML frontmatter and converted to HTML at build time.

**Step 1:** Create a new `.md` file in `blog/posts/`

```markdown
---
title: "Your Post Title"
date: "February 1, 2025"
category: "Tutorial"
excerpt: "Brief description for preview cards"
image: "blog/images/your-image.png"
tags:
  - JavaScript
  - Web Development
  - Tutorial
---

## Your Content

Write your blog post content here in Markdown...
```

**Step 2:** Add post image to `blog/images/`
- Recommended size: 1200x630px
- Name it to match your post (e.g., `your-post-title.png`)

**Step 3:** Build

```bash
npm run build:blog
```

The build script automatically:
- Reads all `.md` files from `blog/posts/`
- Parses frontmatter metadata
- Converts Markdown to HTML
- Injects post sections into `index.html`
- Generates post IDs from filenames

**Supported Markdown:**
- Headers: `## H2`, `### H3`
- **Bold**: `**text**`
- *Italic*: `*text*`
- `Code`: `` `inline` `` or ` ```block``` `
- Lists: `- item` or `1. item`
- Links: `[text](url)`
- Images: `![alt](url)`

**Categories:** Case Study, Tutorial, Thoughts, Review
**Tags:** Use 5-14 tags per post for best organization

---

### Adding Photography

The photography gallery auto-syncs from EXIF metadata.

**Step 1:** Add images to `projects/photography/images/`

**Step 2:** Sync photo array

```bash
npm run sync:photo-array
```

This extracts dates from EXIF metadata and auto-generates entries.

**Step 3:** Build

```bash
npm run minify:js
```

**Features:**
- Timeline view with stacked thumbnails
- Date extraction from EXIF
- Keyboard navigation (arrow keys)
- Drag to scroll timeline
- Responsive layout

---

### Adding Projects

Projects are added directly to `index.html` in the projects grid section.

**Template:**

```html
<div class="project-card"
     data-area="Web Design"
     data-tech="HTML,CSS,JavaScript"
     data-name="Project Name">
    <div class="project-image-wrapper">
        <img src="images/projects/your-project.png"
             alt="Project Name"
             loading="lazy">
    </div>
    <div class="project-card-content">
        <h3 class="project-title">Project Name</h3>
        <p class="project-description">Brief description...</p>
        <div class="project-tags">
            <span class="tag">HTML</span>
            <span class="tag">CSS</span>
        </div>
    </div>
</div>
```

**Important:**
- `data-area`: Category (Web Design, Branding, Photography, etc.)
- `data-tech`: Technologies used (comma-separated)
- `data-name`: Project name for search
- Filters auto-generate from these attributes

---

## 🛠️ Build System

### Available Commands

```bash
# Build blog posts from Markdown
npm run build:blog

# Optimize images
npm run optimize:images

# Minify CSS
npm run minify:css

# Minify JavaScript
npm run minify:js

# Full build (runs all of the above)
npm run build

# Start local development server
npm run serve

# Photo management
npm run sync:photo-array
npm run update:photo-metadata
```

### Build Process

The `npm run build` command runs:

1. **`build:blog`** - Converts Markdown → HTML
2. **`optimize:images`** - Compresses images
3. **`minify:css`** - Minifies CSS (30% reduction)
4. **`minify:js`** - Minifies JavaScript (54% reduction)

**Before Deployment:** Always run `npm run build`

---

## 🎨 Design System

### Colors

```css
--blot-black: #0a0a0a;
--blot-dark-gray: #111111;
--blot-gray: #1a1a1a;
--blot-light-gray: #cccccc;
--blot-white: #ffffff;

--primary-blue: #0D28F2;
--accent-red: #E60F0F;
--gradient-purple: #8B5CF6;
--gradient-blue: #3B82F6;
```

### Typography

- **Font:** Roboto Flex (Variable font)
- **Headings:** Bold, condensed variations
- **Body:** Regular weight, 1.6 line-height

### Spacing

- Consistent 8px base unit
- Grid-based layouts
- Responsive scaling with clamp()

### Breakpoints

- **Desktop:** > 1024px
- **Tablet:** 768px - 1024px
- **Mobile:** < 768px
- **Small Mobile:** < 480px

---

## ⚙️ Technical Architecture

### JavaScript Modules

```javascript
AppState         // Global state management
Navigation       // Section routing & transitions
HeroAnimations   // Hero section effects
ProjectsPreview  // Preview section logic
FilterSystem     // Dynamic filtering
URLManager       // URL parameter handling
BlogState        // Blog post management
```

**Pattern:** Module pattern with clear separation of concerns

### CSS Organization

```
1. Variables & Reset
2. Typography
3. Scrollbar
4. Navigation
5. Layout & Sections
6. Hero Section
7. Buttons & CTAs
8. Background Effects
9. Projects Section
10. Filter Sidebar
11. Blog Section
12. Footer
13. Loader
14. Responsive Design
15. Utility Classes
```

### Key Features

**Navigation:**
- Hash-based routing
- Browser history support
- Smooth transitions
- Mobile-responsive menu

**Filtering:**
- Real-time updates
- URL persistence
- Multi-category support
- Dynamic counter

**Performance:**
- Zero dependencies
- Lazy loading images
- Critical CSS inline
- Minified assets
- GPU-accelerated animations

---

## 📊 Performance

### Optimizations

- **CSS:** 130KB → 89KB (31% reduction)
- **JavaScript:** 136KB → 63KB (54% reduction)
- **Images:** Lazy loading + optimization
- **Fonts:** Variable fonts (single file)

### Best Practices

✅ Single Responsibility Principle
✅ DRY (Don't Repeat Yourself)
✅ Semantic HTML
✅ BEM-like CSS naming
✅ Progressive Enhancement
✅ Mobile-First approach
✅ Accessibility considerations

### Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🎯 Philosophy

### Vanilla JavaScript
- **No frameworks** - Zero dependencies, full control
- **Performance first** - Faster load times
- **Learning value** - Deep understanding of fundamentals
- **Longevity** - No breaking changes from dependencies

### Design Principles
- **Dark mode by default** - Gallery-like atmosphere
- **Variable fonts** - Expressive typography
- **Gradient accents** - Visual signature
- **Purposeful motion** - Every animation serves a purpose
- **Responsive** - Mobile-first, tested on real devices

---

## 🔧 Maintenance

### Adding New Sections

1. Create section in `index.html` with unique ID
2. Add navigation link with `data-section` attribute
3. Add initialization logic in `Navigation.showSection()` if needed

### Modifying Filters

1. Edit `FilterSystem.init()` in `js/main.js`
2. Add new filter sections in HTML
3. Update `applyFilters()` logic if needed

### Styling Changes

1. Modify CSS variables in `:root` for global changes
2. Edit specific sections in `css/main.css`
3. Use utility classes for quick adjustments

### Troubleshooting

**Blog posts not showing?**
- Check frontmatter format (must have `---` delimiters)
- Verify image paths are correct
- Run `npm run build:blog`
- Check browser console for errors

**Filters not working?**
- Verify `data-area` and `data-tech` attributes on project cards
- Check that filter sidebar IDs match JavaScript selectors
- Clear browser cache and hard refresh

**Images not loading?**
- Check file paths are relative to site root
- Verify images exist in correct folders
- Run `npm run optimize:images`

---

## 🚀 Deployment

### Pre-Deploy Checklist

```bash
# 1. Build everything
npm run build

# 2. Test locally
npm run serve

# 3. Check in browser
- Test all navigation
- Verify filtering works
- Check responsive layouts
- Test on multiple browsers
```

### Recommended Hosts

- **Netlify** - Free tier, auto-deploy from Git
- **Vercel** - Free tier, excellent performance
- **GitHub Pages** - Free, simple setup
- **AWS S3 + CloudFront** - Scalable, custom domain

---

## 📚 Additional Documentation

- **Blog System:** See `blog/README.md` for detailed blog documentation
- **Photography:** See `projects/photography/README.md` for gallery details
- **Scripts:** See `scripts/README.md` for automation details
- **Architecture:** See `docs/README.md` for technical deep-dive

---

## 🤝 Contributing

### Code Style

- Tabs for indentation
- Clear, descriptive variable names
- Comment complex logic
- Follow existing patterns

### Testing Checklist

- [ ] Test all navigation paths
- [ ] Verify filtering works correctly
- [ ] Check responsive layouts
- [ ] Test on multiple browsers
- [ ] Validate HTML/CSS
- [ ] Check accessibility

---

## 📄 License

© 2025 Matthew Colvin. All rights reserved.

---

## 🔮 Future Enhancements

**Potential Improvements:**

1. **Performance**
   - Critical CSS inlining
   - Service worker for offline support
   - WebP images with fallbacks

2. **Features**
   - Search functionality
   - Project detail modals
   - Dark/light mode toggle
   - Analytics integration

3. **Accessibility**
   - Keyboard navigation improvements
   - Screen reader optimizations
   - Focus management
   - ARIA live regions

---

**Questions or Issues?**
Contact: mtcolvin99@gmail.com

**Portfolio:** [BLOT.WORLD](https://blot.world)
