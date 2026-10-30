import { GatreeLogo } from "@/components/shared/logo";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ArrowLeft } from "lucide-react";
import localFont from "next/font/local";
import Link from "next/link";

const outfit = localFont({
  src: "../../../node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2",
  variable: "--font-product-display",
  weight: "100 900",
  display: "swap",
});

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const homePath = lang === DEFAULT_LOCALE ? "/" : `/${lang}`;

  return (
    <div
      className={`product-route flex min-h-dvh flex-col bg-canvas font-sans text-ink ${outfit.variable}`}
    >
      <a
        href="#auth-content"
        className="absolute top-2 left-4 z-50 -translate-y-[160%] rounded-full bg-product-accent px-5 py-3 text-sm font-medium text-on-primary focus:translate-y-0"
      >
        {dict.marketing.ui.skipToContent}
      </a>
      <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-5 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        <Link
          href={homePath}
          aria-label="Gatree"
          className="inline-flex min-h-11 items-center gap-2 text-[23px] font-semibold tracking-[-.055em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <GatreeLogo size="lg" className="text-primary" />
          <span>Gatree</span>
        </Link>
        <Link
          href={homePath}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-ink-subtle transition-colors hover:bg-surface-1 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {dict.common.back}
        </Link>
      </header>
      <main
        id="auth-content"
        tabIndex={-1}
        className="flex flex-1 items-center justify-center px-5 pt-5 pb-12 focus:outline-none sm:px-8 lg:px-10 lg:pt-8 lg:pb-16"
      >
        {children}
      </main>
      <footer className="px-5 pb-6 text-center text-xs text-ink-tertiary sm:px-8 lg:pb-8">
        © {new Date().getFullYear()} Gatree
      </footer>
    </div>
  );
}
