import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exportSubtitles, getMimeType, getFileExtension } from "@/lib/export/subtitle-exporter";
import type { SubtitleSegment, ExportFormat, SubtitleStyle, WordTimestamp } from "@/types";

const exportSchema = z.object({
  trackId: z.string(),
  format: z.enum(["SRT", "VTT", "TXT", "JSON", "ASS"]),
  includeTimestamps: z.boolean().default(true),
  includeStyles: z.boolean().default(false),
  maxLineLength: z.number().int().min(20).max(120).default(42),
  maxLinesPerSegment: z.number().int().min(1).max(4).default(2),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id: projectId } = await params;
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
    if (!project) return Response.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const parsed = exportSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const track = await prisma.subtitleTrack.findFirst({
      where: { id: parsed.data.trackId, projectId },
      include: { segments: { orderBy: { index: "asc" } } },
    });
    if (!track) return Response.json({ error: "Track not found" }, { status: 404 });

    type PrismaSegment = typeof track.segments[number];
    const segments: SubtitleSegment[] = track.segments.map((s: PrismaSegment) => ({
      id: s.id,
      trackId: s.trackId,
      index: s.index,
      startTime: s.startTime,
      endTime: s.endTime,
      text: s.text,
      words: s.words as unknown as SubtitleSegment["words"],
      speaker: s.speaker,
      confidence: s.confidence,
      style: s.style as SubtitleSegment["style"],
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));

    const content = exportSubtitles(segments, parsed.data.format as ExportFormat, {
      format: parsed.data.format as ExportFormat,
      includeTimestamps: parsed.data.includeTimestamps,
      includeStyles: parsed.data.includeStyles,
      maxLineLength: parsed.data.maxLineLength,
      maxLinesPerSegment: parsed.data.maxLinesPerSegment,
    });

    const mimeType = getMimeType(parsed.data.format as ExportFormat);
    const ext = getFileExtension(parsed.data.format as ExportFormat);
    const filename = `${project.title.replace(/[^a-z0-9]/gi, "_")}_subtitles.${ext}`;

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": `${mimeType}; charset=utf-8`,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[POST /api/projects/[id]/export]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
