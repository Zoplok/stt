import type { SubtitleSegment, ExportFormat, ExportOptions, SubtitleStyle } from "@/types";
import { formatTimeSRT, formatTimeVTT } from "@/lib/utils";

function applyStyle(text: string, style?: SubtitleStyle | null): string {
  if (!style) return text;
  let result = text;
  if (style.bold) result = `<b>${result}</b>`;
  if (style.italic) result = `<i>${result}</i>`;
  if (style.underline) result = `<u>${result}</u>`;
  if (style.color) result = `<font color="${style.color}">${result}</font>`;
  return result;
}

function wrapLines(text: string, maxLen: number, maxLines: number): string {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if ((current + (current ? " " : "") + word).length > maxLen) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);

  return lines.slice(0, maxLines).join("\n");
}

export function exportSRT(segments: SubtitleSegment[], options: ExportOptions): string {
  return segments
    .map((seg, i) => {
      const text = options.includeStyles
        ? applyStyle(wrapLines(seg.text, options.maxLineLength ?? 42, options.maxLinesPerSegment ?? 2), seg.style)
        : wrapLines(seg.text, options.maxLineLength ?? 42, options.maxLinesPerSegment ?? 2);

      return `${i + 1}\n${formatTimeSRT(seg.startTime)} --> ${formatTimeSRT(seg.endTime)}\n${text}`;
    })
    .join("\n\n");
}

export function exportVTT(segments: SubtitleSegment[], options: ExportOptions): string {
  const header = "WEBVTT\n\n";
  const body = segments
    .map((seg, i) => {
      const text = wrapLines(seg.text, options.maxLineLength ?? 42, options.maxLinesPerSegment ?? 2);
      return `${i + 1}\n${formatTimeVTT(seg.startTime)} --> ${formatTimeVTT(seg.endTime)}\n${text}`;
    })
    .join("\n\n");
  return header + body;
}

export function exportTXT(segments: SubtitleSegment[]): string {
  return segments.map((s) => s.text).join("\n");
}

export function exportJSON(segments: SubtitleSegment[]): string {
  return JSON.stringify(
    segments.map((s) => ({
      index: s.index,
      startTime: s.startTime,
      endTime: s.endTime,
      text: s.text,
      speaker: s.speaker,
      confidence: s.confidence,
      words: s.words,
    })),
    null,
    2
  );
}

export function exportASS(segments: SubtitleSegment[], options: ExportOptions): string {
  function toASSTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const cs = Math.floor((seconds % 1) * 100);
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  }

  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,52,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,20,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = segments
    .map((seg) => {
      const text = seg.text.replace(/\n/g, "\\N");
      return `Dialogue: 0,${toASSTime(seg.startTime)},${toASSTime(seg.endTime)},Default,,0,0,0,,${text}`;
    })
    .join("\n");

  return header + events;
}

export function exportSubtitles(
  segments: SubtitleSegment[],
  format: ExportFormat,
  options: ExportOptions
): string {
  const sorted = [...segments].sort((a, b) => a.startTime - b.startTime);

  switch (format) {
    case "SRT":
      return exportSRT(sorted, options);
    case "VTT":
      return exportVTT(sorted, options);
    case "TXT":
      return exportTXT(sorted);
    case "JSON":
      return exportJSON(sorted);
    case "ASS":
      return exportASS(sorted, options);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

export function getMimeType(format: ExportFormat): string {
  const mimes: Record<ExportFormat, string> = {
    SRT: "text/plain",
    VTT: "text/vtt",
    TXT: "text/plain",
    JSON: "application/json",
    ASS: "text/plain",
  };
  return mimes[format];
}

export function getFileExtension(format: ExportFormat): string {
  return format.toLowerCase();
}
