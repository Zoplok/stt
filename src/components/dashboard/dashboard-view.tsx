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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-xl border border-white/[0.07] overflow-hidden hover:border-white/[0.12] transition-all"
      style={{ background: "#0a0a14" }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-black/40 overflow-hidden">
        {thumb ? (
          <img src={thumb} alt={project.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileVideo className="w-8 h-8 text-white/10" />
          </div>
        )}

        {duration != null && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white/70 font-mono backdrop-blur-sm">
            {formatDuration(duration)}
          </div>
        )}

        {project.status === "PROCESSING" && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/60 backdrop-blur-[2px] flex items-center justify-center gap-2">
          <Link
            href={`/projects/${project.id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-semibold transition-colors shadow-lg"
          >
            <ExternalLink className="w-3 h-3" /> Open
          </Link>
          <button
            onClick={() => onDelete(project.id)}
            className="p-2 rounded-lg bg-white/[0.08] hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-3.5 py-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-[13px] font-medium text-white leading-snug line-clamp-1">{project.title}</h3>
          <div className={cn("flex items-center gap-1 shrink-0 mt-0.5", status.color)}>
            <StatusIcon className={cn("w-3 h-3", project.status === "PROCESSING" && "animate-spin")} />
            <span className="text-[10px] font-medium">{status.label}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-white/25">{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
          <span className="text-[11px] text-white/25">{project.subtitleTracks?.length ?? 0} track{project.subtitleTracks?.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden" style={{ background: "#0a0a14" }}>
      <div className="aspect-video skeleton" />
      <div className="px-3.5 py-3 space-y-2">
        <div className="h-3.5 skeleton rounded w-3/4" />
        <div className="h-2.5 skeleton rounded w-1/3" />
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

  const readyCount = projects.filter((p) => p.status === "READY").length;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-[14px] font-semibold text-white">Projects</h1>
          <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[11px] font-medium text-white/40 tabular-nums">
            {projects.length}
          </span>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-semibold transition-all shadow-lg shadow-indigo-500/20 hover:-translate-y-px"
        >
          <Plus className="w-3.5 h-3.5" /> New Project
        </button>
      </div>

      {/* Stats strip */}
      {!isLoading && projects.length > 0 && (
        <div className="flex items-center gap-6 px-6 py-3 border-b border-white/[0.04] shrink-0">
          {[
            { label: "Total", value: projects.length },
            { label: "Ready", value: readyCount, color: "text-emerald-400" },
            { label: "Processing", value: projects.filter(p => p.status === "PROCESSING").length, color: "text-blue-400" },
            { label: "Draft", value: projects.filter(p => p.status === "DRAFT").length },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className={`text-[13px] font-semibold tabular-nums ${s.color ?? "text-white"}`}>{s.value}</span>
              <span className="text-[11px] text-white/30">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">

        {/* Upload modal */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
              onClick={(e) => e.target === e.currentTarget && setShowUpload(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md rounded-2xl border border-white/[0.1] p-6"
                style={{ background: "#0d0d18" }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[15px] font-semibold text-white">Upload media</h2>
                  <button onClick={() => setShowUpload(false)} className="text-white/30 hover:text-white/70 transition-colors text-lg leading-none">✕</button>
                </div>
                <UploadZone onComplete={handleUploadComplete} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <div className="w-16 h-16 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center mb-5">
              <Upload className="w-6 h-6 text-white/20" />
            </div>
            <h2 className="text-[16px] font-semibold text-white mb-2">No projects yet</h2>
            <p className="text-[13px] text-white/35 mb-6 max-w-[260px] leading-relaxed">
              Upload a video or audio file to get AI-generated subtitles in seconds.
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-semibold transition-all shadow-xl shadow-indigo-500/20"
            >
              <Plus className="w-3.5 h-3.5" /> Upload your first file
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
          >
            <AnimatePresence mode="popLayout">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
