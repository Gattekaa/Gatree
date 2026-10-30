"use client";

import { TreeEditorView } from "@/components/editor/tree-editor";
import { useTreeDetail } from "@/hooks/use-tree-detail";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export interface EditorTranslations {
  editor: Dictionary["editor"];
  common: Dictionary["common"];
  errors: Dictionary["errors"];
  toasts: Dictionary["toasts"];
  appearance: Dictionary["appearance"];
  nav: Dictionary["nav"];
  dialogs: Dictionary["dialogs"];
}

interface EditorClientProps {
  slug: string;
  translations: EditorTranslations;
}

export function EditorClient({ slug, translations }: EditorClientProps) {
  const { data: tree, isLoading, error, refetch } = useTreeDetail(slug);

  if (isLoading) {
    return <EditorSkeleton />;
  }

  if (error || !tree) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center rounded-3xl border border-hairline bg-surface-1 px-6 py-20 text-center"
      >
        <div className="h-12 w-12 rounded-2xl bg-error/10 flex items-center justify-center mb-4">
          <span className="text-error text-lg">!</span>
        </div>
        <p className="text-[15px] font-medium text-ink">
          {translations.editor.loadError}
        </p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-subtle">
          {translations.editor.loadErrorDescription}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-6 min-h-11 rounded-full bg-product-accent px-6 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-product-accent/85"
        >
          {translations.common.retry}
        </button>
      </div>
    );
  }

  return <TreeEditorView tree={tree} slug={slug} translations={translations} />;
}

function EditorSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse motion-reduce:animate-none">
      {}
      <div className="lg:hidden space-y-5">
        {}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 rounded-2xl bg-surface-2" />
          <div className="space-y-2 flex-1 min-w-0">
            <div className="h-5 w-44 bg-surface-2" />
            <div className="h-3.5 w-28 bg-surface-3" />
          </div>
        </div>

        {}
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-hairline bg-surface-1 py-3"
            >
              <div className="h-5 w-5 bg-surface-3" />
              <div className="h-2.5 w-12 bg-surface-3" />
            </div>
          ))}
        </div>

        {}
        <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface-1 p-4">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-surface-2" />
          <div className="space-y-1.5">
            <div className="h-4 w-28 bg-surface-2" />
            <div className="h-3.5 w-44 bg-surface-3" />
          </div>
        </div>

        {}
        <div className="flex justify-between px-1">
          <div className="h-3.5 w-14 bg-surface-3" />
          <div className="h-3.5 w-14 bg-surface-3" />
        </div>

        {}
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-2xl border border-hairline bg-surface-1 p-3"
            >
              <div className="h-8 w-5 shrink-0 bg-surface-3/50" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="h-4 w-3/5 bg-surface-2" />
                <div className="h-3 w-4/5 bg-surface-3" />
              </div>
              <div className="h-5 w-9 shrink-0 bg-surface-3" />
              <div className="h-8 w-8 shrink-0 bg-surface-3/50" />
            </div>
          ))}
        </div>
      </div>

      {}
      <div className="hidden lg:block space-y-6">
        {}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-surface-2" />
            <div className="h-6 w-48 bg-surface-2" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-11 w-24 rounded-full bg-surface-2" />
            ))}
          </div>
        </div>

        {}
        <div className="flex gap-6 rounded-2xl border border-hairline bg-surface-1 px-5 py-3">
          <div className="h-4 w-20 bg-surface-3" />
          <div className="h-4 w-20 bg-surface-3" />
          <div className="h-4 w-28 bg-surface-3" />
        </div>

        {}
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-7 space-y-3">
            {}
            <div className="flex items-center gap-4 rounded-2xl border border-primary/20 p-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-surface-2" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-surface-2" />
                <div className="h-3 w-48 bg-surface-3" />
              </div>
            </div>
            {}
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface-1 p-4"
              >
                <div className="h-8 w-6 shrink-0 bg-surface-3/50" />
                <div className="h-9 w-9 shrink-0 bg-surface-2" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="h-4 w-1/2 bg-surface-2" />
                  <div className="h-3 w-3/4 bg-surface-3" />
                </div>
                <div className="h-5 w-9 shrink-0 bg-surface-3" />
              </div>
            ))}
          </div>
          {}
          <div className="col-span-5">
            <div className="rounded-2xl border border-hairline bg-surface-2 h-140" />
          </div>
        </div>
      </div>
    </div>
  );
}
