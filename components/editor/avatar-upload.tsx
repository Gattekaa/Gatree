"use client";

import { Button } from "@/components/ui/button";
import { Camera, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface AvatarUploadTranslations {
  invalidImage?: string;
  imageTooLarge?: string;
  avatarUpdated?: string;
  uploadError?: string;
  change?: string;
  upload?: string;
  remove?: string;
}

interface AvatarUploadProps {
  currentAvatar: string | null;
  onUpload: (url: string | null) => void;
  translations?: AvatarUploadTranslations;
}

export function AvatarUpload({
  currentAvatar,
  onUpload,
  translations: t,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t?.invalidImage ?? "Selecione uma imagem válida");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t?.imageTooLarge ?? "Imagem muito grande. Máximo 5MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload falhou");
      }

      const { url } = await res.json();
      onUpload(url);
      toast.success(t?.avatarUpdated ?? "Avatar atualizado");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : (t?.uploadError ?? "Erro no upload"),
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      {}
      <div className="relative">
        {currentAvatar ? (
          <Image
            src={currentAvatar}
            alt="Avatar"
            width={80}
            height={80}
            className="h-20 w-20 rounded-full object-cover border border-brutal-pink"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-3 border border-dashed border-brutal-pink">
            <Camera className="h-6 w-6 text-brutal-pink" />
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-canvas/60">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      {}
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-2 border border-brutal-pink text-brutal-pink hover:bg-brutal-pink/10 hover:text-brutal-pink text-xs tracking-normal leading-[1.5]"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Camera className="h-3.5 w-3.5" />
          {currentAvatar ? (t?.change ?? "Alterar") : (t?.upload ?? "Upload")}
        </Button>
        {currentAvatar && (
          <Button
            variant="ghost"
            size="sm"
            className="justify-start gap-2 text-ink-tertiary hover:text-error text-xs tracking-normal leading-[1.5]"
            onClick={() => onUpload(null)}
            disabled={uploading}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t?.remove ?? "Remover"}
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
