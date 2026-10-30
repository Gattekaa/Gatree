import { PublicTree } from "@/components/public/public-tree";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { generateLocaleMetadata } from "@/lib/i18n/metadata";
import { trackPageView } from "@/lib/tracking";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string; lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;

  const dict = await getDictionary(lang as Locale);

  const tree = await db.tree.findUnique({
    where: { slug },
    select: {
      title: true,
      description: true,
      avatar: true,
      seoTitle: true,
      seoDescription: true,
      status: true,
    },
  });

  if (!tree || tree.status === "INACTIVE") {
    return { title: dict.public.notFound };
  }

  const title = tree.seoTitle || tree.title;
  const description =
    tree.seoDescription || tree.description || `${tree.title} | Gatree`;

  const localeMetadata = generateLocaleMetadata(lang as Locale, `/${slug}`, {
    title,
    description,
  });

  return {
    title,
    description,
    alternates: localeMetadata.alternates,
    openGraph: {
      title,
      description,
      type: "website",
      locale: localeMetadata.openGraph?.locale as string,
      ...(tree.avatar && { images: [{ url: tree.avatar }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(tree.avatar && { images: [tree.avatar] }),
    },
  };
}

export default async function PublicTreePage({ params, searchParams }: Props) {
  const { slug, lang } = await params;
  const query = await searchParams;

  const dict = await getDictionary(lang as Locale);

  const tree = await db.tree.findUnique({
    where: { slug },
    include: {
      links: {
        where: {
          enabled: true,
          OR: [
            { scheduledStart: null },
            { scheduledStart: { lte: new Date() } },
          ],
          AND: [
            {
              OR: [
                { scheduledEnd: null },
                { scheduledEnd: { gt: new Date() } },
              ],
            },
          ],
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!tree) {
    notFound();
  }

  if (tree.status === "INACTIVE") {
    const session = await auth();
    const isOwner = session?.user?.id === tree.userId;

    if (!isOwner) {
      notFound();
    }
  }

  const headersList = await headers();
  const fetchDest = headersList.get("sec-fetch-dest");
  const isPreview = fetchDest === "iframe";

  if (!isPreview) {
    const utmSource = typeof query.utm_source === "string" ? query.utm_source : undefined;

    if (tree.status === "ACTIVE") {
      trackPageView(tree.id, headersList, { utm_source: utmSource }).catch(() => {});
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: tree.title,
    description: tree.description || `${tree.title} | Gatree`,
    url: `${appUrl}/${slug}`,
    ...(tree.avatar && { image: tree.avatar }),
    mainEntity: {
      "@type": "Person",
      name: tree.title,
      url: `${appUrl}/${slug}`,
    },
  };

  return (
    <>
      <script
        nonce={headersList.get("x-nonce") || undefined}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PublicTree tree={tree} translations={dict.public} />
    </>
  );
}
