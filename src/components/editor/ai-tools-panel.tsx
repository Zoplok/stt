"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  BookOpen,
  List,
  Hash,
  Sparkles,
  Loader2,
  Globe2,
  ChevronDown,
} from "lucide-react";

interface AIToolsPanelProps {
  projectId: string;
  trackId: string;
}

type Tool = "summary" | "chapters" | "keywords" | "improve";

const LANGUAGES = [
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ja", label: "Japanese" },
  { code: "zh", label: "Chinese" },
  { code: "ko", label: "Korean" },
  { code: "pt", label: "Portuguese" },
  { code: "ar", label: "Arabic" },
  { code: "ru", label: "Russian" },
  { code: "hi", label: "Hindi" },
  { code: "it", label: "Italian" },
  { code: "nl", label: "Dutch" },
];

const tools = [
  { id: "summary" as Tool, icon: BookOpen, label: "Summary", desc: "Generate a concise summary" },
  { id: "chapters" as Tool, icon: List, label: "Chapters", desc: "Auto-detect chapter markers" },
  { id: "keywords" as Tool, icon: Hash, label: "Keywords & Hashtags", desc: "SEO metadata + description" },
  { id: "improve" as Tool, icon: Sparkles, label: "Improve Grammar", desc: "Fix grammar & punctuation" },
];

export function AIToolsPanel({ projectId, trackId }: AIToolsPanelProps) {
  const [loading, setLoading] = useState<Tool | "translate" | null>(null);
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [translateLang, setTranslateLang] = useState("es");

  const runTool = async (tool: Tool) => {
    setLoading(tool);
    try {
      const res = await fetch(`/api/projects/${projectId}/ai-tools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId, tool }),
      });
      const data = await res.json() as { type: string; content: unknown };
      setResults((prev) => ({ ...prev, [tool]: data.content }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const runTranslate = async () => {
    setLoading("translate");
    try {
      await fetch(`/api/projects/${projectId}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId, targetLanguage: translateLang }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-white/5 shrink-0">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-emerald-400" />
          AI Tools
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Translate */}
        <div className="bg-card border border-border rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-white/60 mb-1">
            <Globe2 className="w-3.5 h-3.5" />
            Translate
          </div>
          <select
            value={translateLang}
            onChange={(e) => setTranslateLang(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-emerald-500/40"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-zinc-900">
                {l.label}
              </option>
            ))}
          </select>
          <button
            onClick={runTranslate}
            disabled={loading === "translate"}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-sm font-medium transition-all disabled:opacity-50"
          >
            {loading === "translate" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Globe2 className="w-3.5 h-3.5" />
            )}
            {loading === "translate" ? "Translating…" : "Translate subtitles"}
          </button>
        </div>

        {/* AI tools */}
        {tools.map((tool) => (
          <div key={tool.id} className="bg-card border border-border rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <tool.icon className="w-3.5 h-3.5 text-white/50" />
                <span className="text-xs font-medium text-white/70">{tool.label}</span>
              </div>
              <button
                onClick={() => runTool(tool.id)}
                disabled={loading === tool.id}
                className="px-3 py-1 rounded-lg bg-white/8 hover:bg-white/12 text-xs text-white/60 hover:text-white transition-all disabled:opacity-50"
              >
                {loading === tool.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  "Run"
                )}
              </button>
            </div>
            <p className="text-[10px] text-white/30">{tool.desc}</p>

            <AnimatePresence>
              {Boolean(results[tool.id]) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 pt-2 border-t border-white/5 text-xs text-white/60 leading-relaxed max-h-48 overflow-y-auto">
                    {tool.id === "summary" && (
                      <p>{String(results[tool.id] ?? "")}</p>
                    )}
                    {tool.id === "chapters" && Array.isArray(results[tool.id]) && (
                      <div className="space-y-1">
                        {(results[tool.id] as { time: number; title: string }[]).map((c, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-emerald-400/60 font-mono shrink-0">
                              {Math.floor(c.time / 60)}:{String(Math.floor(c.time % 60)).padStart(2, "0")}
                            </span>
                            <span>{c.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {tool.id === "keywords" && Boolean(results[tool.id]) && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {((results[tool.id] as { hashtags?: string[] })?.hashtags ?? []).map((h, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px]">{h}</span>
                          ))}
                        </div>
                        <p className="text-white/40 italic">{(results[tool.id] as { description?: string })?.description}</p>
                      </div>
                    )}
                    {tool.id === "improve" && (
                      <p className="text-emerald-400/70">
                        ✓ {Array.isArray(results[tool.id]) ? String((results[tool.id] as unknown[]).length) : "0"} subtitle{Array.isArray(results[tool.id]) && (results[tool.id] as unknown[]).length !== 1 ? "s" : ""} improved
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
