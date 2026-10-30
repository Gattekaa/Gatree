import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { generateLocaleMetadata } from "@/lib/i18n/metadata";
import { notFound, redirect } from "next/navigation";
import { AnalyticsClient } from "./client";

interface Props {
  params: Promise<{ slug: string; lang: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug, lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return generateLocaleMetadata(lang as Locale, `/analytics/${slug}`, {
    title: dict.analytics.title,
    description: dict.analytics.title,
  });
}

export default async function AnalyticsPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { slug, lang } = await params;

  const dict = await getDictionary(lang as Locale);

  const tree = await db.tree.findUnique({
    where: { slug },
    select: { id: true, title: true, slug: true, userId: true },
  });

  if (!tree) notFound();
  if (tree.userId !== session.user.id) redirect("/dashboard");

  return (
    <AnalyticsClient
      treeId={tree.id}
      treeName={tree.title}
      slug={tree.slug}
      translations={dict.analytics}
      commonTranslations={dict.common}
    />
  );
}
