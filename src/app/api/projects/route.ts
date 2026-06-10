import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  language: z.string().default("en"),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: { userId: user.id },
        include: {
          mediaFiles: { select: { id: true, duration: true, thumbnailUrl: true, mimeType: true } },
          subtitleTracks: { select: { id: true, language: true, isDefault: true } },
          jobs: { where: { status: { in: ["PENDING", "PROCESSING"] } }, select: { id: true, type: true, status: true, progress: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.project.count({ where: { userId: user.id } }),
    ]);

    return Response.json({ projects, total, page, limit });
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        title: parsed.data.title,
        description: parsed.data.description,
        language: parsed.data.language,
      },
    });

    return Response.json({ project }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/projects]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
