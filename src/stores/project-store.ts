"use client";

import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import type { Project, MediaFile, SubtitleTrack, SubtitleSegment, Job } from "@/types";

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  activeTrack: SubtitleTrack | null;
  activeMediaFile: MediaFile | null;
  jobs: Record<string, Job>;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setActiveProject: (project: Project | null) => void;
  setActiveTrack: (track: SubtitleTrack | null) => void;
  setActiveMediaFile: (file: MediaFile | null) => void;
  upsertJob: (job: Job) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    subscribeWithSelector((set) => ({
      projects: [],
      activeProject: null,
      activeTrack: null,
      activeMediaFile: null,
      jobs: {},
      isLoading: false,
      isSaving: false,
      error: null,

      setProjects: (projects) => set({ projects }),

      addProject: (project) =>
        set((state) => ({ projects: [project, ...state.projects] })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
          activeProject:
            state.activeProject?.id === id
              ? { ...state.activeProject, ...updates }
              : state.activeProject,
        })),

      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProject: state.activeProject?.id === id ? null : state.activeProject,
        })),

      setActiveProject: (project) =>
        set({
          activeProject: project,
          activeTrack: project?.subtitleTracks?.[0] ?? null,
          activeMediaFile: project?.mediaFiles?.[0] ?? null,
        }),

      setActiveTrack: (track) => set({ activeTrack: track }),
      setActiveMediaFile: (file) => set({ activeMediaFile: file }),

      upsertJob: (job) =>
        set((state) => ({ jobs: { ...state.jobs, [job.id]: job } })),

      setLoading: (isLoading) => set({ isLoading }),
      setSaving: (isSaving) => set({ isSaving }),
      setError: (error) => set({ error }),
    })),
    { name: "project-store" }
  )
);
