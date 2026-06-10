"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { UploadProgress } from "@/types";

export interface UploadItem {
  id: string;
  file: File;
  progress: UploadProgress;
  status: "queued" | "uploading" | "processing" | "done" | "error";
  error?: string;
  projectId?: string;
  abortController?: AbortController;
}

interface UploadState {
  uploads: Record<string, UploadItem>;
  addUpload: (item: UploadItem) => void;
  updateUpload: (id: string, updates: Partial<UploadItem>) => void;
  removeUpload: (id: string) => void;
  clearCompleted: () => void;
  cancelUpload: (id: string) => void;
}

export const useUploadStore = create<UploadState>()(
  devtools(
    (set, get) => ({
      uploads: {},

      addUpload: (item) =>
        set((state) => ({ uploads: { ...state.uploads, [item.id]: item } })),

      updateUpload: (id, updates) =>
        set((state) => ({
          uploads: {
            ...state.uploads,
            [id]: state.uploads[id] ? { ...state.uploads[id], ...updates } : state.uploads[id],
          },
        })),

      removeUpload: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.uploads;
          return { uploads: rest };
        }),

      clearCompleted: () =>
        set((state) => ({
          uploads: Object.fromEntries(
            Object.entries(state.uploads).filter(
              ([, item]) => item.status !== "done" && item.status !== "error"
            )
          ),
        })),

      cancelUpload: (id) => {
        const item = get().uploads[id];
        item?.abortController?.abort();
        set((state) => ({
          uploads: {
            ...state.uploads,
            [id]: { ...state.uploads[id], status: "error", error: "Cancelled" },
          },
        }));
      },
    }),
    { name: "upload-store" }
  )
);
