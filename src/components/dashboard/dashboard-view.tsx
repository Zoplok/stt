"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  FileVideo,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Project } from "@/types";

type ProjectStatus = "DRAFT" | "PROCESSING" | "READY" | "ERROR";

const statusConfig: Record<ProjectStatus, { icon: React.ElementType; label: string; className: string }> = {
  DRAFT: { icon: FileVideo, label: "DRAFT", className: "text-muted-foreground border-border" },
  PROCESSING: { icon: Loader2, label: "PROCESSING", className: "text-foreground border-border" },
  READY: { icon: CheckCircle2, label: "READY", className: "text-primary border-primary/30" },
  ERROR: { icon: AlertCircle, label: "ERROR", className: "text-destructive border-destructive/30" },
};

function ProjectCard({ project, onDelete }: { project: Project; onDelete: (id: string) => void }) {
  const status = statusConfig[project.status];
  const StatusIcon = status.icon;
  const thumb = project.thumbnailUrl ?? project.mediaFiles?.[0]?.thumbnailUrl;
  const duration = project.duration ?? project.mediaFiles?.[0]?.duration;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className="group relative overflow-hidden border border-border bg-card transition-colors hover:border-muted-foreground/30"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden border-b border-border bg-black">
        {thumb ? (
          <img src={thumb} alt={project.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FileVideo className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}

        {duration != null && (
          <div className="absolute right-2 bottom-2 bg-background/90 px-1.5 py-0.5 font-mono text-[10px] text-foreground/70">
            {formatDuration(duration)}
          </div>
        )}

        {project.status === "PROCESSING" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/70 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <Button size="xs" asChild>
            <Link href={`/projects/${project.id}`}>
              <ExternalLink data-icon="inline-start" /> Open
            </Link>
          </Button>
          <Button size="icon-xs" variant="destructive" onClick={() => onDelete(project.id)}>
            <Trash2 />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="px-3.5 py-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-[13px] font-medium text-foreground">{project.title}</h3>
          <Badge variant="outline" className={cn("shrink-0 gap-1 rounded-none font-mono text-[9px] tracking-[0.12em]", status.className)}>
            <StatusIcon className={cn("h-2.5 w-2.5", project.status === "PROCESSING" && "animate-spin")} />
            {status.label}
          </Badge>
        </div>
        <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground/70">
          <span>{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true }).toUpperCase()}</span>
          <span>{project.subtitleTracks?.length ?? 0} TRK</span>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden border border-border bg-card">
      <Skeleton className="aspect-video rounded-none" />
      <div className="space-y-2 px-3.5 py-3">
        <Skeleton className="h-3.5 w-3/4 rounded-none" />
        <Skeleton className="h-2.5 w-1/3 rounded-none" />
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

  const counts = {
    total: projects.length,
    ready: projects.filter((p) => p.status === "READY").length,
    processing: projects.filter((p) => p.status === "PROCESSING").length,
    draft: projects.filter((p) => p.status === "DRAFT").length,
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Top bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-[12px] font-semibold tracking-[0.2em] text-foreground">PROJECTS</h1>
          <Badge variant="secondary" className="rounded-none font-mono text-[10px] tabular-nums">
            {counts.total}
          </Badge>
        </div>
        <Button size="xs" onClick={() => setShowUpload(true)}>
          <Plus data-icon="inline-start" /> New Project
        </Button>
      </div>

      {/* Stats strip */}
      {!isLoading && projects.length > 0 && (
        <div className="flex shrink-0 items-center gap-6 border-b border-border px-6 py-2.5">
          {[
            { label: "TOTAL", value: counts.total, className: "text-foreground" },
            { label: "READY", value: counts.ready, className: "text-primary" },
            { label: "PROCESSING", value: counts.processing, className: "text-foreground" },
            { label: "DRAFT", value: counts.draft, className: "text-muted-foreground" },
          ].map((s) => (
            <div key={s.label} className="flex items-baseline gap-1.5">
              <span className={cn("font-mono text-[13px] font-semibold tabular-nums", s.className)}>{s.value}</span>
              <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground/60">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">

        {/* Upload dialog */}
        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogContent className="rounded-none sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-mono text-[13px] tracking-[0.15em]">UPLOAD MEDIA</DialogTitle>
            </DialogHeader>
            <UploadZone onComplete={handleUploadComplete} />
          </DialogContent>
        </Dialog>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-[60vh] flex-col items-center justify-center text-center"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center border border-border bg-card">
              <Upload className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <h2 className="font-mono text-[13px] font-semibold tracking-[0.15em] text-foreground">NO PROJECTS</h2>
            <p className="mt-2 mb-6 max-w-[260px] text-[13px] leading-relaxed text-muted-foreground">
              Upload a video or audio file to get AI-generated subtitles in seconds.
            </p>
            <Button size="sm" onClick={() => setShowUpload(true)}>
              <Plus data-icon="inline-start" /> Upload your first file
            </Button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
