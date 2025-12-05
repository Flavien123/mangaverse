import { API_BASE } from './config';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export async function login({ email, password }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
}

export async function register({ username, email, password }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
}

export async function getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to get user');
    return res.json();
}

// Bookmarks
export async function getBookmarks() {
    const res = await fetch(`${API_BASE}/user/bookmarks`, { headers: getHeaders() });
    return res.json();
}

export async function addBookmark(mangaId) {
    const res = await fetch(`${API_BASE}/user/bookmarks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ manga_id: mangaId })
    });
    return res.json();
}

export async function removeBookmark(mangaId) {
    await fetch(`${API_BASE}/user/bookmarks/${mangaId}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
}

// History
export async function getHistory() {
    const res = await fetch(`${API_BASE}/user/history`, { headers: getHeaders() });
    return res.json();
}

export async function updateHistory({ manga_id, chapter_id, page }) {
    const res = await fetch(`${API_BASE}/user/history`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ manga_id, chapter_id, page })
    });
    return res.json();
}

// Ratings
export async function getRatings() {
    const res = await fetch(`${API_BASE}/user/ratings`, { headers: getHeaders() });
    return res.json();
}

export async function addRating(mangaId, score) {
    const res = await fetch(`${API_BASE}/user/ratings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ manga_id: mangaId, score })
    });
    return res.json();
}

// Status
export async function getStatuses() {
    const res = await fetch(`${API_BASE}/user/status`, { headers: getHeaders() });
    return res.json();
}

export async function updateStatus(mangaId, status) {
    const res = await fetch(`${API_BASE}/user/status`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ manga_id: mangaId, status })
    });
    return res.json();
}
