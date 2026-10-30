"use client";

import { CreateTreeDialog } from "@/components/shared/create-tree-dialog";
import { SummaryMetric } from "@/components/shared/summary-metric";
import { TreeCard } from "@/components/shared/tree-card";
import { useTrees } from "@/hooks/use-trees";
import { getLocalePrefix } from "@/lib/i18n/paths";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import {
  AlertTriangle,
  Eye,
  MousePointerClick,
  Plus,
  RefreshCw,
  Sparkles,
  TreePine,
  TrendingUp,
} from "lucide-react";

interface DashboardClientProps {
  translations: Dictionary["dashboard"];
  treeCardTranslations: Dictionary["treeCard"];
  dialogTranslations: Dictionary["dialogs"];
  toastTranslations: Dictionary["toasts"];
  errorTranslations: Dictionary["errors"];
  commonTranslations: Dictionary["common"];
}

export function DashboardClient({
  translations,
  treeCardTranslations,
  dialogTranslations,
  toastTranslations,
  errorTranslations,
  commonTranslations,
}: DashboardClientProps) {
  const locale = getLocalePrefix(usePathname()) ? "en" : "pt-BR";
  const { data, isLoading, isError, refetch } = useTrees();

  const trees = data?.trees;
  const totalViews = data?.totals?.views ?? 0;
  const totalClicks = data?.totals?.clicks ?? 0;
  const totalTrees =
    trees?.filter((tree) => tree.status === "ACTIVE").length ?? 0;

  return (
    <div className="mx-auto max-w-[1240px] space-y-10">
      <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end md:gap-6">
        <div>
          <h1
            data-tour="dashboard-overview"
            className="text-ink font-sans text-[30px] leading-[1.1] font-semibold tracking-[-.04em] md:text-[38px]"
          >
            {translations.title}
          </h1>
          <p className="text-ink-subtle mt-1.5">{translations.subtitle}</p>
        </div>
        <CreateTreeDialog
          translations={{
            ...dialogTranslations.createTree,
            cancelButton: commonTranslations.cancel,
          }}
          toasts={{
            treeCreated: toastTranslations.treeCreated,
            createError: errorTranslations.createTree,
          }}
          errorTranslations={errorTranslations}
        >
          <button
            data-tour="dashboard-create"
            className="group border-product-accent bg-product-accent text-on-primary hover:bg-product-accent/90 inline-flex min-h-11 items-center gap-2.5 rounded-full border px-[18px] py-[11px] text-sm leading-[1.2] font-semibold tracking-normal normal-case transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            {translations.createTree}
          </button>
        </CreateTreeDialog>
      </div>

      {!isLoading && !isError && trees && trees.length > 0 && (
        <dl className="border-hairline bg-surface-1 grid grid-cols-3 overflow-hidden rounded-3xl border">
          <SummaryMetric
            label={translations.totalViews}
            value={totalViews.toLocaleString(locale)}
            icon={Eye}
          />
          <SummaryMetric
            label={translations.totalClicks}
            value={totalClicks.toLocaleString(locale)}
            icon={MousePointerClick}
          />
          <SummaryMetric
            label={translations.activeTrees}
            value={totalTrees}
            icon={TrendingUp}
          />
        </dl>
      )}

      {isLoading && (
        <div className="space-y-6">
          <div className="border-hairline bg-surface-1 grid grid-cols-3 overflow-hidden rounded-3xl border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="border-hairline min-w-0 border-l px-3.5 py-[18px] first:border-l-0 max-[374px]:px-2.5 md:px-7 md:py-6"
              >
                <div className="flex items-center gap-2">
                  <div className="bg-surface-3 h-8 w-8 animate-pulse rounded-xl" />
                  <div className="bg-surface-3 h-3 w-24 animate-pulse rounded-xl" />
                </div>
                <div className="bg-surface-3 mt-4 h-8 w-16 animate-pulse rounded-xl" />
              </div>
            ))}
          </div>

          <div>
            <div className="bg-surface-3 mb-4 h-5 w-32 animate-pulse rounded-xl" />
            <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="border-hairline bg-surface-1 hover:border-hairline-strong hover:bg-surface-2/40 focus-within:border-hairline-strong focus-within:bg-surface-2/40 relative min-w-0 rounded-3xl border p-6 transition-colors duration-150"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-surface-3 h-14 w-14 animate-pulse rounded-xl" />
                    <div className="flex-1 space-y-2.5">
                      <div className="bg-surface-3 h-4 w-3/4 animate-pulse rounded-xl" />
                      <div className="bg-surface-3 h-3 w-1/2 animate-pulse rounded-xl" />
                    </div>
                  </div>
                  <div className="mt-5 flex gap-4">
                    <div className="bg-surface-3 h-3 w-16 animate-pulse rounded-xl" />
                    <div className="bg-surface-3 h-3 w-12 animate-pulse rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isError && (
        <div className="border-error/20 bg-surface-1 rounded-3xl border px-8 py-20">
          <div className="flex flex-col items-center text-center">
            <div className="border-error bg-error/10 flex h-16 w-16 items-center justify-center rounded-2xl border">
              <AlertTriangle className="text-error h-8 w-8" />
            </div>
            <h2 className="text-ink mt-6 font-sans text-[28px] font-semibold tracking-[-.04em] md:text-[26px]">
              {translations.loadError}
            </h2>
            <p className="text-ink-subtle mx-auto mt-2 max-w-sm text-sm leading-[1.5]">
              {translations.loadErrorDescription}
            </p>
            <button
              onClick={() => refetch()}
              className="border-product-accent bg-product-accent text-on-primary hover:bg-product-accent/90 mt-8 inline-flex min-h-11 items-center gap-2 rounded-full border px-[18px] py-[11px] text-sm leading-[1.2] font-semibold tracking-normal normal-case transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4" />
              {commonTranslations.retry}
            </button>
          </div>
        </div>
      )}

      {!isLoading && !isError && trees?.length === 0 && (
        <div className="border-hairline-strong bg-surface-1 rounded-3xl border px-8 py-24">
          <div className="flex flex-col items-center text-center">
            <div className="border-primary/20 bg-product-accent/10 flex h-20 w-20 items-center justify-center rounded-3xl border">
              <TreePine className="text-primary h-11 w-11" />
            </div>
            <h2 className="text-ink mt-8 font-sans text-[28px] font-semibold tracking-[-.04em] md:text-[26px]">
              {translations.emptyState}
            </h2>
            <p className="text-ink-subtle mx-auto mt-3 max-w-md leading-relaxed">
              {translations.emptyStateDescription}
            </p>
            <CreateTreeDialog
              translations={{
                ...dialogTranslations.createTree,
                cancelButton: commonTranslations.cancel,
              }}
              toasts={{
                treeCreated: toastTranslations.treeCreated,
                createError: errorTranslations.createTree,
              }}
              errorTranslations={errorTranslations}
            >
              <button className="group border-product-accent bg-product-accent text-on-primary hover:bg-product-accent/90 mt-10 inline-flex min-h-11 items-center gap-2.5 rounded-full border px-[18px] py-[11px] text-sm leading-[1.2] font-semibold tracking-normal normal-case transition-colors duration-200">
                <Sparkles className="h-4 w-4" />
                {translations.createFirstTree}
              </button>
            </CreateTreeDialog>
          </div>
        </div>
      )}

      {!isLoading && !isError && trees && trees.length > 0 && (
        <div>
          <h2 className="mb-[18px] text-base font-semibold">
            {translations.yourTrees}
          </h2>
          <div
            data-tour="dashboard-trees"
            className="grid grid-cols-1 gap-[18px] md:grid-cols-2"
          >
            {trees.map((tree) => (
              <TreeCard
                key={tree.id}
                tree={tree}
                translations={treeCardTranslations}
                deleteDialogTranslations={{
                  ...dialogTranslations.deleteTree,
                  cancelButton: commonTranslations.cancel,
                  deleteButton: commonTranslations.delete,
                }}
                shareDialogTranslations={dialogTranslations.share}
                toasts={{
                  treeActivated: toastTranslations.treeActivated,
                  treeDeactivated: toastTranslations.treeDeactivated,
                  statusChangeError: errorTranslations.statusChange,
                  treeDeleted: toastTranslations.treeDeleted,
                  deleteError: errorTranslations.deleteTree,
                  linkCopied: toastTranslations.linkCopied,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
