import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ForwardIcon,
  BackwardIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";

export interface VideoPlayerHandle {
  seekTo: (time: number) => void;
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
}

export interface VideoPlayerProps {
  /** Video source URL */
  src: string;
  /** Poster image URL */
  poster?: string;
  /** Video title */
  title?: string;
  /** Auto play on load */
  autoPlay?: boolean;
  /** Loop video */
  loop?: boolean;
  /** Start muted */
  muted?: boolean;
  /** Show controls */
  controls?: boolean;
  /** On play callback */
  onPlay?: () => void;
  /** On pause callback */
  onPause?: () => void;
  /** On ended callback */
  onEnded?: () => void;
  /** On time update callback */
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  /** Additional class name */
  className?: string;
}

/**
 * Video player component with custom controls
 */
export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(({
  src,
  poster,
  title,
  autoPlay = false,
  loop = false,
  muted = false,
  controls = true,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  className = "",
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const hideControlsTimeout = useRef<NodeJS.Timeout>();

  useImperativeHandle(ref, () => ({
    seekTo: (time: number) => {
      const video = videoRef.current;
      if (video) {
        video.currentTime = time;
        setCurrentTime(time);
      }
    },
    play: () => {
      const video = videoRef.current;
      if (video) {
        video.play();
        setIsPlaying(true);
        onPlay?.();
      }
    },
    pause: () => {
      const video = videoRef.current;
      if (video) {
        video.pause();
        setIsPlaying(false);
        onPause?.();
      }
    },
    getCurrentTime: () => currentTime,
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime, video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [onTimeUpdate, onEnded]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      onPause?.();
    } else {
      video.play();
      onPlay?.();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        className="w-full h-full object-contain"
        onClick={togglePlay}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Play Button Overlay (when paused) */}
      {!isPlaying && !isLoading && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
        >
          <div className="w-20 h-20 bg-edubites-primary rounded-full flex items-center justify-center">
            <PlayIcon className="w-10 h-10 text-white ml-1" />
          </div>
        </button>
      )}

      {/* Controls */}
      {controls && (
        <div
          className={`
            absolute bottom-0 left-0 right-0
            bg-gradient-to-t from-black/80 to-transparent
            transition-opacity duration-300
            ${showControls || !isPlaying ? "opacity-100" : "opacity-0"}
          `}
        >
          {/* Progress Bar */}
          <div className="px-4 py-2">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-edubites-primary
                [&::-webkit-slider-thumb]:cursor-pointer"
              style={{
                background: `linear-gradient(to right, #5845BA ${progress}%, rgba(255,255,255,0.3) ${progress}%)`,
              }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between px-4 pb-4">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="p-2 text-white hover:text-edubites-primary transition-colors"
              >
                {isPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6" />
                )}
              </button>

              {/* Skip Backward */}
              <button
                onClick={() => skip(-10)}
                className="p-2 text-white hover:text-edubites-primary transition-colors"
              >
                <BackwardIcon className="w-5 h-5" />
              </button>

              {/* Skip Forward */}
              <button
                onClick={() => skip(10)}
                className="p-2 text-white hover:text-edubites-primary transition-colors"
              >
                <ForwardIcon className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleMute}
                  className="p-2 text-white hover:text-edubites-primary transition-colors"
                >
                  {isMuted ? (
                    <SpeakerXMarkIcon className="w-5 h-5" />
                  ) : (
                    <SpeakerWaveIcon className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-3
                    [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>

              {/* Time */}
              <span className="text-white text-sm ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Title */}
              {title && (
                <span className="text-white text-sm mr-4 truncate max-w-[200px]">
                  {title}
                </span>
              )}

              {/* Settings */}
              <button className="p-2 text-white hover:text-edubites-primary transition-colors">
                <Cog6ToothIcon className="w-5 h-5" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-white hover:text-edubites-primary transition-colors"
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="w-5 h-5" />
                ) : (
                  <ArrowsPointingOutIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

VideoPlayer.displayName = "VideoPlayer";

// Playlist Item Component
export interface PlaylistItemProps {
  /** Thumbnail URL */
  thumbnail?: string;
  /** Video title */
  title: string;
  /** Video duration */
  duration: string;
  /** Whether currently playing */
  isPlaying?: boolean;
  /** Whether completed */
  isCompleted?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional class name */
  className?: string;
}

export const PlaylistItem = ({
  thumbnail,
  title,
  duration,
  isPlaying = false,
  isCompleted = false,
  onClick,
  className = "",
}: PlaylistItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 w-full p-2 rounded-lg text-left
        ${isPlaying ? "bg-edubites-background" : "hover:bg-gray-50"}
        transition-colors
        ${className}
      `}
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-14 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
        {thumbnail && (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        )}
        {isPlaying && (
          <div className="absolute inset-0 bg-edubites-primary/80 flex items-center justify-center">
            <PlayIcon className="w-6 h-6 text-white" />
          </div>
        )}
        <span className="absolute bottom-1 right-1 px-1 text-xs bg-black/70 text-white rounded">
          {duration}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isPlaying ? "text-edubites-primary" : "text-gray-900"}`}>
          {title}
        </p>
        {isCompleted && (
          <span className="text-xs text-green-600">Completed</span>
        )}
      </div>
    </button>
  );
};

PlaylistItem.displayName = "PlaylistItem";
