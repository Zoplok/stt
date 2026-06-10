import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

const segmentSchema = z.object({
  trackId: z.string(),
  index: z.number().int().min(0),
  startTime: z.number().min(0),
  endTime: z.number().min(0),
  text: z.string(),
  speaker: z.string().optional().nullable(),
  style: z.record(z.string(), z.unknown()).optional().nullable(),
});

const bulkUpdateSchema = z.object({
  segments: z.array(
    z.object({
      id: z.string(),
      startTime: z.number().optional(),
      endTime: z.number().optional(),
      text: z.string().optional(),
      speaker: z.string().nullable().optional(),
      style: z.record(z.string(), z.unknown()).nullable().optional(),
    })
  ),
});

export async function PATCH(
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
    const parsed = bulkUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const updates = await Promise.all(
      parsed.data.segments.map(({ id, style, ...rest }) =>
        prisma.subtitleSegment.update({
          where: { id },
          data: {
            ...rest,
            ...(style !== undefined
              ? { style: style === null ? Prisma.JsonNull : style as Prisma.InputJsonValue }
              : {}),
          },
        })
      )
    );

    return Response.json({ segments: updates });
  } catch (error) {
    console.error("[PATCH /api/projects/[id]/segments]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
