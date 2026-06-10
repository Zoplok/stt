"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { ZoomIn, ZoomOut, AlignLeft } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { usePlayerStore } from "@/stores/player-store";
import { cn, formatTime, clamp } from "@/lib/utils";

interface TimelineEditorProps {
  duration: number;
}

const TRACK_HEIGHT = 40;
const RULER_HEIGHT = 24;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 20;

export function TimelineEditor({ duration }: TimelineEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const isDraggingRef = useRef<{ segId: string; edge: "start" | "end" | "move"; startX: number; origStart: number; origEnd: number } | null>(null);

  const {
    segments, zoom, scrollX,
    setZoom, setScrollX,
    updateSegmentTiming, selectSegment, selectedIds, pushHistory,
  } = useEditorStore();

  const { currentTime, duration: playerDuration, seek } = usePlayerStore();
  const totalDuration = duration || playerDuration || 60;
  const pixelsPerSecond = zoom * 80;
  const totalWidth = totalDuration * pixelsPerSecond;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const timeToX = useCallback((t: number) => t * pixelsPerSecond - scrollX, [pixelsPerSecond, scrollX]);
  const xToTime = useCallback((x: number) => (x + scrollX) / pixelsPerSecond, [pixelsPerSecond, scrollX]);

  // Draw ruler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = RULER_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, containerWidth, RULER_HEIGHT);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(0, 0, containerWidth, RULER_HEIGHT);

    const step = pickStep(pixelsPerSecond);
    const startTime = scrollX / pixelsPerSecond;
    const endTime = (scrollX + containerWidth) / pixelsPerSecond;
    const firstTick = Math.floor(startTime / step) * step;

    ctx.font = "9px 'Geist Mono', monospace";
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;

    for (let t = firstTick; t <= endTime + step; t += step) {
      const x = timeToX(t);
      if (x < 0 || x > containerWidth) continue;
      ctx.beginPath();
      ctx.moveTo(x, RULER_HEIGHT - 8);
      ctx.lineTo(x, RULER_HEIGHT);
      ctx.stroke();
      ctx.fillText(formatTime(t).slice(0, 5), x + 2, RULER_HEIGHT - 10);
    }

    // Playhead on ruler
    const phX = timeToX(currentTime);
    if (phX >= 0 && phX <= containerWidth) {
      ctx.fillStyle = "rgba(99,102,241,0.9)";
      ctx.fillRect(phX - 1, 0, 2, RULER_HEIGHT);
    }
  }, [containerWidth, pixelsPerSecond, scrollX, currentTime, timeToX]);

  const handleRulerClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const t = clamp(xToTime(x), 0, totalDuration);
    seek(t);
    usePlayerStore.setState({ currentTime: t });
  };

  const handleWheelScroll = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const newZoom = clamp(zoom * (e.deltaY > 0 ? 0.9 : 1.1), MIN_ZOOM, MAX_ZOOM);
      setZoom(newZoom);
    } else {
      setScrollX(clamp(scrollX + e.deltaX + e.deltaY * 0.5, 0, Math.max(0, totalWidth - containerWidth)));
    }
  };

  const handleSegmentMouseDown = (e: React.MouseEvent, segId: string, edge: "start" | "end" | "move") => {
    e.stopPropagation();
    const seg = segments.find((s) => s.id === segId);
    if (!seg) return;
    selectSegment(segId, e.metaKey || e.ctrlKey);
    isDraggingRef.current = { segId, edge, startX: e.clientX, origStart: seg.startTime, origEnd: seg.endTime };
    pushHistory();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const drag = isDraggingRef.current;
    if (!drag) return;
    const deltaX = e.clientX - drag.startX;
    const deltaSec = deltaX / pixelsPerSecond;
    const seg = segments.find((s) => s.id === drag.segId);
    if (!seg) return;

    switch (drag.edge) {
      case "start": {
        const newStart = clamp(drag.origStart + deltaSec, 0, seg.endTime - 0.1);
        updateSegmentTiming(drag.segId, newStart, seg.endTime);
        break;
      }
      case "end": {
        const newEnd = clamp(drag.origEnd + deltaSec, seg.startTime + 0.1, totalDuration);
        updateSegmentTiming(drag.segId, seg.startTime, newEnd);
        break;
      }
      case "move": {
        const dur = drag.origEnd - drag.origStart;
        const newStart = clamp(drag.origStart + deltaSec, 0, totalDuration - dur);
        updateSegmentTiming(drag.segId, newStart, newStart + dur);
        break;
      }
    }
  }, [pixelsPerSecond, segments, totalDuration, updateSegmentTiming]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const playheadX = timeToX(currentTime);

  return (
    <div className="flex flex-col h-full bg-black/20" ref={containerRef} onWheel={handleWheelScroll}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 shrink-0">
        <span className="text-xs text-white/30 font-mono">{formatTime(currentTime)}</span>
        <div className="flex-1" />
        <button onClick={() => setZoom(clamp(zoom / 1.5, MIN_ZOOM, MAX_ZOOM))} className="p-1 text-white/40 hover:text-white transition-colors">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs text-white/30 w-10 text-center">{zoom.toFixed(1)}×</span>
        <button onClick={() => setZoom(clamp(zoom * 1.5, MIN_ZOOM, MAX_ZOOM))} className="p-1 text-white/40 hover:text-white transition-colors">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => { setZoom(1); setScrollX(0); }} className="p-1 text-white/40 hover:text-white transition-colors">
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Ruler */}
      <canvas
        ref={canvasRef}
        height={RULER_HEIGHT}
        style={{ width: "100%", height: RULER_HEIGHT, cursor: "pointer", display: "block" }}
        onClick={handleRulerClick}
      />

      {/* Track area */}
      <div className="flex-1 relative overflow-hidden timeline-track">
        <div
          className="absolute inset-0 overflow-x-auto overflow-y-hidden"
          onScroll={(e) => setScrollX((e.currentTarget as HTMLDivElement).scrollLeft)}
        >
          <div style={{ width: totalWidth, height: "100%", position: "relative" }}>
            {/* Playhead */}
            {playheadX >= 0 && playheadX <= containerWidth && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 z-20 pointer-events-none"
                style={{ left: timeToX(currentTime) }}
              >
                <div className="w-2 h-2 bg-emerald-500 rounded-full -translate-x-[3px] -translate-y-[2px]" />
              </div>
            )}

            {/* Segments */}
            {segments.map((seg) => {
              const x = timeToX(seg.startTime);
              const w = Math.max(2, (seg.endTime - seg.startTime) * pixelsPerSecond);
              const isSelected = selectedIds.has(seg.id);

              if (x + w < 0 || x > containerWidth + 200) return null;

              return (
                <div
                  key={seg.id}
                  className={cn(
                    "absolute top-2 rounded-md border text-[10px] font-medium text-white overflow-hidden select-none cursor-grab active:cursor-grabbing",
                    isSelected
                      ? "bg-emerald-500/30 border-emerald-400/60"
                      : "bg-white/10 border-white/15 hover:bg-white/15"
                  )}
                  style={{
                    left: x,
                    width: w,
                    height: TRACK_HEIGHT,
                  }}
                  onMouseDown={(e) => handleSegmentMouseDown(e, seg.id, "move")}
                >
                  {/* Left resize handle */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-emerald-500/40 transition-colors z-10"
                    onMouseDown={(e) => { e.stopPropagation(); handleSegmentMouseDown(e, seg.id, "start"); }}
                  />
                  {/* Text */}
                  <span className="block px-3 py-1 leading-tight truncate text-white/70">{seg.text}</span>
                  {/* Right resize handle */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-emerald-500/40 transition-colors z-10"
                    onMouseDown={(e) => { e.stopPropagation(); handleSegmentMouseDown(e, seg.id, "end"); }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function pickStep(pps: number): number {
  if (pps < 4) return 60;
  if (pps < 10) return 30;
  if (pps < 20) return 10;
  if (pps < 40) return 5;
  if (pps < 100) return 1;
  return 0.5;
}
