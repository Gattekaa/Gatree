import { randomUUID } from "crypto";
import type { StorageAdapter, UploadOptions } from "../index";

export class LocalAdapter implements StorageAdapter {
  async upload(buffer: Buffer, options: UploadOptions = {}): Promise<string> {
    const { folder = "avatars", extension = "png" } = options;
    const path = await import( "path");
    const { mkdir, writeFile } = await import( "fs/promises");

    const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${randomUUID()}.${extension}`;
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    return `/uploads/${folder}/${filename}`;
  }

  async delete(fileUrl: string): Promise<void> {
    if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;

    try {
      const path = await import( "path");
      const { unlink } = await import( "fs/promises");
      const filepath = path.join(process.cwd(), "public", fileUrl);
      await unlink(filepath);
    } catch {

    }
  }
}
