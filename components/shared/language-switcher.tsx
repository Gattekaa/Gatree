"use client";

import { updateUserLocale } from "@/actions/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { usePathname } from "next/navigation";
import { useTransition } from "react";

interface LanguageSwitcherProps {
  currentLocale: string;
  labels: { portuguese: string; english: string };
  compact?: boolean;
  portalClassName?: string;
}

export function LanguageSwitcher({
  currentLocale,
  labels,
  compact = false,
  portalClassName = "",
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function getTargetPath(targetLocale: string): string {
    let cleanPath = pathname;

    if (cleanPath.startsWith("/en/")) {
      cleanPath = cleanPath.slice(3);
    } else if (cleanPath === "/en") {
      cleanPath = "/";
    }

    if (targetLocale === DEFAULT_LOCALE) {
      return cleanPath || "/";
    }

    return `/en${cleanPath}`;
  }

  function handleLocaleChange(targetLocale: string) {
    if (targetLocale === currentLocale) return;

    startTransition(async () => {
      await updateUserLocale(targetLocale);
      const targetPath = getTargetPath(targetLocale);
      window.location.href = targetPath;
    });
  }

  return (
    <Select
      value={currentLocale}
      onValueChange={handleLocaleChange}
      disabled={isPending}
    >
      <SelectTrigger
        className={
          compact
            ? "h-10 w-[58px] border-0 bg-transparent px-[7px] text-xs text-marketing-muted [font-family:var(--font-marketing-display)] shadow-none hover:border-transparent focus-visible:outline-2 focus-visible:outline-offset-5 focus-visible:outline-marketing-accent-text md:w-18"
            : "w-45"
        }
        aria-label={currentLocale === "en" ? "Language" : "Idioma"}
      >
        <SelectValue>
          {compact ? (currentLocale === "en" ? "EN" : "PT") : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        className={compact ? `product-route min-w-44 ${portalClassName}` : undefined}
      >
        <SelectItem value="pt-BR">🇧🇷 {labels.portuguese}</SelectItem>
        <SelectItem value="en">🇺🇸 {labels.english}</SelectItem>
      </SelectContent>
    </Select>
  );
}
