"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  FileVideo,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
  Upload,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn, formatDuration } from "@/lib/utils";
import { UploadZone } from "@/components/media/upload-zone";
import type { Project } from "@/types";

type ProjectStatus = "DRAFT" | "PROCESSING" | "READY" | "ERROR";

const statusConfig: Record<ProjectStatus, { icon: React.ElementType; label: string; color: string }> = {
  DRAFT: { icon: FileVideo, label: "Draft", color: "text-white/40" },
  PROCESSING: { icon: Loader2, label: "Processing", color: "text-blue-400" },
  READY: { icon: CheckCircle2, label: "Ready", color: "text-emerald-400" },
  ERROR: { icon: AlertCircle, label: "Error", color: "text-red-400" },
};

function ProjectCard({ project, onDelete }: { project: Project; onDelete: (id: string) => void }) {
  const status = statusConfig[project.status];
  const StatusIcon = status.icon;
  const thumb = project.thumbnailUrl ?? project.mediaFiles?.[0]?.thumbnailUrl;
  const duration = project.duration ?? project.mediaFiles?.[0]?.duration;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="group relative glass rounded-2xl gradient-border overflow-hidden hover:bg-white/5 transition-all"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-white/4 overflow-hidden">
        {thumb ? (
          <img src={thumb} alt={project.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileVideo className="w-10 h-10 text-white/15" />
          </div>
        )}

        {duration != null && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-xs text-white/80 font-mono">
            {formatDuration(duration)}
          </div>
        )}

        {project.status === "PROCESSING" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-sm leading-snug line-clamp-2">{project.title}</h3>
          <div className={cn("flex items-center gap-1 shrink-0", status.color)}>
            <StatusIcon className={cn("w-3.5 h-3.5", project.status === "PROCESSING" && "animate-spin")} />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-white/40">
          <span>{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
          <span>{project.subtitleTracks?.length ?? 0} track{project.subtitleTracks?.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Hover actions */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 bg-black/50">
        <Link
          href={`/projects/${project.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Open
        </Link>
        <button
          onClick={() => onDelete(project.id)}
          className="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="aspect-video skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-1/2" />
      </div>
    </div>
  );
}

export function DashboardView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
  };

  const handleUploadComplete = async (file: { name: string; url: string; key: string }) => {
    setIsCreating(true);
    try {
      const projectRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: file.name.replace(/\.[^.]+$/, "") }),
      });
      const { project } = await projectRes.json();
      if (project) {
        setProjects((prev) => [project, ...prev]);
        setShowUpload(false);
      }
    } finally {
      setIsCreating(false);
    }
    await fetchProjects();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-white/40 mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Upload modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setShowUpload(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="w-full max-w-lg glass-heavy rounded-2xl gradient-border p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Upload Media</h2>
              <UploadZone onComplete={handleUploadComplete} />
              <button
                onClick={() => setShowUpload(false)}
                className="mt-4 w-full py-2 rounded-xl text-sm text-white/40 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[50vh] text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/4 flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-white/20" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
          <p className="text-white/40 text-sm mb-6 max-w-xs">
            Upload a video or audio file to generate AI subtitles in seconds.
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Upload your first file
          </button>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
