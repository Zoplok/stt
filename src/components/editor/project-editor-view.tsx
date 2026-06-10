"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useProjectStore } from "@/stores/project-store";
import { useEditorStore } from "@/stores/editor-store";
import { EditorTopBar } from "./editor-top-bar";
import { VideoPlayer } from "../media/video-player";
import { SubtitleList } from "./subtitle-list";
import { TimelineEditor } from "./timeline-editor";
import { AIToolsPanel } from "./ai-tools-panel";
import type { Project, SubtitleSegment } from "@/types";

interface ProjectEditorViewProps {
  projectId: string;
}

export function ProjectEditorView({ projectId }: ProjectEditorViewProps) {
  const { activeProject, setActiveProject, isSaving } = useProjectStore();
  const { setSegments, isDirty, segments } = useEditorStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Project not found");
      const { project } = await res.json() as { project: Project };
      setActiveProject(project);

      const defaultTrack = project.subtitleTracks?.find((t) => t.isDefault) ?? project.subtitleTracks?.[0];
      if (defaultTrack?.segments) {
        setSegments(defaultTrack.segments);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, setActiveProject, setSegments]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const saveSegments = useCallback(async () => {
    if (!isDirty || !activeProject) return;
    useProjectStore.setState({ isSaving: true });
    try {
      await fetch(`/api/projects/${projectId}/segments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segments: segments.map((s) => ({
            id: s.id,
            startTime: s.startTime,
            endTime: s.endTime,
            text: s.text,
            speaker: s.speaker,
            style: s.style,
          })),
        }),
      });
      useEditorStore.setState({ isDirty: false });
    } catch (e) {
      console.error("Failed to save", e);
    } finally {
      useProjectStore.setState({ isSaving: false });
    }
  }, [isDirty, activeProject, projectId, segments]);

  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(saveSegments, 2000);
    return () => clearTimeout(timer);
  }, [isDirty, saveSegments]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-white/40">Loading project…</p>
        </div>
      </div>
    );
  }

  if (error || !activeProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-400 font-medium">Failed to load project</p>
          <p className="text-white/40 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const mediaFile = activeProject.mediaFiles?.[0];
  const activeTrack = activeProject.subtitleTracks?.find((t) => t.isDefault) ?? activeProject.subtitleTracks?.[0];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <EditorTopBar
        project={activeProject}
        isSaving={isSaving}
        onToggleAI={() => setShowAIPanel((v) => !v)}
        trackId={activeTrack?.id}
        onRefresh={fetchProject}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Player */}
        <div className="flex flex-col w-[420px] lg:w-[480px] shrink-0 border-r border-white/5">
          <VideoPlayer mediaFile={mediaFile} />
        </div>

        {/* Center: Subtitle list */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <SubtitleList />
        </div>

        {/* Right: AI panel */}
        {showAIPanel && activeTrack && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="shrink-0 border-l border-white/5 overflow-hidden"
          >
            <AIToolsPanel projectId={projectId} trackId={activeTrack.id} />
          </motion.div>
        )}
      </div>

      {/* Bottom: Timeline */}
      <div className="h-44 shrink-0 border-t border-white/5">
        <TimelineEditor duration={activeProject.duration ?? mediaFile?.duration ?? 0} />
      </div>
    </div>
  );
}
