import { LandingPageContent } from "@/components/marketing/landing-page-content";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { generateLocaleMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return generateLocaleMetadata(lang as Locale, "/", {
    title: dict.marketing.hero.headline,
    description: dict.marketing.hero.subtitle,
  });
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const localePath = lang === DEFAULT_LOCALE ? "" : `/${lang}`;

  return (
    <LandingPageContent marketing={dict.marketing} localePath={localePath} />
  );
}
