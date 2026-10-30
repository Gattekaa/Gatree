"use client";

import type { EditorTranslations } from "@/app/[lang]/(dashboard)/editor/[slug]/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateTreeUrl } from "@/hooks/use-update-tree-url";
import { SlugEditor } from "./slug-editor";

export function TreeUrlDialog({
  treeId,
  slug,
  open,
  onOpenChange,
  translations,
}: {
  treeId: string;
  slug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  translations: EditorTranslations;
}) {
  const mutation = useUpdateTreeUrl(treeId, slug, translations);
  const t = translations.editor.urlEditor;
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!mutation.isPending) onOpenChange(next);
      }}
    >
      <DialogContent
        closeLabel={translations.common.close}
        className="max-w-lg rounded-3xl border border-hairline-strong bg-surface-1 p-6 sm:p-8"
      >
        <DialogTitle className="pr-8 text-xl font-semibold text-ink">
          {t.title}
        </DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-ink-subtle">
          {t.description}
        </DialogDescription>
        <div className="mt-4">
          <SlugEditor
            key={slug}
            treeId={treeId}
            currentSlug={slug}
            isSaving={mutation.isPending}
            translations={t}
            onSave={(next) =>
              mutation.mutate(next, { onSuccess: () => onOpenChange(false) })
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
