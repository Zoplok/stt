import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId } = await params;
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ type: "connected", projectId });

      let attempts = 0;
      const maxAttempts = 180;

      const poll = async () => {
        try {
          const jobs = await prisma.job.findMany({
            where: {
              projectId,
              status: { in: ["PENDING", "PROCESSING"] },
            },
            orderBy: { createdAt: "desc" },
          });

          if (jobs.length === 0) {
            const latestJob = await prisma.job.findFirst({
              where: { projectId },
              orderBy: { createdAt: "desc" },
            });
            if (latestJob) {
              send({
                type: "completed",
                jobId: latestJob.id,
                jobType: latestJob.type,
                status: latestJob.status,
                progress: 100,
              });
            }
            controller.close();
            return;
          }

          for (const job of jobs) {
            send({
              type: "progress",
              jobId: job.id,
              jobType: job.type,
              status: job.status,
              progress: job.progress,
              error: job.error,
            });
          }

          attempts++;
          if (attempts >= maxAttempts) {
            send({ type: "timeout" });
            controller.close();
            return;
          }

          await new Promise((r) => setTimeout(r, 2000));
          await poll();
        } catch {
          controller.close();
        }
      };

      request.signal.addEventListener("abort", () => {
        controller.close();
      });

      await poll();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
