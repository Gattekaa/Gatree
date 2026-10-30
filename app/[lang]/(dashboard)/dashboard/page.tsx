import { auth } from "@/lib/auth";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { generateLocaleMetadata } from "@/lib/i18n/metadata";
import { redirect } from "next/navigation";
import { DashboardClient } from "./client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return generateLocaleMetadata(lang as Locale, "/dashboard", {
    title: dict.dashboard.title,
    description: dict.dashboard.subtitle,
  });
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login?signedOut=1");

  const dict = await getDictionary(lang as Locale);

  return (
    <DashboardClient
      translations={dict.dashboard}
      treeCardTranslations={dict.treeCard}
      dialogTranslations={dict.dialogs}
      toastTranslations={dict.toasts}
      errorTranslations={dict.errors}
      commonTranslations={dict.common}
    />
  );
}
