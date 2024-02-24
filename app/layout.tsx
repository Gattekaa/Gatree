import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import TanstackProvider from "@/providers/TanstackProvider";
import UserProvider from "@/context/UserContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Unnamed Project",
  description: "Create your trees and manage them with ease!",
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
