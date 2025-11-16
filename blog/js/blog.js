/* ==========================================================================
   BLOT.WORLD Blog - JavaScript
   ========================================================================== */

// Blog Posts Data
const blogPosts = [
    {
        id: 'blot-world-portfolio',
        title: 'Building BLOT.WORLD: A Modern Portfolio Experience',
        excerpt: 'A deep dive into the design decisions, technical challenges, and creative process behind building my personal portfolio website from scratch.',
        date: '2025-01-15',
        category: 'case-study',
        tags: ['Web Design', 'HTML', 'CSS', 'JavaScript', 'UX/UI'],
        image: '../images/previews/inception-protection.png',
        url: 'posts/blot-world-case-study.html'
    },
    {
        id: 'cafemex-branding',
        title: 'Café Mexicali: Crafting a Vibrant Restaurant Identity',
        excerpt: 'How I designed a complete brand identity system for a Californian-Mexican fusion restaurant, from concept to final deliverables.',
        date: '2025-01-10',
        category: 'case-study',
        tags: ['Branding', 'Identity Design', 'Affinity Designer', 'Visual Design'],
        image: '../images/previews/cafemex-preview.jpg',
        url: 'posts/cafemex-case-study.html'
    },
    {
        id: 'photography-timeline',
        title: 'Photography Through Time: Building an Interactive Timeline',
        excerpt: 'The story behind creating an immersive photography gallery with a unique timeline interface to showcase moments captured through the years.',
        date: '2025-01-05',
        category: 'case-study',
        tags: ['Photography', 'Web Development', 'Interactive Design'],
        image: '../images/previews/photography-preview.jpg',
        url: 'posts/photography-case-study.html'
    }
];

// State Management
const BlogState = {
    currentFilter: 'all',
    searchQuery: '',
    filteredPosts: [...blogPosts]
};

// Initialize Blog
document.addEventListener('DOMContentLoaded', () => {
    initializeBlog();
    setupEventListeners();
    renderBlogPosts();
    updatePostCounter();
});

// Initialize Blog
function initializeBlog() {
    BlogState.filteredPosts = [...blogPosts];
}

// Setup Event Listeners
function setupEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => handleFilterClick(btn));
    });

    // Search input
    const searchInput = document.getElementById('blog-search');
    searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
}

// Handle Filter Click
function handleFilterClick(button) {
    // Update active state
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');

    // Update filter state
    BlogState.currentFilter = button.dataset.filter;

    // Re-filter and render
    applyFilters();
}

// Handle Search
function handleSearch(query) {
    BlogState.searchQuery = query.toLowerCase();
    applyFilters();
}

// Apply Filters
function applyFilters() {
    BlogState.filteredPosts = blogPosts.filter(post => {
        // Filter by category
        const categoryMatch = BlogState.currentFilter === 'all' || post.category === BlogState.currentFilter;

        // Filter by search query
        const searchMatch = BlogState.searchQuery === '' ||
            post.title.toLowerCase().includes(BlogState.searchQuery) ||
            post.excerpt.toLowerCase().includes(BlogState.searchQuery) ||
            post.tags.some(tag => tag.toLowerCase().includes(BlogState.searchQuery));

        return categoryMatch && searchMatch;
    });

    renderBlogPosts();
    updatePostCounter();
}

// Render Blog Posts
function renderBlogPosts() {
    const blogGrid = document.getElementById('blog-grid');
    const noResults = document.getElementById('no-results');

    if (BlogState.filteredPosts.length === 0) {
        blogGrid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    // Sort by date (newest first)
    const sortedPosts = [...BlogState.filteredPosts].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    blogGrid.innerHTML = sortedPosts.map(post => createBlogCard(post)).join('');
}

// Create Blog Card HTML
function createBlogCard(post) {
    const formattedDate = formatDate(post.date);
    const categoryLabel = getCategoryLabel(post.category);

    return `
        <a href="${post.url}" class="blog-card" data-post-id="${post.id}">
            <div class="blog-card-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
            </div>
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <span class="blog-card-date">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${formattedDate}
                    </span>
                    <span class="blog-card-category">${categoryLabel}</span>
                </div>
                <h2 class="blog-card-title">${post.title}</h2>
                <p class="blog-card-excerpt">${post.excerpt}</p>
                <div class="blog-card-tags">
                    ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
                </div>
                <span class="blog-card-read-more">
                    Read more
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </span>
            </div>
        </a>
    `;
}

// Update Post Counter
function updatePostCounter() {
    document.getElementById('visible-posts').textContent = BlogState.filteredPosts.length;
    document.getElementById('total-posts').textContent = blogPosts.length;
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Get Category Label
function getCategoryLabel(category) {
    const labels = {
        'case-study': 'Case Study',
        'tutorial': 'Tutorial',
        'thoughts': 'Thoughts'
    };
    return labels[category] || category;
}
