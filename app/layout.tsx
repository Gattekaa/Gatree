import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GeistMono } from "geist/font/mono";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  preload: false,
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#010102",
};

export const metadata: Metadata = {
  title: {
    default: "Gatree — Sua árvore de links profissional",
    template: "%s | Gatree",
  },
  description:
    "Crie e compartilhe árvores de links com analytics poderoso. Editor intuitivo, customização total e insights para crescer sua audiência.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    type: "website",
    siteName: "Gatree",
    title: "Gatree — Sua árvore de links profissional",
    description:
      "Crie e compartilhe árvores de links com analytics poderoso.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const lang = headersList.get("x-locale") || "pt-BR";

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${inter.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-dvh bg-canvas text-ink antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          themes={["dark", "light"]}
          disableTransitionOnChange
        >
          <QueryProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </QueryProvider>
          <Toaster
            position="bottom-right"
            gap={8}
            toastOptions={{
              unstyled: true,
              classNames: {
                toast:
                  "flex items-center gap-3 border-2 border-hairline-strong bg-surface-1 px-4 py-3 text-[13px] text-ink shadow-[3px_3px_0px_var(--color-hairline-strong)] w-full product:rounded-2xl product:border product:font-sans product:shadow-[0_12px_40px_#00000015]",
                title: "text-ink font-medium",
                description: "text-ink-subtle text-[12px]",
                success: "border-success shadow-[3px_3px_0px_var(--color-success)] product:border-success/30 product:shadow-none",
                error: "border-error shadow-[3px_3px_0px_var(--color-error)] product:border-error/30 product:shadow-none",
                icon: "text-ink-subtle",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
