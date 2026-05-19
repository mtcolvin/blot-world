# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BLOT.WORLD is a vanilla JavaScript portfolio website with no framework dependencies. The site is hosted on GitHub Pages at blot.world and uses a build system for asset optimization.

## Build Commands

```bash
npm run build              # Full build (blog + images + minification)
npm run build:blog         # Convert Markdown posts to HTML + generate RSS feed
npm run minify:css         # Minify CSS files (creates *.min.css)
npm run minify:js          # Minify JavaScript files (creates *.min.js)
npm run optimize:images    # Compress images with sharp
npm run serve              # Start local server at http://localhost:8080
```

### Photography Workflow

The photography page (`projects/photography/photography.html`) is data-driven from two files:
- **`photo-data.js`** — hand-curated source of truth: `{ file, date, location }` per photo. Exposes `window.BLOT_PHOTOS`.
- **`photo-colors.js`** — auto-generated dominant color per photo. Exposes `window.BLOT_PHOTO_COLORS`.

```bash
npm run resize:photos          # Resize incoming photos to 1200px (preserves EXIF)
npm run sync:photo-colors      # Compute dominant color per photo with sharp → photo-colors.js
npm run minify:js              # Minify after data/color changes
```

**Adding a new photo:**
1. Drop the file in `projects/photography/images/`
2. Append a `{ file, date, location }` entry to `projects/photography/photo-data.js`
3. Run `npm run sync:photo-colors` (or `npm run build` which includes it)
4. Hard refresh the page

**Why pre-computed colors?** The page works via `file://` (no local server needed). In-browser canvas pixel extraction is blocked by CORS for `file://` URLs, so colors are computed at build time by `scripts/sync-photo-colors.js` using sharp + a hue-bin histogram. Per-month aggregation (hue voting + saturation boost) still happens in the browser at page load.

> The older `photo-loader.js` + `npm run sync:photo-array` (EXIF-driven) pipeline is no longer used by the page. `photo-data.js` is the authoritative source.

## Architecture

### Main Application (`js/main.js`)

The application uses a module pattern with these key components:

- **PageLoader** - Transition loader with animated loading bar
- **AppState** - Global state management
- **Navigation** - Hash-based routing and section transitions
- **HeroAnimations** - Hero section effects
- **ProjectsPreview** - Preview section logic
- **FilterSystem** - Dynamic project filtering with URL persistence
- **URLManager** - URL parameter handling
- **NightSky** - Animated background effect
- **QuoteRotator** - Rotating quotes display
- **BlogState** - Blog post management

### CSS Organization (`css/main.css`)

Organized into numbered sections:
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

### Project Pages

Each project in `projects/` has its own HTML file (e.g., `projects/photography/photography.html`) with dedicated JS/CSS. The photography gallery has its own module (`photo-loader.js`).

### Blog System

- Posts: Markdown files in `blog/posts/` with YAML frontmatter
- Build: `npm run build:blog` parses Markdown, injects HTML into `index.html`, and generates RSS feed
- RSS Feed: Auto-generated at `blog/rss.xml` (subscribable)
- Categories: Case Study, Tutorial, Thoughts, Review
- Post IDs: Generated from filenames (e.g., `my-post.md` → `#post-my-post`)
- Full documentation: See `blog/README.md`

### Adding a Blog Post

1. Create `blog/posts/your-post-name.md` with frontmatter:
   ```markdown
   ---
   title: "Post Title"
   date: "January 15, 2025"
   category: "Case Study"
   excerpt: "Brief description for previews and RSS."
   image: "blog/images/your-post-image.png"
   tags:
     - Tag 1
     - Tag 2
   ---

   ## Your content here...
   ```

2. Add featured image to `blog/images/` (recommended: 1200x630px)

3. Build:
   ```bash
   npm run build:blog    # Generates HTML + RSS feed
   npm run minify:js     # Minify if deploying
   ```

## Code Style

- **Prettier config**: 2-space indent, no semicolons, single quotes
- **Tabs in existing code**: Some files use tabs (main.js)
- **CSS naming**: BEM-like conventions
- **Colors**: Defined as CSS custom properties in `:root`

Key CSS variables:
```css
--blot-black: #0a0a0a;
--primary-blue: #0D28F2;
--accent-red: #E60F0F;
```

## File Naming

- Source files: `main.js`, `main.css`
- Minified: `main.min.js`, `main.min.css`
- Always edit source files, then run minify commands

## Testing

No automated tests. Manual testing checklist:
- Navigation between sections
- Filter functionality
- Responsive layouts (mobile breakpoint: 768px)
- Photography timeline interactions

## Project-Specific Skills

Skills for this project are in `~/.claude/skills/blot-world/`.

Current skills:
- **add-blog-post**: Add blog posts to the Thoughts section and generate RSS feed
- **sitemap**: Site structure reference for locating pages, sections, and elements
- **add-poem**: Add poems to the poetry showcase
- **add-photography**: Add photos to the photography gallery
- **mobile-optimization**: Mobile layout and touch optimization
