"use client";

import { DeleteTreeDialog } from "@/components/shared/delete-tree-dialog";
import { ShareDialog } from "@/components/shared/share-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToggleTreeStatus } from "@/hooks/use-trees";
import type { Tree } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import {
  BarChart3,
  ExternalLink,
  Eye,
  EyeOff,
  MoreHorizontal,
  MousePointerClick,
  Pencil,
  Power,
  Share2,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { getLocalePrefix } from "@/lib/i18n/paths";
import { toast } from "sonner";

interface TreeCardTranslations {
  actions: string;
  edit: string;
  viewPage: string;
  share: string;
  deactivate: string;
  activate: string;
  delete: string;
  views: string;
  clicks: string;
  active: string;
  inactive: string;
}

interface TreeCardProps {
  tree: Tree & {
    views: number;
    clicks: number;
  };
  translations: TreeCardTranslations;
  deleteDialogTranslations: {
    title: string;
    description: string;
    cancelButton?: string;
    deleteButton?: string;
  };
  shareDialogTranslations: {
    title: string;
    copyButton: string;
    qrCode: string;
    checkMyLinks: string;
  };
  toasts?: {
    treeActivated?: string;
    treeDeactivated?: string;
    statusChangeError?: string;
    treeDeleted?: string;
    deleteError?: string;
    linkCopied?: string;
  };
}

export function TreeCard({
  tree,
  translations,
  deleteDialogTranslations,
  shareDialogTranslations,
  toasts: toastMessages,
}: TreeCardProps) {
  const localePrefix = getLocalePrefix(usePathname());
  const [showDelete, setShowDelete] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const toggleStatus = useToggleTreeStatus();

  const isActive = tree.status === "ACTIVE";

  function handleToggleStatus() {
    const newStatus = isActive ? "INACTIVE" : "ACTIVE";
    toggleStatus.mutate(
      { treeId: tree.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(
            newStatus === "ACTIVE"
              ? (toastMessages?.treeActivated ?? "")
              : (toastMessages?.treeDeactivated ?? ""),
          );
        },
        onError: () => {
          toast.error(toastMessages?.statusChangeError ?? "");
        },
      },
    );
  }

  const ctr = tree.views > 0 ? Math.round((tree.clicks / tree.views) * 100) : 0;

  return (
    <>
      <article className="group border-hairline bg-surface-1 hover:border-hairline-strong hover:bg-surface-2 focus-within:border-hairline-strong focus-within:bg-surface-2 relative min-w-0 rounded-3xl border transition-colors duration-150">
        <Link
          href={`${localePrefix}/editor/${tree.slug}`}
          className="absolute inset-0 z-[1] rounded-3xl"
          aria-label={`${translations.edit} ${tree.title}`}
        />
        <div className="absolute top-[15px] right-3 z-[2]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="text-ink-subtle hover:bg-surface-2 hover:text-ink grid size-11 place-items-center rounded-full"
                aria-label={`${translations.actions}: ${tree.title}`}
              >
                <MoreHorizontal size={18} aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`${localePrefix}/editor/${tree.slug}`}>
                  <Pencil />
                  {translations.edit}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`${localePrefix}/analytics/${tree.slug}`}>
                  <BarChart3 />
                  Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`${localePrefix}/${tree.slug}`}
                  target="_blank"
                  rel="noopener"
                >
                  <ExternalLink />
                  {translations.viewPage}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowShare(true)}>
                <Share2 />
                {translations.share}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleToggleStatus}>
                {isActive ? <EyeOff /> : <Power />}
                {isActive ? translations.deactivate : translations.activate}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDelete(true)}
                variant="destructive"
              >
                <Trash2 />
                {translations.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="p-6 md:p-7">
          <div className="flex items-center gap-3.5 pr-8">
            {tree.avatar ? (
              <Image
                src={tree.avatar}
                alt=""
                width={48}
                height={48}
                className="border-hairline-strong bg-product-accent/10 text-primary grid size-12 shrink-0 place-items-center rounded-2xl border object-cover text-lg font-semibold"
              />
            ) : (
              <span className="border-hairline-strong bg-product-accent/10 text-primary grid size-12 shrink-0 place-items-center rounded-2xl border object-cover text-lg font-semibold">
                {tree.title[0]?.toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold tracking-[-.04em]">
                {tree.title}
              </h3>
              <p className="text-ink-tertiary mt-1 truncate font-mono text-xs">
                /{tree.slug}
              </p>
            </div>
          </div>
          <dl className="border-hairline mt-6 grid grid-cols-3 gap-2 border-t pt-5 md:gap-0">
            <div>
              <dt className="text-ink-tertiary flex items-center gap-[7px] text-xs">
                <Eye size={13} className="hidden md:block" aria-hidden="true" />
                {translations.views}
              </dt>
              <dd className="mt-[5px] text-[22px] font-semibold tracking-[-.025em] tabular-nums">
                {tree.views.toLocaleString(localePrefix ? "en" : "pt-BR")}
              </dd>
            </div>
            <div>
              <dt className="text-ink-tertiary flex items-center gap-[7px] text-xs">
                <MousePointerClick
                  size={13}
                  className="hidden md:block"
                  aria-hidden="true"
                />
                {translations.clicks}
              </dt>
              <dd className="mt-[5px] text-[22px] font-semibold tracking-[-.025em] tabular-nums">
                {tree.clicks.toLocaleString(localePrefix ? "en" : "pt-BR")}
              </dd>
            </div>
            <div>
              <dt className="text-ink-tertiary flex items-center gap-[7px] text-xs">
                <BarChart3
                  size={13}
                  className="hidden md:block"
                  aria-hidden="true"
                />
                CTR
              </dt>
              <dd className="mt-[5px] text-[22px] font-semibold tracking-[-.025em] tabular-nums">
                {ctr}%
              </dd>
            </div>
          </dl>
          <div className="mt-[22px] flex items-center justify-between gap-3">
            <time
              className="text-ink-tertiary text-xs"
              dateTime={new Date(tree.createdAt).toISOString()}
            >
              {formatDistanceToNow(new Date(tree.createdAt), {
                addSuffix: true,
                locale: localePrefix ? enUS : ptBR,
              })}
            </time>
            <span
              className="bg-surface-2 text-ink-tertiary data-[active=true]:bg-success/10 data-[active=true]:text-success inline-flex items-center rounded-full px-[9px] py-[3px] text-xs"
              data-active={isActive}
            >
              {isActive ? translations.active : translations.inactive}
            </span>
          </div>
        </div>
      </article>

      <DeleteTreeDialog
        treeId={tree.id}
        treeName={tree.title}
        open={showDelete}
        onOpenChange={setShowDelete}
        translations={deleteDialogTranslations}
        toasts={toastMessages}
      />

      <ShareDialog
        treeId={tree.id}
        slug={tree.slug}
        open={showShare}
        onOpenChange={setShowShare}
        translations={shareDialogTranslations}
        toasts={toastMessages}
      />
    </>
  );
}
