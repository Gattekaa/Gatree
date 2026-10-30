"use client";

import type { createLink, updateLink } from "@/actions/link";
import type { EditorTranslations } from "@/app/[lang]/(dashboard)/editor/[slug]/client";
import { ShareDialog } from "@/components/shared/share-dialog";
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
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAutoSave } from "@/hooks/use-auto-save";
import {
  useCreateLink,
  useDeleteLink,
  useReorderLinks,
  useToggleLink,
  useUpdateLink,
  useUpdateTree,
} from "@/hooks/use-tree-detail";
import type { Link, Tree } from "@prisma/client";
import {
  BarChart3,
  Check,
  ExternalLink,
  Eye,
  Loader2,
  Palette,
  Plus,
  Share2,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { getLocalePrefix } from "@/lib/i18n/paths";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { AppearancePanel } from "./appearance-panel";
import { LinkForm } from "./link-form";
import { LinkList } from "./link-list";
import { TreePreview } from "./tree-preview";

interface TreeEditorViewProps {
  tree: Tree & { links: Link[] };
  slug: string;
  translations: EditorTranslations;
}

export function TreeEditorView({
  tree: initialTree,
  slug,
  translations,
}: TreeEditorViewProps) {
  const localePrefix = getLocalePrefix(usePathname());
  const [tree, setTree] = useState(initialTree);
  const [links, setLinks] = useState(initialTree.links);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [deletingLink, setDeletingLink] = useState<Link | null>(null);
  const [deleteError, setDeleteError] = useState(false);
  const deleteReturnFocusRef = useRef<HTMLButtonElement | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const deleteInFlightRef = useRef(false);

  const updateTreeMutation = useUpdateTree(slug);
  const createLinkMutation = useCreateLink(slug);
  const updateLinkMutation = useUpdateLink(slug);
  const deleteLinkMutation = useDeleteLink(slug);
  const reorderLinksMutation = useReorderLinks(slug);
  const toggleLinkMutation = useToggleLink(slug);

  const { status: titleSaveStatus } = useAutoSave(tree.title, async (title) => {
    if (title !== initialTree.title) {
      await updateTreeMutation.mutateAsync({
        treeId: tree.id,
        data: { title },
      });
    }
  });

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTree((prev) => ({ ...prev, title: e.target.value }));
    },
    [],
  );

  const handleReorder = useCallback(
    (reorderedLinks: Link[]) => {
      setLinks(reorderedLinks);
      const orderedIds = reorderedLinks.map((l) => l.id);
      reorderLinksMutation.mutate(
        { treeId: tree.id, orderedIds },
        { onError: () => toast.error(translations.errors.reorder) },
      );
    },
    [tree.id, reorderLinksMutation, translations],
  );

  const handleLinkAppearanceChange = useCallback((updated: Link) => {
    setLinks((current) => current.map((link) => link.id === updated.id ? updated : link));
  }, []);

  const handleCreateLink = useCallback(
    async (data: Parameters<typeof createLink>[1]) => {
      await createLinkMutation.mutateAsync(
        { treeId: tree.id, data },
        {
          onSuccess: (newLink) => {
            setLinks((prev) => [...prev, newLink]);
            setShowLinkForm(false);
            toast.success(translations.toasts.linkAdded);
          },
          onError: () => toast.error(translations.errors.addLink),
        },
      );
    },
    [tree.id, createLinkMutation, translations],
  );

  const handleUpdateLink = useCallback(
    async (
      linkId: string,
      data: Parameters<typeof updateLink>[1],
    ) => {
      await updateLinkMutation.mutateAsync(
        { linkId, data },
        {
          onSuccess: (updated) => {
            setLinks((prev) =>
              prev.map((l) => (l.id === linkId ? updated : l)),
            );
            setEditingLink(null);
            toast.success(translations.toasts.linkUpdated);
          },
          onError: () => toast.error(translations.errors.updateLink),
        },
      );
    },
    [updateLinkMutation, translations],
  );

  const handleRequestDeleteLink = useCallback(
    (linkId: string, returnFocus: HTMLButtonElement | null) => {
      const selectedLink = links.find((link) => link.id === linkId);
      if (!selectedLink) return;
      deleteReturnFocusRef.current = returnFocus;
      setDeleteError(false);
      setDeletingLink(selectedLink);
    },
    [links],
  );

  const handleConfirmDeleteLink = useCallback(() => {
    if (!deletingLink || deleteInFlightRef.current) return;
    deleteInFlightRef.current = true;
    setDeleteError(false);
    const linkId = deletingLink.id;
    deleteLinkMutation.mutate(linkId, {
      onSuccess: () => {
        setLinks((prev) => prev.filter((l) => l.id !== linkId));
        setDeletingLink(null);
        toast.success(translations.toasts.linkDeleted);
      },
      onError: () => {
        setDeleteError(true);
        toast.error(translations.errors.deleteLink);
      },
      onSettled: () => {
        deleteInFlightRef.current = false;
      },
    });
  }, [deletingLink, deleteLinkMutation, translations]);

  const handleToggleLink = useCallback(
    (linkId: string, enabled: boolean) => {
      toggleLinkMutation.mutate(
        { linkId, enabled },
        {
          onSuccess: (updated) => {
            setLinks((prev) =>
              prev.map((l) => (l.id === linkId ? updated : l)),
            );
          },
          onError: () => toast.error(translations.errors.toggleVisibility),
        },
      );
    },
    [toggleLinkMutation, translations],
  );

  const activeLinks = links.filter((l) => l.enabled);
  const totalLinks = links.length;

  return (
    <Dialog open={showMobilePreview} onOpenChange={setShowMobilePreview}>
      <div ref={editorRef} className="mx-auto max-w-7xl">
        <h1 className="text-balance break-words sr-only">
          {translations.nav.editor}: {tree.title}
        </h1>
        <div className="lg:hidden">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {tree.avatar ? (
                <Image
                  src={tree.avatar}
                  alt=""
                  width={44}
                  height={44}
                  className="h-11 w-11 shrink-0 rounded-2xl object-cover border border-hairline"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-product-accent/10">
                  <span className="text-[15px] font-semibold text-primary">
                    {tree.title[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <input
                  data-slot="input"
                  data-tour="editor-title"
                  aria-label={translations.editor.treeTitlePlaceholder}
                  value={tree.title}
                  onChange={handleTitleChange}
                  className="w-full rounded-xl border border-transparent bg-transparent px-2 py-1 text-2xl font-semibold tracking-[-0.035em] text-ink outline-none placeholder:text-ink-tertiary hover:border-hairline focus:border-primary focus-visible:outline-none"
                  placeholder={translations.editor.titlePlaceholder}
                />
                <p className="break-words text-[12px] text-ink-tertiary">
                  /{slug}
                </p>
              </div>
            </div>
            {titleSaveStatus === "saving" && (
              <Loader2 className="h-4 w-4 animate-spin text-ink-tertiary" />
            )}
            {titleSaveStatus === "saved" && (
              <Check className="h-4 w-4 text-success" />
            )}
          </div>

          <div className="mb-2 grid grid-cols-3 gap-2">
            <AppearancePanel
              links={links}
              onLinkChange={handleLinkAppearanceChange}
              tree={tree}
              slug={slug}
              onTreeChange={(updated) =>
                setTree((prev) => ({ ...prev, ...updated }))
              }
              translations={translations}
            >
              <button
                data-tour="editor-appearance"
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-hairline bg-surface-1 py-3.5 transition-colors hover:bg-surface-2 active:scale-[0.98]"
              >
                <Palette className="h-5 w-5 text-ink-subtle" />
                <span className="text-xs font-medium text-ink-tertiary">
                  {translations.editor.appearance}
                </span>
              </button>
            </AppearancePanel>
            <NextLink
              href={`${localePrefix}/analytics/${slug}`}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-hairline bg-surface-1 py-3.5 transition-colors hover:bg-surface-2 active:scale-[0.98]"
            >
              <BarChart3 className="h-5 w-5 text-ink-subtle" />
              <span className="text-xs font-medium text-ink-tertiary">
                Analytics
              </span>
            </NextLink>
            <DialogTrigger asChild>
              <button
                data-tour="editor-preview"
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-hairline bg-surface-1 py-3.5 transition-colors hover:bg-surface-2 active:scale-[0.98]"
              >
                <Smartphone className="h-5 w-5 text-ink-subtle" />
                <span className="text-xs font-medium text-ink-tertiary">
                  {translations.common.preview}
                </span>
              </button>
            </DialogTrigger>
          </div>
          <div className="mb-5 grid grid-cols-2 gap-2">
            <NextLink
              href={`${localePrefix}/${slug}`}
              target="_blank"
              className="flex items-center justify-center gap-2 rounded-full border border-hairline bg-surface-1 py-2.5 transition-colors hover:bg-surface-2 active:scale-[0.98]"
            >
              <ExternalLink className="h-4 w-4 text-ink-subtle" />
              <span className="text-xs font-medium text-ink-tertiary">
                {translations.nav.viewPage}
              </span>
            </NextLink>
            <button
              data-tour="editor-share"
              onClick={() => setShowShare(true)}
              className="flex items-center justify-center gap-2 rounded-full border border-hairline bg-surface-1 py-2.5 transition-colors hover:bg-surface-2 active:scale-[0.98]"
            >
              <Share2 className="h-4 w-4 text-ink-subtle" />
              <span className="text-xs font-medium text-ink-tertiary">
                {translations.common.share}
              </span>
            </button>
          </div>

          <button
            data-action="add-link"
            data-tour="editor-add-link"
            onClick={() => setShowLinkForm(true)}
            className="mb-4 flex w-full items-center gap-3 p-4 active:scale-[0.98] rounded-2xl border border-primary/25 bg-product-accent/5 hover:border-primary/50 hover:bg-product-accent/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-product-accent/10">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="break-words text-[15px] font-semibold text-ink">
                {translations.editor.addLink}
              </p>
              <p className="break-words text-[12px] text-ink-subtle">
                {translations.editor.addLinkDescription}
              </p>
            </div>
          </button>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 pb-1">
              <p className="break-words text-[13px] font-semibold text-ink">
                <span className="text-ink">{totalLinks}</span>{" "}
                {translations.editor.links
                  .replace("{{count}}", String(totalLinks))
                  .replace(String(totalLinks), "")
                  .trim()}
              </p>
              <p className="break-words text-[12px] text-ink-tertiary">
                <span className="text-primary font-medium">
                  {activeLinks.length}
                </span>{" "}
                {translations.editor.activeLinks
                  .replace("{{count}}", String(activeLinks.length))
                  .replace(String(activeLinks.length), "")
                  .trim()}
              </p>
            </div>
            {links.length > 1 && (
              <div className="flex items-center gap-2 rounded-xl border border-hairline bg-surface-1 px-3 py-2">
                <div className="flex gap-0.5">
                  <div className="size-0.75 rounded-full bg-ink-tertiary" />
                  <div className="size-0.75 rounded-full bg-ink-tertiary" />
                </div>
                <p className="break-words text-[12px] text-ink-tertiary">
                  {translations.editor.dragHint}
                </p>
              </div>
            )}
            <LinkList
              links={links}
              onReorder={handleReorder}
              onEdit={setEditingLink}
              onDelete={handleRequestDeleteLink}
              onToggle={handleToggleLink}
              translations={translations}
            />
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="mb-6 flex items-center justify-between flex-wrap gap-[18px]">
            <div className="flex items-center gap-3 min-w-0">
              {tree.avatar ? (
                <Image
                  src={tree.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 rounded-2xl object-cover border border-hairline"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-product-accent/10">
                  <span className="font-semibold text-primary text-sm leading-[1.5]">
                    {tree.title[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex min-w-0 items-center gap-2">
                <input
                  data-slot="input"
                  data-tour="editor-title"
                  aria-label={translations.editor.treeTitlePlaceholder}
                  value={tree.title}
                  onChange={handleTitleChange}
                  className="min-w-0 flex-1 rounded-xl border border-transparent bg-transparent px-2 py-1 text-2xl font-semibold tracking-[-0.035em] text-ink outline-none placeholder:text-ink-tertiary hover:border-hairline focus:border-primary focus-visible:outline-none"
                  placeholder={translations.editor.treeTitlePlaceholder}
                />
                {titleSaveStatus === "saving" && (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-ink-tertiary" />
                )}
                {titleSaveStatus === "saved" && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                )}
              </div>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <AppearancePanel
                links={links}
                onLinkChange={handleLinkAppearanceChange}
                tree={tree}
                slug={slug}
                onTreeChange={(updated) =>
                  setTree((prev) => ({ ...prev, ...updated }))
                }
                translations={translations}
              />
              <NextLink
                href={`${localePrefix}/analytics/${slug}`}
                className="inline-flex items-center gap-2 rounded-full min-h-11 border border-hairline px-4 py-2 text-[13px] font-medium text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden md:inline">Analytics</span>
              </NextLink>
              <NextLink
                href={`${localePrefix}/${slug}`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full min-h-11 border border-hairline px-4 py-2 text-[13px] font-medium text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden md:inline">
                  {translations.nav.viewPage}
                </span>
              </NextLink>
              <button
                data-tour="editor-share"
                onClick={() => setShowShare(true)}
                className={`inline-flex items-center gap-2 rounded-full min-h-11 border border-hairline px-4 py-2 text-[13px] font-medium text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink ${showShare ? "" : ""}`}
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden md:inline">
                  {translations.common.share}
                </span>
              </button>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-6 border border-hairline bg-surface-1 px-5 py-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-2">
                <Plus className="h-3 w-3 text-ink" />
              </div>
              <span className="text-[13px] text-ink-subtle">
                <span className="font-semibold text-ink">{totalLinks}</span>{" "}
                links
              </span>
            </div>
            <div className="h-4 w-px bg-hairline-strong" />
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-2">
                <Eye className="h-3 w-3 text-primary" />
              </div>
              <span className="text-[13px] text-ink-subtle">
                <span className="font-semibold text-primary">
                  {activeLinks.length}
                </span>{" "}
                {translations.common.active.toLowerCase()}
              </span>
            </div>
            <div className="h-4 w-px bg-hairline-strong" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-ink-tertiary text-xs tracking-normal leading-[1.5]">
                /{slug}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(280px,1fr)] gap-8">
            <div className="space-y-3 min-w-0">
              <button
                data-action="add-link"
                data-tour="editor-add-link"
                onClick={() => setShowLinkForm(true)}
                className="group flex w-full items-center gap-4 p-4 transition-colors rounded-2xl border border-primary/25 bg-product-accent/5 hover:border-primary/50 hover:bg-product-accent/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-product-accent/10 transition-colors group-hover:bg-product-accent/15">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="break-words text-[13px] font-medium text-ink-subtle group-hover:text-ink">
                    {translations.editor.addNewLink}
                  </p>
                  <p className="break-words text-xs text-ink-tertiary">
                    {translations.editor.addNewLinkDescription}
                  </p>
                </div>
              </button>
              <LinkList
                links={links}
                onReorder={handleReorder}
                onEdit={setEditingLink}
                onDelete={handleRequestDeleteLink}
                onToggle={handleToggleLink}
                translations={translations}
              />
            </div>
            <div className="min-w-0 pt-0.5">
              <div data-tour="editor-preview" className="sticky top-24">
                <TreePreview tree={tree} links={links} />
              </div>
            </div>
          </div>
        </div>

        {(showLinkForm || editingLink) && (
          <LinkForm
            link={editingLink}
            onSubmit={
              editingLink
                ? (data) => handleUpdateLink(editingLink.id, data)
                : handleCreateLink
            }
            onClose={() => {
              setShowLinkForm(false);
              setEditingLink(null);
            }}
            translations={translations}
          />
        )}

        <ShareDialog
          treeId={tree.id}
          slug={slug}
          open={showShare}
          onOpenChange={setShowShare}
          translations={translations.dialogs.share}
          toasts={{ linkCopied: translations.toasts.linkCopied }}
        />

        <AlertDialog
          open={deletingLink !== null}
          onOpenChange={(open) => {
            if (!open && !deleteInFlightRef.current) setDeletingLink(null);
          }}
        >
          <AlertDialogContent
            onEscapeKeyDown={(event) => {
              if (deleteInFlightRef.current) event.preventDefault();
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              const trigger = deleteReturnFocusRef.current;
              if (trigger?.isConnected && trigger.getClientRects().length > 0) {
                trigger.focus();
              } else {
                Array.from(
                  editorRef.current?.querySelectorAll<HTMLButtonElement>(
                    '[data-action="add-link"]',
                  ) ?? [],
                )
                  .find((button) => button.getClientRects().length > 0)
                  ?.focus();
              }
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>
                {translations.editor.deleteLink.title}
              </AlertDialogTitle>
              <AlertDialogDescription className="break-words">
                {translations.editor.deleteLink.description.replace(
                  "{{label}}",
                  deletingLink?.label || translations.editor.deleteLink.unnamed,
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError && (
              <p
                role="alert"
                className="break-words mt-4 text-error text-sm leading-[1.5]"
              >
                {translations.errors.deleteLink}
              </p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={deleteLinkMutation.isPending}
                className="rounded-full min-h-11 normal-case tracking-normal disabled:opacity-50"
              >
                {translations.common.cancel}
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={deleteLinkMutation.isPending}
                className="rounded-full min-h-11 gap-2 normal-case tracking-normal disabled:opacity-50"
                onClick={(event) => {
                  event.preventDefault();
                  handleConfirmDeleteLink();
                }}
              >
                {deleteLinkMutation.isPending && (
                  <Loader2
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                  />
                )}
                {deleteLinkMutation.isPending
                  ? translations.editor.deleteLink.deleting
                  : translations.common.delete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {showMobilePreview && (
          <DialogContent
            className="flex flex-col bg-canvas p-0 product:w-screen product:max-w-none product:h-dvh product:max-h-none product:rounded-none product:border-0 [&>[data-slot=dialog-close]]:hidden"
            closeLabel={translations.common.close}
            aria-describedby={undefined}
          >
            <DialogTitle className="sr-only">
              {translations.common.preview}
            </DialogTitle>
            <div className="flex shrink-0 items-center justify-between border-b border-hairline-strong px-4 py-3">
              <p className="break-words text-[15px] font-semibold text-ink">
                {translations.common.preview}
              </p>
              <button
                onClick={() => setShowMobilePreview(false)}
                className="rounded-xl border border-hairline-strong px-3 py-1.5 text-[13px] font-medium text-primary active:bg-surface-2"
              >
                {translations.common.close}
              </button>
            </div>

            <iframe
              src={`${localePrefix}/${slug}`}
              className="flex-1 border-0"
              title="Preview"
              loading="lazy"
            />
          </DialogContent>
        )}
      </div>
    </Dialog>
  );
}
