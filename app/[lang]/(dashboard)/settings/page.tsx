import { auth } from "@/lib/auth";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { generateLocaleMetadata } from "@/lib/i18n/metadata";
import { redirect } from "next/navigation";
import { SettingsClient } from "./client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return generateLocaleMetadata(lang as Locale, "/settings", {
    title: dict.settings.title,
    description: dict.settings.subtitle,
  });
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const dict = await getDictionary(lang as Locale);

  return (
    <SettingsClient
      user={session.user}
      translations={dict.settings}
      authTranslations={dict.auth}
      commonTranslations={dict.common}
      currentLocale={lang}
    />
  );
}
