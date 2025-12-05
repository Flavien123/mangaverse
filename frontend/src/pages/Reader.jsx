import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChapterPages } from '../api/mangadex';
import { updateHistory } from '../api/backend';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Loader2, Settings, ChevronUp } from 'lucide-react';

export default function Reader() {
    const { mangaId, chapterId } = useParams();
    const { user } = useAuth();
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        getChapterPages(chapterId)
            .then(res => {
                const baseUrl = res.baseUrl;
                const hash = res.chapter?.hash;
                const data = res.chapter?.data || [];
                setPages(data.map(f => `${baseUrl}/data/${hash}/${f}`));
            })
            .finally(() => setLoading(false));
    }, [chapterId]);

    useEffect(() => {
        if (user && pages.length) {
            updateHistory({ manga_id: mangaId, chapter_id: chapterId, page: 0 }).catch(() => { });
        }
    }, [user, mangaId, chapterId, pages.length]);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const currentProgress = (window.scrollY / totalHeight) * 100;
            setProgress(currentProgress);

            if (window.scrollY > 100) setShowControls(false);
            else setShowControls(true);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-black text-white">
            <Loader2 className="w-10 h-10 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#111]" onClick={() => setShowControls(!showControls)}>
            {/* Top Bar */}
            <div className={`fixed top-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-md flex items-center justify-between z-50 transition-transform duration-300 ${showControls ? 'translate-y-0' : '-translate-y-full'}`}>
                <Link to={`/manga/${mangaId}`} className="flex items-center gap-2 text-white hover:text-primary transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-medium">Назад</span>
                </Link>
                <span className="text-sm text-gray-400">{pages.length} страниц</span>
                <button className="p-2 text-white hover:text-primary">
                    <Settings size={20} />
                </button>
            </div>

            {/* Pages */}
            <div className="max-w-3xl mx-auto flex flex-col items-center py-20 gap-2">
                {pages.map((url, i) => (
                    <img
                        key={i}
                        src={url}
                        alt={`Page ${i + 1}`}
                        loading="lazy"
                        className="w-full h-auto shadow-2xl"
                    />
                ))}
            </div>

            {/* Bottom Progress Bar */}
            <div className="fixed bottom-0 left-0 right-0 h-1 bg-gray-800 z-50">
                <div
                    className="h-full bg-primary transition-all duration-100"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Scroll to top */}
            <button
                onClick={(e) => { e.stopPropagation(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`fixed bottom-8 right-8 p-3 bg-primary text-white rounded-full shadow-lg transition-all duration-300 ${showControls || progress > 10 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
                <ChevronUp size={24} />
            </button>
        </div>
    );
}
