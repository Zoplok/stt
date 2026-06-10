"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { SubtitleSegment, SubtitleStyle } from "@/types";

export type EditorTool = "select" | "split" | "merge" | "text";

interface EditorState {
  segments: SubtitleSegment[];
  selectedIds: Set<string>;
  editingId: string | null;
  tool: EditorTool;
  zoom: number;
  scrollX: number;
  isDirty: boolean;
  history: SubtitleSegment[][];
  historyIndex: number;

  setSegments: (segments: SubtitleSegment[]) => void;
  upsertSegment: (segment: SubtitleSegment) => void;
  removeSegment: (id: string) => void;
  updateSegmentText: (id: string, text: string) => void;
  updateSegmentTiming: (id: string, startTime: number, endTime: number) => void;
  updateSegmentStyle: (id: string, style: Partial<SubtitleStyle>) => void;
  splitSegment: (id: string, atTime: number) => void;
  mergeSegments: (ids: string[]) => void;
  shiftSegments: (ids: string[], deltaMs: number) => void;
  selectSegment: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  setEditingId: (id: string | null) => void;
  setTool: (tool: EditorTool) => void;
  setZoom: (zoom: number) => void;
  setScrollX: (x: number) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  setDirty: (dirty: boolean) => void;
}

function reindex(segments: SubtitleSegment[]): SubtitleSegment[] {
  return [...segments]
    .sort((a, b) => a.startTime - b.startTime)
    .map((s, i) => ({ ...s, index: i }));
}

export const useEditorStore = create<EditorState>()(
  devtools(
    (set, get) => ({
      segments: [],
      selectedIds: new Set(),
      editingId: null,
      tool: "select",
      zoom: 1,
      scrollX: 0,
      isDirty: false,
      history: [],
      historyIndex: -1,

      setSegments: (segments) =>
        set({ segments: reindex(segments), isDirty: false, history: [segments], historyIndex: 0 }),

      upsertSegment: (segment) =>
        set((state) => {
          const exists = state.segments.some((s) => s.id === segment.id);
          const next = exists
            ? state.segments.map((s) => (s.id === segment.id ? segment : s))
            : [...state.segments, segment];
          return { segments: reindex(next), isDirty: true };
        }),

      removeSegment: (id) =>
        set((state) => ({
          segments: reindex(state.segments.filter((s) => s.id !== id)),
          selectedIds: new Set([...state.selectedIds].filter((sid) => sid !== id)),
          isDirty: true,
        })),

      updateSegmentText: (id, text) =>
        set((state) => ({
          segments: state.segments.map((s) => (s.id === id ? { ...s, text } : s)),
          isDirty: true,
        })),

      updateSegmentTiming: (id, startTime, endTime) =>
        set((state) => ({
          segments: reindex(
            state.segments.map((s) => (s.id === id ? { ...s, startTime, endTime } : s))
          ),
          isDirty: true,
        })),

      updateSegmentStyle: (id, style) =>
        set((state) => ({
          segments: state.segments.map((s) =>
            s.id === id ? { ...s, style: { ...s.style, ...style } } : s
          ),
          isDirty: true,
        })),

      splitSegment: (id, atTime) =>
        set((state) => {
          const seg = state.segments.find((s) => s.id === id);
          if (!seg || atTime <= seg.startTime || atTime >= seg.endTime) return state;

          const midText = seg.text;
          const words = midText.split(" ");
          const mid = Math.ceil(words.length / 2);
          const firstText = words.slice(0, mid).join(" ");
          const secondText = words.slice(mid).join(" ");

          const now = new Date().toISOString();
          const first: SubtitleSegment = {
            ...seg,
            endTime: atTime,
            text: firstText,
            updatedAt: now,
          };
          const second: SubtitleSegment = {
            ...seg,
            id: `${seg.id}-split-${Date.now()}`,
            startTime: atTime,
            text: secondText,
            createdAt: now,
            updatedAt: now,
          };

          const next = state.segments
            .filter((s) => s.id !== id)
            .concat([first, second]);

          return { segments: reindex(next), isDirty: true };
        }),

      mergeSegments: (ids) =>
        set((state) => {
          const toMerge = state.segments
            .filter((s) => ids.includes(s.id))
            .sort((a, b) => a.startTime - b.startTime);
          if (toMerge.length < 2) return state;

          const merged: SubtitleSegment = {
            ...toMerge[0],
            endTime: toMerge.at(-1)!.endTime,
            text: toMerge.map((s) => s.text).join(" "),
            updatedAt: new Date().toISOString(),
          };

          const next = [
            ...state.segments.filter((s) => !ids.includes(s.id)),
            merged,
          ];

          return {
            segments: reindex(next),
            selectedIds: new Set([merged.id]),
            isDirty: true,
          };
        }),

      shiftSegments: (ids, deltaSec) =>
        set((state) => ({
          segments: reindex(
            state.segments.map((s) =>
              ids.includes(s.id)
                ? {
                    ...s,
                    startTime: Math.max(0, s.startTime + deltaSec),
                    endTime: Math.max(deltaSec, s.endTime + deltaSec),
                  }
                : s
            )
          ),
          isDirty: true,
        })),

      selectSegment: (id, multi = false) =>
        set((state) => {
          if (multi) {
            const next = new Set(state.selectedIds);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return { selectedIds: next };
          }
          return { selectedIds: new Set([id]) };
        }),

      clearSelection: () => set({ selectedIds: new Set() }),
      setEditingId: (editingId) => set({ editingId }),
      setTool: (tool) => set({ tool }),
      setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(10, zoom)) }),
      setScrollX: (scrollX) => set({ scrollX: Math.max(0, scrollX) }),

      pushHistory: () =>
        set((state) => {
          const history = state.history.slice(0, state.historyIndex + 1);
          history.push([...state.segments]);
          return { history: history.slice(-50), historyIndex: history.length - 1 };
        }),

      undo: () =>
        set((state) => {
          if (state.historyIndex <= 0) return state;
          const idx = state.historyIndex - 1;
          return { segments: state.history[idx], historyIndex: idx, isDirty: true };
        }),

      redo: () =>
        set((state) => {
          if (state.historyIndex >= state.history.length - 1) return state;
          const idx = state.historyIndex + 1;
          return { segments: state.history[idx], historyIndex: idx, isDirty: true };
        }),

      setDirty: (isDirty) => set({ isDirty }),
    }),
    { name: "editor-store" }
  )
);
