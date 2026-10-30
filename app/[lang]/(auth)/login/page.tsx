import { GatreeLogo } from "@/components/shared/logo";
import { signIn } from "@/lib/auth";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { generateLocaleMetadata } from "@/lib/i18n/metadata";
import { BarChart3, Link2, Paintbrush } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return generateLocaleMetadata(lang as Locale, "/login", {
    title: dict.auth.welcome,
    description: dict.auth.welcomeSubtitle,
  });
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { lang } = await params;
  const { error } = await searchParams;
  const dict = await getDictionary(lang as Locale);
  const t = dict.auth;

  const benefits = [
    { Icon: Paintbrush, label: dict.marketing.features.themes },
    { Icon: BarChart3, label: dict.marketing.features.analytics },
    { Icon: Link2, label: dict.marketing.features.editor },
  ];

  return (
    <div className="grid w-full max-w-[1080px] items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-20">
      <div className="hidden lg:block">
        <p className="max-w-[12ch] text-balance text-[clamp(40px,4.5vw,64px)] font-semibold leading-[1.04] tracking-[-.06em]">
          <span className="block">{dict.marketing.campaign.hero.line1}</span>
          <span className="block text-primary">
            {dict.marketing.campaign.hero.line2}
          </span>
        </p>
        <p className="mt-6 max-w-[44ch] text-base leading-[1.75] text-ink-subtle">
          {dict.marketing.campaign.hero.subtitle}
        </p>
        <ul className="mt-9 space-y-4">
          {benefits.map(({ Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 text-sm font-medium text-ink-muted"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-product-accent/10 text-primary">
                <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>
      <div className="mx-auto w-full max-w-[440px] rounded-3xl border border-hairline bg-surface-1 p-6 sm:p-9 lg:p-10">
        <div className="mb-8">
          <div className="mb-6 grid size-12 place-items-center rounded-2xl bg-product-accent/10 text-primary">
            <GatreeLogo size="lg" />
          </div>
          <h1 className="text-balance text-[30px] font-semibold leading-[1.15] tracking-[-.045em] sm:text-[34px]">
            {t.welcome}
          </h1>
          <p className="mt-3 text-sm leading-[1.7] text-ink-subtle">
            {t.welcomeSubtitle}
          </p>
        </div>
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-error/25 bg-error/5 px-4 py-3"
          >
            <p className="text-sm leading-relaxed text-error">
              {t.loginError ||
                "Não foi possível completar o login. Tente novamente."}
            </p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-hairline-strong bg-canvas px-5 py-3.5 text-sm font-semibold text-ink transition-colors duration-200 hover:border-primary/40 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <GoogleIcon />
              {t.continueWithGoogle}
            </button>
          </form>}
          {process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-hairline-strong bg-canvas px-5 py-3.5 text-sm font-semibold text-ink transition-colors duration-200 hover:border-primary/40 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <GitHubIcon />
              {t.continueWithGithub}
            </button>
          </form>}
        </div>
        <p className="mt-7 border-t border-hairline pt-6 text-xs leading-[1.75] text-ink-tertiary">
          {t.termsNotice}{" "}
          <span className="text-ink-subtle">{t.termsOfUse}</span> {t.and}{" "}
          <span className="text-ink-subtle">{t.privacyPolicy}</span>.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
