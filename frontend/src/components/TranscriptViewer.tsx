import { useEffect, useRef } from 'react';
import { Card } from './ui/Card';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export interface TranscriptViewerProps {
  transcript: string | null;
  currentTime: number;
  onTimestampClick?: (timestamp: number) => void;
  className?: string;
}

interface TranscriptSegment {
  text: string;
  startTime: number | null;
}

/**
 * Parses transcript text and extracts timestamp markers.
 * Supports formats like [00:30], [1:45], [01:30:00]
 */
function parseTranscript(transcript: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const timestampRegex = /\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]/g;

  let lastIndex = 0;
  let match;

  while ((match = timestampRegex.exec(transcript)) !== null) {
    // Add text before this timestamp
    if (match.index > lastIndex) {
      const textBefore = transcript.slice(lastIndex, match.index).trim();
      if (textBefore) {
        segments.push({ text: textBefore, startTime: null });
      }
    }

    // Parse timestamp
    const hours = match[3] ? parseInt(match[1], 10) : 0;
    const minutes = match[3] ? parseInt(match[2], 10) : parseInt(match[1], 10);
    const seconds = match[3] ? parseInt(match[3], 10) : parseInt(match[2], 10);
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    // Get text after timestamp until next timestamp or end
    const nextMatch = timestampRegex.exec(transcript);
    const endIndex = nextMatch ? nextMatch.index : transcript.length;
    timestampRegex.lastIndex = match.index + match[0].length; // Reset to continue from after current match

    const textAfter = transcript.slice(match.index + match[0].length, endIndex).trim();
    if (textAfter) {
      segments.push({ text: textAfter, startTime: totalSeconds });
    }

    lastIndex = endIndex;
  }

  // Add any remaining text
  if (lastIndex < transcript.length) {
    const remaining = transcript.slice(lastIndex).trim();
    if (remaining) {
      segments.push({ text: remaining, startTime: null });
    }
  }

  // If no timestamps found, split by paragraphs
  if (segments.length === 0) {
    const paragraphs = transcript.split(/\n\n+/).filter(p => p.trim());
    paragraphs.forEach(p => {
      segments.push({ text: p.trim(), startTime: null });
    });
  }

  return segments;
}

/**
 * Formats seconds into a timestamp string (MM:SS or HH:MM:SS)
 */
function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * TranscriptViewer component displays the transcript with clickable timestamps
 * and auto-scrolls to follow video playback.
 */
export const TranscriptViewer = ({
  transcript,
  currentTime,
  onTimestampClick,
  className = '',
}: TranscriptViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLDivElement>(null);

  const segments = transcript ? parseTranscript(transcript) : [];

  // Find the currently active segment based on video time
  const activeIndex = segments.findIndex((segment, index) => {
    if (segment.startTime === null) return false;
    const nextSegment = segments.slice(index + 1).find(s => s.startTime !== null);
    const endTime = nextSegment?.startTime ?? Infinity;
    return currentTime >= segment.startTime && currentTime < endTime;
  });

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeSegmentRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = activeSegmentRef.current;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // Only scroll if element is outside visible area
      if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  if (!transcript) {
    return (
      <Card padding="md" className={className}>
        <div className="flex items-center gap-2 mb-3">
          <DocumentTextIcon className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">Transcript</h3>
        </div>
        <p className="text-sm text-gray-500 text-center py-8">
          Transcript will be available after processing completes.
        </p>
      </Card>
    );
  }

  return (
    <Card padding="md" className={className}>
      <div className="flex items-center gap-2 mb-3">
        <DocumentTextIcon className="w-5 h-5 text-edubites-primary" />
        <h3 className="text-sm font-semibold text-gray-900">Transcript</h3>
      </div>

      <div
        ref={containerRef}
        className="max-h-96 overflow-y-auto space-y-3 pr-2"
      >
        {segments.map((segment, index) => {
          const isActive = index === activeIndex;
          const hasTimestamp = segment.startTime !== null;

          return (
            <div
              key={index}
              ref={isActive ? activeSegmentRef : null}
              className={`
                p-3 rounded-lg transition-all duration-200
                ${isActive
                  ? 'bg-edubites-background border border-edubites-primary/30'
                  : 'bg-gray-50 hover:bg-gray-100'
                }
                ${hasTimestamp && onTimestampClick ? 'cursor-pointer' : ''}
              `}
              onClick={() => {
                if (hasTimestamp && onTimestampClick && segment.startTime !== null) {
                  onTimestampClick(segment.startTime);
                }
              }}
            >
              {hasTimestamp && segment.startTime !== null && (
                <span className={`
                  text-xs font-mono px-2 py-0.5 rounded mr-2
                  ${isActive
                    ? 'bg-edubites-primary text-white'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {formatTimestamp(segment.startTime)}
                </span>
              )}
              <span className={`text-sm ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                {segment.text}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

TranscriptViewer.displayName = 'TranscriptViewer';
