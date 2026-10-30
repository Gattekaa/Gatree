import { auth } from "@/lib/auth";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { redirect } from "next/navigation";
import { ShortLinkAnalyticsClient } from "./client";

export default async function ShortLinkAnalyticsPage({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>;
}) {
  const { slug, lang } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login?signedOut=1");

  const dict = await getDictionary(lang as Locale);

  return (
    <ShortLinkAnalyticsClient
      slug={slug}
      translations={dict.analytics}
    />
  );
}
