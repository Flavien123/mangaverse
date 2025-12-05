import { Link } from 'react-router-dom';
import { getCoverUrl, getTitle } from '../api/mangadex';
import { Star } from 'lucide-react';

export default function MangaCard({ manga, rating }) {
    const cover = getCoverUrl(manga);
    const title = getTitle(manga);

    return (
        <Link to={`/manga/${manga.id}`} className="group relative bg-surface rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-[2/3] overflow-hidden relative">
                <img
                    src={cover || '/placeholder.jpg'}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {rating && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-yellow-400">
                        <Star size={10} fill="currentColor" />
                        {rating.toFixed(1)}
                    </div>
                )}
            </div>
            <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors" title={title}>
                    {title}
                </h3>
            </div>
        </Link>
    );
}
