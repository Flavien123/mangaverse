import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-lg bg-surface border border-border hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft size={20} />
            </button>

            <span className="text-sm font-medium px-4">
                Страница {page}
            </span>

            <button
                onClick={() => onPageChange(page + 1)}
                disabled={!totalPages || page >= totalPages} 
                className="p-2 rounded-lg bg-surface border border-border hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
}
