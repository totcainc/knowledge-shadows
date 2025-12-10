import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { VideoPlayer, VideoPlayerHandle } from '../components/ui/VideoPlayer';
import { ChapterList } from '../components/ChapterList';
import { DecisionPointCard } from '../components/DecisionPointCard';
import { TranscriptViewer } from '../components/TranscriptViewer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useShadow, useChapters, useDecisionPoints, useRetryProcessing } from '../api/hooks';
import type { ShadowStatus } from '../api/types';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ShareIcon,
  BookmarkIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  LightBulbIcon,
  TagIcon,
  ExclamationCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getVideoUrl = (rawVideoUrl: string | null): string | null => {
  if (!rawVideoUrl) return null;
  if (rawVideoUrl.startsWith('http')) return rawVideoUrl;
  return `${API_BASE_URL}${rawVideoUrl}`;
};

/**
 * Shadow detail page - view a single Shadow with video, chapters, and decision points
 */
export const ShadowDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentTime, setCurrentTime] = useState(0);
  const videoPlayerRef = useRef<VideoPlayerHandle>(null);

  const { data: shadow, isLoading: shadowLoading, error: shadowError } = useShadow(id || '', { pollWhileProcessing: true });
  const { data: chapters = [] } = useChapters(id || '');
  const { data: decisionPoints = [] } = useDecisionPoints(id || '');
  const retryProcessing = useRetryProcessing();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChapterClick = (timestamp: number) => {
    videoPlayerRef.current?.seekTo(timestamp);
    setCurrentTime(timestamp);
  };

  const handleTimestampClick = (timestamp: number) => {
    videoPlayerRef.current?.seekTo(timestamp);
    setCurrentTime(timestamp);
  };

  const getStatusBadge = (status: ShadowStatus) => {
    switch (status) {
      case 'published':
        return <Badge color="green" size="sm">Published</Badge>;
      case 'ready_for_review':
        return <Badge color="blue" size="sm">Ready for Review</Badge>;
      case 'processing':
        return <Badge color="yellow" size="sm">Processing</Badge>;
      case 'capturing':
        return <Badge color="purple" size="sm">Capturing</Badge>;
      case 'failed':
        return <Badge color="red" size="sm">Failed</Badge>;
      case 'archived':
        return <Badge color="gray" size="sm">Archived</Badge>;
      default:
        return <Badge color="gray" size="sm">{status}</Badge>;
    }
  };

  // Loading state
  if (shadowLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="aspect-video bg-gray-200 rounded-lg" />
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (shadowError || !shadow) {
    return (
      <div className="p-8">
        <Card padding="lg" className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationCircleIcon className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Shadow not found
          </h3>
          <p className="text-gray-500 mb-6">
            This shadow may have been deleted or doesn't exist.
          </p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Processing state
  if (shadow.status === 'processing') {
    return (
      <div className="p-8">
        <Button
          variant="tertiary"
          size="sm"
          leadingIcon={<ArrowLeftIcon className="w-4 h-4" />}
          onClick={() => navigate('/')}
          className="mb-6"
        >
          Back to Dashboard
        </Button>
        <Card padding="lg" className="text-center">
          <div className="w-16 h-16 bg-edubites-background rounded-full flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-8 h-8 text-edubites-primary animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Processing: {shadow.title}
          </h3>
          <p className="text-gray-500 mb-6">
            AI is analyzing your recording, extracting chapters and decision points.
            This usually takes a few minutes.
          </p>
          <div className="max-w-md mx-auto">
            <ProgressBar value={50} max={100} size="md" variant="primary" />
            <p className="text-sm text-gray-500 mt-2">Analyzing content...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Failed state
  if (shadow.status === 'failed') {
    const handleRetry = () => {
      if (id) {
        retryProcessing.mutate(id);
      }
    };

    return (
      <div className="p-8">
        <Button
          variant="tertiary"
          size="sm"
          leadingIcon={<ArrowLeftIcon className="w-4 h-4" />}
          onClick={() => navigate('/')}
          className="mb-6"
        >
          Back to Dashboard
        </Button>
        <Card padding="lg" className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationCircleIcon className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Processing Failed
          </h3>
          <p className="text-gray-500 mb-6">
            We encountered an error while processing "{shadow.title}".
            This may be due to API configuration issues or an invalid recording.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="primary"
              onClick={handleRetry}
              disabled={retryProcessing.isPending}
              leadingIcon={<ArrowPathIcon className={`w-4 h-4 ${retryProcessing.isPending ? 'animate-spin' : ''}`} />}
            >
              {retryProcessing.isPending ? 'Retrying...' : 'Retry Processing'}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/')}>
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="tertiary"
          size="sm"
          leadingIcon={<ArrowLeftIcon className="w-4 h-4" />}
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" leadingIcon={<BookmarkIcon className="w-4 h-4" />}>
            Save
          </Button>
          <Button variant="secondary" size="sm" leadingIcon={<ShareIcon className="w-4 h-4" />}>
            Share
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Video and Info (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <Card padding="sm" className="overflow-hidden">
            {getVideoUrl(shadow.raw_video_url) ? (
              <VideoPlayer
                ref={videoPlayerRef}
                src={getVideoUrl(shadow.raw_video_url)!}
                title={shadow.title}
                onTimeUpdate={(time) => setCurrentTime(time)}
              />
            ) : (
              <div className="aspect-video bg-gray-100 flex items-center justify-center rounded-lg">
                <p className="text-gray-500">No video available</p>
              </div>
            )}
          </Card>

          {/* Shadow Info Card */}
          <Card padding="md">
            {/* Title and Badges */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">{shadow.title}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(shadow.status)}
                  <Badge color="purple" size="sm">
                    {decisionPoints.length} decision points
                  </Badge>
                  <Badge color="blue" size="sm">
                    Quality: {shadow.quality_score}%
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between py-4 border-y border-gray-100">
              <div className="flex items-center gap-3">
                <Avatar alt="Creator" size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Creator</p>
                  <p className="text-xs text-gray-500">Knowledge Shadows</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <EyeIcon className="w-4 h-4" />
                  <span>{shadow.view_count} views</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="w-4 h-4" />
                  <span>{formatDuration(shadow.duration_seconds)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>{Math.round(shadow.average_completion_rate * 100)}% avg completion</span>
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            {shadow.executive_summary && (
              <div className="py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 bg-edubites-background rounded flex items-center justify-center">
                    <LightBulbIcon className="w-3.5 h-3.5 text-edubites-primary" />
                  </span>
                  Executive Summary
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">{shadow.executive_summary}</p>
              </div>
            )}

            {/* Key Takeaways */}
            {shadow.key_takeaways && shadow.key_takeaways.length > 0 && (
              <div className="py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Key Takeaways</h2>
                <ul className="space-y-2">
                  {shadow.key_takeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* User Notes */}
            {shadow.user_notes && (
              <div className="py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">Notes</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{shadow.user_notes}</p>
              </div>
            )}

            {/* Tags */}
            {shadow.tags && shadow.tags.length > 0 && (
              <div className="pt-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <TagIcon className="w-4 h-4 text-gray-400" />
                  {shadow.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Decision Points Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Decision Points</h2>
              <span className="text-sm text-gray-500">
                {decisionPoints.length} key decisions captured
              </span>
            </div>
            {decisionPoints.length > 0 ? (
              <div className="space-y-4">
                {decisionPoints.map((dp) => (
                  <DecisionPointCard
                    key={dp.id}
                    decisionPoint={dp}
                    onTimestampClick={handleTimestampClick}
                  />
                ))}
              </div>
            ) : (
              <Card padding="md" className="text-center">
                <p className="text-gray-500">
                  No decision points extracted yet. These will appear after AI processing.
                </p>
              </Card>
            )}
          </div>

          {/* Transcript Section */}
          <TranscriptViewer
            transcript={shadow.transcript}
            currentTime={currentTime}
            onTimestampClick={handleTimestampClick}
          />
        </div>

        {/* Right Column - Chapters (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Chapter List */}
            <ChapterList
              chapters={chapters}
              currentTime={currentTime}
              onChapterClick={handleChapterClick}
            />

            {/* Watch Progress Card */}
            <Card padding="md">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Progress</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Watched</span>
                  <span className="font-medium text-gray-900">35%</span>
                </div>
                <ProgressBar value={35} max={100} size="sm" variant="primary" />
                <p className="text-xs text-gray-500 mt-2">
                  Continue from {formatDuration(520)} to finish this Shadow
                </p>
              </div>
            </Card>

            {/* Related Shadows */}
            <Card padding="md">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Related Shadows</h3>
              <div className="space-y-3">
                {['Database Migration Strategy', 'API Integration Walkthrough'].map((title, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-gray-400">Thumb</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
                      <p className="text-xs text-gray-500">24:35</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShadowDetail;
