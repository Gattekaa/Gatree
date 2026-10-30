"use client";

import { SummaryMetric } from "@/components/shared/summary-metric";
import { CreateShortLinkDialog } from "@/components/shortener/create-short-link-dialog";
import { EditShortLinkDialog } from "@/components/shortener/edit-short-link-dialog";
import { QRCodeDialog } from "@/components/shortener/qr-code-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useDeleteShortLink,
  useShortLinkKPIs,
  useShortLinks,
} from "@/hooks/use-short-links";
import { getShortLinkDisplay, getShortLinkUrl } from "@/lib/constants";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { ShortLink } from "@prisma/client";
import {
  BarChart3,
  Copy,
  Link2,
  LockKeyhole,
  RefreshCw,
  MoreHorizontal,
  Pencil,
  Plus,
  QrCode,
  Search,
  Trash2,
} from "lucide-react";
import { getLocalePrefix } from "@/lib/i18n/paths";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ShortenerClientProps {
  translations: Dictionary["shortener"];
  commonTranslations: Dictionary["common"];
  dialogTranslations: Dictionary["dialogs"]["deleteShortLink"];
  toastTranslations: Dictionary["toasts"];
  errorTranslations: Dictionary["errors"];
}

function truncateUrl(url: string, max = 50) {
  return url.length > max ? url.slice(0, max) + "..." : url;
}

function formatDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getStatus(link: ShortLink): "active" | "expired" | "protected" {
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) return "expired";
  if (link.passwordHash) return "protected";
  return "active";
}

function KPISummary({
  translations,
}: {
  translations: Dictionary["shortener"];
}) {
  const { data: kpis, isLoading } = useShortLinkKPIs();

  if (isLoading) {
    return (
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
    );
  }

  return (
    <dl className="border-hairline bg-surface-1 grid grid-cols-3 overflow-hidden rounded-3xl border">
      <SummaryMetric
        label={translations.totalLinks}
        value={(kpis?.totalLinks ?? 0).toLocaleString("pt-BR")}
        icon={Link2}
      />
      <SummaryMetric
        label={translations.clicks30d}
        value={(kpis?.totalClicks30d ?? 0).toLocaleString("pt-BR")}
        icon={BarChart3}
      />
      <SummaryMetric
        label={translations.topLink}
        icon={Link2}
        value={
          <span className="block truncate font-mono text-xs tracking-[-.04em] md:text-[17px]">
            {kpis?.topLink
              ? getShortLinkDisplay(kpis.topLink.slug)
              : kpis?.totalLinks
                ? translations.noTopLink
                : translations.noLinksYet}
          </span>
        }
        detail={
          kpis?.topLink
            ? `${kpis.topLink.clicks.toLocaleString("pt-BR")} ${translations.clicks}`
            : undefined
        }
      />
    </dl>
  );
}

function StatusBadge({
  status,
  translations,
}: {
  status: "active" | "expired" | "protected";
  translations: Dictionary["shortener"]["status"];
}) {
  switch (status) {
    case "active":
      return (
        <span className="border-success/20 bg-success/10 text-success inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
          <span className="bg-success h-1.5 w-1.5 rounded-full" />
          {translations.active}
        </span>
      );
    case "expired":
      return (
        <span className="border-error/20 bg-error/10 text-error inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
          <span className="bg-error h-1.5 w-1.5 rounded-full" />
          {translations.expired}
        </span>
      );
    case "protected":
      return (
        <span className="border-primary/20 bg-product-accent/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
          <LockKeyhole size={12} aria-hidden="true" /> {translations.protected}
        </span>
      );
  }
}

function ShortLinkRow({
  link,
  translations,
  commonTranslations,
  dialogTranslations,
  toastTranslations,
  errorTranslations,
}: {
  link: ShortLink;
  translations: Dictionary["shortener"];
  commonTranslations: Dictionary["common"];
  dialogTranslations: Dictionary["dialogs"]["deleteShortLink"];
  toastTranslations: Dictionary["toasts"];
  errorTranslations: Dictionary["errors"];
}) {
  const router = useRouter();
  const localePrefix = getLocalePrefix(usePathname());
  const deleteMutation = useDeleteShortLink();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const status = getStatus(link);
  const shortUrl = getShortLinkDisplay(link.slug);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getShortLinkUrl(link.slug));
      toast.success(translations.urlCopied, { duration: 3000 });
    } catch {
      toast.error(translations.urlCopyError);
    }
  }

  function handleDelete() {
    deleteMutation.mutate(link.id, {
      onSuccess: () => toast.success(toastTranslations.linkExcluded),
      onError: () => toast.error(errorTranslations.deleteShortLink),
    });
  }

  return (
    <>
      <div className="group border-hairline-strong bg-surface-1 hover:bg-surface-2 flex min-w-0 flex-col gap-4 rounded-2xl border p-5 transition-colors duration-150 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex-1 space-y-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <Link2 className="text-primary h-4 w-4 shrink-0" />
            <span className="text-ink truncate font-medium">{shortUrl}</span>
            <StatusBadge status={status} translations={translations.status} />
          </div>
          <p className="text-ink-subtle truncate pl-6 text-sm leading-[1.5]">
            {truncateUrl(link.url)}
          </p>
        </div>

        <div className="flex items-center gap-4 pl-6 sm:pl-0">
          <span className="text-ink-subtle text-sm leading-[1.5]">
            {(link as ShortLink & { _count?: { clicks: number } })._count
              ?.clicks ?? 0}{" "}
            {translations.clicks}
          </span>
          <span className="text-ink-tertiary text-sm leading-[1.5]">
            {formatDate(
              link.createdAt as unknown as string,
              localePrefix ? "en" : "pt-BR",
            )}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="border-hairline-strong text-ink-tertiary hover:bg-surface-2 hover:text-ink flex size-11 items-center justify-center rounded-full border transition-colors"
                aria-label={translations.linkActions}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopy}>
                <Copy />
                {translations.copyUrl}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <Pencil />
                {commonTranslations.edit}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`${localePrefix}/shortener/${link.slug}`)
                }
              >
                <BarChart3 />
                Analytics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setQrDialogOpen(true)}>
                <QrCode />
                {translations.qrCode}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 />
                {commonTranslations.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <EditShortLinkDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        shortLink={link}
        errorTranslations={errorTranslations}
      />

      <QRCodeDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        slug={link.slug}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl p-6 sm:p-8">
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTranslations.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogTranslations.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{commonTranslations.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="border-error/20 bg-error/10 text-error hover:bg-error/20 rounded-full border"
            >
              {commonTranslations.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
  commonTranslations,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  commonTranslations: Dictionary["common"];
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="border-hairline-strong bg-surface-1 text-ink-subtle hover:bg-surface-2 min-h-11 rounded-full border px-3 py-1.5 text-sm leading-[1.5] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      >
        {commonTranslations.previous}
      </button>
      <span className="text-ink-subtle px-3 text-sm leading-[1.5]">
        {commonTranslations.pageOf
          .replace("{{page}}", String(page))
          .replace("{{totalPages}}", String(totalPages))}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="border-hairline-strong bg-surface-1 text-ink-subtle hover:bg-surface-2 min-h-11 rounded-full border px-3 py-1.5 text-sm leading-[1.5] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      >
        {commonTranslations.next}
      </button>
    </div>
  );
}

export function ShortenerClient({
  translations,
  commonTranslations,
  dialogTranslations,
  toastTranslations,
  errorTranslations,
}: ShortenerClientProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError, refetch } = useShortLinks(
    debouncedSearch,
    page,
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-[1240px] space-y-8">
      <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end md:gap-6">
        <div>
          <h1
            data-tour="shortener-overview"
            className="text-ink font-sans text-[30px] leading-[1.1] font-semibold tracking-[-.04em] md:text-[38px]"
          >
            {translations.title}
          </h1>
          <p className="text-ink-subtle mt-1.5">{translations.subtitle}</p>
        </div>
        <button
          data-tour="shortener-create"
          onClick={() => setCreateDialogOpen(true)}
          className="group border-product-accent bg-product-accent text-on-primary hover:bg-product-accent/90 inline-flex min-h-11 items-center gap-2.5 rounded-full border px-[18px] py-[11px] text-sm leading-[1.2] font-semibold tracking-normal normal-case transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          {translations.createLink}
        </button>
      </div>

      <KPISummary translations={translations} />

      <div data-tour="shortener-search" className="max-w-[520px]">
        <Input
          leftIcon={Search}
          aria-label={translations.searchPlaceholder}
          placeholder={translations.searchPlaceholder}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="border-hairline-strong bg-surface-1 rounded-2xl border p-5 sm:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="bg-surface-3 h-4 w-4 animate-pulse rounded-xl" />
                <div className="bg-surface-3 h-4 w-40 animate-pulse rounded-xl" />
                <div className="bg-surface-3 h-5 w-16 animate-pulse rounded-xl" />
              </div>
              <div className="mt-2 pl-7">
                <div className="bg-surface-3 h-3 w-64 animate-pulse rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div
          className="border-error bg-surface-1 rounded-3xl border p-8"
          role="alert"
        >
          <h2 className="text-ink font-sans text-[28px] font-semibold tracking-[-.04em] md:text-[26px]">
            {translations.loadError}
          </h2>
          <button
            onClick={() => refetch()}
            className="text-ink mt-4 inline-flex min-h-11 items-center gap-2 rounded-full"
          >
            <RefreshCw size={16} />
            {commonTranslations.retry}
          </button>
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="space-y-3">
          {data.data.map((link) => (
            <ShortLinkRow
              key={link.id}
              link={link}
              translations={translations}
              commonTranslations={commonTranslations}
              dialogTranslations={dialogTranslations}
              toastTranslations={toastTranslations}
              errorTranslations={errorTranslations}
            />
          ))}
        </div>
      ) : debouncedSearch ? (
        <div className="border-hairline-strong bg-surface-1 rounded-3xl border px-8 py-16 text-center">
          <Search className="text-ink-tertiary mx-auto h-10 w-10" />
          <h2 className="text-ink mt-4 font-sans text-[28px] font-semibold tracking-[-.04em] md:text-[26px]">
            {translations.noSearchResults}
          </h2>
          <p className="text-ink-subtle mt-2">
            {translations.noSearchResultsDescription.replace(
              "{{query}}",
              debouncedSearch,
            )}
          </p>
        </div>
      ) : (
        <div className="border-hairline-strong bg-surface-1 rounded-3xl border px-8 py-24">
          <div className="flex flex-col items-center text-center">
            <div className="border-primary/20 bg-product-accent/10 flex h-24 w-24 items-center justify-center border">
              <Link2 className="text-primary h-11 w-11" />
            </div>
            <h2 className="text-ink mt-8 font-sans text-[28px] font-semibold tracking-[-.04em] md:text-[26px]">
              {translations.emptyState}
            </h2>
            <p className="text-ink-subtle mx-auto mt-3 max-w-md leading-relaxed">
              {translations.emptyStateDescription}
            </p>
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="group border-product-accent bg-product-accent text-on-primary hover:bg-product-accent/90 mt-10 inline-flex min-h-11 items-center gap-2.5 rounded-full border px-[18px] py-[11px] text-sm leading-[1.2] font-semibold tracking-normal normal-case transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              {translations.createFirstLink}
            </button>
          </div>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          onPageChange={setPage}
          commonTranslations={commonTranslations}
        />
      )}

      <CreateShortLinkDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        errorTranslations={errorTranslations}
      />
    </div>
  );
}
