import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";

const presignSchema = z.object({
  filename: z.string().min(1).max(500),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
});

const MAX_SIZE = 2 * 1024 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = presignSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    if (parsed.data.size > MAX_SIZE) {
      return Response.json({ error: "File too large (max 2GB)" }, { status: 413 });
    }

    const ext = parsed.data.filename.split(".").pop() ?? "bin";
    const key = `uploads/${userId}/${nanoid()}/${Date.now()}.${ext}`;

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_S3_BUCKET) {
      const mockUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/upload/mock`;
      return Response.json({
        uploadUrl: mockUrl,
        key,
        publicUrl: `https://placeholder.example.com/${key}`,
      });
    }

    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    const s3 = new S3Client({
      region: process.env.AWS_REGION ?? "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      ContentType: parsed.data.mimeType,
      ContentLength: parsed.data.size,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION ?? "us-east-1"}.amazonaws.com/${key}`;

    return Response.json({ uploadUrl, key, publicUrl });
  } catch (error) {
    console.error("[POST /api/upload/presign]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
