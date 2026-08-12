'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Film,
  Zap,
} from 'lucide-react';

interface VideoPlayerProps {
  src?: string;
  poster?: string;
  title: string;
  durationFormatted?: string;
}

export function VideoPlayer({
  src,
  poster,
  title,
  durationFormatted = '0:45',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<boolean>(false);

  useEffect(() => {
    // Reset state on src change
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.playbackRate = playbackRate;
    }
  }, [src, playbackRate]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setVideoError(true));
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setCurrentTime(curr);
    setDuration(dur);
    setProgress((curr / dur) * 100);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * (videoRef.current.duration || 0);
    videoRef.current.currentTime = newTime;
    setProgress(newProgress);
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="group relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-white shadow-xl transition-all"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Top Header Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-zinc-200 border border-white/10">
          <Film className="h-3.5 w-3.5 text-zinc-400" />
          <span className="truncate max-w-50 sm:max-w-75">{title}</span>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
          <Zap className="h-3 w-3" />
          <span>1080p HD</span>
        </div>
      </div>

      {/* Video Element container */}
      <div className="relative aspect-video w-full bg-zinc-900 flex items-center justify-center">
        {src && !videoError ? (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onError={() => setVideoError(true)}
            onClick={togglePlay}
            className="h-full w-full object-contain cursor-pointer"
            playsInline
          />
        ) : (
          <div className="relative flex flex-col items-center justify-center p-8 text-center bg-linear-to-br from-zinc-900 via-zinc-950 to-black w-full h-full">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/80 border border-zinc-700 text-zinc-300 mb-4 shadow-inner">
              <Film className="h-8 w-8" />
            </div>
            <p className="text-sm font-bold text-zinc-200">{title}</p>
            <p className="mt-1 text-xs text-zinc-400">
              Sample playback preview • {durationFormatted}
            </p>
            <button
              type="button"
              onClick={togglePlay}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-bold text-black hover:bg-zinc-200 transition-all shadow-md"
            >
              <Play className="h-4 w-4 fill-black" />
              <span>Simulate Video Playback</span>
            </button>
          </div>
        )}

        {/* Big Play Overlay Button when paused */}
        {!isPlaying && src && !videoError && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label="Play video"
            className="absolute z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white transition-transform hover:scale-110 active:scale-95 shadow-2xl"
          >
            <Play className="h-7 w-7 fill-white translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Video Control Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 z-20 bg-linear-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-200 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar / Scrubber */}
        <div className="relative mb-3 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={handleSeek}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/20 accent-white hover:bg-white/30 transition-all"
          />
        </div>

        {/* Controls Layout */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-white" />
              ) : (
                <Play className="h-4 w-4 fill-white translate-x-0.5" />
              )}
            </button>

            {/* Restart */}
            <button
              type="button"
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = 0;
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-zinc-300 hover:text-white"
              title="Restart video"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {/* Volume */}
            <button
              type="button"
              onClick={toggleMute}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-zinc-300 hover:text-white"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-red-400" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>

            {/* Timestamp */}
            <div className="text-xs font-mono text-zinc-300">
              <span>{formatTime(currentTime)}</span>
              <span className="text-zinc-500"> / </span>
              <span>{duration > 0 ? formatTime(duration) : durationFormatted}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed selector */}
            <div className="flex items-center gap-1 rounded-lg bg-white/10 p-1 text-[11px] font-semibold text-zinc-300 border border-white/5">
              {[0.5, 1, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => changePlaybackRate(rate)}
                  className={`rounded px-1.5 py-0.5 transition-colors ${
                    playbackRate === rate
                      ? 'bg-white text-black font-bold'
                      : 'hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={handleFullscreen}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-zinc-300 hover:text-white"
              title="Fullscreen"
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
