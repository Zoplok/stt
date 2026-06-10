import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  generateSummary,
  generateChapters,
  generateKeywordsAndHashtags,
  improveSubtitles,
} from "@/lib/ai/openai-tools";

const toolSchema = z.object({
  trackId: z.string(),
  tool: z.enum(["summary", "chapters", "keywords", "improve"]),
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
    const parsed = toolSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const track = await prisma.subtitleTrack.findFirst({
      where: { id: parsed.data.trackId, projectId },
      include: { segments: { orderBy: { index: "asc" } } },
    });
    if (!track) return Response.json({ error: "Track not found" }, { status: 404 });

    type Seg = typeof track.segments[number];
    const segs = track.segments.map((s: Seg) => ({
      index: s.index,
      startTime: s.startTime,
      text: s.text,
    }));

    switch (parsed.data.tool) {
      case "summary": {
        const summary = await generateSummary(segs);
        return Response.json({ type: "summary", content: summary });
      }
      case "chapters": {
        const duration = track.segments.at(-1)?.endTime ?? 0;
        const chapters = await generateChapters(segs, duration);
        return Response.json({ type: "chapters", content: chapters });
      }
      case "keywords": {
        const result = await generateKeywordsAndHashtags(segs);
        return Response.json({ type: "keywords", content: result });
      }
      case "improve": {
        const improved = await improveSubtitles(segs);
        await Promise.all(
          improved.map((s) =>
            prisma.subtitleSegment.updateMany({
              where: { trackId: track.id, index: s.index },
              data: { text: s.text },
            })
          )
        );
        return Response.json({ type: "improve", content: improved });
      }
      default:
        return Response.json({ error: "Unknown tool" }, { status: 400 });
    }
  } catch (error) {
    console.error("[POST /api/projects/[id]/ai-tools]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
