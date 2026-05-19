/**
 * Blog Build Script
 * Converts Markdown blog posts to HTML and injects them into index.html
 */

const fs = require('fs');
const path = require('path');

class BlogBuilder {
    constructor() {
        this.postsDir = path.join(__dirname, '../blog/posts');
        this.indexPath = path.join(__dirname, '../index.html');
        this.rssPath = path.join(__dirname, '../blog/rss.xml');
        this.siteUrl = 'https://blot.world';
        this.posts = [];
    }

    /**
     * Parse YAML frontmatter from markdown content
     */
    parseFrontmatter(content) {
        // Normalize line endings to \n
        content = content.replace(/\r\n/g, '\n');

        const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);

        if (!match) {
            return { metadata: {}, content: content };
        }

        const frontmatter = match[1];
        const markdown = match[2];
        const metadata = {};

        // Parse YAML-like frontmatter
        const lines = frontmatter.split('\n');
        let currentKey = null;
        let currentArray = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            // Handle array items
            if (trimmed.startsWith('-')) {
                if (currentArray) {
                    currentArray.push(trimmed.substring(1).trim());
                }
                return;
            }

            // Handle key-value pairs
            const colonIndex = trimmed.indexOf(':');
            if (colonIndex > -1) {
                const key = trimmed.substring(0, colonIndex).trim();
                const value = trimmed.substring(colonIndex + 1).trim();

                // Remove quotes from value
                const cleanValue = value.replace(/^["']|["']$/g, '');

                if (cleanValue === '') {
                    // This is an array start
                    currentKey = key;
                    currentArray = [];
                    metadata[key] = currentArray;
                } else {
                    metadata[key] = cleanValue;
                    currentKey = null;
                    currentArray = null;
                }
            }
        });

        return { metadata, content: markdown };
    }

    /**
     * Escape HTML entities
     */
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Convert Markdown to HTML
     */
    markdownToHtml(markdown) {
        let html = markdown;

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Code blocks with HTML escaping
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return '<pre><code>' + this.escapeHtml(code) + '</code></pre>';
        });

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Unordered lists
        html = html.replace(/^\- (.+)$/gim, '<li>$1</li>');
        // Wrap consecutive <li> tags in <ul>
        html = html.replace(/(<li>[\s\S]*?<\/li>)(\n\s*(?!<li>))/g, '<ul>$1</ul>$2');

        // Ordered lists
        html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');

        // Horizontal rules
        html = html.replace(/^---$/gim, '<hr>');

        // Paragraphs (process last to avoid conflicts)
        const lines = html.split('\n');
        let inList = false;
        let inCodeBlock = false;
        let processedLines = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            if (trimmed.startsWith('<pre>')) inCodeBlock = true;
            if (trimmed.endsWith('</pre>')) inCodeBlock = false;
            if (trimmed.startsWith('<ul>') || trimmed.startsWith('<ol>')) inList = true;
            if (trimmed.endsWith('</ul>') || trimmed.endsWith('</ol>')) inList = false;

            if (trimmed &&
                !trimmed.startsWith('<h') &&
                !trimmed.startsWith('<ul') &&
                !trimmed.startsWith('<ol') &&
                !trimmed.startsWith('<li') &&
                !trimmed.startsWith('<hr') &&
                !trimmed.startsWith('<pre') &&
                !trimmed.startsWith('<') &&
                !trimmed.endsWith('>') &&
                !inList &&
                !inCodeBlock) {
                processedLines.push(`\t\t\t\t\t\t<p>${line}</p>`);
            } else {
                processedLines.push(`\t\t\t\t\t\t${line}`);
            }
        }

        html = processedLines.join('\n');

        // Clean up empty paragraphs and fix list wrapping
        html = html.replace(/<p>\s*<\/p>/g, '');
        html = html.replace(/<\/li>\n\t\t\t\t\t\t<li>/g, '</li>\n\t\t\t\t\t\t\t<li>');

        return html;
    }

    /**
     * Read and parse all markdown files
     */
    readMarkdownFiles() {
        const files = fs.readdirSync(this.postsDir).filter(file => file.endsWith('.md'));

        console.log(`📝 Found ${files.length} markdown file(s)`);

        files.forEach(file => {
            const filePath = path.join(this.postsDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const { metadata, content: markdown } = this.parseFrontmatter(content);
            const htmlContent = this.markdownToHtml(markdown);

            // Generate post ID from filename
            const postId = 'post-' + path.basename(file, '.md');

            this.posts.push({
                id: postId,
                filename: file,
                title: metadata.title || 'Untitled',
                date: metadata.date || '',
                category: metadata.category || 'Thoughts',
                excerpt: metadata.excerpt || '',
                image: metadata.image || '',
                tags: metadata.tags || [],
                content: htmlContent
            });

            console.log(`  ✓ Processed: ${file}`);
        });

        return this.posts;
    }

    /**
     * Generate HTML for a blog post section
     */
    generatePostSection(post) {
        return `\t\t<!-- Blog Post: ${post.title} -->
\t\t<section id="${post.id}" class="section post-section">
\t\t\t<div class="post-container">
\t\t\t\t<a href="#" data-section="blog" class="back-to-blog">
\t\t\t\t\t<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
\t\t\t\t\t\t<path d="M19 12H5M12 19l-7-7 7-7"/>
\t\t\t\t\t</svg>
\t\t\t\t\tBack to Thoughts
\t\t\t\t</a>

\t\t\t\t<article>
\t\t\t\t\t<header class="post-header">
\t\t\t\t\t\t<h1 class="post-title">${post.title}</h1>

\t\t\t\t\t\t<div class="post-meta">
\t\t\t\t\t\t\t<span class="post-date">
\t\t\t\t\t\t\t\t<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
\t\t\t\t\t\t\t\t\t<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
\t\t\t\t\t\t\t\t\t<line x1="16" y1="2" x2="16" y2="6"></line>
\t\t\t\t\t\t\t\t\t<line x1="8" y1="2" x2="8" y2="6"></line>
\t\t\t\t\t\t\t\t\t<line x1="3" y1="10" x2="21" y2="10"></line>
\t\t\t\t\t\t\t\t</svg>
\t\t\t\t\t\t\t\t${post.date}
\t\t\t\t\t\t\t</span>
\t\t\t\t\t\t\t<span class="post-category">${post.category}</span>
\t\t\t\t\t\t\t<span class="post-read-time"></span>
\t\t\t\t\t\t</div>
\t\t\t\t\t</header>

\t\t\t\t\t<div class="post-content">
${post.content}
\t\t\t\t\t</div>
\t\t\t\t</article>
\t\t\t</div>
\t\t</section>`;
    }

    /**
     * Inject post sections into index.html
     */
    updateIndexHTML() {
        let indexHTML = fs.readFileSync(this.indexPath, 'utf-8');

        // Remove existing blog post sections (between blog section and main closing tag)
        const blogSectionStart = indexHTML.indexOf('<!-- BLOG POSTS START -->');
        const blogSectionEnd = indexHTML.indexOf('<!-- BLOG POSTS END -->');

        if (blogSectionStart === -1 || blogSectionEnd === -1) {
            console.error('❌ Could not find blog posts markers in index.html');
            console.log('   Add <!-- BLOG POSTS START --> and <!-- BLOG POSTS END --> markers');
            return false;
        }

        // Generate all post sections
        const postSections = this.posts.map(post => this.generatePostSection(post)).join('\n\n');

        // Replace the content between markers
        const before = indexHTML.substring(0, blogSectionStart + '<!-- BLOG POSTS START -->'.length);
        const after = indexHTML.substring(blogSectionEnd);

        indexHTML = before + '\n' + postSections + '\n\n\t\t' + after;

        // Write back to file
        fs.writeFileSync(this.indexPath, indexHTML, 'utf-8');
        console.log(`\n✓ Updated index.html with ${this.posts.length} post section(s)`);

        return true;
    }

    /**
     * Parse human-readable date to RFC 2822 format for RSS
     */
    parseDate(dateStr) {
        if (!dateStr) return new Date().toUTCString();

        // Handle "Month Day, Year" format (e.g., "November 27, 2025")
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.toUTCString();
        }

        return new Date().toUTCString();
    }

    /**
     * Escape XML special characters
     */
    escapeXml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    /**
     * Strip HTML tags and get plain text
     */
    stripHtml(html) {
        if (!html) return '';
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Truncate text to specified length with ellipsis
     */
    truncate(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    /**
     * Generate RSS feed from posts
     */
    generateRSS() {
        // Sort posts by date (newest first)
        const sortedPosts = [...this.posts].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        const lastBuildDate = new Date().toUTCString();

        let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>BLOT.WORLD Thoughts</title>
        <description>Insights on design, development, and creative processes by Matthew Colvin</description>
        <link>${this.siteUrl}</link>
        <atom:link href="${this.siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
        <language>en-us</language>
        <lastBuildDate>${lastBuildDate}</lastBuildDate>
        <image>
            <url>${this.siteUrl}/images/favicon/android-chrome-512x512.png</url>
            <title>BLOT.WORLD</title>
            <link>${this.siteUrl}</link>
        </image>
`;

        sortedPosts.forEach(post => {
            const postUrl = `${this.siteUrl}/blog/posts/${path.basename(post.filename, '.md')}.html`;
            const pubDate = this.parseDate(post.date);

            // Get full content as plain text for RSS description
            const plainText = this.stripHtml(post.content);

            // Build category tags (sorted alphabetically)
            let categoryTags = `        <category>${this.escapeXml(post.category)}</category>\n`;
            if (post.tags && post.tags.length > 0) {
                const sortedTags = [...post.tags].sort((a, b) => a.localeCompare(b));
                sortedTags.forEach(tag => {
                    categoryTags += `            <category>${this.escapeXml(tag)}</category>\n`;
                });
            }

            rss += `
        <item>
            <title>${this.escapeXml(post.title)}</title>
            <description>${this.escapeXml(plainText)}</description>
            <link>${postUrl}</link>
            <guid>${postUrl}</guid>
            <pubDate>${pubDate}</pubDate>
${categoryTags}        </item>
`;
        });

        rss += `    </channel>
</rss>
`;

        fs.writeFileSync(this.rssPath, rss, 'utf-8');
        console.log(`\n📡 Generated RSS feed with ${sortedPosts.length} item(s)`);
    }

    /**
     * Build all blog posts
     */
    build() {
        console.log('📚 Building blog posts...\n');

        this.readMarkdownFiles();
        this.updateIndexHTML();
        this.generateRSS();

        console.log('\n✨ Blog build complete!\n');
    }
}

// Run the builder
const builder = new BlogBuilder();
builder.build();
