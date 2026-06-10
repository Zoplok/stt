"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors,
  Merge,
  Trash2,
  Plus,
  AlignLeft,
  ChevronDown,
} from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { usePlayerStore } from "@/stores/player-store";
import { cn, formatTime, generateId } from "@/lib/utils";
import type { SubtitleSegment } from "@/types";

function SegmentRow({
  segment,
  isActive,
  isSelected,
  isEditing,
  onSelect,
  onDoubleClick,
  onTextChange,
  onTextBlur,
  onSeek,
}: {
  segment: SubtitleSegment;
  isActive: boolean;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (id: string, multi: boolean) => void;
  onDoubleClick: (id: string) => void;
  onTextChange: (id: string, text: string) => void;
  onTextBlur: (id: string) => void;
  onSeek: (time: number) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      onClick={(e) => onSelect(segment.id, e.metaKey || e.ctrlKey || e.shiftKey)}
      onDoubleClick={() => onDoubleClick(segment.id)}
      className={cn(
        "group flex gap-3 px-4 py-3 border-b border-white/4 cursor-pointer transition-all relative",
        isActive && "bg-indigo-500/8 border-l-2 border-l-indigo-500",
        isSelected && !isActive && "bg-white/5",
        !isActive && !isSelected && "hover:bg-white/3"
      )}
    >
      {/* Index + timing */}
      <div className="flex flex-col items-end gap-1 shrink-0 pt-0.5">
        <span className="text-xs font-mono text-white/25 w-7 text-right">{segment.index + 1}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onSeek(segment.startTime); }}
          className="text-[10px] font-mono text-white/30 hover:text-indigo-400 transition-colors leading-none"
        >
          {formatTime(segment.startTime).replace(".", ",")}
        </button>
        <span className="text-[10px] font-mono text-white/20 leading-none">→</span>
        <button
          onClick={(e) => { e.stopPropagation(); onSeek(segment.endTime); }}
          className="text-[10px] font-mono text-white/30 hover:text-indigo-400 transition-colors leading-none"
        >
          {formatTime(segment.endTime).replace(".", ",")}
        </button>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        {segment.speaker && (
          <span className="text-[10px] font-medium text-indigo-400/70 uppercase tracking-wide block mb-1">
            {segment.speaker}
          </span>
        )}
        {isEditing ? (
          <textarea
            ref={textareaRef}
            defaultValue={segment.text}
            onChange={(e) => onTextChange(segment.id, e.target.value)}
            onBlur={() => onTextBlur(segment.id)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onTextBlur(segment.id);
            }}
            onClick={(e) => e.stopPropagation()}
            rows={2}
            className="w-full bg-transparent text-sm text-white leading-relaxed resize-none outline-none ring-1 ring-indigo-500/40 rounded-lg p-1.5"
          />
        ) : (
          <p className="text-sm text-white/80 leading-relaxed">{segment.text}</p>
        )}

        {segment.confidence != null && (
          <div className="flex items-center gap-1 mt-1">
            <div className="h-0.5 w-12 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500/60 rounded-full"
                style={{ width: `${Math.round(segment.confidence * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-white/20">{Math.round(segment.confidence * 100)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function SubtitleList() {
  const {
    segments,
    selectedIds,
    editingId,
    selectSegment,
    clearSelection,
    setEditingId,
    updateSegmentText,
    removeSegment,
    splitSegment,
    mergeSegments,
    pushHistory,
    upsertSegment,
  } = useEditorStore();
  const { currentTime, seek } = usePlayerStore();
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const activeSegmentId = segments.find(
    (s) => currentTime >= s.startTime && currentTime < s.endTime
  )?.id;

  useEffect(() => {
    if (!activeSegmentId) return;
    const el = document.getElementById(`seg-${activeSegmentId}`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeSegmentId]);

  const handleSeek = useCallback((time: number) => {
    seek(time);
    usePlayerStore.setState({ currentTime: time });
  }, [seek]);

  const handleDelete = () => {
    pushHistory();
    selectedIds.forEach((id) => removeSegment(id));
    clearSelection();
  };

  const handleSplit = () => {
    if (selectedIds.size !== 1) return;
    const id = [...selectedIds][0];
    const seg = segments.find((s) => s.id === id);
    if (!seg) return;
    pushHistory();
    splitSegment(id, (seg.startTime + seg.endTime) / 2);
  };

  const handleMerge = () => {
    if (selectedIds.size < 2) return;
    pushHistory();
    mergeSegments([...selectedIds]);
  };

  const handleAddSegment = () => {
    const now = new Date().toISOString();
    const last = segments.at(-1);
    const newSeg: SubtitleSegment = {
      id: generateId(),
      trackId: segments[0]?.trackId ?? "",
      index: segments.length,
      startTime: last ? last.endTime + 0.5 : 0,
      endTime: last ? last.endTime + 2.5 : 2,
      text: "New subtitle",
      words: undefined,
      speaker: null,
      confidence: null,
      style: null,
      createdAt: now,
      updatedAt: now,
    };
    pushHistory();
    upsertSegment(newSeg);
  };

  const filtered = searchQuery
    ? segments.filter((s) => s.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : segments;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 shrink-0">
        <input
          type="text"
          placeholder="Search subtitles…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 text-sm bg-white/5 rounded-lg px-3 py-1.5 text-white placeholder:text-white/25 outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all"
        />
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleSplit}
              disabled={selectedIds.size !== 1}
              title="Split"
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-all disabled:opacity-30"
            >
              <Scissors className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleMerge}
              disabled={selectedIds.size < 2}
              title="Merge"
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-all disabled:opacity-30"
            >
              <Merge className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              title="Delete"
              className="p-1.5 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <button
          onClick={handleAddSegment}
          title="Add segment"
          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Count */}
      <div className="px-4 py-1.5 border-b border-white/4 text-xs text-white/25 shrink-0">
        {segments.length} subtitle{segments.length !== 1 ? "s" : ""}
        {selectedIds.size > 0 && ` · ${selectedIds.size} selected`}
        {searchQuery && ` · ${filtered.length} results`}
      </div>

      {/* List */}
      <div ref={containerRef} className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-white/20 text-sm gap-2">
            <AlignLeft className="w-6 h-6" />
            <span>{searchQuery ? "No results" : "No subtitles yet"}</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((seg) => (
              <div key={seg.id} id={`seg-${seg.id}`}>
                <SegmentRow
                  segment={seg}
                  isActive={seg.id === activeSegmentId}
                  isSelected={selectedIds.has(seg.id)}
                  isEditing={seg.id === editingId}
                  onSelect={selectSegment}
                  onDoubleClick={setEditingId}
                  onTextChange={updateSegmentText}
                  onTextBlur={() => setEditingId(null)}
                  onSeek={handleSeek}
                />
              </div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
