"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteTree } from "@/hooks/use-trees";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteTreeDialogTranslations {
  title: string;
  description: string;
  cancelButton?: string;
  deleteButton?: string;
}

interface DeleteTreeDialogProps {
  treeId: string;
  treeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  translations: DeleteTreeDialogTranslations;
  toasts?: {
    treeDeleted?: string;
    deleteError?: string;
  };
  errorTranslations?: Record<string, string>;
}

export function DeleteTreeDialog({
  treeId,
  treeName,
  open,
  onOpenChange,
  translations,
  toasts: toastMessages,
  errorTranslations,
}: DeleteTreeDialogProps) {
  const deleteTreeMutation = useDeleteTree();

  function handleDelete() {
    deleteTreeMutation.mutate(treeId, {
      onSuccess: () => {
        toast.success(toastMessages?.treeDeleted ?? "");
        onOpenChange(false);
      },
      onError: (error) => {
        const errorKey = error instanceof Error ? error.message : "";
        const resolvedKey = errorKey.startsWith("errors.")
          ? errorKey.replace("errors.", "")
          : "";
        const message =
          (resolvedKey && errorTranslations?.[resolvedKey]) ||
          toastMessages?.deleteError ||
          errorKey;
        toast.error(message);
      },
    });
  }

  const descriptionText = translations.description.replace(
    "{{name}}",
    treeName,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl p-6 sm:max-w-md sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-ink flex items-center gap-2 text-[22px] font-semibold tracking-[-.04em]">
            <AlertTriangle className="text-error h-5 w-5" />
            {translations.title}
          </DialogTitle>
          <DialogDescription className="text-ink-subtle text-sm leading-[1.5]">
            {descriptionText}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => onOpenChange(false)}
            disabled={deleteTreeMutation.isPending}
            className="border-hairline-strong text-ink-subtle hover:bg-surface-2 hover:text-ink min-h-11 rounded-full border px-4 py-2.5 text-[13px] font-medium transition-colors disabled:opacity-50"
          >
            {translations.cancelButton || "Cancelar"}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteTreeMutation.isPending}
            className="border-error/20 bg-error/10 text-error hover:bg-error/20 inline-flex min-h-11 items-center gap-2 rounded-full border px-5 py-2.5 text-[13px] font-semibold transition-colors disabled:opacity-50"
          >
            {deleteTreeMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {translations.deleteButton || "Deletar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
