/**
 * PiiBlog Engine - Modern Markdown-to-Blog System
 */

const CONFIG = {
    postsPath: 'posts/posts.json',
    contentDir: 'posts/',
};

// State management
let allPosts = [];
let currentCategory = 'All';

async function init() {
    try {
        const response = await fetch(CONFIG.postsPath);
        allPosts = await response.json();
        
        // Listen for route changes
        window.addEventListener('hashchange', handleRouteChange);
        
        // Initial route
        handleRouteChange();
    } catch (error) {
        console.error('Failed to initialize blog engine:', error);
    }
}

function handleRouteChange() {
    const hash = window.location.hash || '#/';
    
    if (hash === '#/') {
        renderLanding();
    } else if (hash.startsWith('#/category/')) {
        const category = decodeURIComponent(hash.split('/')[2]);
        renderLanding(category);
    } else if (hash.startsWith('#/post/')) {
        const postId = hash.split('/')[2];
        renderPost(postId);
    }
}

function renderLanding(category = 'All') {
    const main = document.getElementById('main-content');
    currentCategory = category;
    
    const filteredPosts = category === 'All' 
        ? allPosts 
        : allPosts.filter(p => p.category === category);
    
    const featured = filteredPosts.find(p => p.featured) || filteredPosts[0];
    const rest = filteredPosts.filter(p => p.id !== featured?.id);
    
    // Build categories list
    const categories = ['All', ...new Set(allPosts.map(p => p.category))];
    
    main.innerHTML = `
        <section class="hero animate-in">
            <div class="container">
                <h1>Catatan Pii</h1>
                <p>Kumpulan pikiran, tutorial, dan dokumentasi perjalanan teknologi saya.</p>
            </div>
        </section>

        <div class="container">
            <div class="filters animate-in">
                ${categories.map(cat => `
                    <button class="filter-btn ${cat === category ? 'active' : ''}" 
                            onclick="location.hash = '#/category/${cat}'">${cat}</button>
                `).join('')}
            </div>

            ${renderFeatured(featured)}

            <div class="post-grid">
                ${rest.map(post => renderPostCard(post)).join('')}
            </div>
        </div>
    `;
}

function renderFeatured(post) {
    if (!post) return '';
    return `
        <div class="featured-card animate-in" onclick="location.hash = '#/post/${post.id}'" style="cursor: pointer;">
            <div class="featured-img" style="background-image: url('${post.image}')"></div>
            <div class="featured-content">
                <span class="badge">Featured Post</span>
                <h2>${post.title}</h2>
                <div class="post-meta">${post.date} • ${post.category}</div>
                <p class="post-summary">${post.summary}</p>
                <div class="tag-list">
                    ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderPostCard(post) {
    return `
        <article class="post-card animate-in" onclick="location.hash = '#/post/${post.id}'" style="cursor: pointer;">
            <div class="post-meta">${post.date} • ${post.category}</div>
            <h3>${post.title}</h3>
            <p class="post-summary">${post.summary}</p>
            <div class="tag-list">
                ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
            </div>
        </article>
    `;
}

async function renderPost(postId) {
    const main = document.getElementById('main-content');
    const post = allPosts.find(p => p.id === postId);
    
    if (!post) {
        main.innerHTML = `<h1>Post not found</h1><a href="#/">Back to home</a>`;
        return;
    }

    // Show loading state
    main.innerHTML = `<div class="container" style="padding: 10rem 0; text-align: center;">Loading...</div>`;

    try {
        const response = await fetch(post.file);
        const markdown = await response.text();
        const htmlContent = marked.parse(markdown);

        main.innerHTML = `
            <article class="animate-in">
                <header class="article-header">
                    <div class="container">
                        <span class="badge">${post.category}</span>
                        <h1>${post.title}</h1>
                        <div class="post-meta">${post.date}</div>
                    </div>
                </header>
                <div class="container">
                    <div class="article-content">
                        ${htmlContent}
                        <div style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--glass-border);">
                            <a href="#/" class="logo">← Back to Blog</a>
                        </div>
                    </div>
                </div>
            </article>
        `;
        window.scrollTo(0, 0);
    } catch (error) {
        main.innerHTML = `<h1>Error loading post</h1><a href="#/">Back to home</a>`;
    }
}

window.onload = init;
