import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import TanstackProvider from "@/providers/TanstackProvider";
import UserProvider from "@/context/UserContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(`${process.env.FRONTEND_BASE_URL} `),
  title: "Gatree - Create and share trees of links",
  description: `Gatree is a platform to create and share trees of links.You can create a tree of links for your social media, your portfolio, your company, your project, or anything you want.And the best part is that it's free!`,
  robots: "index, follow",
  publisher: "Gattree",
  authors: [
    {
      name: "Vinicius Gabriel",
      url: "https://www.viniciusgabriel.tech/"
    }
  ],
  openGraph: {
    type: "website",
    url: process.env.FRONTEND_BASE_URL,
    title: "Gatree - Create and share trees of links",
    description: `Gatree is a platform to create and share trees of links. You can create a tree of links for your social media, your portfolio, your company, your project, or anything you want. And the best part is that it's free!`,
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Gatree Logo"
      },
    ],
  },
  twitter: {
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Gatree Logo"
      },
    ]
  },
  icons: [
    {
      rel: "icon",
      url: "/logo.png",
      type: "image/png",
      sizes: "any",
    }
  ],
  applicationName: "Gattree",
  appleWebApp: {
    statusBarStyle: "black",
    title: "Gatree - Create and share trees of links",
    startupImage: "/logo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html suppressHydrationWarning lang="en">
      <body className={`${inter.className} w-full h-[100dvh] md:h-screen`}>
        <TanstackProvider>
          <UserProvider>
            <ThemeProvider
              themes={['light', 'dark', 'system']}
              attribute="class"
              storageKey="theme"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </UserProvider>
        </TanstackProvider>
      </body>
    </html>
  );
}
