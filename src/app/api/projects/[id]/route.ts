import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  language: z.string().optional(),
});

async function getProjectForUser(projectId: string, clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return null;
  return prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
    include: {
      mediaFiles: true,
      subtitleTracks: {
        include: {
          segments: { orderBy: { index: "asc" } },
        },
      },
      translations: true,
      jobs: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const project = await getProjectForUser(id, userId);
    if (!project) return Response.json({ error: "Not found" }, { status: 404 });

    return Response.json({ project });
  } catch (error) {
    console.error("[GET /api/projects/[id]]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const existing = await prisma.project.findFirst({ where: { id, userId: user.id } });
    if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const project = await prisma.project.update({
      where: { id },
      data: parsed.data,
    });

    return Response.json({ project });
  } catch (error) {
    console.error("[PATCH /api/projects/[id]]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const existing = await prisma.project.findFirst({ where: { id, userId: user.id } });
    if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

    await prisma.project.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/projects/[id]]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
