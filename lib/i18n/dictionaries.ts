import "server-only";
import { notFound } from "next/navigation";
import { isValidLocale, type Locale } from "./config";

const dictionaries = {
  "pt-BR": () => import("@/dictionaries/pt-BR.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
};

function deepMerge(
  base: Record<string, unknown>,
  override: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      override[key] &&
      typeof override[key] === "object" &&
      !Array.isArray(override[key]) &&
      base[key] &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      result[key] = deepMerge(
        base[key] as Record<string, unknown>,
        override[key] as Record<string, unknown>
      );
    } else if (override[key] !== undefined) {
      result[key] = override[key];
    }
  }
  return result;
}

export async function getDictionary(locale: Locale) {
  // Nested layouts may run before the parent layout validates route params.
  if (!isValidLocale(locale)) notFound();
  const base = await dictionaries["pt-BR"]();
  if (locale === "pt-BR") return base;

  const localeDict = await dictionaries[locale]();
  return deepMerge(base, localeDict) as typeof base;
}

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
