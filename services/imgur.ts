const IMGUR_API_URL = "https://api.imgur.com/3/image";

/**
 * Upload an image to Imgur
 *
 * @param file - Image file as Buffer, Blob, or base64 string
 * @returns Promise<string> - The URL of the uploaded image
 */
export async function uploadImage(
  file: Buffer | Blob | Uint8Array | ArrayBuffer,
): Promise<string> {
  const clientId = process.env.IMGUR_CLIENT_ID;

  if (!clientId) {
    throw new Error("IMGUR_CLIENT_ID environment variable is not set");
  }

  // Convert to base64
  const arrayBuffer = file instanceof Blob 
    ? await file.arrayBuffer() 
    : file;
  const base64Image = Buffer.from(new Uint8Array(arrayBuffer)).toString("base64");

  const response = await fetch(IMGUR_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Client-ID ${clientId}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: base64Image,
      type: "base64",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Imgur upload failed: ${error.data?.error || response.statusText}`);
  }

  const data = await response.json();
  return data.data.link;
}