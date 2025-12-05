import { useState, useEffect } from 'react';
import { getLatestManga, getStatistics } from '../api/mangadex';
import MangaCard from '../components/MangaCard';
import { MangaCardSkeleton } from '../components/Skeleton';
import Pagination from '../components/Pagination';
import Layout from '../components/Layout';
import { Flame } from 'lucide-react';

export default function Home() {
    const [manga, setManga] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const limit = 24;

    useEffect(() => {
        setLoading(true);
        const offset = (page - 1) * limit;

        getLatestManga(limit, offset)
            .then(async (res) => {
                setManga(res.data || []);
                const ids = res.data?.map(m => m.id) || [];
                if (ids.length) {
                    const statsRes = await getStatistics(ids);
                    setStats(statsRes.statistics || {});
                }
            })
            .finally(() => setLoading(false));
    }, [page]);

    return (
        <Layout>
            {/* Hero Section - Full width override */}
            <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 mb-8 bg-surface border-b border-border py-12 px-4 md:px-8">
                <div className="max-w-screen-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                        Добро пожаловать
                    </h1>
                    <p className="text-muted text-lg max-w-2xl">
                        Читайте любимую мангу бесплатно и без рекламы. Огромная библиотека, удобный ридер и синхронизация на всех устройствах.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
                <Flame className="text-orange-500" />
                <h2 className="text-2xl font-bold">Новые главы</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,200px)] justify-center gap-4 md:gap-6">
                {loading ? (
                    [...Array(limit)].map((_, i) => <MangaCardSkeleton key={i} />)
                ) : (
                    manga.map(m => (
                        <MangaCard key={m.id} manga={m} rating={stats[m.id]?.rating?.average} />
                    ))
                )}
            </div>

            {!loading && (
                <Pagination
                    page={page}
                    totalPages={100}
                    onPageChange={setPage}
                />
            )}
        </Layout>
    );
}
