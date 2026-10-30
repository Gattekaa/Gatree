import { db } from "@/lib/db";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/config";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function getLocaleUrl(path: string, locale: string): string {
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  return `${baseUrl}${prefix}${path}`;
}

function getAlternates(path: string) {
  return {
    languages: Object.fromEntries(
      LOCALES.map((loc) => [loc, getLocaleUrl(path, loc)])
    ),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const trees = await db.tree.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const staticPages: MetadataRoute.Sitemap = LOCALES.flatMap((locale) => [
    {
      url: getLocaleUrl("/", locale),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 1.0,
      alternates: getAlternates("/"),
    },
    {
      url: getLocaleUrl("/login", locale),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: getAlternates("/login"),
    },
  ]);

  const treePages: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    trees.map((tree) => ({
      url: getLocaleUrl(`/${tree.slug}`, locale),
      lastModified: tree.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: getAlternates(`/${tree.slug}`),
    }))
  );

  return [...staticPages, ...treePages];
}
