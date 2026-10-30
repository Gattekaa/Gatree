import { getAuthUser } from "@/lib/auth-utils";
import { uploadRateLimiter } from "@/lib/rate-limit";
import { validateImageMagicBytes } from "@/lib/security";
import { getStorageAdapter } from "@/lib/storage";
import { NextResponse } from "next/server";
import sharp from "sharp";

const ALLOWED_TYPES = ["avatar", "thumbnail", "image"] as const;
type UploadType = (typeof ALLOWED_TYPES)[number];

export async function POST(request: Request) {
  const authResult = await getAuthUser();
  if ("response" in authResult) return authResult.response;
  const { userId } = authResult;

  const { success } = await uploadRateLimiter.check(`upload:${userId}`);
  if (!success) {
    return NextResponse.json(
      { error: "Too many uploads. Try again in a minute." },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Max 5MB." },
        { status: 400 }
      );
    }

    const rawType = (formData.get("type") as string) || "avatar";
    const type: UploadType = ALLOWED_TYPES.includes(rawType as UploadType)
      ? (rawType as UploadType)
      : "avatar";

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!validateImageMagicBytes(buffer)) {
      return NextResponse.json(
        { error: "File is not a valid image" },
        { status: 400 }
      );
    }

    let processedImage: Buffer;
    let folder: string;
    let contentType: string;
    let extension: string;

    switch (type) {
      case "thumbnail":
        processedImage = await sharp(buffer)
          .resize(64, 64, { fit: "cover" })
          .png({ quality: 85 })
          .toBuffer();

        folder = `thumbnails/${userId}`;
        contentType = "image/png";
        extension = "png";
        break;

      case "image":
        processedImage = await sharp(buffer)
          .webp({ quality: 80 })
          .toBuffer();
        folder = `images/${userId}`;
        contentType = "image/webp";
        extension = "webp";
        break;

      case "avatar":
      default:
        processedImage = await sharp(buffer)
          .resize(256, 256, { fit: "cover" })
          .png({ quality: 90 })
          .toBuffer();
        folder = `avatars/${userId}`;
        contentType = "image/png";
        extension = "png";
        break;
    }

    const storage = await getStorageAdapter();
    const url = await storage.upload(processedImage, {
      folder,
      contentType,
      extension,
    });

    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
