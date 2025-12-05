import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBookmarks, getHistory, getRatings, getStatuses } from '../api/backend';
import { getManga, getCoverUrl, getTitle } from '../api/mangadex';
import { BookMarked, History, Star, User } from 'lucide-react';
import Layout from '../components/Layout';
import { ProfileSkeleton } from '../components/Skeleton';

export default function Profile() {
    const { user, loading: authLoading } = useAuth();
    const [statuses, setStatuses] = useState([]);
    const [history, setHistory] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [mangaCache, setMangaCache] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        Promise.all([getStatuses(), getHistory(), getRatings()])
            .then(async ([s, h, r]) => {
                setStatuses(s);
                setHistory(h);
                setRatings(r);

                // Fetch manga details
                const ids = [...new Set([...s.map(x => x.manga_id), ...h.map(x => x.manga_id), ...r.map(x => x.manga_id)])];
                const cache = {};
                // Batch requests in chunks of 20
                for (let i = 0; i < ids.length; i += 20) {
                    const chunk = ids.slice(i, i + 20);
                    await Promise.all(chunk.map(async id => {
                        try {
                            const res = await getManga(id);
                            if (res.data) cache[id] = res.data;
                        } catch (e) { console.error(e); }
                    }));
                }
                setMangaCache(cache);
            })
            .finally(() => setLoading(false));
    }, [user]);

    if (authLoading) return <Layout><ProfileSkeleton /></Layout>;
    if (!user) return <Navigate to="/login" />;
    if (loading) return <Layout><ProfileSkeleton /></Layout>;

    const MangaItem = ({ mangaId, subtitle }) => {
        const manga = mangaCache[mangaId];
        if (!manga) return (
            <div className="flex items-center gap-4 p-3 animate-pulse">
                <div className="w-16 h-24 bg-surface-hover rounded-lg" />
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-surface-hover rounded w-3/4" />
                    <div className="h-3 bg-surface-hover rounded w-1/2" />
                </div>
            </div>
        );

        const cover = getCoverUrl(manga);
        const title = getTitle(manga);

        return (
            <Link to={`/manga/${mangaId}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-hover transition-colors group">
                <img src={cover} alt={title} className="w-16 h-24 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform" />
                <div>
                    <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>
                    {subtitle && <div className="text-sm text-muted mt-1">{subtitle}</div>}
                </div>
            </Link>
        );
    };

    const STATUS_LABELS = {
        planned: 'В планах',
        reading: 'Читаю',
        completed: 'Прочитано',
        dropped: 'Брошено',
        on_hold: 'Отложено'
    };

    return (
        <Layout>
            <div className="flex items-center gap-4 mb-8 bg-surface p-6 rounded-2xl border border-border">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <User size={40} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{user.username}</h1>
                    <p className="text-muted">{user.email}</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="bg-surface rounded-2xl border border-border overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-border flex items-center gap-2 font-bold text-lg shrink-0">
                        <BookMarked className="text-blue-400" />
                        Мои списки ({statuses.length})
                    </div>
                    <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
                        {statuses.length > 0 ? (
                            statuses.map(s => (
                                <MangaItem
                                    key={s.id}
                                    mangaId={s.manga_id}
                                    subtitle={<span className="capitalize text-primary">{STATUS_LABELS[s.status] || s.status}</span>}
                                />
                            ))
                        ) : (
                            <div className="p-4 text-center text-muted">Список пуст</div>
                        )}
                    </div>
                </div>

                <div className="bg-surface rounded-2xl border border-border overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-border flex items-center gap-2 font-bold text-lg shrink-0">
                        <History className="text-green-400" />
                        История ({history.length})
                    </div>
                    <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
                        {history.length > 0 ? (
                            history.map(h => (
                                <MangaItem
                                    key={h.id}
                                    mangaId={h.manga_id}
                                    subtitle={`Обновлено: ${new Date(h.updated_at).toLocaleDateString()}`}
                                />
                            ))
                        ) : (
                            <div className="p-4 text-center text-muted">История пуста</div>
                        )}
                    </div>
                </div>

                <div className="bg-surface rounded-2xl border border-border overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-border flex items-center gap-2 font-bold text-lg shrink-0">
                        <Star className="text-yellow-400" />
                        Оценки ({ratings.length})
                    </div>
                    <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
                        {ratings.length > 0 ? (
                            ratings.map(r => (
                                <MangaItem
                                    key={r.id}
                                    mangaId={r.manga_id}
                                    subtitle={<div className="flex items-center gap-1 text-yellow-400"><Star size={12} fill="currentColor" /> {r.score}</div>}
                                />
                            ))
                        ) : (
                            <div className="p-4 text-center text-muted">Нет оценок</div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
