export interface Chapter {
    id: string;
    title: string;
    start_timestamp_seconds: number;
    end_timestamp_seconds: number;
    summary: string | null;
}

export interface ChapterListProps {
    chapters: Chapter[];
    currentTime: number;
    onChapterClick: (timestamp: number) => void;
    className?: string;
}

/**
 * Chapter list sidebar component
 */
export const ChapterList = ({
    chapters,
    currentTime,
    onChapterClick,
    className = '',
}: ChapterListProps) => {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const isChapterActive = (chapter: Chapter) => {
        return (
            currentTime >= chapter.start_timestamp_seconds &&
            currentTime < chapter.end_timestamp_seconds
        );
    };

    return (
        <div className={`bg-white border border-edubites-card-stroke rounded-lg overflow-hidden ${className}`}>
            <div className="p-4 border-b border-edubites-card-stroke">
                <h3 className="text-base font-semibold text-gray-900">Chapters</h3>
                <p className="text-sm text-gray-500">{chapters.length} chapters</p>
            </div>

            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {chapters.map((chapter, index) => (
                    <button
                        key={chapter.id}
                        onClick={() => onChapterClick(chapter.start_timestamp_seconds)}
                        className={`
              w-full text-left p-4 transition-colors
              ${isChapterActive(chapter)
                                ? 'bg-edubites-background border-l-4 border-edubites-primary'
                                : 'hover:bg-gray-50 border-l-4 border-transparent'
                            }
            `}
                    >
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-xs font-medium text-edubites-primary">
                                Chapter {index + 1}
                            </span>
                            <span className="text-xs text-gray-500">
                                {formatTime(chapter.start_timestamp_seconds)}
                            </span>
                        </div>
                        <h4
                            className={`text-sm font-medium mb-1 ${isChapterActive(chapter) ? 'text-edubites-primary' : 'text-gray-900'
                                }`}
                        >
                            {chapter.title}
                        </h4>
                        {chapter.summary && (
                            <p className="text-xs text-gray-600 line-clamp-2">{chapter.summary}</p>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

ChapterList.displayName = 'ChapterList';
