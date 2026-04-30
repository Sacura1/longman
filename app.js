'use strict';

const postsGrid      = document.getElementById('postsGrid');
const emptyState     = document.getElementById('emptyState');
const modalOverlay   = document.getElementById('modalOverlay');
const postForm       = document.getElementById('postForm');
const postCountEl    = document.getElementById('postCount');
const charCountEl    = document.getElementById('charCount');
const postContentEl  = document.getElementById('postContent');
const currentDateEl  = document.getElementById('current-date');

// Set header date
currentDateEl.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// Storage helpers
function loadPosts() {
    try {
        return JSON.parse(localStorage.getItem('dispatch_posts') || '[]');
    } catch {
        return [];
    }
}

function savePosts(posts) {
    localStorage.setItem('dispatch_posts', JSON.stringify(posts));
}

// Sanitize user text for safe innerHTML insertion
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
}

// Render all posts to the grid
function renderPosts() {
    const posts = loadPosts();
    postsGrid.innerHTML = '';

    const label = posts.length === 1 ? '1 Post Published' : `${posts.length} Posts Published`;
    postCountEl.textContent = label;

    if (posts.length === 0) {
        emptyState.classList.add('visible');
        return;
    }

    emptyState.classList.remove('visible');

    // Show newest first
    [...posts].reverse().forEach((post, i) => {
        const number = String(posts.length - i).padStart(3, '0');
        const card = document.createElement('article');
        card.className = 'post-card';
        card.style.animationDelay = `${i * 55}ms`;
        card.innerHTML = `
            <div class="post-card-number">DISPATCH #${number}</div>
            <h2 class="post-card-title">${escapeHtml(post.title)}</h2>
            <p class="post-card-content">${escapeHtml(post.content)}</p>
            <div class="post-card-meta">
                <span class="post-card-author">— ${escapeHtml(post.author)}</span>
                <span>${formatDate(post.date)}</span>
            </div>
        `;
        postsGrid.appendChild(card);
    });
}

// Modal open / close
function openModal() {
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('postTitle').focus(), 100);
}

function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

// Event listeners
document.getElementById('openModal').addEventListener('click', openModal);
document.getElementById('openModalEmpty').addEventListener('click', openModal);
document.getElementById('closeModal').addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Live character count
postContentEl.addEventListener('input', () => {
    charCountEl.textContent = `${postContentEl.value.length} / 1000`;
});

// Submit new post
postForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title   = document.getElementById('postTitle').value.trim();
    const author  = document.getElementById('postAuthor').value.trim();
    const content = postContentEl.value.trim();

    if (!title || !author || !content) return;

    const posts = loadPosts();
    posts.push({ id: Date.now(), title, author, content, date: new Date().toISOString() });
    savePosts(posts);

    postForm.reset();
    charCountEl.textContent = '0 / 1000';
    closeModal();
    renderPosts();

    // Scroll to grid so the new card is visible
    postsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Init
renderPosts();
