"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getLocalePrefix } from "@/lib/i18n/paths";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GatreeLogo } from "./logo";
import { ProductNavigation } from "./product-navigation";

interface SidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  translations: {
    nav: Dictionary["nav"];
    auth: { logout: string; logoutAccount: string };
  };
}

export function Sidebar({ user, translations }: SidebarProps) {
  const prefix = getLocalePrefix(usePathname());
  return (
    <aside className="fixed inset-y-4 left-4 z-30 hidden w-[240px] flex-col rounded-[28px] border border-hairline bg-surface-1 lg:flex">
      <div className="flex h-20 shrink-0 items-center px-6">
        <Link
          href={`${prefix}/dashboard`}
          className="inline-flex items-center gap-2.5 text-[26px] font-semibold tracking-[-.055em] [&>svg]:text-primary"
        >
          <GatreeLogo size="lg" />
          <span>Gatree</span>
        </Link>
      </div>
      <ProductNavigation labels={translations.nav} />
      <div className="mx-4 mt-auto border-t border-hairline py-4">
        <Link
          href={`${prefix}/settings`}
          className="flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-surface-2 [&_strong]:block [&_strong]:text-sm [&_strong]:font-medium [&_p]:truncate [&_p]:text-xs [&_p]:text-ink-subtle"
        >
          {user.image ? (
            <Image
              src={user.image}
              alt=""
              width={36}
              height={36}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-3 object-cover text-ink-muted"
            />
          ) : (
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-3 object-cover text-ink-muted">
              {user.name?.[0]?.toUpperCase() || "G"}
            </span>
          )}
          <div className="min-w-0">
            <strong className="truncate">{user.name}</strong>
            <p>{translations.nav.settings}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
