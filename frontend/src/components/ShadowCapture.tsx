import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { PlayIcon, StopIcon } from '@heroicons/react/24/solid';
import { useStartCapture, useEndCapture } from '../api/hooks';
import { shadowsApi } from '../api/shadows';

export interface ShadowCaptureProps {
    className?: string;
}

type CaptureState = 'idle' | 'requesting_permission' | 'recording' | 'uploading' | 'ending';

/**
 * Shadow capture button component
 * Captures screen recording using MediaRecorder API
 * Uploads video to backend after capture ends
 */
export const ShadowCapture = ({
    className = '',
}: ShadowCaptureProps) => {
    const navigate = useNavigate();
    const [captureState, setCaptureState] = useState<CaptureState>('idle');
    const [duration, setDuration] = useState(0);
    const [currentShadowId, setCurrentShadowId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const intervalRef = useRef<number | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const startCapture = useStartCapture();
    const endCapture = useEndCapture();

    const isCapturing = captureState === 'recording';
    const isLoading = captureState === 'requesting_permission' || captureState === 'uploading' || captureState === 'ending';

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const stopMediaStream = useCallback(() => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
    }, []);

    const handleStart = async () => {
        setError(null);
        setCaptureState('requesting_permission');

        try {
            // Request screen capture permission
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: 'monitor',
                },
                audio: true,
            });

            // Try to get microphone audio for narration
            let audioStream: MediaStream | null = null;
            try {
                audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
            } catch {
                // Microphone access denied - continue without narration audio
                console.info('Microphone access denied, continuing without narration audio');
            }

            // Combine streams if we have both
            let combinedStream: MediaStream;
            if (audioStream) {
                const audioTracks = audioStream.getAudioTracks();
                const displayAudioTracks = displayStream.getAudioTracks();
                combinedStream = new MediaStream([
                    ...displayStream.getVideoTracks(),
                    ...displayAudioTracks,
                    ...audioTracks,
                ]);
            } else {
                combinedStream = displayStream;
            }

            mediaStreamRef.current = combinedStream;
            recordedChunksRef.current = [];

            // Create the shadow record in the backend
            const shadow = await startCapture.mutateAsync({
                title: `Shadow ${new Date().toLocaleString()}`,
            });
            setCurrentShadowId(shadow.id);

            // Set up MediaRecorder
            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                ? 'video/webm;codecs=vp9'
                : 'video/webm';

            const mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType,
                videoBitsPerSecond: 2500000, // 2.5 Mbps
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            // Handle stream ending (user clicks "Stop sharing" in browser UI)
            displayStream.getVideoTracks()[0].onended = () => {
                if (captureState === 'recording') {
                    handleEnd();
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(1000); // Collect data every second

            setCaptureState('recording');

            // Start duration timer
            intervalRef.current = window.setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Failed to start capture:', err);
            stopMediaStream();
            setCaptureState('idle');

            if (err instanceof Error) {
                if (err.name === 'NotAllowedError') {
                    setError('Screen capture permission denied. Please allow screen sharing to record a shadow.');
                } else {
                    setError(`Failed to start recording: ${err.message}`);
                }
            } else {
                setError('Failed to start shadow capture. Make sure screen sharing is supported in your browser.');
            }
        }
    };

    const handleEnd = async () => {
        if (!currentShadowId || !mediaRecorderRef.current) return;

        setCaptureState('uploading');

        // Stop the timer
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        try {
            // Stop recording and wait for final data
            const mediaRecorder = mediaRecorderRef.current;

            await new Promise<void>((resolve) => {
                mediaRecorder.onstop = () => resolve();
                mediaRecorder.stop();
            });

            // Stop the media stream
            stopMediaStream();

            // Create video blob from recorded chunks
            const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            recordedChunksRef.current = [];

            // Upload video to backend
            if (videoBlob.size > 0) {
                await shadowsApi.uploadVideo(currentShadowId, videoBlob);
            }

            setCaptureState('ending');

            // End the capture (triggers processing)
            await endCapture.mutateAsync(currentShadowId);

            // Navigate to the shadow detail page to see processing
            navigate(`/shadows/${currentShadowId}`);

        } catch (err) {
            console.error('Failed to end capture:', err);
            setError('Failed to save recording. Please try again.');
        } finally {
            setCaptureState('idle');
            setDuration(0);
            setCurrentShadowId(null);
            mediaRecorderRef.current = null;
        }
    };

    const handleToggle = () => {
        if (isCapturing) {
            handleEnd();
        } else {
            handleStart();
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getButtonText = () => {
        switch (captureState) {
            case 'requesting_permission':
                return 'Requesting Permission...';
            case 'uploading':
                return 'Uploading Video...';
            case 'ending':
                return 'Finishing...';
            case 'recording':
                return 'End Shadow';
            default:
                return 'Start Shadow';
        }
    };

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            <div className="flex items-center gap-4">
                <Button
                    variant={isCapturing ? 'secondary' : 'primary'}
                    size="lg"
                    onClick={handleToggle}
                    disabled={isLoading}
                    leadingIcon={isCapturing ? <StopIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                >
                    {getButtonText()}
                </Button>

                {isCapturing && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-red-700">
                            Recording {formatDuration(duration)}
                        </span>
                    </div>
                )}

                {captureState === 'uploading' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium text-blue-700">
                            Uploading recording...
                        </span>
                    </div>
                )}
            </div>

            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}
        </div>
    );
};

ShadowCapture.displayName = 'ShadowCapture';
