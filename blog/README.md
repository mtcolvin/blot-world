# Blog System Guide

This blog system uses Markdown files with YAML frontmatter to generate blog posts at build time. This makes it easy to add, edit, and manage blog content without touching HTML.

## How It Works

1. **Markdown Files**: Blog posts are written in Markdown format with YAML frontmatter for metadata
2. **Build Script**: `npm run build:blog` converts `.md` files to HTML
3. **Build-Time Integration**: Content is converted and injected into `index.html` during build
4. **Auto Features**: Read time, tags, and metadata are all handled automatically
5. **No Runtime Overhead**: Posts are pre-built, so no CORS issues or fetch delays

## Adding a New Blog Post

### Step 1: Create the Markdown File

Create a new `.md` file in `blog/posts/` with the following structure:

```markdown
---
title: "Your Post Title"
date: "February 1, 2025"
category: "Tutorial"
excerpt: "A brief description of your post that appears in the blog card preview."
image: "blog/images/your-post-image.png"
tags:
  - Tag 1
  - Tag 2
  - Tag 3
---

## Your First Heading

Your content here...

### Subheading

More content with **bold** and *italic* text.

- Bullet points
- Are supported

```code blocks```
Are also supported
\```

**Supported Markdown:**
- Headers: `## H2`, `### H3`
- Bold: `**text**`
- Italic: `*text*`
- Code: `` `inline` `` or ```` ```block``` ````
- Lists: `- item` or `1. item`
- Horizontal rules: `---`
- Paragraphs: Blank line separated

### Step 2: Add Post Image

Place your post's featured image in `blog/images/` and name it to match your post:
- Example: `blog/images/your-post-name.png`
- Recommended size: 1200x630px
- Format: PNG or JPG

### Step 3: Build the Blog

Run the build command to convert Markdown to HTML:

```bash
npm run build:blog
```

This will:
- Read all `.md` files in `blog/posts/`
- Parse frontmatter and convert markdown to HTML
- Inject post sections into `index.html` automatically
- Generate proper IDs based on filenames (`post-your-post-name`)

### Step 4: Build Everything

For a complete build (recommended before deploying):

```bash
npm run build
```

This runs:
1. `build:blog` - Converts markdown to HTML
2. `optimize:images` - Optimizes images
3. `minify:css` - Minifies CSS
4. `minify:js` - Minifies JavaScript

### Step 5: (Optional) Create Standalone Page

If you want a standalone HTML page for direct access, you can manually create one in `blog/posts/` based on the template structure. However, the main single-page app automatically includes all posts.

## Frontmatter Fields

### Required Fields

- **title**: The post title (appears in `<h1>`)
- **date**: Publication date (displayed in post meta)
- **category**: Post category (Case Study, Tutorial, Thoughts, etc.)
- **excerpt**: Short description for blog cards and SEO
- **image**: Path to featured image relative to site root
- **tags**: Array of relevant tags

### Example Frontmatter

```yaml
---
title: "Building a Markdown Blog System"
date: "February 1, 2025"
category: "Tutorial"
excerpt: "Learn how to build a dynamic blog system using Markdown files and vanilla JavaScript."
image: "blog/images/markdown-blog-system.png"
tags:
  - JavaScript
  - Markdown
  - Web Development
  - Tutorial
---
```

## Category Options

Current categories (you can add more):
- **Case Study**: Deep dives into projects
- **Tutorial**: Step-by-step guides
- **Thoughts**: Personal reflections and opinions
- **Review**: Product/service reviews

## Tag Best Practices

- Use 5-14 tags per post
- Include technology tags (HTML, CSS, JavaScript, etc.)
- Include topic tags (Portfolio, Performance, SEO, etc.)
- Include format tags (Tutorial, Guide, etc.)
- Use title case for consistency

## File Structure

```
blog/
├── README.md (this file)
├── images/
│   ├── blot-world-case-study.png
│   └── your-post-image.png
├── posts/
│   ├── blot-world-case-study.md
│   ├── blot-world-case-study.html (standalone)
│   └── your-post-name.md
└── css/
    └── post.css
```

## Troubleshooting

### Post not showing up?
1. Check that the `id` in `index.html` matches the `id` in `blog-loader.js`
2. Verify the Markdown file path in `postsConfig` is correct
3. Check browser console for any errors

### Read time showing 0?
- Make sure you have content in your Markdown file
- The read time is calculated automatically based on word count (200 words/min)

### Images not loading?
- Verify the image path in frontmatter is correct
- Paths are relative to the site root (start with `blog/images/`)
- Check that the image file actually exists

### Formatting looks wrong?
- Ensure proper Markdown syntax (check spacing, line breaks)
- Make sure headers have space after `#` (`## Header` not `##Header`)
- Lists need blank lines before and after

## Tips

1. **Preview Before Publishing**: Test your Markdown in a previewer first
2. **Optimize Images**: Compress images to keep load times fast
3. **Consistent Naming**: Use lowercase and hyphens for file names
4. **SEO-Friendly**: Write descriptive titles and excerpts
5. **Tag Thoughtfully**: Use existing tags when possible for consistency

## Questions?

Check the existing `blot-world-case-study.md` file as a reference example!
