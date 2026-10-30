"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ImageUploadTranslations {
  invalidImage?: string;
  imageTooLarge?: string;
  imageUploaded?: string;
  uploadError?: string;
  replace?: string;
  remove?: string;
  clickToUpload?: string;
  uploading?: string;
  fileHint?: string;
}

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  translations?: ImageUploadTranslations;
}

export function ImageUploadField({
  value,
  onChange,
  translations: t,
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error(t?.invalidImage ?? "Selecione um arquivo de imagem");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t?.imageTooLarge ?? "Imagem muito grande. Máximo 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro no upload");
      }

      const { url } = await res.json();
      onChange(url);
      toast.success(t?.imageUploaded ?? "Imagem enviada");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : (t?.uploadError ?? "Erro no upload"),
      );
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }

  if (value) {
    return (
      <div className="space-y-3">
        {}
        <div className="overflow-hidden border border-hairline-strong bg-surface-2">
          {}
          <img src={value} alt="Preview" className="w-full" />
        </div>
        {}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="rounded-xl flex flex-1 items-center justify-center gap-2 border border-hairline-strong bg-surface-2 px-4 py-2.5 text-[13px] font-medium text-ink-subtle transition-colors hover:bg-surface-3 hover:text-ink"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {t?.replace ?? "Substituir"}
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-xl flex items-center justify-center gap-2 border border-error bg-surface-1 px-4 py-2.5 text-[13px] font-medium text-error transition-colors hover:bg-surface-2"
          >
            <Trash2 className="h-4 w-4" />
            {t?.remove ?? "Remover"}
          </button>
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

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="rounded-xl flex w-full flex-col items-center gap-3 border border-dashed border-hairline-strong bg-surface-2 px-6 py-8 transition-colors hover:border-primary"
      >
        {isUploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-ink-tertiary" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center bg-surface-3">
            <ImagePlus className="h-5 w-5 text-ink-subtle" />
          </div>
        )}
        <div className="text-center">
          <p className="break-words text-[13px] font-medium text-ink">
            {isUploading
              ? (t?.uploading ?? "Enviando...")
              : (t?.clickToUpload ?? "Clique para fazer upload")}
          </p>
          <p className="break-words mt-0.5 text-[12px] text-ink-tertiary">
            {t?.fileHint ?? "JPG, PNG ou WebP · Máximo 5MB"}
          </p>
        </div>
      </button>
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
