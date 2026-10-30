"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Copy, Download, QrCode, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareDialogTranslations {
  title: string;
  copyButton: string;
  qrCode: string;
  checkMyLinks: string;
}

interface ShareDialogProps {
  treeId: string;
  slug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  translations: ShareDialogTranslations;
  toasts?: {
    linkCopied?: string;
  };
}

export function ShareDialog({
  treeId,
  slug,
  open,
  onOpenChange,
  translations,
  toasts: toastMessages,
}: ShareDialogProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const publicUrl = `${appUrl}/${slug}`;
  const qrUrl = `/api/qrcode/${treeId}?format=png&size=512`;

  async function handleCopy() {
    await navigator.clipboard.writeText(publicUrl);
    toast.success(toastMessages?.linkCopied ?? "");
  }

  function handleShareTwitter() {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(publicUrl)}&text=${encodeURIComponent(translations.checkMyLinks)}`,
      "_blank",
    );
  }

  function handleShareWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${translations.checkMyLinks} ${publicUrl}`)}`,
      "_blank",
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl p-6 sm:max-w-md sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-ink flex items-center gap-2 text-[22px] font-semibold tracking-[-.04em]">
            <Share2 className="text-primary h-5 w-5" />
            {translations.title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div className="flex flex-wrap gap-3">
            <Input
              value={publicUrl}
              readOnly
              className="text-ink min-w-0 flex-1 rounded-xl text-sm leading-[1.5]"
            />
            <button
              onClick={handleCopy}
              className="border-product-accent bg-product-accent text-on-primary inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[13px] leading-[1.2] font-semibold tracking-normal normal-case"
            >
              <Copy className="h-4 w-4" />
              {translations.copyButton}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleShareTwitter}
              className="border-hairline-strong text-ink-subtle hover:bg-surface-2 hover:text-ink min-h-11 flex-1 rounded-full border py-2.5 text-[13px] font-medium transition-colors"
            >
              Twitter / X
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="border-hairline-strong text-ink-subtle hover:bg-surface-2 hover:text-ink min-h-11 flex-1 rounded-full border py-2.5 text-[13px] font-medium transition-colors"
            >
              WhatsApp
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-ink flex items-center gap-2 text-sm leading-[1.5] font-medium text-balance break-words">
              <QrCode className="text-ink-tertiary h-4 w-4" />
              {translations.qrCode}
            </h3>
            <div className="border-hairline bg-surface-2 flex justify-center rounded-2xl border p-6">
              {}
              <img
                src={qrUrl}
                alt={`QR Code para ${slug}`}
                className="h-auto w-48 max-w-full"
              />
            </div>
            <div className="flex gap-2">
              <a
                href={`/api/qrcode/${treeId}?format=png&size=1024`}
                download
                className="border-hairline-strong text-ink-subtle hover:bg-surface-2 hover:text-ink flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border py-2.5 text-[13px] font-medium transition-colors"
              >
                <Download className="h-4 w-4" />
                PNG
              </a>
              <a
                href={`/api/qrcode/${treeId}?format=svg&size=512`}
                download
                className="border-hairline-strong text-ink-subtle hover:bg-surface-2 hover:text-ink flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border py-2.5 text-[13px] font-medium transition-colors"
              >
                <Download className="h-4 w-4" />
                SVG
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
