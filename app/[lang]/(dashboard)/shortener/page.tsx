import { auth } from "@/lib/auth";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { generateLocaleMetadata } from "@/lib/i18n/metadata";
import { redirect } from "next/navigation";
import { ShortenerClient } from "./client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return generateLocaleMetadata(lang as Locale, "/shortener", {
    title: dict.shortener.title,
    description: dict.shortener.subtitle,
  });
}

export default async function ShortenerPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login?signedOut=1");

  const dict = await getDictionary(lang as Locale);

  return (
    <ShortenerClient
      translations={dict.shortener}
      commonTranslations={dict.common}
      dialogTranslations={dict.dialogs.deleteShortLink}
      toastTranslations={dict.toasts}
      errorTranslations={dict.errors}
    />
  );
}
