"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdateShortLink } from "@/hooks/use-short-links";
import { getShortLinkDomain } from "@/lib/constants";
import {
  updateShortLinkSchema,
  type UpdateShortLinkInput,
} from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ShortLink } from "@prisma/client";
import { Loader2, Lock, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface EditShortLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortLink: ShortLink;
  translations?: {
    title: string;
    slugLabel: string;
    slugHint: string;
    urlLabel: string;
    titleLabel: string;
    titleOptional: string;
    descriptionLabel: string;
    descriptionOptional: string;
    expirationLabel: string;
    expirationOptional: string;
    passwordLabel: string;
    passwordOptional: string;
    passwordPlaceholder: string;
    passwordProtected: string;
    removePassword: string;
    cancelButton: string;
    saveButton: string;
    successToast: string;
    errorToast: string;
  };
  errorTranslations?: Record<string, string>;
}

export function EditShortLinkDialog({
  open,
  onOpenChange,
  shortLink,
  translations: t,
  errorTranslations,
}: EditShortLinkDialogProps) {
  const updateMutation = useUpdateShortLink();
  const [removePassword, setRemovePassword] = useState(false);

  const form = useForm<UpdateShortLinkInput>({
    resolver: zodResolver(updateShortLinkSchema),
    mode: "onSubmit",
    defaultValues: {
      url: shortLink.url,
      title: shortLink.title ?? "",
      description: shortLink.description ?? "",
      expiresAt: shortLink.expiresAt
        ? formatDatetimeLocal(new Date(shortLink.expiresAt))
        : "",
      password: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        url: shortLink.url,
        title: shortLink.title ?? "",
        description: shortLink.description ?? "",
        expiresAt: shortLink.expiresAt
          ? formatDatetimeLocal(new Date(shortLink.expiresAt))
          : "",
        password: "",
      });
    }
  }, [open, shortLink, form]);

  function handleOpenChange(value: boolean) {
    if (value) setRemovePassword(false);
    onOpenChange(value);
  }

  function onSubmit(values: UpdateShortLinkInput) {
    const data: UpdateShortLinkInput = {};

    if (values.url && values.url !== shortLink.url) {
      data.url = values.url;
    }
    if ((values.title ?? "") !== (shortLink.title ?? "")) {
      data.title = values.title || undefined;
    }
    if ((values.description ?? "") !== (shortLink.description ?? "")) {
      data.description = values.description || undefined;
    }

    if (values.expiresAt) {
      const newExpiry = new Date(values.expiresAt).toISOString();
      const currentExpiry = shortLink.expiresAt
        ? new Date(shortLink.expiresAt).toISOString()
        : null;
      if (newExpiry !== currentExpiry) {
        data.expiresAt = newExpiry;
      }
    } else if (shortLink.expiresAt) {
      data.expiresAt = null;
    }

    if (removePassword) {
      data.password = null;
    } else if (values.password && values.password.length > 0) {
      data.password = values.password;
    }

    if (Object.keys(data).length === 0) {
      onOpenChange(false);
      return;
    }

    updateMutation.mutate(
      { id: shortLink.id, data },
      {
        onSuccess: () => {
          toast.success(t?.successToast ?? "Link atualizado!");
          onOpenChange(false);
        },
        onError: (error) => {
          const errorKey = error instanceof Error ? error.message : "";
          const resolvedKey = errorKey.startsWith("errors.")
            ? errorKey.replace("errors.", "")
            : "";
          const message =
            (resolvedKey && errorTranslations?.[resolvedKey]) ||
            t?.errorToast ||
            errorKey;
          toast.error(message);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl p-6 sm:max-w-130 sm:p-8">
        <DialogHeader>
          <DialogTitle>{t?.title ?? "Editar link"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-5 space-y-5"
          >
            {}
            <div className="space-y-1.5">
              <label className="text-ink text-sm leading-[1.5] font-medium">
                {t?.slugLabel ?? "Slug"}
              </label>
              <div className="border-hairline/50 bg-surface-2/30 flex items-stretch overflow-hidden rounded-xl border">
                <span className="border-hairline/40 bg-surface-2/50 text-ink-tertiary flex items-center border-r px-3.5 text-[13px]">
                  {getShortLinkDomain()}/s/
                </span>
                <input
                  value={shortLink.slug}
                  disabled
                  className="text-ink-subtle h-11 flex-1 cursor-not-allowed border-0 bg-transparent px-3.5 text-[16px] outline-none sm:text-[14px]"
                />
              </div>
              <p className="text-ink-tertiary text-xs leading-[1.5] tracking-normal">
                {t?.slugHint ?? "O slug não pode ser alterado após a criação."}
              </p>
            </div>

            {}
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t?.urlLabel ?? "URL de destino"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://exemplo.com/pagina"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t?.titleLabel ?? "Título"}{" "}
                    <span className="text-ink-tertiary">
                      ({t?.titleOptional ?? "opcional"})
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Um nome para identificar o link"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t?.descriptionLabel ?? "Descrição"}{" "}
                    <span className="text-ink-tertiary">
                      ({t?.descriptionOptional ?? "opcional"})
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descrição breve do link"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {}
            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t?.expirationLabel ?? "Expiração"}{" "}
                    <span className="text-ink-tertiary">
                      ({t?.expirationOptional ?? "opcional"})
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t?.passwordLabel ?? "Senha"}{" "}
                      <span className="text-ink-tertiary">
                        ({t?.passwordOptional ?? "opcional"})
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={
                          t?.passwordPlaceholder ??
                          "Deixe vazio para manter a senha atual"
                        }
                        disabled={removePassword}
                        {...field}
                        value={removePassword ? "" : (field.value ?? "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {shortLink.passwordHash && (
                <div className="bg-surface-2/50 flex items-center justify-between rounded-lg px-3 py-2">
                  <div className="text-ink-subtle flex items-center gap-2 text-sm leading-[1.5]">
                    <Lock className="h-3.5 w-3.5" />
                    <span>
                      {t?.passwordProtected ??
                        "Link atualmente protegido por senha"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRemovePassword(!removePassword)}
                    className={`inline-flex min-h-9 items-center gap-1 rounded-full px-2 py-1 text-xs leading-[1.5] font-medium tracking-normal transition-colors ${
                      removePassword
                        ? "bg-error/10 text-error"
                        : "bg-surface-3 text-ink-subtle hover:text-ink"
                    }`}
                  >
                    {removePassword ? (
                      <>
                        <X className="h-3 w-3" />
                        {t?.removePassword ?? "Remover senha"}
                      </>
                    ) : (
                      (t?.removePassword ?? "Remover senha")
                    )}
                  </button>
                </div>
              )}
            </div>

            {}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="text-ink-subtle hover:bg-surface-2 hover:text-ink min-h-11 rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors"
              >
                {t?.cancelButton ?? "Cancelar"}
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-product-accent text-on-primary hover:bg-product-accent/90 disabled:hover:bg-product-accent inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium transition-colors duration-150 disabled:opacity-40"
              >
                {updateMutation.isPending && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                {t?.saveButton ?? "Salvar"}
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function formatDatetimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
