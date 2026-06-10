import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { translateSubtitles } from "@/lib/ai/openai-tools";

const translateSchema = z.object({
  trackId: z.string(),
  targetLanguage: z.string().min(2).max(10),
  sourceLanguage: z.string().default("auto"),
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
    const parsed = translateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const track = await prisma.subtitleTrack.findFirst({
      where: { id: parsed.data.trackId, projectId },
      include: { segments: { orderBy: { index: "asc" } } },
    });
    if (!track) return Response.json({ error: "Track not found" }, { status: 404 });

    const job = await prisma.job.create({
      data: {
        projectId,
        type: "TRANSLATION",
        status: "PROCESSING",
        progress: 10,
        metadata: {
          trackId: track.id,
          targetLanguage: parsed.data.targetLanguage,
          sourceLanguage: parsed.data.sourceLanguage,
        },
      },
    });

    runTranslationInBackground(job.id, track.segments, parsed.data, projectId, track.id).catch(console.error);

    return Response.json({ jobId: job.id, status: "PROCESSING" }, { status: 202 });
  } catch (error) {
    console.error("[POST /api/projects/[id]/translate]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function runTranslationInBackground(
  jobId: string,
  segments: { index: number; text: string }[],
  options: z.infer<typeof translateSchema>,
  projectId: string,
  sourceTrackId: string
) {
  try {
    const translated = await translateSubtitles(
      segments.map((s) => ({ index: s.index, text: s.text })),
      options.targetLanguage,
      options.sourceLanguage
    );

    await prisma.job.update({ where: { id: jobId }, data: { progress: 80 } });

    const existing = await prisma.translation.findFirst({
      where: { projectId, trackId: sourceTrackId, targetLanguage: options.targetLanguage },
    });

    if (existing) {
      await prisma.translation.update({
        where: { id: existing.id },
        data: { segments: translated, status: "COMPLETED" },
      });
    } else {
      await prisma.translation.create({
        data: {
          projectId,
          trackId: sourceTrackId,
          targetLanguage: options.targetLanguage,
          sourceLanguage: options.sourceLanguage === "auto" ? "en" : options.sourceLanguage,
          segments: translated,
          status: "COMPLETED",
        },
      });
    }

    await prisma.job.update({
      where: { id: jobId },
      data: { status: "COMPLETED", progress: 100, completedAt: new Date() },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "FAILED", error: message, completedAt: new Date() },
    });
  }
}
