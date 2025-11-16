# BLOT.WORLD Blog System

A comprehensive blog and case study platform integrated into the BLOT.WORLD portfolio website.

## Features

### Core Functionality
- **Dynamic Blog Index**: Displays all blog posts with filtering, search, and sorting
- **Search System**: Real-time search across post titles, excerpts, and tags
- **Category Filtering**: Filter by Case Studies, Tutorials, or Thoughts
- **Tag System**: Granular topic-based organization
- **RSS Feed**: Subscribe to updates via RSS at `/blog/rss.xml`
- **Responsive Design**: Optimized for desktop, tablet, and mobile

### Case Studies Included
1. **Building BLOT.WORLD: A Modern Portfolio Experience**
   - Deep dive into portfolio design and technical implementation
   - Covers vanilla JavaScript architecture, filtering system, and UX decisions

2. **Café Mexicali: Crafting a Vibrant Restaurant Identity**
   - Complete branding case study from research to deliverables
   - Details color palette development, logo design, and brand system

3. **Photography Through Time: Building an Interactive Timeline**
   - Interactive photography gallery with chronological timeline interface
   - Technical challenges of horizontal scrolling, lazy loading, and responsive design

## File Structure

```
blog/
├── index.html              # Blog index page
├── rss.xml                # RSS feed
├── css/
│   ├── blog.css           # Blog index styles
│   └── post.css           # Blog post template styles
├── js/
│   └── blog.js            # Blog functionality (search, filtering, rendering)
├── posts/
│   ├── blot-world-case-study.html
│   ├── cafemex-case-study.html
│   └── photography-case-study.html
└── images/                # Blog-specific images (if needed)
```

## Adding New Blog Posts

### Step 1: Create the HTML Post
Create a new HTML file in `blog/posts/` using the existing case studies as templates.

### Step 2: Update blog.js
Add your new post to the `blogPosts` array in `blog/js/blog.js`:

```javascript
{
    id: 'your-post-slug',
    title: 'Your Post Title',
    excerpt: 'Brief description of your post',
    date: '2025-01-20',
    category: 'case-study', // or 'tutorial', 'thoughts'
    tags: ['Tag1', 'Tag2', 'Tag3'],
    image: '../images/previews/your-image.jpg',
    url: 'posts/your-post-slug.html'
}
```

### Step 3: Update RSS Feed
Add your post to `blog/rss.xml`:

```xml
<item>
    <title>Your Post Title</title>
    <description>Brief description</description>
    <link>https://blot.world/blog/posts/your-post-slug.html</link>
    <guid>https://blot.world/blog/posts/your-post-slug.html</guid>
    <pubDate>Date in RFC 822 format</pubDate>
    <category>Your Category</category>
</item>
```

## Design Philosophy

### Typography
- Headlines use large, bold type with tight letter-spacing (-2px)
- Body text maintains comfortable line-height (1.7-1.8)
- Code blocks use monospace with syntax-friendly styling

### Color System
Inherits from main site:
- Primary gradient: Purple to Blue
- Background: Deep black (#0a0a0a)
- Text: White with varying opacity for hierarchy
- Accent colors for categories and tags

### Layout
- Maximum content width: 900px for optimal readability
- Generous spacing between sections (50-60px)
- Card-based grid for blog index (auto-fill minmax(400px, 1fr))

## SEO Optimization

- Semantic HTML5 structure
- Proper heading hierarchy (h1 → h2 → h3)
- Meta descriptions and keywords
- RSS feed for syndication
- Open Graph and Twitter Card support (extend as needed)
- Alt text on all images

## Performance Considerations

- Lazy loading for blog post images
- Minimal JavaScript bundle
- CSS scoped to blog section
- Optimized images

## Navigation Integration

The blog is accessible from:
- Main navigation (desktop & mobile)
- Footer links
- Direct URL: `/blog/index.html`

## Future Enhancements

Potential additions:
- Comment system (if needed)
- Related posts suggestions
- Reading time estimation (already in template)
- Social sharing buttons (already in template)
- Newsletter signup integration
- Analytics integration
- Dark/light theme toggle specific to blog

## Maintenance

### Regular Updates
- Add new blog posts as projects complete
- Update RSS feed with new entries
- Ensure images are optimized before upload
- Review and update older posts periodically

### SEO Maintenance
- Monitor search performance
- Update meta descriptions as needed
- Add internal links between related posts
- Keep RSS feed updated

## Credits

Designed and developed by Matthew Colvin as part of BLOT.WORLD portfolio website.

---

For questions or suggestions, contact: mtcolvin99@gmail.com
