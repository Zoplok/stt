import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as {
      type: string;
      data: {
        id: string;
        email_addresses: Array<{ email_address: string }>;
        first_name?: string | null;
        last_name?: string | null;
        image_url?: string | null;
      };
    };

    const { type, data } = payload;

    switch (type) {
      case "user.created": {
        const email = data.email_addresses[0]?.email_address ?? "";
        const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

        await prisma.user.upsert({
          where: { clerkId: data.id },
          create: {
            clerkId: data.id,
            email,
            name,
            avatarUrl: data.image_url,
          },
          update: {
            email,
            name,
            avatarUrl: data.image_url,
          },
        });
        break;
      }
      case "user.updated": {
        const email = data.email_addresses[0]?.email_address ?? "";
        const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

        await prisma.user.updateMany({
          where: { clerkId: data.id },
          data: { email, name, avatarUrl: data.image_url },
        });
        break;
      }
      case "user.deleted": {
        await prisma.user.deleteMany({ where: { clerkId: data.id } });
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("[Clerk webhook]", error);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
