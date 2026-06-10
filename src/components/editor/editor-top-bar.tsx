"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Wand2,
  Download,
  Loader2,
  CheckCircle2,
  Mic,
  Globe2,
  MoreHorizontal,
} from "lucide-react";
import type { Project } from "@/types";

interface EditorTopBarProps {
  project: Project;
  isSaving: boolean;
  onToggleAI: () => void;
  trackId?: string;
  onRefresh: () => void;
}

const exportFormats = ["SRT", "VTT", "TXT", "JSON", "ASS"] as const;

export function EditorTopBar({ project, isSaving, onToggleAI, trackId, onRefresh }: EditorTopBarProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showTranscribeOpts, setShowTranscribeOpts] = useState(false);

  const handleTranscribe = async (provider: "WHISPER" | "DEEPGRAM" | "ASSEMBLYAI") => {
    const mediaFile = project.mediaFiles?.[0];
    if (!mediaFile) return;
    setIsTranscribing(true);
    setShowTranscribeOpts(false);
    try {
      const res = await fetch(`/api/projects/${project.id}/transcribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaFileId: mediaFile.id,
          provider,
          language: project.language ?? "en",
          wordTimestamps: true,
        }),
      });
      if (res.ok) {
        await new Promise((r) => setTimeout(r, 3000));
        onRefresh();
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleExport = async (format: typeof exportFormats[number]) => {
    if (!trackId) return;
    setShowExport(false);
    try {
      const res = await fetch(`/api/projects/${project.id}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId, format }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] ?? `subtitles.${format.toLowerCase()}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 glass shrink-0">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:block">Projects</span>
      </Link>

      <div className="w-px h-4 bg-white/10" />

      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-medium truncate">{project.title}</h1>
      </div>

      {/* Save indicator */}
      <div className="flex items-center gap-1.5 text-xs text-white/30">
        {isSaving ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Saving…</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60" />
            <span>Saved</span>
          </>
        )}
      </div>

      <div className="w-px h-4 bg-white/10" />

      {/* Transcribe */}
      <div className="relative">
        <button
          onClick={() => setShowTranscribeOpts((v) => !v)}
          disabled={isTranscribing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/8 transition-all disabled:opacity-50"
        >
          {isTranscribing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          ) : (
            <Mic className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:block">{isTranscribing ? "Transcribing…" : "Transcribe"}</span>
        </button>
        {showTranscribeOpts && (
          <div className="absolute top-full mt-1 right-0 z-50 w-48 glass-heavy rounded-xl border border-white/10 py-1 shadow-2xl">
            {(["WHISPER", "DEEPGRAM", "ASSEMBLYAI"] as const).map((p) => (
              <button
                key={p}
                onClick={() => handleTranscribe(p)}
                className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Translate */}
      <button
        onClick={onToggleAI}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/8 transition-all"
      >
        <Wand2 className="w-3.5 h-3.5" />
        <span className="hidden sm:block">AI Tools</span>
      </button>

      {/* Export */}
      <div className="relative">
        <button
          onClick={() => setShowExport((v) => !v)}
          disabled={!trackId}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:block">Export</span>
        </button>
        {showExport && (
          <div className="absolute top-full mt-1 right-0 z-50 w-36 glass-heavy rounded-xl border border-white/10 py-1 shadow-2xl">
            {exportFormats.map((fmt) => (
              <button
                key={fmt}
                onClick={() => handleExport(fmt)}
                className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                .{fmt.toLowerCase()}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
