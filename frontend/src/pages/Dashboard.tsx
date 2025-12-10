import { useNavigate } from 'react-router-dom';
import { ShadowCapture } from '../components/ShadowCapture';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useShadows } from '../api/hooks';
import type { Shadow, ShadowStatus } from '../api/types';
import {
  PlayIcon,
  ClockIcon,
  EyeIcon,
  SparklesIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Dashboard page - main landing page showing all Shadows
 */
export const Dashboard = () => {
  const navigate = useNavigate();
  const { data: shadows = [], isLoading, error } = useShadows();

  // Calculate stats from real data
  const stats = {
    totalShadows: shadows.length,
    totalViews: shadows.reduce((acc, s) => acc + s.view_count, 0),
    hoursWatched: Math.round(shadows.reduce((acc, s) => acc + s.duration_seconds, 0) / 3600 * 10) / 10,
    decisionPoints: 0, // Will be populated when we fetch decision points
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (error) {
    return (
      <div className="p-8">
        <Card padding="lg" className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationCircleIcon className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load shadows
          </h3>
          <p className="text-gray-500 mb-6">
            Please make sure the backend server is running.
          </p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Capture and share your expertise effortlessly
          </p>
        </div>
        <ShadowCapture />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-edubites-background rounded-lg flex items-center justify-center">
              <PlayIcon className="w-6 h-6 text-edubites-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Shadows</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalShadows}</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-edubites-background rounded-lg flex items-center justify-center">
              <EyeIcon className="w-6 h-6 text-edubites-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-edubites-background rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-edubites-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Hours Watched</p>
              <p className="text-2xl font-bold text-gray-900">{stats.hoursWatched}</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-edubites-background rounded-lg flex items-center justify-center">
              <LightBulbIcon className="w-6 h-6 text-edubites-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Decision Points</p>
              <p className="text-2xl font-bold text-gray-900">{stats.decisionPoints}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Shadows</h2>
        <Button variant="tertiary" size="sm">
          View All
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} padding="sm">
              <div className="w-full aspect-video bg-gray-100 rounded-lg mb-4 animate-pulse" />
              <div className="space-y-3">
                <div className="h-5 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
                <div className="h-8 bg-gray-100 rounded animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Shadows Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shadows.map((shadow: Shadow) => (
            <Card key={shadow.id} padding="sm" hover>
              {/* Thumbnail */}
              <div className="relative w-full aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                {shadow.thumbnail_url ? (
                  <img
                    src={shadow.thumbnail_url}
                    alt={shadow.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-edubites">
                      <PlayIcon className="w-6 h-6 text-edubites-primary ml-0.5" />
                    </div>
                  </div>
                )}
                {/* Duration badge */}
                <div className="absolute bottom-2 right-2">
                  <span className="px-2 py-1 bg-black/70 text-white text-xs font-medium rounded">
                    {formatDuration(shadow.duration_seconds)}
                  </span>
                </div>
                {/* Processing overlay */}
                {shadow.status === 'processing' && (
                  <div className="absolute inset-0 bg-edubites-primary/10 flex items-center justify-center">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-edubites">
                      <SparklesIcon className="w-4 h-4 text-edubites-primary animate-pulse" />
                      <span className="text-xs font-medium text-edubites-primary">Processing...</span>
                    </div>
                  </div>
                )}
                {/* Capturing overlay */}
                {shadow.status === 'capturing' && (
                  <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-edubites">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-red-600">Recording...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-tight">
                    {shadow.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(shadow.status)}
                  {shadow.key_takeaways && shadow.key_takeaways.length > 0 && (
                    <Badge color="purple" size="sm">
                      {shadow.key_takeaways.length} takeaways
                    </Badge>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>{shadow.view_count} views</span>
                  </div>
                  <span>{formatDate(shadow.created_at)}</span>
                </div>

                {/* Completion rate */}
                {(shadow.status === 'published' || shadow.status === 'ready_for_review') && shadow.view_count > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Avg. completion</span>
                      <span className="font-medium">{Math.round(shadow.average_completion_rate * 100)}%</span>
                    </div>
                    <ProgressBar value={shadow.average_completion_rate * 100} max={100} size="sm" />
                  </div>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/shadows/${shadow.id}`)}
                >
                  {shadow.status === 'processing' ? 'View Progress' :
                   shadow.status === 'capturing' ? 'View Recording' : 'Watch Shadow'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && shadows.length === 0 && (
        <Card padding="lg" className="text-center">
          <div className="w-16 h-16 bg-edubites-background rounded-full flex items-center justify-center mx-auto mb-4">
            <PlayIcon className="w-8 h-8 text-edubites-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Shadows yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Start capturing your first Shadow to build your knowledge library.
            Every demo becomes a training asset.
          </p>
          <ShadowCapture />
        </Card>
      )}

      {/* Quick Tip */}
      <Card padding="md" className="mt-8 bg-edubites-background border-edubites-card-stroke">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-edubites-sm">
            <ArrowTrendingUpIcon className="w-5 h-5 text-edubites-primary" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Pro Tip: The "Why Loop" Technique</h4>
            <p className="text-sm text-gray-600">
              When explaining something, consciously ask yourself "why" and answer it out loud.
              AI picks this up as a strong decision point, making your Shadows more valuable.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
