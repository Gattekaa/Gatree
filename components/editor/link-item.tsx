"use client";

import type { EditorTranslations } from "@/app/[lang]/(dashboard)/editor/[slug]/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { getIconComponent } from "@/lib/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Link } from "@prisma/client";
import { ExternalLink, MoreVertical, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { createElement, useRef } from "react";

function getScheduleStatus(
  link: Link,
): "scheduled" | "active" | "expired" | null {
  if (!link.scheduledStart && !link.scheduledEnd) return null;

  const now = new Date();

  if (link.scheduledStart && new Date(link.scheduledStart) > now)
    return "scheduled";
  if (link.scheduledEnd && new Date(link.scheduledEnd) < now) return "expired";

  return "active";
}

interface LinkItemProps {
  link: Link;
  onEdit: () => void;
  onDelete: (returnFocus: HTMLButtonElement | null) => void;
  onToggle: (enabled: boolean) => void;
  translations: EditorTranslations;
}

export function LinkItem({
  link,
  onEdit,
  onDelete,
  onToggle,
  translations,
}: LinkItemProps) {
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
  };

  const iconComponent = getIconComponent(link.icon);
  const scheduleStatus = getScheduleStatus(link);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl group relative overflow-hidden border transition-colors ${
        isDragging
          ? "z-50 border-primary bg-surface-2  scale-[1.02]"
          : "border-hairline bg-surface-1 hover:border-hairline-strong hover:bg-surface-2/50"
      } ${!link.enabled ? "opacity-40" : ""}`}
    >
      <div className="flex min-h-[76px] items-center gap-2 p-3 sm:gap-3 sm:p-4">
        <button
          {...attributes}
          {...listeners}
          className="rounded-full flex h-full w-8 shrink-0 cursor-grab touch-none items-center justify-center text-ink-subtle/60 hover:text-brutal-pink active:cursor-grabbing active:text-brutal-pink active:bg-surface-2 sm:w-8 min-h-11"
          aria-label={translations.editor.dragHint}
        >
          <div className="flex flex-col items-center gap-0.75">
            <div className="flex gap-0.75">
              <div className="size-1.25 rounded-full bg-current" />
              <div className="size-1.25 rounded-full bg-current" />
            </div>
            <div className="flex gap-0.75">
              <div className="size-1.25 rounded-full bg-current" />
              <div className="size-1.25 rounded-full bg-current" />
            </div>
            <div className="flex gap-0.75">
              <div className="size-1.25 rounded-full bg-current" />
              <div className="size-1.25 rounded-full bg-current" />
            </div>
          </div>
        </button>

        {link.thumbnail ? (
          <Image
            src={link.thumbnail}
            alt=""
            width={36}
            height={36}
            className="hidden h-9 w-9 shrink-0 rounded-xl object-cover border border-hairline-strong sm:block"
          />
        ) : iconComponent ? (
          <div
            className={`hidden h-10 w-10 shrink-0 rounded-xl items-center justify-center border sm:flex ${
              link.type === "YOUTUBE"
                ? "border-[#ff0000]/50 bg-[#ff0000]/10"
                : link.type === "SPOTIFY"
                  ? "border-brutal-green bg-brutal-green/10"
                  : link.type === "TEXT" || link.type === "HEADER"
                    ? "border-brutal-yellow bg-brutal-yellow/10"
                    : link.type === "MAP"
                      ? "border-brutal-pink bg-brutal-pink/10"
                      : link.type === "LINK"
                        ? "border-brutal-blue bg-brutal-blue/10"
                        : "border-hairline-strong bg-surface-2"
            }`}
          >
            {createElement(iconComponent, {
              className: `h-4 w-4 ${
                link.type === "YOUTUBE"
                  ? "text-[#ff0000]"
                  : link.type === "SPOTIFY"
                    ? "text-brutal-green"
                    : link.type === "TEXT" || link.type === "HEADER"
                      ? "text-brutal-yellow"
                      : link.type === "MAP"
                        ? "text-brutal-pink"
                        : link.type === "LINK"
                          ? "text-brutal-blue"
                          : "text-ink-subtle"
              }`,
            })}
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {link.thumbnail ? (
              <Image
                src={link.thumbnail}
                alt=""
                width={16}
                height={16}
                className="size-4 shrink-0 rounded object-cover sm:hidden"
              />
            ) : iconComponent ? (
              createElement(iconComponent, {
                className: "size-3.5 shrink-0 text-ink-tertiary sm:hidden",
              })
            ) : null}
            <p className="break-words truncate text-sm font-semibold text-ink">
              {link.label}
            </p>
            {link.type === "HEADER" && (
              <span className="shrink-0 rounded-full bg-product-accent/10 px-2 py-0.5 text-[10px] font-semibold normal-case text-brutal-yellow">
                {translations.editor.linkItem.section}
              </span>
            )}
            {link.type === "YOUTUBE" && (
              <span className="shrink-0 rounded-full bg-[#ff0000]/10 px-2 py-0.5 text-[10px] font-semibold normal-case text-[#ff0000]">
                YT
              </span>
            )}
            {link.type === "SPOTIFY" && (
              <span className="shrink-0 rounded-full bg-product-accent/10 px-2 py-0.5 text-[10px] font-semibold normal-case text-brutal-green">
                SP
              </span>
            )}
            {scheduleStatus === "scheduled" && (
              <span className="shrink-0 rounded-full bg-product-accent/10 px-2 py-0.5 text-[10px] font-semibold normal-case text-primary">
                {translations.editor.linkItem.scheduled}
              </span>
            )}
            {scheduleStatus === "active" && (
              <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold normal-case text-success">
                {translations.common.active}
              </span>
            )}
            {scheduleStatus === "expired" && (
              <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold normal-case text-ink-tertiary">
                {translations.common.expired}
              </span>
            )}
          </div>
          {link.type !== "HEADER" && (
            <p className="break-words mt-0.5 flex items-center gap-1 truncate text-[12px] text-ink-tertiary">
              <ExternalLink className="h-2.5 w-2.5 shrink-0" />
              {link.url}
            </p>
          )}
        </div>

        <Switch
          className="m-0.5"
          checked={link.enabled}
          onCheckedChange={onToggle}
          aria-label={`${link.enabled ? translations.common.inactive : translations.common.active} link`}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              ref={menuTriggerRef}
              type="button"
              aria-label={`${translations.nav.menu}: ${link.label}`}
              className="flex items-center justify-center text-ink-tertiary hover:bg-surface-2 hover:text-ink size-11 rounded-full"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit} className="gap-2.5">
              <Pencil className="h-4 w-4" />
              {translations.common.edit}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onDelete(menuTriggerRef.current)}
              className="gap-2.5 text-error focus:text-error"
            >
              <Trash2 className="h-4 w-4" />
              {translations.common.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
