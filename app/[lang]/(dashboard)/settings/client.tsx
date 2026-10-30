"use client";

import {
  getActiveSessions,
  revokeAllOtherSessions,
  revokeSession,
  type SessionInfo,
} from "@/actions/session";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import {
  Globe,
  Loader2,
  LogOut,
  Monitor,
  Moon,
  Shield,
  Smartphone,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

interface SettingsClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  translations: Dictionary["settings"];
  authTranslations: Dictionary["auth"];
  commonTranslations: Dictionary["common"];
  currentLocale: string;
}

export function SettingsClient({
  user,
  translations,
  authTranslations,
  commonTranslations,
  currentLocale,
}: SettingsClientProps) {
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const {
    data: sessionsData,
    isLoading: loadingSessions,
    isError: sessionsError,
    refetch: refetchSessions,
  } = useQuery<SessionInfo[]>({
    queryKey: ["active-sessions"],
    queryFn: async () => {
      const data = await getActiveSessions();
      if (data && "error" in data) throw new Error("Failed to load sessions");
      return data;
    },
  });

  const sessions = sessionsData ?? [];

  async function handleRevoke(sessionId: string) {
    setRevokingId(sessionId);
    const result = await revokeSession(sessionId);
    if (result && "error" in result) {
      toast.error(translations.sessionEndError);
    } else {
      void refetchSessions();
      toast.success(translations.sessionEnded);
    }
    setRevokingId(null);
  }

  async function handleRevokeAll() {
    setRevokingAll(true);
    const result = await revokeAllOtherSessions();
    if (result && "error" in result) {
      toast.error(translations.allSessionsEndError);
    } else {
      void refetchSessions();
      toast.success(translations.allSessionsEnded);
    }
    setRevokingAll(false);
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-8">
      <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end md:gap-6">
        <div>
          <h1 className="text-ink font-sans text-[30px] leading-[1.15] font-semibold tracking-[-.045em] md:text-[40px]">
            {translations.title}
          </h1>
          <p className="text-ink-subtle mt-3 max-w-[60ch] text-sm leading-relaxed">
            {translations.subtitle}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 content-start gap-6">
          <section className="border-hairline bg-surface-1 min-w-0 rounded-3xl border p-5 sm:p-7">
            <h2 className="flex items-center gap-2 text-base font-semibold tracking-[-.02em]">
              <UserRound
                size={18}
                className="text-primary"
                aria-hidden="true"
              />
              {translations.profile}
            </h2>
            <div className="mt-5 flex items-center gap-4">
              {user.image ? (
                <Image
                  src={user.image}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                />
              ) : (
                <span className="bg-surface-2 text-ink grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-xl font-semibold">
                  {user.name?.[0]?.toUpperCase() || "G"}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-ink font-medium">{user.name}</p>
                <p className="text-ink-subtle text-sm leading-[1.5] break-all">
                  {user.email}
                </p>
                <p className="text-ink-tertiary mt-2 text-xs leading-[1.5] tracking-normal">
                  {authTranslations.authenticatedViaOAuth}
                </p>
              </div>
            </div>
          </section>
          <section className="border-hairline bg-surface-1 min-w-0 rounded-3xl border p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-base font-semibold tracking-[-.02em]">
                <Shield size={18} className="text-primary" aria-hidden="true" />
                {translations.activeSessions}
              </h2>
              {sessions.length > 1 && (
                <button
                  onClick={handleRevokeAll}
                  disabled={revokingAll}
                  className="border-error/25 text-error hover:bg-error/10 inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium leading-[1.5] transition-colors disabled:cursor-wait disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
                >
                  {revokingAll ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} aria-hidden="true" />
                  )}
                  {translations.endOtherSessions}
                </button>
              )}
            </div>
            <div className="mt-5 space-y-3">
              {loadingSessions ? (
                <div
                  className="space-y-3"
                  role="status"
                  aria-label={translations.loadingSessions}
                >
                  <div className="bg-surface-2 h-16 animate-pulse rounded-2xl" />
                  <div className="bg-surface-2 h-16 animate-pulse rounded-2xl" />
                </div>
              ) : sessionsError ? (
                <div className="py-3" role="alert">
                  <p className="text-ink-subtle text-sm leading-[1.5]">
                    {translations.sessionLoadError}
                  </p>
                  <button
                    onClick={() => refetchSessions()}
                    className="text-ink hover:bg-surface-2 mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline px-4 text-sm font-medium transition-colors"
                  >
                    <RefreshCw size={15} />
                    {commonTranslations.retry}
                  </button>
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-ink-subtle py-4 text-sm leading-[1.5]">
                  {translations.noActiveSessions}
                </p>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s.id}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-4 ${s.isCurrent ? "border-primary/30 bg-product-accent/5" : "border-hairline-strong bg-surface-2"}`}
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="bg-surface-3 text-ink-subtle mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl">
                        {s.device?.toLowerCase().includes("mobile") ||
                        s.device?.toLowerCase().includes("iphone") ? (
                          <Smartphone size={17} aria-hidden="true" />
                        ) : (
                          <Monitor size={17} aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-ink text-sm leading-[1.5] font-semibold">
                            {s.device || translations.unknownDevice}
                          </p>
                          {s.isCurrent && (
                            <span className="bg-product-accent/10 text-primary rounded-full px-2.5 py-0.5 text-xs leading-[1.5] tracking-normal">
                              {translations.thisSession}
                            </span>
                          )}
                        </div>
                        <p className="text-ink-tertiary mt-1 text-xs leading-[1.5] tracking-normal">
                          {commonTranslations.active}{" "}
                          {formatDistanceToNow(new Date(s.lastActive), {
                            addSuffix: true,
                            locale: currentLocale === "en" ? enUS : ptBR,
                          })}
                          {s.ip && ` · ${s.ip}`}
                        </p>
                      </div>
                    </div>
                    {!s.isCurrent && (
                      <button
                        onClick={() => handleRevoke(s.id)}
                        disabled={revokingId === s.id}
                        aria-label={`${commonTranslations.delete}: ${s.device || translations.unknownDevice}`}
                        className="border-hairline text-ink-subtle hover:border-error/30 hover:bg-error/5 hover:text-error grid size-11 shrink-0 place-items-center rounded-full border transition-colors disabled:cursor-wait disabled:opacity-50"
                      >
                        {revokingId === s.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} aria-hidden="true" />
                        )}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
        <div className="grid min-w-0 content-start gap-6">
          <section
            data-tour="settings-preferences"
            className="border-hairline bg-surface-1 min-w-0 rounded-3xl border p-5 sm:p-7"
          >
            <h2 className="flex items-center gap-2 text-base font-semibold tracking-[-.02em]">
              <SlidersHorizontal
                size={18}
                className="text-primary"
                aria-hidden="true"
              />
              {translations.preferences}
            </h2>
            <div className="divide-hairline mt-5 divide-y">
              <div className="flex flex-wrap items-start justify-between gap-4 py-5 first:pt-0">
                <div className="flex min-w-[190px] flex-1 items-start gap-3">
                  <Moon
                    size={17}
                    className="text-ink-tertiary mt-1 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-ink text-sm leading-[1.5] font-semibold">
                      {translations.theme}
                    </p>
                    <p className="text-ink-tertiary mt-1 text-xs leading-[1.5] tracking-normal">
                      {translations.themeToggle}
                    </p>
                  </div>
                </div>
                <ThemeToggle label={translations.themeToggle} />
              </div>
              <div className="flex flex-wrap items-start justify-between gap-4 py-5 last:pb-0">
                <div className="flex min-w-[190px] flex-1 items-start gap-3">
                  <Globe
                    size={17}
                    className="text-ink-tertiary mt-1 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-ink text-sm leading-[1.5] font-semibold">
                      {translations.language}
                    </p>
                    <p className="text-ink-tertiary mt-1 text-xs leading-[1.5] tracking-normal">
                      {translations.languageDescription}
                    </p>
                  </div>
                </div>
                <LanguageSwitcher
                  currentLocale={currentLocale}
                  labels={{ portuguese: "Português", english: "English" }}
                />
              </div>
            </div>
          </section>
          <section className="border-hairline bg-surface-1 min-w-0 rounded-3xl border p-5 sm:p-7">
            <h2 className="flex items-center gap-2 text-base font-semibold tracking-[-.02em]">
              <LogOut size={18} className="text-primary" aria-hidden="true" />
              {translations.account}
            </h2>
            <button
              onClick={() =>
                signOut({ callbackUrl: currentLocale === "en" ? "/en" : "/" })
              }
              className="border-hairline text-ink-subtle hover:border-error/30 hover:bg-error/5 hover:text-error mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors"
            >
              <LogOut size={16} aria-hidden="true" />
              {authTranslations.logoutAccount}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
