"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useProductTour } from "@/components/onboarding/tour-provider";
import { useSlugAvailability } from "@/hooks/use-analytics";
import { useDebounce } from "@/hooks/use-debounce";
import { useCreateTree } from "@/hooks/use-trees";
import { getAppDomain } from "@/lib/constants";
import { getLocalePrefix } from "@/lib/i18n/paths";
import { createTreeSchema, type CreateTreeInput } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Link2, Loader2, Sparkles, TreePine, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface CreateTreeDialogTranslations {
  title: string;
  description: string;
  nameLabel: string;
  namePlaceholder: string;
  urlLabel: string;
  slugPlaceholder: string;
  slugUnavailable: string;
  slugAvailable: string;
  createButton: string;
  cancelButton?: string;
}

interface CreateTreeDialogProps {
  children: React.ReactNode;
  translations: CreateTreeDialogTranslations;
  toasts?: {
    treeCreated?: string;
    createError?: string;
  };
  errorTranslations?: Record<string, string>;
}

export function CreateTreeDialog({
  children,
  translations,
  toasts: toastMessages,
  errorTranslations,
}: CreateTreeDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { treeCreated } = useProductTour();
  const createTreeMutation = useCreateTree();

  const form = useForm<CreateTreeInput>({
    resolver: zodResolver(createTreeSchema),
    defaultValues: { title: "", slug: "" },
    mode: "onChange",
  });

  const [title, slug] = useWatch({
    control: form.control,
    name: ["title", "slug"],
  });

  useEffect(() => {
    if (!title && !form.formState.isDirty) return;
    const generated = title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 30);
    form.setValue("slug", generated, { shouldValidate: true });
  }, [title, form]);

  const debouncedSlug = useDebounce(slug, 500);
  const { data: slugCheck, isLoading: checkingSlug } =
    useSlugAvailability(debouncedSlug);
  const slugAvailable =
    debouncedSlug === slug ? (slugCheck?.available ?? null) : null;

  function onSubmit(data: CreateTreeInput) {
    if (slugAvailable !== true) return;

    createTreeMutation.mutate(data, {
      onSuccess: () => {
        toast.success(toastMessages?.treeCreated ?? "");
        setOpen(false);
        form.reset();
        treeCreated(data.slug);
        router.push(`${getLocalePrefix(pathname)}/editor/${data.slug}`);
      },
      onError: (error) => {
        const errorKey = error instanceof Error ? error.message : "";
        const resolvedKey = errorKey.startsWith("errors.")
          ? errorKey.replace("errors.", "")
          : "";
        const message =
          (resolvedKey && errorTranslations?.[resolvedKey]) ||
          toastMessages?.createError ||
          errorKey;
        toast.error(message);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        closeLabel={translations.cancelButton}
        className="overflow-hidden rounded-3xl p-0 sm:max-w-120"
      >
        <div className="border-hairline border-b px-6 pt-7 pb-6 sm:px-8">
          <div className="flex items-start gap-4">
            <div className="border-primary/20 bg-product-accent/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border">
              <TreePine className="text-primary h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-ink text-[22px] font-semibold tracking-[-.04em]">
                {translations.title}
              </DialogTitle>
              <DialogDescription className="text-ink-subtle mt-1 text-sm leading-[1.5]">
                {translations.description}
              </DialogDescription>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-6 pt-6 pb-7 sm:px-8 sm:pb-8"
          >
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-2 flex items-center gap-2">
                      <Sparkles className="text-primary h-3.5 w-3.5" />
                      <span className="text-ink text-[13px] font-medium">
                        {translations.nameLabel}
                      </span>
                    </div>
                    <FormControl>
                      <Input
                        placeholder={translations.namePlaceholder}
                        aria-label={translations.nameLabel}
                        className="rounded-xl px-4 text-sm leading-[1.5]"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-2 flex items-center gap-2">
                      <Link2 className="text-ink-tertiary h-3.5 w-3.5" />
                      <span className="text-ink text-[13px] font-medium">
                        {translations.urlLabel}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="border-hairline-strong bg-canvas focus-within:border-primary flex items-stretch overflow-hidden rounded-xl border transition-all">
                        <span className="border-hairline-strong bg-surface-2 text-ink-tertiary flex items-center border-r px-3.5 text-[13px]">
                          {getAppDomain()}/
                        </span>
                        <FormControl>
                          <input
                            data-slot="input"
                            placeholder={translations.slugPlaceholder}
                            aria-label={translations.urlLabel}
                            className="text-ink placeholder:text-ink-tertiary h-12 min-w-0 flex-1 border-0 bg-transparent px-3.5 text-sm leading-[1.5] ring-0 outline-none focus:ring-0 focus:outline-none"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9-]/g, "")
                                  .slice(0, 30),
                              )
                            }
                          />
                        </FormControl>
                        <div className="flex items-center pr-3">
                          {checkingSlug && (
                            <Loader2 className="text-ink-tertiary h-4 w-4 animate-spin" />
                          )}
                          {!checkingSlug && slugAvailable === true && (
                            <div className="bg-success/15 flex h-5 w-5 items-center justify-center rounded-full">
                              <Check className="text-success h-3 w-3" />
                            </div>
                          )}
                          {!checkingSlug &&
                            slugAvailable === false &&
                            slug.length >= 2 && (
                              <div className="bg-error/15 flex h-5 w-5 items-center justify-center rounded-full">
                                <X className="text-error h-3 w-3" />
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                    {!checkingSlug &&
                      slugAvailable === false &&
                      slug.length >= 2 && (
                        <p className="text-error mt-1.5 text-xs leading-[1.5] tracking-normal break-words">
                          {translations.slugUnavailable}
                        </p>
                      )}
                    {slugAvailable === true && (
                      <p className="text-success mt-1.5 text-xs leading-[1.5] tracking-normal break-words">
                        {translations.slugAvailable}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {title && slug && slugAvailable === true && (
              <div className="border-hairline bg-canvas mt-6 rounded-2xl border p-4">
                <p className="text-ink-tertiary mb-2 text-xs leading-[1.5] tracking-normal break-words">
                  Preview
                </p>
                <div className="flex items-center gap-3">
                  <div className="border-primary/20 bg-product-accent/10 flex h-10 w-10 items-center justify-center rounded-xl border">
                    <span className="text-primary text-sm leading-[1.5] font-bold">
                      {title[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-ink text-sm leading-[1.5] font-medium break-words">
                      {title}
                    </p>
                    <p className="text-ink-tertiary font-mono text-xs leading-[1.5] tracking-normal break-words">
                      {getAppDomain()}/{slug}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="border-hairline-strong text-ink-subtle hover:bg-surface-2 hover:text-ink min-h-11 rounded-full border px-4 py-2.5 text-[13px] font-medium transition-colors"
              >
                {translations.cancelButton || "Cancelar"}
              </button>
              <button
                type="submit"
                disabled={
                  createTreeMutation.isPending ||
                  !form.formState.isValid ||
                  slugAvailable !== true
                }
                className="border-product-accent bg-product-accent text-on-primary hover:bg-product-accent/90 inline-flex min-h-11 items-center gap-2 rounded-full border px-5 py-2.5 text-[13px] font-medium transition-colors duration-150 disabled:opacity-40"
              >
                {createTreeMutation.isPending && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                {translations.createButton}
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
