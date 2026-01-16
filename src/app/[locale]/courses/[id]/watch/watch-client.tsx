'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Video {
    id: string;
    courseId: string;
    title: string;
    description: string | null;
    youtubeVideoId: string;
    order: number | null;
    duration: number | null;
}

interface WatchPageClientProps {
    currentVideo: Video;
    videos: Video[];
    courseId: string;
    locale: string;
}

export function WatchPageClient({
    currentVideo,
    videos,
    courseId,
    locale,
}: WatchPageClientProps) {
    const router = useRouter();
    const currentIndex = videos.findIndex(v => v.id === currentVideo.id);
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < videos.length - 1;

    const translations = {
        fr: {
            previous: 'Précédent',
            next: 'Suivant',
        },
        en: {
            previous: 'Previous',
            next: 'Next',
        },
    };

    const t = translations[locale as keyof typeof translations] || translations.en;

    const goToVideo = (videoId: string) => {
        router.push(`/${locale}/courses/${courseId}/watch?video=${videoId}`);
    };

    return (
        <div>
            {/* YouTube Player */}
            <div className="aspect-video bg-black">
                <iframe
                    src={`https://www.youtube.com/embed/${currentVideo.youtubeVideoId}?rel=0&modestbranding=1`}
                    title={currentVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
                <button
                    onClick={() => hasPrevious && goToVideo(videos[currentIndex - 1].id)}
                    disabled={!hasPrevious}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${hasPrevious
                            ? 'text-white hover:bg-gray-700'
                            : 'text-gray-600 cursor-not-allowed'
                        }`}
                >
                    <ChevronLeft className="w-5 h-5" />
                    {t.previous}
                </button>

                <span className="text-gray-400 text-sm">
                    {currentIndex + 1} / {videos.length}
                </span>

                <button
                    onClick={() => hasNext && goToVideo(videos[currentIndex + 1].id)}
                    disabled={!hasNext}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${hasNext
                            ? 'text-white hover:bg-gray-700'
                            : 'text-gray-600 cursor-not-allowed'
                        }`}
                >
                    {t.next}
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
