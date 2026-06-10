"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Subtitles,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { usePlayerStore } from "@/stores/player-store";
import { useEditorStore } from "@/stores/editor-store";
import { cn, formatTime } from "@/lib/utils";
import type { MediaFile } from "@/types";

interface VideoPlayerProps {
  mediaFile?: MediaFile;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function VideoPlayer({ mediaFile }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    currentTime, isPlaying, volume, isMuted, playbackRate, showSubtitles,
    duration, isReady, activeSegmentId,
    setCurrentTime, setDuration, setPlaying, setVolume, toggleMute,
    setPlaybackRate, setReady, setActiveSegmentId, toggleSubtitles, seek,
  } = usePlayerStore();
  const { segments } = useEditorStore();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const active = segments.find(
        (s) => video.currentTime >= s.startTime && video.currentTime < s.endTime
      );
      setActiveSegmentId(active?.id ?? null);
    };

    const onDurationChange = () => setDuration(video.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onCanPlay = () => setReady(true);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("canplay", onCanPlay);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("canplay", onCanPlay);
    };
  }, [segments, setCurrentTime, setDuration, setPlaying, setReady, setActiveSegmentId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) video.play().catch(() => {});
    else video.pause();
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const time = ratio * duration;
    seek(time);
    if (videoRef.current) videoRef.current.currentTime = time;
  }, [duration, seek]);

  const togglePlay = () => setPlaying(!isPlaying);

  const skipForward = () => {
    const t = Math.min(currentTime + 5, duration);
    seek(t);
    if (videoRef.current) videoRef.current.currentTime = t;
  };

  const skipBack = () => {
    const t = Math.max(currentTime - 5, 0);
    seek(t);
    if (videoRef.current) videoRef.current.currentTime = t;
  };

  const activeSegment = segments.find((s) => s.id === activeSegmentId);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const isAudioOnly = mediaFile?.mimeType?.startsWith("audio/");

  return (
    <div className="flex flex-col h-full">
      {/* Video area */}
      <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
        {mediaFile?.storageUrl || mediaFile?.audioUrl ? (
          <>
            {isAudioOnly ? (
              <div className="flex flex-col items-center justify-center gap-4 w-full px-8">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                  <Volume2 className="w-10 h-10 text-indigo-400" />
                </div>
                <p className="text-sm text-white/40 text-center truncate max-w-[200px]">{mediaFile.originalName}</p>
              </div>
            ) : null}
            <video
              ref={videoRef}
              src={mediaFile.storageUrl ?? undefined}
              className={cn("max-h-full max-w-full", isAudioOnly && "hidden")}
              preload="metadata"
              playsInline
            />
          </>
        ) : (
          <div className="flex items-center justify-center text-white/20 text-sm">
            No media file
          </div>
        )}

        {/* Subtitle overlay */}
        {showSubtitles && activeSegment && (
          <div className="absolute bottom-10 left-0 right-0 flex justify-center px-6 pointer-events-none">
            <div className="px-4 py-2 bg-black/70 backdrop-blur-sm rounded-lg text-white text-sm font-medium text-center max-w-[90%] leading-snug">
              {activeSegment.text}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="shrink-0 px-3 pb-3 pt-2 space-y-2">
        {/* Progress bar */}
        <div
          className="w-full h-1.5 bg-white/8 rounded-full cursor-pointer group relative"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button onClick={skipBack} className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-all">
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              disabled={!isReady && !!mediaFile}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-all disabled:opacity-40"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5" />}
            </button>
            <button onClick={skipForward} className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-all">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs font-mono text-white/40">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex items-center gap-1">
            {/* Speed */}
            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(Number(e.target.value))}
              className="bg-transparent text-xs text-white/40 hover:text-white border-none outline-none cursor-pointer"
            >
              {PLAYBACK_RATES.map((r) => (
                <option key={r} value={r} className="bg-zinc-900">{r}×</option>
              ))}
            </select>

            {/* Volume */}
            <button onClick={toggleMute} className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-all">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Subtitles toggle */}
            <button
              onClick={toggleSubtitles}
              className={cn("p-1.5 rounded-lg transition-all", showSubtitles ? "text-indigo-400 bg-indigo-500/15" : "text-white/50 hover:text-white hover:bg-white/8")}
            >
              <Subtitles className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
