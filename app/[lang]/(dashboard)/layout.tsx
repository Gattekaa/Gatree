import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";
import { ProductShell } from "@/components/shared/product-shell";
import { TourProvider } from "@/components/onboarding/tour-provider";
import { auth } from "@/lib/auth";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { redirect } from "next/navigation";
import localFont from "next/font/local";

const outfit = localFont({
  src: "../../../node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2",
  variable: "--font-product-display",
  weight: "100 900",
  display: "swap",
});

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${lang === "pt-BR" ? "" : lang + "/"}login`);
  }

  const dict = await getDictionary(lang as Locale);

  const sidebarTranslations = {
    nav: dict.nav,
    auth: { logout: dict.auth.logout, logoutAccount: dict.auth.logoutAccount },
  };

  const topbarTranslations = {
    nav: dict.nav,
    auth: { logout: dict.auth.logout, logoutAccount: dict.auth.logoutAccount },
    theme: dict.settings.themeToggle,
    close: dict.common.close,
    tour: dict.onboarding.reopen,
  };

  return (
    <ProductShell
      fontClassName={outfit.variable}
      skipLabel={dict.marketing.ui.skipToContent}
    >
      <TourProvider
        key={session.user.id}
        userId={session.user.id}
        autoStart={session.user.showWelcomeTour === true}
        translations={dict.onboarding}
      >
        <Sidebar user={session.user} translations={sidebarTranslations} />

        <div className="flex min-w-0 flex-1 flex-col lg:ml-[272px]">
          <Topbar user={session.user} translations={topbarTranslations} />
          <main
            id="product-content"
            tabIndex={-1}
            className="mx-auto w-full min-w-0 max-w-[1600px] flex-1 scroll-mt-28 px-4 pt-7 pb-10 md:px-6 md:pt-9 md:pb-12 lg:px-8 lg:pt-10 lg:pb-14"
          >
            {children}
          </main>
        </div>
      </TourProvider>
    </ProductShell>
  );
}
