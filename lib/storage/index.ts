

export interface UploadOptions {
  folder?: string;
  contentType?: string;
  extension?: string;
}

export interface StorageAdapter {
  upload(buffer: Buffer, options?: UploadOptions): Promise<string>;
  delete?(fileUrl: string): Promise<void>;
}

let adapter: StorageAdapter | null = null;

export async function getStorageAdapter(): Promise<StorageAdapter> {
  if (adapter) return adapter;

  const provider = process.env.STORAGE_PROVIDER || "local";

  switch (provider) {
    case "imgur": {
      const { ImgurAdapter } = await import("./adapters/imgur");
      adapter = new ImgurAdapter();
      break;
    }
    case "r2": {
      const { R2Adapter } = await import("./adapters/r2");
      adapter = new R2Adapter();
      break;
    }
    case "local":
    default: {
      const { LocalAdapter } = await import("./adapters/local");
      adapter = new LocalAdapter();
      break;
    }
  }

  return adapter;
}
