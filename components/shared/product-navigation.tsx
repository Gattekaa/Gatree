"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getLocalePrefix, stripLocale } from "@/lib/i18n/paths";
import {
  BarChart3,
  ExternalLink,
  LayoutDashboard,
  Link2,
  Pencil,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ProductNavigation({
  labels,
  onNavigate,
}: {
  labels: Dictionary["nav"];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const path = stripLocale(pathname);
  const prefix = getLocalePrefix(pathname);
  const treeMatch = path.match(/^\/(editor|analytics)\/([^/]+)/);
  const slug = treeMatch?.[2];
  const destinations = [
    { href: "/dashboard", label: labels.dashboard, icon: LayoutDashboard },
    { href: "/shortener", label: labels.shortener, icon: Link2 },
    { href: "/settings", label: labels.settings, icon: Settings },
  ];

  return (
    <nav
      className="flex-1 overflow-y-auto px-4 py-3"
      aria-label={labels.menu}
    >
      <div className="grid gap-1.5">
        {destinations.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={`${prefix}${href}`}
              onClick={onNavigate}
              className="flex min-h-12 items-center gap-3 rounded-full px-3.5 py-[11px] text-sm font-medium text-ink-subtle transition-colors duration-150 hover:bg-surface-2 hover:text-ink aria-[current=page]:bg-product-accent aria-[current=page]:text-on-primary aria-[current=page]:font-semibold"
              aria-current={active ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
      {slug && (
        <div className="mt-6 border-t border-hairline pt-6 [&>p]:px-3.5 [&>p]:text-xs [&>p]:text-ink-tertiary">
          <p>{labels.activeTree}</p>
          <span className="block px-3.5 pt-2 pb-3.5 font-mono text-xs text-ink-muted [overflow-wrap:anywhere]">
            /{slug}
          </span>
          {[
            { href: `/editor/${slug}`, label: labels.editor, icon: Pencil },
            {
              href: `/analytics/${slug}`,
              label: labels.analytics,
              icon: BarChart3,
            },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={`${prefix}${href}`}
              onClick={onNavigate}
              className="flex min-h-12 items-center gap-3 rounded-full px-3.5 py-[11px] text-sm font-medium text-ink-subtle transition-colors duration-150 hover:bg-surface-2 hover:text-ink aria-[current=page]:bg-product-accent aria-[current=page]:text-on-primary aria-[current=page]:font-semibold"
              aria-current={path === href ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
          <Link
            href={`${prefix}/${slug}`}
            target="_blank"
            rel="noopener"
            className="flex min-h-12 items-center gap-3 rounded-full px-3.5 py-[11px] text-sm font-medium text-ink-subtle transition-colors duration-150 hover:bg-surface-2 hover:text-ink aria-[current=page]:bg-product-accent aria-[current=page]:text-on-primary aria-[current=page]:font-semibold"
            onClick={onNavigate}
          >
            <ExternalLink size={18} strokeWidth={1.7} aria-hidden="true" />
            <span>{labels.viewPage}</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
