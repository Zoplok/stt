"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface PlayerState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isReady: boolean;
  activeSegmentId: string | null;
  showSubtitles: boolean;

  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  setReady: (ready: boolean) => void;
  setActiveSegmentId: (id: string | null) => void;
  toggleSubtitles: () => void;
  seek: (time: number) => void;
}

export const usePlayerStore = create<PlayerState>()(
  devtools(
    (set) => ({
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      volume: 1,
      isMuted: false,
      playbackRate: 1,
      isReady: false,
      activeSegmentId: null,
      showSubtitles: true,

      setCurrentTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),
      setPlaying: (isPlaying) => set({ isPlaying }),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      setPlaybackRate: (playbackRate) => set({ playbackRate }),
      setReady: (isReady) => set({ isReady }),
      setActiveSegmentId: (activeSegmentId) => set({ activeSegmentId }),
      toggleSubtitles: () => set((state) => ({ showSubtitles: !state.showSubtitles })),
      seek: (time) => set({ currentTime: Math.max(0, time) }),
    }),
    { name: "player-store" }
  )
);
