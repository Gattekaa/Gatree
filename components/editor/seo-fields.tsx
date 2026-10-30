"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { APP_URL, getAppDomain } from "@/lib/constants";
import { seoSchema, type SeoInput } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface SeoFieldsProps {
  seoTitle: string;
  seoDescription: string;
  treeTitle: string;
  treeDescription: string;
  onSave: (seoTitle: string, seoDescription: string) => Promise<void>;
}

export function SeoFields({
  seoTitle: initialTitle,
  seoDescription: initialDesc,
  treeTitle,
  treeDescription,
  onSave,
}: SeoFieldsProps) {
  const [saving, setSaving] = useState(false);

  const form = useForm<SeoInput>({
    resolver: zodResolver(seoSchema),
    defaultValues: {
      seoTitle: initialTitle,
      seoDescription: initialDesc,
    },
  });

  const seoTitle = form.watch("seoTitle") || "";
  const seoDescription = form.watch("seoDescription") || "";
  const displayTitle = seoTitle || treeTitle || "Minha Árvore";
  const displayDesc =
    seoDescription ||
    treeDescription ||
    "Uma árvore de links criada com Gatree";

  const hasChanged =
    seoTitle !== initialTitle || seoDescription !== initialDesc;

  async function handleSubmit(data: SeoInput) {
    setSaving(true);
    try {
      await onSave(data.seoTitle || "", data.seoDescription || "");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {}
      <div className="overflow-hidden rounded-lg border border-[#3c4043] bg-[#202124] font-sans">
        {}
        <div className="flex items-center gap-3 border-b border-[#3c4043] px-4 py-3">
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <div className="flex-1 rounded-full bg-[#303134] px-4 py-1.5">
            <span className="text-[12px] text-[#e8eaed]">{displayTitle}</span>
          </div>
        </div>

        {}
        <div className="px-5 py-4">
          {}
          <div className="flex items-center gap-2">
            <div className="flex size-5.5 items-center justify-center rounded-full bg-[#303134]">
              <span className="text-xs font-bold text-[#8ab4f8]">G</span>
            </div>
            <div>
              <p className="break-words text-[12px] text-[#bdc1c6]">
                {getAppDomain()}
              </p>
              <p className="break-words text-xs text-[#969ba1]">{`${APP_URL}/${treeTitle.toLowerCase().replace(/\s+/g, "-")}`}</p>
            </div>
          </div>

          {}
          <h3 className="text-balance break-words mt-2 text-[18px] leading-tight text-[#8ab4f8] hover:underline">
            {displayTitle} | Gatree
          </h3>

          {}
          <p className="break-words mt-1 text-[13px] leading-relaxed text-[#bdc1c6] line-clamp-2">
            {displayDesc}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="seoTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-ink-subtle text-xs tracking-normal leading-[1.5]">
                  Título SEO
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      treeTitle || "Título personalizado para buscadores"
                    }
                    maxLength={60}
                    className="h-full border-0 bg-transparent text-ink placeholder:text-ink-tertiary text-xs tracking-normal leading-[1.5]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  <span className="text-brutal-blue">
                    {(field.value || "").length}
                  </span>
                  /60
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seoDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-ink-subtle text-xs tracking-normal leading-[1.5]">
                  Descrição SEO
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      treeDescription || "Descrição para resultados de busca"
                    }
                    maxLength={160}
                    className="h-full border-0 bg-transparent text-ink placeholder:text-ink-tertiary text-xs tracking-normal leading-[1.5]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  <span className="text-brutal-blue">
                    {(field.value || "").length}
                  </span>
                  /160
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {hasChanged && (
            <Button
              type="submit"
              disabled={saving || !form.formState.isValid}
              size="sm"
              className="min-h-11 rounded-full bg-product-accent px-3 text-on-primary hover:bg-primary-hover text-xs tracking-normal leading-[1.5]"
            >
              {saving && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
              Salvar SEO
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
}
