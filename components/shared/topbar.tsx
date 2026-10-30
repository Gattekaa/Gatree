"use client";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useProductTour } from "@/components/onboarding/tour-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getLocalePrefix, stripLocale } from "@/lib/i18n/paths";
import {
  ChevronDown,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Settings,
  Pencil,
  BarChart3,
  CircleHelp,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GatreeLogo } from "./logo";
import { ProductNavigation } from "./product-navigation";

interface TopbarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  translations: {
    nav: Dictionary["nav"];
    auth: { logout: string; logoutAccount: string };
    theme: string;
    close: string;
    tour: string;
  };
}

export function Topbar({ user, translations }: TopbarProps) {
  const pathname = usePathname();
  const path = stripLocale(pathname);
  const prefix = getLocalePrefix(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const { startTour } = useProductTour();
  const { nav, auth } = translations;
  const breadcrumb = path.startsWith("/editor/")
    ? { label: nav.editor, icon: Pencil }
    : path.startsWith("/analytics/")
      ? { label: nav.analytics, icon: BarChart3 }
      : path.startsWith("/shortener")
        ? { label: nav.shortener, icon: Link2 }
        : path === "/settings"
          ? { label: nav.settings, icon: Settings }
          : { label: nav.dashboard, icon: LayoutDashboard };
  const BreadcrumbIcon = breadcrumb.icon;

  return (
    <header className="sticky top-3 z-20 mx-4 mt-3 flex h-16 min-h-16 items-center justify-between gap-4 rounded-full border border-hairline bg-surface-1/95 px-3 backdrop-blur-xl md:mx-6 lg:top-4 lg:mx-8 lg:mt-4 lg:px-5 max-[374px]:gap-2">
      <div className="flex items-center gap-3 lg:gap-3.5">
        <div className="lg:hidden">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-full border-0 bg-surface-2"
                aria-label={nav.menu}
              >
                <Menu size={20} strokeWidth={1.7} aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="min-h-dvh bg-canvas text-ink font-sans text-sm leading-[1.55] w-[min(320px,calc(100vw-32px))] p-0 flex flex-col"
              closeLabel={translations.close}
            >
              <SheetHeader>
                <SheetTitle>
                  <span className="inline-flex items-center gap-2 text-[22px] font-semibold tracking-[-.055em] [&>svg]:text-primary">
                    <GatreeLogo size="lg" />
                    Gatree
                  </span>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  {nav.menu}
                </SheetDescription>
              </SheetHeader>
              <ProductNavigation
                labels={nav}
                onNavigate={() => setMenuOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
        <span className="inline-flex items-center gap-2 font-semibold tracking-[-.055em] [&>svg]:text-primary text-[19px] max-[374px]:gap-[3px] max-[374px]:text-[17px] lg:hidden">
          <GatreeLogo size="md" />
          Gatree
        </span>
        <div className="hidden items-center gap-2.5 text-sm text-ink-subtle lg:flex [&>svg]:text-ink-tertiary">
          <BreadcrumbIcon size={16} strokeWidth={1.7} aria-hidden="true" />
          <span>{breadcrumb.label}</span>
        </div>
      </div>
      <div className="flex items-center gap-3.5 max-[374px]:gap-2">
        <ThemeToggle label={translations.theme} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex min-h-11 min-w-11 items-center justify-center gap-2.5 rounded-full p-1 hover:bg-surface-2"
              aria-label={user.name || nav.settings}
              data-tour-launcher
            >
              {user.image ? (
                <Image
                  src={user.image}
                  alt=""
                  width={32}
                  height={32}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-3 object-cover text-ink-muted"
                />
              ) : (
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-3 object-cover text-ink-muted">
                  {user.name?.[0]?.toUpperCase() || "G"}
                </span>
              )}
              <ChevronDown
                size={13}
                className="hidden lg:block text-ink-tertiary"
                aria-hidden="true"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="px-3 py-3">
              <p className="font-medium text-ink text-sm leading-[1.5]">
                {user.name}
              </p>
              <p className="text-ink-subtle text-xs tracking-normal leading-[1.5]">
                {user.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={startTour}>
              <CircleHelp size={16} />
              {translations.tour}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: `${prefix}/` })}
            >
              <LogOut size={16} />
              {auth.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
