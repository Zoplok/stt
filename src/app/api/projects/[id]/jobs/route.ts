import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
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

    const jobs = await prisma.job.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return Response.json({ jobs });
  } catch (error) {
    console.error("[GET /api/projects/[id]/jobs]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
