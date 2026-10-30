"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getShortLinkDisplay } from "@/lib/constants";
import { Download, QrCode } from "lucide-react";
import Image from "next/image";

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
}

export function QRCodeDialog({ open, onOpenChange, slug }: QRCodeDialogProps) {
  const previewUrl = `/api/short-links/${slug}/qrcode?format=png`;
  const shortUrl = getShortLinkDisplay(slug);

  async function handleDownload(format: "png" | "svg") {
    const url = `/api/short-links/${slug}/qrcode?format=${format}`;
    const res = await fetch(url);
    const blob = await res.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${slug}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl p-6 sm:max-w-sm sm:p-8">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-product-accent/10 flex h-10 w-10 items-center justify-center rounded-xl">
              <QrCode className="text-primary h-5 w-5" />
            </div>
            <div>
              <DialogTitle>QR Code</DialogTitle>
              <p className="text-ink-subtle text-sm leading-[1.5]">
                {shortUrl}
              </p>
            </div>
          </div>
        </DialogHeader>

        {}
        <div className="mt-4 flex justify-center">
          <div className="border-hairline/30 rounded-2xl border bg-white p-6">
            <Image
              src={previewUrl}
              alt={`QR Code for ${shortUrl}`}
              width={200}
              height={200}
              className="h-50 w-50"
              unoptimized
            />
          </div>
        </div>

        {}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => handleDownload("png")}
            className="border-hairline/30 bg-surface-2 text-ink hover:bg-surface-3 flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-medium transition-colors"
          >
            <Download className="h-4 w-4" />
            PNG
          </button>
          <button
            onClick={() => handleDownload("svg")}
            className="border-hairline/30 bg-surface-2 text-ink hover:bg-surface-3 flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-medium transition-colors"
          >
            <Download className="h-4 w-4" />
            SVG
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
