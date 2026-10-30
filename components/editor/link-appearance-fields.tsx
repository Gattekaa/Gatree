"use client";

import { createElement } from "react";
import { ColorSwatchInput } from "@/components/editor/color-swatch-input";
import { LINK_RADIUS_MAP } from "@/lib/constants";
import { getIconComponent } from "@/lib/icons";
import { getLinkButtonStyle } from "@/lib/link-style";
import type { LinkStyleConfig } from "@/types";

export interface LinkAppearanceTranslations {
  title: string;
  description: string;
  inherit: string;
  custom: string;
  background: string;
  border: string;
  text: string;
  preview: string;
  previewLabel: string;
}

export function LinkAppearanceFields({
  value,
  onChange,
  defaults,
  label,
  icon,
  translations: t,
}: {
  value: { bgColor: string | null; textColor: string | null };
  onChange: (value: {
    bgColor: string | null;
    textColor: string | null;
  }) => void;
  defaults: LinkStyleConfig;
  label: string;
  icon: string | null;
  translations: LinkAppearanceTranslations;
}) {
  const custom = value.bgColor !== null || value.textColor !== null;
  const iconComponent = getIconComponent(icon);
  return (
    <section className="space-y-4 rounded-2xl border border-hairline bg-surface-2 p-4">
      <div>
        <h3 className="text-[13px] font-medium text-ink">{t.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-tertiary">
          {t.description}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2" role="group" aria-label={t.title}>
        {[false, true].map((isCustom) => (
          <button
            key={String(isCustom)}
            type="button"
            aria-pressed={custom === isCustom}
            onClick={() =>
              onChange(
                isCustom
                  ? {
                      bgColor: value.bgColor || defaults.bgColor,
                      textColor: value.textColor || defaults.textColor,
                    }
                  : { bgColor: null, textColor: null },
              )
            }
            className={`min-h-11 rounded-xl border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary ${custom === isCustom ? "border-primary/50 bg-product-accent/10 text-primary" : "border-hairline text-ink-subtle hover:border-hairline-strong"}`}
          >
            {isCustom ? t.custom : t.inherit}
          </button>
        ))}
      </div>
      {custom && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="min-w-0 space-y-2">
            <p className="text-xs text-ink-subtle">
              {defaults.variant === "outlined" ? t.border : t.background}
            </p>
            <ColorSwatchInput
              debounceMs={0}
              label={defaults.variant === "outlined" ? t.border : t.background}
              value={value.bgColor || defaults.bgColor}
              onChange={(bgColor) => onChange({ ...value, bgColor })}
            />
          </div>
          <div className="min-w-0 space-y-2">
            <p className="text-xs text-ink-subtle">{t.text}</p>
            <ColorSwatchInput
              debounceMs={0}
              label={t.text}
              value={value.textColor || defaults.textColor}
              onChange={(textColor) => onChange({ ...value, textColor })}
            />
          </div>
        </div>
      )}
      <div className="rounded-xl border border-hairline bg-canvas p-4">
        <p className="mb-3 text-xs text-ink-tertiary">{t.preview}</p>
        <div
          className="flex min-h-12 items-center justify-center gap-2 px-4 py-3 text-center text-sm font-semibold"
          style={getLinkButtonStyle(
            value,
            defaults,
            LINK_RADIUS_MAP[defaults.radius],
          )}
        >
          {iconComponent && createElement(iconComponent, { className: "size-5 shrink-0" })}
          <span className="break-words">{label || t.previewLabel}</span>
        </div>
      </div>
    </section>
  );
}
