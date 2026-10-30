import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { generateLocaleMetadata } from "@/lib/i18n/metadata";
import { notFound, redirect } from "next/navigation";
import { EditorClient } from "./client";

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { lang, slug } = await params;
  const dict = await getDictionary(lang as Locale);

  return generateLocaleMetadata(lang as Locale, `/editor/${slug}`, {
    title: dict.editor.title,
    description: dict.editor.title,
  });
}

export default async function EditorPage({ params }: Props) {
  const { lang, slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tree = await db.tree.findUnique({
    where: { slug },
    select: { id: true, userId: true, slug: true },
  });

  if (!tree) notFound();
  if (tree.userId !== session.user.id) redirect("/dashboard");

  const dict = await getDictionary(lang as Locale);

  return (
    <EditorClient
      slug={slug}
      translations={{
        editor: dict.editor,
        common: dict.common,
        errors: dict.errors,
        toasts: dict.toasts,
        appearance: dict.appearance,
        nav: dict.nav,
        dialogs: dict.dialogs,
      }}
    />
  );
}
