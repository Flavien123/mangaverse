import { clsx } from 'clsx';

export default function Skeleton({ className, ...props }) {
    return (
        <div
            className={clsx("animate-pulse bg-surface-hover rounded-xl", className)}
            {...props}
        />
    );
}

export function MangaCardSkeleton() {
    return (
        <div className="bg-surface rounded-xl overflow-hidden border border-transparent">
            <div className="aspect-[2/3] bg-surface-hover animate-pulse" />
            <div className="p-3 space-y-2">
                <div className="h-4 bg-surface-hover rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-surface-hover rounded w-1/2 animate-pulse" />
            </div>
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 py-8">
            <div className="flex items-center gap-4 mb-8 bg-surface p-6 rounded-2xl border border-border">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-surface rounded-2xl border border-border overflow-hidden flex flex-col h-[600px]">
                        <div className="p-4 border-b border-border flex items-center gap-2">
                            <Skeleton className="h-6 w-32" />
                        </div>
                        <div className="p-2 space-y-2">
                            {[1, 2, 3, 4, 5].map(j => (
                                <div key={j} className="flex items-center gap-4 p-3">
                                    <Skeleton className="w-16 h-24 rounded-lg" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
