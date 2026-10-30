import type { Metadata } from "next";
import type { Locale } from "./config";
import { DEFAULT_LOCALE, LOCALES } from "./config";

export function generateLocaleMetadata(
  locale: Locale,
  path: string,
  translations: { title: string; description: string }
): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const alternateLanguages: Record<string, string> = {};
  for (const loc of LOCALES) {
    const prefix = loc === DEFAULT_LOCALE ? "" : `/${loc}`;
    alternateLanguages[loc] = `${baseUrl}${prefix}${path}`;
  }

  return {
    title: translations.title,
    description: translations.description,
    alternates: {
      languages: alternateLanguages,
    },
    openGraph: {
      locale: locale === "pt-BR" ? "pt_BR" : "en_US",
    },
  };
}
