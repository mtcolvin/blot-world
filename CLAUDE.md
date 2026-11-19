# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BLOT.WORLD is a vanilla JavaScript portfolio website with no framework dependencies. The site is hosted on GitHub Pages at blot.world and uses a build system for asset optimization.

## Build Commands

```bash
npm run build              # Full build (blog + projects + images + minification)
npm run build:blog         # Convert Markdown posts to HTML + generate RSS feed
npm run build:projects     # Generate project cards + inject per-page SEO meta from data/projects.json
npm run minify:css         # Minify CSS files (creates *.min.css)
npm run minify:js          # Minify JavaScript files (creates *.min.js)
npm run optimize:images    # Compress images with sharp
npm run serve              # Start local server at http://localhost:8080
```

### Projects Workflow (single source of truth)

All projects are defined in **`data/projects.json`** — the authoritative source for
the homepage cards AND each project page's `<head>` SEO/Open Graph/JSON-LD and series
navigation. `npm run build:projects` reads it and generates:
- `js/projects-data.js` (`window.PROJECTS_DATA`, consumed by `renderProjectCards()` in `js/main.js`)
- the region between `<!-- PROJECT-META:start --> … :end -->` markers in each `projects/<slug>/index.html`
- series nav/label between `<!-- SERIES-NAV -->` / `<!-- SERIES-LABEL -->` markers on member pages (e.g. amari/joni)

**Rules:**
- **`slug` is permanent.** It is the folder name (`projects/<slug>/`) and the URL. Never
  rename it — change the `name` field instead. (A folder `faces/` can display "La Façade".)
- **Never hand-edit generated regions** (the marker blocks, or `js/projects-data.js`). Edit `data/projects.json` and rebuild.
- Each project is self-contained under `projects/<slug>/`: `index.html`, `preview.{jpg,webp,avif}`, and `images/` for content. Only global assets (favicon, logo, loaders, about photos) live in top-level `images/`.

**Renaming a project's display name:** edit `name` (and any `seo.*` text) in `data/projects.json`, run `npm run build:projects` — it propagates to the card, the page `<title>`/meta/OG, and every sibling page's series label/nav automatically.

**Adding a project:** create `projects/<slug>/index.html` (with `<!-- PROJECT-META:start/end -->` markers in `<head>`), add `preview.jpg`, append an entry to `data/projects.json`, run `npm run build:projects`.

### Domains & Disciplines (project taxonomy)

Each project has a two-level classification in `data/projects.json` (there is no `area` field anymore):
- **`domain`** — the broad field: `Art`, `Code`, `Data`, `Design`, `Writing`
- **`discipline`** — the specific kind of work inside it: `Digital`, `Photography`, `Web`, `Software`, `Analysis`, `Branding`, `Poetry`

New kinds of work become a new **discipline** under an existing domain (e.g. painting → `Art`/`Painting`, a novel → `Writing`/`Novels`), not a new domain. The same discipline name can exist under two domains; the filter keys them as `Domain/Discipline`.

Everything is derived from those two fields — nothing else to edit:
- **Card tag** (top-left): dark pill `● DOMAIN / DISCIPLINE`, dot in the domain color. Card back shows the same.
- **Filter sidebar**: the Domain section is a tree (`FilterSystem.buildDomainTree()`) — one branch per domain in its color, expandable to its disciplines. URL params: `?domain=Art,Code&discipline=Code/Software`.
- **About → Areas of Work** (`populateAreaBadges()`): one column per domain over a sideways brace in its color, disciplines listed beneath; rows that aren't full are centered.
- **Analytics**: the card-click `dataLayer` event sends `project_area` (= domain) and `project_discipline`.

**Domain colors** live in `css/root.css` as `--domain-<lowercased name>` (`--domain-art`, `--domain-code`, …), read via `domainColorVar()` in `js/main.js`. **Adding a new domain = add its `--domain-<name>` variable**; a domain without one falls back to grey (`--domain-fallback`). `root.css` changes need `npm run minify:css && npm run cache:bust`.

### Project Cards (front face)

Rendered by `renderProjectCards()` in `js/main.js` from `data/projects.json`; styles under `.card-front` in `css/main.css`.

- **Top-left — domain tag:** dark pill with faint edge, `● DOMAIN / DISCIPLINE`, dot in the domain color (see above).
- **Top-right — AI badge** (only when `dataTech` includes an AI tool): same pill size, no visible border; the sparkle and "AI" carry the holo sweep (`.ai-spark` / `.ai-holo-text`, shared with the "With AI" filter).
- **Bottom:** small mono date line (`.card-date`) above the title, and just the ↻ flip arrow at bottom-right (its "Flip" / "More info" label is kept as `title` + `.sr-only`). Titles sit naturally at the bottom — not forced to a common start height.
- **Title font:** Space Grotesk 700, uppercase, 18px — the site's heading voice (matches "PROJECTS"). `text-wrap: balance` keeps two-line titles even ("Amberlin / Health App", not "Amberlin Health / App").
- **Cover images** (`projects/<slug>/preview.jpg`, 900×1320): flat background with one centered graphic. Keep the hero inside roughly y 140–860 — the domain tag covers the top-left and the title fade starts around y 880. After replacing one: delete that project's old `preview.{avif,webp}` and `preview-{480,960}.*` (variant scripts skip files that exist), run `npm run optimize:images && npm run build:srcset && npm run check:pictures`, then `npm run cache:bust`. **`optimize:images` also re-compresses other previews (e.g. Amberlin's) — `git checkout` any it touched that you didn't mean to change.**
- **Renaming:** edit `name`; leave `dataName` alone — it's the value analytics reports (`project_name`), so changing it breaks click history.

### Rotator Content (quotes & sayings)

The two About-section rotators read their content from two **hand-curated** files:
- **`js/quotes-data.js`** — `window.QUOTES_DATA`, attributed quotes (upper block)
- **`js/sayings-data.js`** — `window.SAYINGS_DATA`, proverbs (lower block)

**Rules:**
- **Nothing generates these.** They sit beside the generated `js/projects-data.js` but are edited by hand — there is no build step and no `data/*.json` source. Edit and hard refresh.
- Entry shape is `{ text, author }`. `author` is optional: omit it and the `<cite>` renders empty, which CSS `:empty` hides so no orphan em dash appears.
- For sayings, `author` names a *tradition* ("Japanese proverb"), and only where the origin is well documented. Anything whose usual attribution is disputed is marked plainly "Proverb" rather than credited to a culture that can't be stood behind.
- Both are loaded `defer` **before** `js/main.min.js` in `index.html` — deferred scripts run in order, so the globals exist before the rotators are built. A rotator with an empty `items` bails in `init()` rather than throwing.
- After editing, deploy with `npm run minify:js && npm run cache:bust`. **The cache-bust step is not optional** — `index.html` references these files with `?v=` hashes, so skipping it leaves returning visitors on the cached copy.

### Photography Workflow

The photography page (`projects/photography/index.html`) is data-driven from two files:
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
- **FilterSystem** - Dynamic project filtering with URL persistence: the Domain tree (domain/discipline, see Domains & Disciplines above), Technologies checklist, and Made-with segmented control (styled by **MadeWithTray**: background fills only, no outlines)
- **ProjectsHeaderAlign** - Pads the Projects title row so the title lines up with the first card column and "Showing X of Y" with the last (the grid centers its tracks, so the inset changes with column count). If both can't fit on one line, adds `.header-wrap` and the counter drops below the title
- **URLManager** - URL parameter handling
- **NightSky** - Animated background effect
- **createRotator(cfg)** - Factory behind the two About-section rotators: **QuoteRotator** (attributed quotes, `#quote-block`) and **SayingRotator** (proverbs, `#saying-block`). All DOM lookups are scoped to `cfg.container`, so each block needs its own `.rotating-quote`, `.quote-indicators`, and `[data-rotator-prev/next]` controls. Content lives in `js/quotes-data.js` / `js/sayings-data.js` (see Rotator Content below)
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

Each project lives in `projects/<slug>/index.html` (clean URL: `blot.world/projects/<slug>/`) with co-located `preview.*` and `images/`. The slug is permanent (see Projects Workflow above). Per-page SEO/meta + series nav are generated from `data/projects.json` into marker regions — do not hand-edit those. The photography gallery has its own module (`photo-loader.js`).

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
--ai-accent: #C9A9FF;      /* AI co-built lilac */
--domain-art: #FF4040;     /* one --domain-* per domain, see Domains & Disciplines */
```

**AI mark:** the card's AI badge and the "With AI" filter share `.ai-spark` (masked sparkle) and `.ai-holo-text` in `css/main.css`. The sliding pink → lilac → aqua sweep is defined once there, so changing it updates both.

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
