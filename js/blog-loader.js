/**
 * Blog Post Loader
 * Fetches and parses Markdown blog posts with YAML frontmatter
 */

class BlogLoader {
    constructor() {
        this.posts = [];
        this.postsConfig = [
            { id: 'post-blot-world', file: 'blog/posts/blot-world-case-study.md' }
            // Add more posts here as needed
        ];
    }

    /**
     * Parse YAML frontmatter from markdown content
     */
    parseFrontmatter(content) {
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

        // Code blocks
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Unordered lists
        html = html.replace(/^\- (.+)$/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

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
            if (trimmed.startsWith('</pre>')) inCodeBlock = false;
            if (trimmed.startsWith('<ul>') || trimmed.startsWith('<ol>')) inList = true;
            if (trimmed.startsWith('</ul>') || trimmed.startsWith('</ol>')) inList = false;

            if (trimmed &&
                !trimmed.startsWith('<h') &&
                !trimmed.startsWith('<ul') &&
                !trimmed.startsWith('<ol') &&
                !trimmed.startsWith('<li') &&
                !trimmed.startsWith('<hr') &&
                !trimmed.startsWith('<pre') &&
                !trimmed.startsWith('</') &&
                !inList &&
                !inCodeBlock) {
                processedLines.push(`<p>${line}</p>`);
            } else {
                processedLines.push(line);
            }
        }

        html = processedLines.join('\n');

        // Clean up empty paragraphs and fix list wrapping
        html = html.replace(/<p>\s*<\/p>/g, '');
        html = html.replace(/<\/li>\n<li>/g, '</li><li>');

        return html;
    }

    /**
     * Load a single blog post
     */
    async loadPost(postConfig) {
        try {
            const response = await fetch(postConfig.file);
            if (!response.ok) {
                throw new Error(`Failed to load ${postConfig.file}`);
            }

            const content = await response.text();
            const { metadata, content: markdown } = this.parseFrontmatter(content);
            const htmlContent = this.markdownToHtml(markdown);

            return {
                id: postConfig.id,
                title: metadata.title || 'Untitled',
                date: metadata.date || '',
                category: metadata.category || 'Thoughts',
                excerpt: metadata.excerpt || '',
                image: metadata.image || '',
                tags: metadata.tags || [],
                content: htmlContent
            };
        } catch (error) {
            console.error(`Error loading post ${postConfig.file}:`, error);
            return null;
        }
    }

    /**
     * Load all blog posts
     */
    async loadAllPosts() {
        const promises = this.postsConfig.map(config => this.loadPost(config));
        const results = await Promise.all(promises);
        this.posts = results.filter(post => post !== null);
        return this.posts;
    }

    /**
     * Render a post into the DOM
     */
    renderPost(post, containerId) {
        console.log(`BlogLoader: Looking for container with ID: ${containerId}`);
        const section = document.getElementById(containerId);
        if (!section) {
            console.error(`BlogLoader: Section ${containerId} not found`);
            return;
        }

        // Find the .post-container div inside the section
        const container = section.querySelector('.post-container');
        if (!container) {
            console.error(`BlogLoader: .post-container not found in section ${containerId}`);
            return;
        }
        console.log(`BlogLoader: Found container, rendering post: ${post.title}`);

        // Create post structure
        const postHTML = `
            <article>
                <a href="#" data-section="blog" class="back-to-blog">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back to Thoughts
                </a>

                <header class="post-header">
                    <div class="post-meta">
                        <span class="post-date">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            ${post.date}
                        </span>
                        <span class="post-category">${post.category}</span>
                        <span class="post-read-time"></span>
                    </div>

                    <h1 class="post-title">${post.title}</h1>

                    <p class="post-excerpt">${post.excerpt}</p>

                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('\n                        ')}
                    </div>
                </header>

                <div class="post-featured-image">
                    <img src="${post.image}" alt="${post.title}">
                </div>

                <div class="post-content">
                    ${post.content}
                </div>
            </article>
        `;

        container.innerHTML = postHTML;

        // Calculate and populate read time
        const contentElement = container.querySelector('.post-content');
        const readTimeElement = container.querySelector('.post-read-time');

        if (contentElement && readTimeElement) {
            const text = contentElement.textContent || contentElement.innerText;
            const wordCount = text.trim().split(/\s+/).length;
            const readTime = Math.ceil(wordCount / 200);
            readTimeElement.textContent = `${readTime} min read`;
        }
    }

    /**
     * Initialize blog loader
     */
    async init() {
        console.log('BlogLoader: Starting initialization...');
        await this.loadAllPosts();
        console.log('BlogLoader: Loaded posts:', this.posts);

        // Render each post into its container
        this.posts.forEach(post => {
            console.log(`BlogLoader: Rendering post ${post.id}`);
            this.renderPost(post, post.id);
        });

        console.log('BlogLoader: Initialization complete');
        return this.posts;
    }
}

// Export for use in main.js
window.BlogLoader = BlogLoader;
