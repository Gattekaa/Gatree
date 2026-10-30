"use client";

import type { EditorTranslations } from "@/app/[lang]/(dashboard)/editor/[slug]/client";
import { updateLink } from "@/actions/link";
import type { LinkStyleConfig } from "@/types";
import type { Link } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { BASE_QUERY_KEYS } from "@/lib/query-keys";
import { notifyAppearanceSaved } from "./appearance-save-events";
import { createLatestSaveQueue } from "./latest-save-queue";
import { LinkAppearanceFields } from "./link-appearance-fields";
import { LinkStylePicker } from "./link-style-picker";

type Colors = { bgColor: string | null; textColor: string | null };
type SaveStatus = "saving" | "saved" | "error";

export function LinkAppearanceEditor({
  treeId,
  slug,
  links,
  onLinkChange,
  defaults,
  onDefaultChange,
  translations,
}: {
  treeId: string;
  slug: string;
  links: Link[];
  onLinkChange: (link: Link) => void;
  defaults: LinkStyleConfig;
  onDefaultChange: (style: LinkStyleConfig) => void;
  translations: EditorTranslations;
}) {
  const id = useId();
  const [target, setTarget] = useState("page");
  const [statuses, setStatuses] = useState<Record<string, SaveStatus>>({});
  const queues = useRef(
    new Map<string, ReturnType<typeof createLatestSaveQueue<Colors>>>(),
  );
  const client = useQueryClient();
  const t = translations.appearance.linkCustomization;
  const buttons = links.filter((link) =>
    ["LINK", "EMAIL", "PHONE", "WHATSAPP"].includes(link.type),
  );
  const selected = buttons.find((link) => link.id === target);

  function changeColors(link: Link, colors: Colors) {
    onLinkChange({ ...link, ...colors });
    setStatuses((current) => ({ ...current, [link.id]: "saving" }));
    let queue = queues.current.get(link.id);
    if (!queue) {
      queue = createLatestSaveQueue<Colors>({
        save: async (patch) => {
          const result = await updateLink(link.id, patch);
          if (result && "error" in result) throw new Error(result.error);
        },
        onSuccess: (_patch, isLatest) => {
          if (!isLatest) return;
          setStatuses((current) => ({ ...current, [link.id]: "saved" }));
          void client.invalidateQueries({
            queryKey: BASE_QUERY_KEYS.trees.detail(slug),
          });
          notifyAppearanceSaved(treeId);
        },
        onError: (_error, _patch, isLatest) => {
          if (!isLatest) return;
          setStatuses((current) => ({ ...current, [link.id]: "error" }));
          toast.error(translations.errors.saveLinkStyle);
        },
      });
      queues.current.set(link.id, queue);
    }
    queue.enqueue(colors);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label htmlFor={id} className="text-[13px] font-medium text-ink">
          {t.target}
        </label>
        <select
          id={id}
          value={selected?.id || "page"}
          onChange={(event) => setTarget(event.target.value)}
          className="min-h-12 w-full rounded-xl border border-hairline-strong bg-surface-2 px-3 text-sm text-ink outline-none focus:border-primary focus-visible:outline-2 focus-visible:outline-primary"
        >
          <option value="page">{t.pageDefaults}</option>
          {buttons.map((link) => (
            <option key={link.id} value={link.id}>
              {link.label || link.url}
            </option>
          ))}
        </select>
        <p className="text-xs leading-relaxed text-ink-tertiary">
          {t.scopeDescription}
        </p>
      </div>
      {selected ? (
        <>
          <LinkAppearanceFields
            key={selected.id}
            value={{ bgColor: selected.bgColor, textColor: selected.textColor }}
            onChange={(colors) => changeColors(selected, colors)}
            defaults={defaults}
            label={selected.label}
            icon={selected.icon}
            translations={t}
          />
          <div
            aria-live="polite"
            className="flex min-h-6 items-center justify-between gap-3 text-xs text-ink-subtle"
          >
            <span>{statuses[selected.id] ? t[statuses[selected.id]] : ""}</span>
            {statuses[selected.id] === "error" && (
              <button
                type="button"
                onClick={() =>
                  changeColors(selected, {
                    bgColor: selected.bgColor,
                    textColor: selected.textColor,
                  })
                }
                className="min-h-11 rounded-full border border-hairline px-4 font-medium text-ink"
              >
                {translations.common.retry}
              </button>
            )}
          </div>
        </>
      ) : (
        <LinkStylePicker
          value={defaults}
          onChange={onDefaultChange}
          translations={translations.appearance.linkStyle}
        />
      )}
    </div>
  );
}
