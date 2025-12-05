import { useState, useEffect } from 'react';
import { searchManga, getTags, getStatistics } from '../api/mangadex';
import MangaCard from '../components/MangaCard';
import { MangaCardSkeleton } from '../components/Skeleton';
import Pagination from '../components/Pagination';
import Layout from '../components/Layout';
import { Search, Filter, X } from 'lucide-react';
import { clsx } from 'clsx';

export default function Catalog() {
    const [manga, setManga] = useState([]);
    const [stats, setStats] = useState({});
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ status: '', demographic: '', tag: '' });
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 24;

    useEffect(() => {
        getTags().then(res => setTags(res.data || []));
    }, []);

    useEffect(() => {
        setPage(1);
    }, [search, filters]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(true);
            const offset = (page - 1) * limit;
            const params = {
                title: search || undefined,
                status: filters.status || undefined,
                demographic: filters.demographic || undefined,
                tags: filters.tag ? [filters.tag] : undefined,
                order: { rating: 'desc' },
                limit,
                offset
            };

            searchManga(params)
                .then(async (res) => {
                    setManga(res.data || []);
                    setTotal(res.total || 0);
                    const ids = res.data?.map(m => m.id) || [];
                    if (ids.length) {
                        const statsRes = await getStatistics(ids);
                        setStats(statsRes.statistics || {});
                    }
                })
                .finally(() => setLoading(false));
        }, 500);

        return () => clearTimeout(timer);
    }, [search, filters, page]);

    const genreTags = tags.filter(t => t.attributes?.group === 'genre').sort((a, b) => a.attributes.name.en.localeCompare(b.attributes.name.en));
    const totalPages = Math.ceil(total / limit);

    return (
        <Layout>
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                    <input
                        type="text"
                        placeholder="Поиск манги..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input pl-12"
                    />
                </div>
                <button
                    className={clsx("btn md:hidden", showFilters ? "btn-primary" : "btn-outline")}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={20} />
                    Фильтры
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters Sidebar - Mobile Drawer / Desktop Sidebar */}
                <div className={clsx(
                    "fixed inset-0 z-40 bg-background/95 backdrop-blur-sm p-4 lg:static lg:bg-transparent lg:p-0 lg:w-64 lg:block shrink-0 transition-all duration-300",
                    showFilters ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}>
                    <div className="bg-surface p-6 rounded-xl border border-border space-y-6 sticky top-24 h-full lg:h-auto overflow-y-auto">
                        <div className="flex items-center justify-between lg:hidden mb-4">
                            <h3 className="font-bold text-lg">Фильтры</h3>
                            <button onClick={() => setShowFilters(false)}><X /></button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Статус</label>
                            <select
                                className="input py-2"
                                value={filters.status}
                                onChange={e => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="">Любой</option>
                                <option value="ongoing">Онгоинг</option>
                                <option value="completed">Завершено</option>
                                <option value="hiatus">Хиатус</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Демография</label>
                            <select
                                className="input py-2"
                                value={filters.demographic}
                                onChange={e => setFilters({ ...filters, demographic: e.target.value })}
                            >
                                <option value="">Любая</option>
                                <option value="shounen">Сёнен</option>
                                <option value="shoujo">Сёдзё</option>
                                <option value="seinen">Сейнен</option>
                                <option value="josei">Дзёсей</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Жанр</label>
                            <select
                                className="input py-2"
                                value={filters.tag}
                                onChange={e => setFilters({ ...filters, tag: e.target.value })}
                            >
                                <option value="">Любой</option>
                                {genreTags.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.attributes?.name?.en}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {(filters.status || filters.demographic || filters.tag) && (
                            <button
                                onClick={() => setFilters({ status: '', demographic: '', tag: '' })}
                                className="btn btn-outline w-full text-sm"
                            >
                                <X size={16} /> Сбросить
                            </button>
                        )}

                        <button
                            className="btn btn-primary w-full lg:hidden mt-4"
                            onClick={() => setShowFilters(false)}
                        >
                            Применить
                        </button>
                    </div>
                </div>

                {/* Results */}
                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,200px)] justify-center gap-4 md:gap-6">
                            {[...Array(limit)].map((_, i) => <MangaCardSkeleton key={i} />)}
                        </div>
                    ) : manga.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,200px)] justify-center gap-4 md:gap-6">
                                {manga.map(m => (
                                    <MangaCard key={m.id} manga={m} rating={stats[m.id]?.rating?.average} />
                                ))}
                            </div>
                            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                        </>
                    ) : (
                        <div className="text-center py-20 text-muted">
                            Ничего не найдено
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
