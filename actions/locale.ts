"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { LOCALE_COOKIE_MAX_AGE, LOCALE_COOKIE_NAME, isValidLocale } from "@/lib/i18n/config";
import { cookies } from "next/headers";

export async function updateUserLocale(locale: string) {
  if (!isValidLocale(locale)) {
    return { error: "errors.invalidLocale" };
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });

  const session = await auth();
  if (session?.user?.id) {
    await db.user.update({
      where: { id: session.user.id },
      data: { locale },
    });
  }

  return { success: true };
}
