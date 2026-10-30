import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import type { StorageAdapter, UploadOptions } from "../index";

export class R2Adapter implements StorageAdapter {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "R2 not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY."
      );
    }

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    this.bucket = process.env.R2_BUCKET_NAME || "gatree-uploads";
    this.publicUrl =
      process.env.R2_PUBLIC_URL ||
      `https://${this.bucket}.${accountId}.r2.dev`;
  }

  async upload(buffer: Buffer, options: UploadOptions = {}): Promise<string> {
    const { folder = "avatars", contentType = "image/png", extension = "png" } = options;
    const key = `${folder}/${randomUUID()}.${extension}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    return `${this.publicUrl}/${key}`;
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      let key: string;

      if (fileUrl.startsWith(this.publicUrl)) {
        key = fileUrl.replace(`${this.publicUrl}/`, "");
      } else {
        const url = new URL(fileUrl);
        key = url.pathname.slice(1);
      }

      if (!key) return;

      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
    } catch (error) {
      console.error("[R2] Failed to delete:", error);
    }
  }
}
