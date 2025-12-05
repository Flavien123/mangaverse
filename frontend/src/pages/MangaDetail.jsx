import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getManga, getChapters, getCoverUrl, getTitle, getStatistics } from '../api/mangadex';
import { addBookmark, removeBookmark, getBookmarks, updateStatus, getStatuses, addRating, getRatings } from '../api/backend';
import { useAuth } from '../context/AuthContext';
import { Star, BookMarked, BookOpen, Calendar, User, Check, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import Skeleton from '../components/Skeleton';
import Layout from '../components/Layout';

const STATUS_OPTIONS = [
    { value: 'planned', label: 'В планах', color: 'bg-gray-500' },
    { value: 'reading', label: 'Читаю', color: 'bg-blue-500' },
    { value: 'completed', label: 'Прочитано', color: 'bg-green-500' },
    { value: 'dropped', label: 'Брошено', color: 'bg-red-500' },
    { value: 'on_hold', label: 'Отложено', color: 'bg-yellow-500' },
];

export default function MangaDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [manga, setManga] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [stats, setStats] = useState(null);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusOpen, setStatusOpen] = useState(false);

    const [userRating, setUserRating] = useState(null);

    useEffect(() => {
        Promise.all([
            getManga(id),
            getChapters(id, 'en'), // Fetch English chapters
            getStatistics([id]),
        ]).then(async ([mangaRes, chaptersRes, statsRes]) => {
            setManga(mangaRes.data);

            // Handle chapters: deduplicate by chapter number
            const rawChapters = chaptersRes.data || [];
            const uniqueChapters = [];
            const seen = new Set();

            rawChapters.forEach(ch => {
                const num = ch.attributes.chapter;
                if (!seen.has(num)) {
                    seen.add(num);
                    uniqueChapters.push(ch);
                }
            });

            // If no RU chapters, maybe fetch EN? For now just show what we got
            if (uniqueChapters.length === 0 && rawChapters.length === 0) {
                // Optional: fetch EN fallback
            }

            setChapters(uniqueChapters);
            setStats(statsRes.statistics?.[id]);
        }).finally(() => setLoading(false));

        if (user) {
            getStatuses().then(res => {
                const s = res.find(x => x.manga_id === id);
                if (s) setStatus(s.status);
            }).catch(() => { });

            getRatings().then(res => {
                const r = res.find(x => x.manga_id === id);
                if (r) setUserRating(r.score);
            }).catch(() => { });
        }
    }, [id, user]);

    const handleStatusChange = async (newStatus) => {
        try {
            await updateStatus(id, newStatus);
            setStatus(newStatus);
            setStatusOpen(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleRating = async (score) => {
        try {
            await addRating(id, score);
            setUserRating(score);
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return (
        <Layout>
            <div className="h-64 md:h-96 bg-surface-hover animate-pulse -mx-4 md:-mx-6 lg:-mx-8 -mt-6" />
            <div className="relative z-10 -mt-32 md:-mt-48">
                <div className="flex flex-col md:flex-row gap-8">
                    <Skeleton className="w-48 md:w-72 h-[300px] md:h-[400px] shrink-0" />
                    <div className="flex-1 space-y-6 pt-12 md:pt-48">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        </Layout>
    );

    if (!manga) return <Layout><div className="text-center py-20">Манга не найдена</div></Layout>;

    const cover = getCoverUrl(manga, 512);
    const title = getTitle(manga);
    const desc = manga.attributes?.description?.en || manga.attributes?.description?.ru || '';
    const author = manga.relationships?.find(r => r.type === 'author')?.attributes?.name;
    const tags = manga.attributes?.tags || [];
    const mangaStatus = manga.attributes?.status;
    const year = manga.attributes?.year;

    const currentStatusObj = STATUS_OPTIONS.find(s => s.value === status);

    return (
        <Layout>
            {/* Backdrop */}
            <div className="h-64 md:h-96 relative overflow-hidden -mx-4 md:-mx-6 lg:-mx-8 -mt-6">
                <img src={cover} className="w-full h-full object-cover blur-xl opacity-30" alt="backdrop" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
            </div>

            <div className="relative z-10 -mt-32 md:-mt-48">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Cover & Actions */}
                    <div className="w-48 md:w-72 mx-auto md:mx-0 shrink-0 flex flex-col gap-4">
                        <img
                            src={cover}
                            alt={title}
                            className="w-full rounded-xl shadow-2xl shadow-black/50 border border-border"
                        />

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setStatusOpen(!statusOpen)}
                                    className={clsx(
                                        "btn w-full justify-between",
                                        currentStatusObj ? "bg-surface border-primary text-primary" : "btn-primary"
                                    )}
                                >
                                    <span className="flex items-center gap-2">
                                        {currentStatusObj ? (
                                            <><Check size={18} /> {currentStatusObj.label}</>
                                        ) : (
                                            <><BookMarked size={18} /> Добавить в список</>
                                        )}
                                    </span>
                                    <ChevronDown size={16} className={clsx("transition-transform", statusOpen && "rotate-180")} />
                                </button>

                                {statusOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
                                        {STATUS_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => handleStatusChange(opt.value)}
                                                className={clsx(
                                                    "w-full text-left px-4 py-3 hover:bg-surface-hover flex items-center gap-3 transition-colors",
                                                    status === opt.value && "text-primary bg-primary/5"
                                                )}
                                            >
                                                <div className={clsx("w-2 h-2 rounded-full", opt.color)} />
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-primary w-full">
                                Войти чтобы добавить
                            </Link>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold mb-2 text-shadow">{title}</h1>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                                {author && <span className="flex items-center gap-1"><User size={14} /> {author}</span>}
                                {year && <span className="flex items-center gap-1"><Calendar size={14} /> {year}</span>}
                                <span className="capitalize px-2 py-0.5 rounded bg-surface border border-border">{mangaStatus}</span>
                            </div>
                        </div>

                        {stats?.rating && (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={20} fill={i < Math.round(stats.rating.average / 2) ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <span className="text-xl font-bold">{stats.rating.average?.toFixed(1)}</span>
                                    <span className="text-muted text-sm">
                                        ({stats.rating.distribution ? Object.values(stats.rating.distribution).reduce((a, b) => a + b, 0) : 0})
                                    </span>
                                </div>

                                {user && (
                                    <div className="flex items-center gap-1 ml-4 bg-surface px-3 py-1 rounded-lg border border-border">
                                        <span className="text-sm text-muted mr-2">Ваша оценка:</span>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                                            <button
                                                key={score}
                                                onClick={() => handleRating(score)}
                                                className={clsx(
                                                    "w-6 h-6 flex items-center justify-center rounded hover:bg-surface-hover transition-colors text-xs font-medium",
                                                    userRating === score ? "bg-primary text-white" : "text-muted"
                                                )}
                                                title={`Оценить на ${score}`}
                                            >
                                                {score}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {tags.map(t => (
                                <span key={t.id} className="px-3 py-1 rounded-full bg-surface-hover text-xs font-medium text-gray-300 border border-border">
                                    {t.attributes?.name?.en}
                                </span>
                            ))}
                        </div>

                        <p className="text-gray-300 leading-relaxed max-w-4xl bg-surface/30 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
                            {desc}
                        </p>
                    </div>
                </div>

                {/* Chapters */}
                <div className="mt-12 max-w-4xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <BookOpen className="text-primary" />
                            Главы ({chapters.length})
                        </h2>
                    </div>

                    <div className="bg-surface rounded-xl border border-border overflow-hidden">
                        {chapters.length > 0 ? (
                            chapters.map((ch, i) => (
                                <Link
                                    key={ch.id}
                                    to={`/read/${id}/${ch.id}`}
                                    className={clsx(
                                        "flex items-center justify-between p-4 hover:bg-surface-hover transition-colors border-b border-border last:border-0",
                                        i % 2 === 0 ? "bg-surface" : "bg-surface/50"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-muted font-mono w-20">
                                            Гл. {ch.attributes.chapter}
                                        </span>
                                        <span className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                                            {ch.attributes.title || `Глава ${ch.attributes.chapter}`}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted shrink-0">
                                        {ch.attributes.publishAt ? new Date(ch.attributes.publishAt).toLocaleDateString() : 'Unknown'}
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="p-8 text-center text-muted">
                                Нет глав на русском языке
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
