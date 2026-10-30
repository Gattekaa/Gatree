"use client";

import { useAutoSave } from "@/hooks/use-auto-save";
import { getIconComponent } from "@/lib/icons";
import { normalizeSocialUrl, SOCIAL_PLATFORMS } from "@/lib/social-platforms";
import { useCallback, useId, useState } from "react";

interface SocialIcon {
  platform: string;
  url: string;
}
interface SocialProfilesTranslations {
  title: string;
  description: string;
  active: string;
  activeSingular: string;
  invalid: string;
  profileUrl: string;
}

export function SocialIconsEditor({
  socialIcons,
  onSave,
  translations: t,
}: {
  socialIcons: SocialIcon[];
  onSave: (icons: SocialIcon[]) => void | Promise<void>;
  translations: SocialProfilesTranslations;
}) {
  const id = useId();
  const [urls, setUrls] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      socialIcons.map((icon) => [
        icon.platform === "x" ? "twitter" : icon.platform,
        icon.url,
      ]),
    ),
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const save = useCallback(
    async (serialized: string) => {
      const drafts = JSON.parse(serialized) as Record<string, string>;
      const icons: SocialIcon[] = [];
      for (const platform of SOCIAL_PLATFORMS) {
        if (!drafts[platform.id]?.trim()) continue;
        const url = normalizeSocialUrl(platform.id, drafts[platform.id]);
        // Keep the last saved profiles while the user is editing an invalid URL.
        if (!url) return;
        icons.push({ platform: platform.id, url });
      }
      await onSave(icons);
    },
    [onSave],
  );
  useAutoSave(JSON.stringify(urls), save);
  const filledCount = SOCIAL_PLATFORMS.filter((p) =>
    normalizeSocialUrl(p.id, urls[p.id] || ""),
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">{t.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-subtle">
            {t.description}
          </p>
        </div>
        {filledCount > 0 && (
          <span className="shrink-0 rounded-full bg-product-accent/10 px-2.5 py-1 text-xs font-medium text-primary">
            {filledCount} {filledCount === 1 ? t.activeSingular : t.active}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SOCIAL_PLATFORMS.map((platform) => {
          const Icon = getIconComponent(platform.id);
          const value = urls[platform.id] || "";
          const valid = !!normalizeSocialUrl(platform.id, value);
          const invalid = !!touched[platform.id] && !!value.trim() && !valid;
          const inputId = `${id}-${platform.id}`;
          return (
            <div
              key={platform.id}
              className={`min-w-0 rounded-2xl border bg-surface-2 p-3 transition-colors ${valid ? "border-primary/35" : "border-hairline"}`}
            >
              <label
                htmlFor={inputId}
                className="mb-3 flex items-center gap-2 text-[13px] font-medium text-ink"
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-xl ${valid ? "bg-product-accent/10 text-primary" : "bg-surface-3 text-ink-subtle"}`}
                >
                  {Icon && <Icon className="size-4" />}
                </span>
                {platform.label}
              </label>
              <input
                id={inputId}
                type="url"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                value={value}
                aria-label={`${platform.label}: ${t.profileUrl}`}
                aria-invalid={invalid}
                aria-describedby={invalid ? `${inputId}-error` : undefined}
                onBlur={() =>
                  setTouched((current) => ({ ...current, [platform.id]: true }))
                }
                onChange={(event) =>
                  setUrls((current) => ({
                    ...current,
                    [platform.id]: event.target.value,
                  }))
                }
                placeholder={platform.placeholder}
                className={`h-12 w-full min-w-0 rounded-xl border bg-canvas px-3 py-2 text-base text-ink outline-none transition-colors placeholder:text-ink-tertiary focus:border-primary sm:text-sm ${invalid ? "border-error" : "border-hairline-strong"}`}
              />
              {invalid && (
                <p
                  id={`${inputId}-error`}
                  role="alert"
                  className="mt-2 text-xs leading-relaxed text-error"
                >
                  {t.invalid}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
