// Blog functionality for agame.works
// Supports loading posts from local JSON or synced from TrueNAS

const Blog = {
    // Configuration - change this URL to your TrueNAS endpoint if syncing
    // For GitHub Pages, we use a local JSON file
    POSTS_URL: 'data/blog-posts.json',
    
    // Fallback posts if no data file exists
    defaultPosts: [
        {
            id: 'welcome-post',
            title: 'Welcome to My Blog',
            date: '2024-01-15',
            author: 'Agame7k',
            excerpt: 'This is the beginning of my personal blog where I\'ll be sharing my homelab adventures, development projects, and tech experiments.',
            content: 'Welcome to my blog! This space is dedicated to documenting my journey through the world of self-hosting, development, and technology experimentation. Stay tuned for updates about my TrueNAS setup, various coding projects, and lessons learned along the way.',
            tags: ['welcome', 'introduction'],
            image: null
        },
        {
            id: 'truenas-setup',
            title: 'Setting Up My TrueNAS Server',
            date: '2024-01-20',
            author: 'Agame7k',
            excerpt: 'A walkthrough of how I set up my home TrueNAS server for storage and self-hosted applications.',
            content: 'In this post, I\'ll walk through my TrueNAS setup process, including hardware selection, initial configuration, and the various services I\'m running. From media storage to Docker containers, there\'s a lot you can do with a home server.',
            tags: ['truenas', 'homelab', 'self-hosted'],
            image: null
        },
        {
            id: 'blog-sync-tutorial',
            title: 'Syncing Blog Posts from TrueNAS',
            date: '2024-01-25',
            author: 'Agame7k',
            excerpt: 'Learn how to set up automatic blog post syncing between your TrueNAS server and GitHub Pages.',
            content: 'This tutorial covers how to set up a system where blog posts written on your TrueNAS server are automatically synced to your GitHub Pages site. We\'ll use a combination of shell scripts, cron jobs, and the GitHub API.',
            tags: ['tutorial', 'truenas', 'github'],
            image: null
        }
    ],

    // Helper function to escape HTML
    escapeHtml: function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Format date for display
    formatDate: function(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Load blog posts
    loadPosts: async function() {
        const container = document.getElementById('blog-container');
        if (!container) return;

        try {
            // Try to fetch posts from JSON file
            const response = await fetch(this.POSTS_URL);
            
            let posts;
            if (response.ok) {
                posts = await response.json();
            } else {
                // Use default posts if file doesn't exist
                console.log('Blog data file not found, using default posts');
                posts = this.defaultPosts;
            }

            if (posts.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="icon">📝</div>
                        <h3>No Blog Posts Yet</h3>
                        <p>Check back soon for updates on projects and homelab adventures!</p>
                    </div>
                `;
                container.classList.remove('loading');
                return;
            }

            // Sort posts by date (newest first)
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Render blog grid
            let html = '<div class="blog-grid">';
            
            posts.forEach(post => {
                const formattedDate = this.formatDate(post.date);
                const imageHtml = post.image 
                    ? `<img src="${this.escapeHtml(post.image)}" alt="${this.escapeHtml(post.title)}" class="blog-card-image">`
                    : `<div class="blog-card-image"></div>`;

                html += `
                    <article class="blog-card">
                        ${imageHtml}
                        <div class="blog-card-content">
                            <div class="blog-card-meta">
                                <span>📅 ${formattedDate}</span>
                                <span>✍️ ${this.escapeHtml(post.author)}</span>
                            </div>
                            <h3><a href="blog-post.html?id=${this.escapeHtml(post.id)}">${this.escapeHtml(post.title)}</a></h3>
                            <p>${this.escapeHtml(post.excerpt)}</p>
                            <a href="blog-post.html?id=${this.escapeHtml(post.id)}" class="read-more">
                                Read more <span>→</span>
                            </a>
                        </div>
                    </article>
                `;
            });

            html += '</div>';
            container.innerHTML = html;
            container.classList.remove('loading');

        } catch (error) {
            console.error('Error loading blog posts:', error);
            // Fall back to default posts
            this.renderDefaultPosts(container);
        }
    },

    // Render default posts as fallback
    renderDefaultPosts: function(container) {
        const posts = this.defaultPosts;
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        let html = '<div class="blog-grid">';
        
        posts.forEach(post => {
            const formattedDate = this.formatDate(post.date);

            html += `
                <article class="blog-card">
                    <div class="blog-card-image"></div>
                    <div class="blog-card-content">
                        <div class="blog-card-meta">
                            <span>📅 ${formattedDate}</span>
                            <span>✍️ ${this.escapeHtml(post.author)}</span>
                        </div>
                        <h3><a href="blog-post.html?id=${this.escapeHtml(post.id)}">${this.escapeHtml(post.title)}</a></h3>
                        <p>${this.escapeHtml(post.excerpt)}</p>
                        <a href="blog-post.html?id=${this.escapeHtml(post.id)}" class="read-more">
                            Read more <span>→</span>
                        </a>
                    </div>
                </article>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
        container.classList.remove('loading');
    },

    // Simple markdown-like formatting (safe subset)
    formatContent: function(text) {
        if (!text) return '';
        
        // Escape HTML first for security
        let formatted = this.escapeHtml(text);
        
        // Convert double newlines to paragraphs
        formatted = formatted.split('\n\n').map(para => `<p>${para}</p>`).join('');
        
        // Convert single newlines to line breaks within paragraphs
        formatted = formatted.replace(/\n/g, '<br>');
        
        // Bold text: **text** or __text__
        formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');
        
        // Italic text: *text* or _text_
        formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/_(.+?)_/g, '<em>$1</em>');
        
        // Inline code: `code`
        formatted = formatted.replace(/`(.+?)`/g, '<code>$1</code>');
        
        return formatted;
    },

    // Load a single blog post
    loadPost: async function(postId) {
        const container = document.getElementById('blog-post-container');
        if (!container) return;

        try {
            const response = await fetch(this.POSTS_URL);
            let posts;
            
            if (response.ok) {
                posts = await response.json();
            } else {
                posts = this.defaultPosts;
            }

            const post = posts.find(p => p.id === postId);

            if (!post) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="icon">🔍</div>
                        <h3>Post Not Found</h3>
                        <p>The blog post you're looking for doesn't exist.</p>
                        <a href="blog.html" class="primary-btn" style="display: inline-block; margin-top: 1rem;">Back to Blog</a>
                    </div>
                `;
                return;
            }

            const formattedDate = this.formatDate(post.date);
            const tagsHtml = post.tags 
                ? post.tags.map(tag => `<span class="skill-tag">${this.escapeHtml(tag)}</span>`).join('')
                : '';

            container.innerHTML = `
                <article class="blog-post">
                    <header class="blog-post-header">
                        <h1>${this.escapeHtml(post.title)}</h1>
                        <div class="blog-post-meta">
                            <span>📅 ${formattedDate}</span> • <span>✍️ ${this.escapeHtml(post.author)}</span>
                        </div>
                        ${tagsHtml ? `<div class="skills-grid" style="justify-content: center; margin-top: 1rem;">${tagsHtml}</div>` : ''}
                    </header>
                    <div class="blog-post-content">
                        ${this.formatContent(post.content)}
                    </div>
                    <div style="text-align: center; margin-top: 2rem;">
                        <a href="blog.html" class="secondary-btn" style="display: inline-block;">← Back to Blog</a>
                    </div>
                </article>
            `;

        } catch (error) {
            console.error('Error loading blog post:', error);
            container.innerHTML = `
                <div class="error-message">
                    <p>Failed to load blog post. Please try again later.</p>
                    <a href="blog.html">Back to Blog</a>
                </div>
            `;
        }
    }
};

// Initialize blog on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the blog list page
    if (document.getElementById('blog-container')) {
        Blog.loadPosts();
    }
    
    // Check if we're on a blog post page
    if (document.getElementById('blog-post-container')) {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        if (postId) {
            Blog.loadPost(postId);
        }
    }
});
