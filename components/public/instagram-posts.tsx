"use client";

import { instagramEmbedUrl, readInstagramEmbedHeight } from "@/lib/instagram";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Copy = Dictionary["public"]["instagram"];

export default function InstagramPosts({
  posts,
  linkId,
  translations: t,
}: {
  posts: string[];
  linkId: string;
  translations: Copy;
}) {
  const [selected, setSelected] = useState(0);
  const index = Math.min(selected, posts.length - 1);
  const embed = instagramEmbedUrl(posts[index] || "");
  if (!embed) return null;

  return (
    <section
      aria-label={t.title}
      className="overflow-hidden rounded-2xl border border-white/15 bg-white/5"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-white/80">
        <p className="text-sm font-medium">{t.title}</p>
        {posts.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={t.previous}
              disabled={index === 0}
              onClick={() => setSelected(index - 1)}
              className="grid size-11 place-items-center rounded-full border border-white/15 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white disabled:opacity-30"
            >
              <ChevronLeft aria-hidden className="size-4" />
            </button>
            <span
              aria-live="polite"
              className="min-w-10 text-center text-xs tabular-nums"
            >
              {index + 1} / {posts.length}
            </span>
            <button
              type="button"
              aria-label={t.next}
              disabled={index === posts.length - 1}
              onClick={() => setSelected(index + 1)}
              className="grid size-11 place-items-center rounded-full border border-white/15 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white disabled:opacity-30"
            >
              <ChevronRight aria-hidden className="size-4" />
            </button>
          </div>
        )}
      </div>
      <InstagramEmbed
        key={embed}
        src={embed}
        title={`${t.post} ${index + 1}`}
      />
      <a
        href={`/api/click/${linkId}?post=${index}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-12 items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
      >
        {t.open}
        <ExternalLink aria-hidden className="size-4" />
      </a>
    </section>
  );
}

function InstagramEmbed({ src, title }: { src: string; title: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(640);
  useEffect(() => {
    function resize(event: MessageEvent) {
      if (
        event.origin !== "https://www.instagram.com" ||
        event.source !== frame.current?.contentWindow
      )
        return;
      const measured = readInstagramEmbedHeight(event.data);
      if (measured !== null) setHeight(measured);
    }
    window.addEventListener("message", resize);
    return () => window.removeEventListener("message", resize);
  }, []);
  return (
    <iframe
      ref={frame}
      src={src}
      title={title}
      height={height}
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
      allow="encrypted-media; fullscreen"
      className="block w-full border-0 bg-white"
    />
  );
}
