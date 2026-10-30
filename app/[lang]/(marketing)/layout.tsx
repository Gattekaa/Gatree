import { MarketingThemeToggle } from "@/components/marketing/marketing-controls";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { GatreeLogo } from "@/components/shared/logo";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ArrowUpRight } from "lucide-react";
import localFont from "next/font/local";
import Link from "next/link";

const outfit = localFont({
  src: "../../../node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2",
  variable: "--font-marketing-display",
  display: "swap",
  weight: "100 900",
});

// Navigation: layer 40; product stories stack locally in layers 1-3.
export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const t = dict.marketing;
  const localePath = lang === DEFAULT_LOCALE ? "" : `/${lang}`;

  return (
    <div
      className={`marketing-theme min-h-dvh bg-marketing-bg text-base leading-[1.6] text-marketing-ink [font-family:var(--font-marketing-display)] ${outfit.variable}`}
    >
      <a
        className="fixed top-2 left-4 z-50 -translate-y-[180%] rounded-full bg-marketing-accent px-5 py-3 text-marketing-accent-ink focus:translate-y-0"
        href="#main-content"
      >
        {t.ui.skipToContent}
      </a>
      <header className="sticky top-0 z-40 px-5 py-2 sm:px-8 lg:px-10">
        <nav
          className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 rounded-full border border-marketing-border bg-marketing-surface/95 px-4 supports-[backdrop-filter]:backdrop-blur-xl sm:px-6 [@media(prefers-reduced-transparency:reduce)]:bg-marketing-surface"
          aria-label={t.ui.navigation}
        >
          <Link
            href={`${localePath}/`}
            className="flex shrink-0 items-center gap-2 text-[23px] font-semibold tracking-[-.055em]"
            aria-label="Gatree"
          >
            <GatreeLogo size="md" className="text-marketing-accent-text" />
            <span className="max-[379px]:hidden">Gatree</span>
          </Link>
          <Link
            href="#features"
            className="hidden text-sm text-marketing-muted transition-colors hover:text-marketing-ink md:block"
          >
            {t.nav.features}
          </Link>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="hidden min-[480px]:block">
              <LanguageSwitcher
                currentLocale={lang}
                labels={{ portuguese: "Português", english: "English" }}
                compact
                portalClassName={outfit.variable}
              />
            </div>
            <MarketingThemeToggle label={t.ui.toggleTheme} />
            <Link
              href={`${localePath}/login`}
              className="hidden text-sm text-marketing-muted transition-colors hover:text-marketing-ink lg:block"
            >
              {t.nav.login}
            </Link>
            <Link
              href={`${localePath}/login`}
              className="group inline-flex min-h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-marketing-accent px-4 py-2.5 text-xs font-semibold text-marketing-accent-ink transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transform-none sm:text-sm"
            >
              {t.nav.startFree}
              <ArrowUpRight
                size={16}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:rotate-45 motion-reduce:transition-none"
              />
            </Link>
          </div>
        </nav>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="w-full max-w-full overflow-x-clip"
      >
        {children}
      </main>
      <footer className="overflow-hidden px-5 pb-8 pt-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <p
            className="select-none text-center text-[clamp(6rem,21vw,21rem)] font-semibold leading-none tracking-[-.07em] text-marketing-ink/15"
            aria-hidden="true"
          >
            Gatree
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-5 border-t border-marketing-border pt-7">
            <p className="text-xs text-marketing-muted">
              © {new Date().getFullYear()} Gatree
            </p>
            <div className="flex items-center gap-7 text-sm text-marketing-muted">
              <Link
                href="#features"
                className="inline-flex min-h-11 items-center hover:text-marketing-ink"
              >
                {t.footer.features}
              </Link>
              <Link
                href={`${localePath}/login`}
                className="inline-flex min-h-11 items-center gap-2 hover:text-marketing-ink"
              >
                {t.footer.login}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
