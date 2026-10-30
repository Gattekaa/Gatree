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
import { Textarea } from "@/components/ui/textarea";
import { useCreateShortLink } from "@/hooks/use-short-links";
import { getShortLinkDomain } from "@/lib/constants";
import {
  createShortLinkSchema,
  type CreateShortLinkInput,
} from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface CreateShortLinkDialogTranslations {
  title: string;
  description: string;
  urlLabel: string;
  slugLabel: string;
  slugOptional: string;
  titleLabel: string;
  titleOptional: string;
  descriptionLabel: string;
  descriptionOptional: string;
  expirationLabel: string;
  expirationOptional: string;
  passwordLabel: string;
  passwordOptional: string;
  cancelButton: string;
  createButton: string;
  successToast: string;
  errorToast: string;
}

interface CreateShortLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  translations?: CreateShortLinkDialogTranslations;
  errorTranslations?: Record<string, string>;
}

export function CreateShortLinkDialog({
  open,
  onOpenChange,
  translations: t,
  errorTranslations,
}: CreateShortLinkDialogProps) {
  const createMutation = useCreateShortLink();

  const form = useForm<CreateShortLinkInput>({
    resolver: zodResolver(createShortLinkSchema),
    defaultValues: {
      url: "",
      customSlug: undefined,
      title: undefined,
      description: undefined,
      password: undefined,
      expiresAt: undefined,
    },
    mode: "onSubmit",
  });

  function onSubmit(data: CreateShortLinkInput) {
    const payload: CreateShortLinkInput = {
      url: data.url,
      ...(data.customSlug ? { customSlug: data.customSlug } : {}),
      ...(data.title ? { title: data.title } : {}),
      ...(data.description ? { description: data.description } : {}),
      ...(data.password ? { password: data.password } : {}),
      ...(data.expiresAt ? { expiresAt: data.expiresAt } : {}),
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(t?.successToast ?? "Link criado com sucesso!");
        onOpenChange(false);
        form.reset();
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
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl p-6 sm:max-w-130 sm:p-8">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="border-hairline-strong bg-product-accent/10 flex h-11 w-11 items-center justify-center rounded-2xl border">
              <Link2 className="text-ink h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{t?.title ?? "Criar link encurtado"}</DialogTitle>
              <p className="text-ink-tertiary text-xs leading-[1.5] tracking-normal">
                {t?.description ??
                  "Preencha a URL de destino e opções adicionais."}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-6 space-y-5"
          >
            {}
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t?.urlLabel ?? "URL de destino"}</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {}
            <FormField
              control={form.control}
              name="customSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t?.slugLabel ?? "Slug personalizado"}{" "}
                    <span className="text-ink-tertiary">
                      ({t?.slugOptional ?? "opcional"})
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="meu-link"
                      leftAddon={
                        <span className="text-ink-tertiary text-xs leading-[1.5] tracking-normal">
                          {getShortLinkDomain()}/s/
                        </span>
                      }
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "")
                          .slice(0, 50);
                        field.onChange(val || undefined);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Título */}
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
                      placeholder="Título do link"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value || undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
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
                    <Textarea
                      placeholder="Descrição breve do link"
                      rows={2}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value || undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expiração */}
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
                      className="rounded-xl"
                      value={field.value ? field.value.slice(0, 16) : ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(
                          val ? new Date(val).toISOString() : undefined,
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Senha */}
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
                      placeholder="Proteger com senha"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value || undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="border-hairline-strong text-ink-subtle hover:border-ink-subtle hover:text-ink min-h-11 rounded-full border px-4 py-2.5 text-[13px] font-medium transition-colors"
              >
                {t?.cancelButton ?? "Cancelar"}
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="border-hairline-strong bg-product-accent text-on-primary hover:bg-product-accent/90 inline-flex min-h-11 items-center gap-2 rounded-full border px-5 py-2.5 text-[13px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-40"
              >
                {createMutation.isPending && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                {t?.createButton ?? "Criar link"}
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
