const API_BASE = 'https://api.mangadex.org';

export async function getLatestManga(limit = 20, offset = 0) {
    const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        'order[latestUploadedChapter]': 'desc',
        'includes[]': 'cover_art',
        'contentRating[]': 'safe',
        'contentRating[]': 'suggestive',
        hasAvailableChapters: 'true',
    });
    const res = await fetch(`${API_BASE}/manga?${params}`);
    return res.json();
}

export async function searchManga({ title, tags, status, demographic, limit = 20, offset = 0, order = { rating: 'desc' } }) {
    const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        'includes[]': 'cover_art',
        hasAvailableChapters: 'true',
    });

    if (title) params.set('title', title);
    if (status) params.set('status[]', status);
    if (demographic) params.set('publicationDemographic[]', demographic);
    if (tags?.length) tags.forEach(t => params.append('includedTags[]', t));

    Object.entries(order).forEach(([k, v]) => params.set(`order[${k}]`, v));

    const res = await fetch(`${API_BASE}/manga?${params}`);
    return res.json();
}

export async function getManga(id) {
    const params = new URLSearchParams({
        'includes[]': 'cover_art',
    });
    params.append('includes[]', 'author');
    params.append('includes[]', 'artist');
    const res = await fetch(`${API_BASE}/manga/${id}?${params}`);
    return res.json();
}

export async function getChapters(mangaId, lang = 'en') {
    const params = new URLSearchParams({
        limit: '500',
        'translatedLanguage[]': lang,
        'order[chapter]': 'desc',
        'includes[]': 'scanlation_group',
    });
    // Fallback to English if no Russian? For now let's strict to requested lang or default
    const res = await fetch(`${API_BASE}/manga/${mangaId}/feed?${params}`);
    return res.json();
}

export async function getChapterPages(chapterId) {
    const res = await fetch(`${API_BASE}/at-home/server/${chapterId}`);
    return res.json();
}

export async function getTags() {
    const res = await fetch(`${API_BASE}/manga/tag`);
    return res.json();
}

export async function getStatistics(mangaIds) {
    const params = new URLSearchParams();
    mangaIds.forEach(id => params.append('manga[]', id));
    const res = await fetch(`${API_BASE}/statistics/manga?${params}`);
    return res.json();
}

export function getCoverUrl(manga, size = 256) {
    const cover = manga.relationships?.find(r => r.type === 'cover_art');
    if (!cover?.attributes?.fileName) return null;
    return `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}.${size}.jpg`;
}

export function getTitle(manga) {
    const t = manga.attributes?.title;
    return t?.en || t?.['ja-ro'] || Object.values(t || {})[0] || 'Unknown';
}
