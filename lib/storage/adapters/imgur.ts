import type { StorageAdapter } from "../index";

export class ImgurAdapter implements StorageAdapter {
  async upload(buffer: Buffer): Promise<string> {
    const clientId = process.env.IMGUR_CLIENT_ID;
    if (!clientId) throw new Error("IMGUR_CLIENT_ID is not configured");

    const response = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        Authorization: `Client-ID ${clientId}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: buffer.toString("base64"), type: "base64" }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`Imgur upload failed (${response.status})`);

    const result: { success?: boolean; data?: { link?: string } } = await response.json();
    if (!result.success || !result.data?.link) {
      throw new Error("Imgur did not return an image URL");
    }
    const url = new URL(result.data.link);
    if (url.protocol !== "https:" || url.hostname !== "i.imgur.com") {
      throw new Error("Imgur returned an unexpected image URL");
    }
    return url.toString();
  }
}
