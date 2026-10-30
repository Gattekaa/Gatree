import { DEFAULT_LOCALE, isValidLocale } from "./config";

export function getLocalePrefix(pathname: string): string {
  const locale = pathname.split("/")[1];
  return isValidLocale(locale) && locale !== DEFAULT_LOCALE ? `/${locale}` : "";
}

export function stripLocale(pathname: string): string {
  const locale = pathname.split("/")[1];
  return isValidLocale(locale)
    ? pathname.slice(locale.length + 1) || "/"
    : pathname;
}
