"use client";

import { getInstagramDisplay } from "@/lib/instagram";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getLinkButtonStyle } from "@/lib/link-style";
import { getIconComponent } from "@/lib/icons";
import type { LinkStyleConfig } from "@/types";
import type { Link } from "@prisma/client";
import dynamic from "next/dynamic";
import { createElement } from "react";

const PublicMapLazy = dynamic(
  () => import("./public-map").then((m) => m.PublicMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-45 items-center justify-center rounded-xl border border-white/6 bg-white/2">
        <p className="text-[13px] text-white/50">Carregando mapa...</p>
      </div>
    ),
  }
);

const InstagramPosts = dynamic(() => import("./instagram-posts"));

interface PublicLinkProps {
  instagramTranslations?: Dictionary["public"]["instagram"];
  link: Link;
  treeId: string;
  defaultStyle: LinkStyleConfig;
  radius: string;
}

export function PublicLink({ link, treeId, defaultStyle, radius, instagramTranslations }: PublicLinkProps) {
  const content = (() => {
    switch (link.type) {
    case "HEADER":
      return (
        <div className="pb-1 pt-4">
          <p className="text-center text-[12px] font-semibold uppercase tracking-wider text-white/50">
            {link.label}
          </p>
        </div>
      );

    case "TEXT":
      return (
        <div className="px-2 py-2">
          <p className="text-center text-[14px] leading-relaxed text-white/70">
            {link.label}
          </p>
        </div>
      );

    case "YOUTUBE":
      return <YoutubeEmbed link={link} />;

    case "SPOTIFY":
      return <SpotifyEmbed link={link} />;

    case "SOUNDCLOUD":
      return <SoundCloudEmbed link={link} />;

    case "IMAGE":
      return <ImageBlock link={link} />;

    case "MAP":
      return <MapBlock link={link} />;

    case "EMAIL":
      return <ContactLink link={link} href={`mailto:${link.url}`} defaultStyle={defaultStyle} radius={radius} treeId={treeId} />;

    case "PHONE":
      return <ContactLink link={link} href={`tel:${link.url}`} defaultStyle={defaultStyle} radius={radius} treeId={treeId} />;

    case "WHATSAPP": {
      const phone = link.url.replace(/\D/g, "");
      return <ContactLink link={link} href={`https://wa.me/${phone}`} defaultStyle={defaultStyle} radius={radius} treeId={treeId} />;
    }

    case "LINK": {
      const display = link.icon === "instagram" ? getInstagramDisplay(link.instagramConfig) : null;
      if (display && instagramTranslations) return <div className="space-y-3"><StandardLink link={link} treeId={treeId} defaultStyle={defaultStyle} radius={radius} /><InstagramPosts posts={display.posts} linkId={link.id} translations={instagramTranslations} /></div>;
      return <StandardLink link={link} treeId={treeId} defaultStyle={defaultStyle} radius={radius} />;
    }
    default:
      return <StandardLink link={link} treeId={treeId} defaultStyle={defaultStyle} radius={radius} />;
  }
  })();

  return content;
}

function StandardLink({
  link,
  treeId,
  defaultStyle,
  radius,
}: {
  link: Link;
  treeId: string;
  defaultStyle: LinkStyleConfig;
  radius: string;
}) {
  const iconComponent = getIconComponent(link.icon);
  const hasThumbnail = !!link.thumbnail;

  const linkStyle = getLinkButtonStyle(link, defaultStyle, radius);

  return (
    <a
      href={`/api/click/${link.id}?tree=${treeId}`}
      className={`flex min-h-12 items-center ${hasThumbnail ? "justify-start" : "justify-center"} gap-3 px-6 py-3 text-center text-[14px] font-semibold transition-opacity hover:opacity-80 active:scale-[0.98]`}
      style={linkStyle}
    >
      {}
      {hasThumbnail && <img src={link.thumbnail!} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />}
      {iconComponent && createElement(iconComponent, { className: "h-5 w-5 shrink-0" })}
      <span className={hasThumbnail ? "flex-1 text-center" : ""}>{link.label}</span>
    </a>
  );
}

function ContactLink({
  link,
  href,
  defaultStyle,
  radius,
}: {
  link: Link;
  href: string;
  treeId: string;
  defaultStyle: LinkStyleConfig;
  radius: string;
}) {
  const iconComponent = getIconComponent(link.icon);
  const hasThumbnail = !!link.thumbnail;

  const linkStyle = getLinkButtonStyle(link, defaultStyle, radius);

  return (
    <a
      href={href}
      className={`flex min-h-12 items-center ${hasThumbnail ? "justify-start" : "justify-center"} gap-3 px-6 py-3 text-center text-[14px] font-semibold transition-opacity hover:opacity-80 active:scale-[0.98]`}
      style={linkStyle}
    >
      {}
      {hasThumbnail && <img src={link.thumbnail!} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />}
      {iconComponent && createElement(iconComponent, { className: "h-5 w-5 shrink-0" })}
      <span className={hasThumbnail ? "flex-1 text-center" : ""}>{link.label}</span>
    </a>
  );
}

function YoutubeEmbed({ link }: { link: Link }) {
  const videoId = extractYouTubeId(link.url);

  if (!videoId) {
    return (
      <a href={link.url} target="_blank" rel="noopener" className="block rounded-xl bg-white/5 p-4 text-center text-[13px] text-white/50">
        {link.label || "YouTube"}
      </a>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/6 bg-white/2">
      <div className="relative aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={link.label || "YouTube"}
        />
      </div>
      {link.label && (
        <div className="px-4 py-3">
          <p className="text-[14px] font-medium text-white/80">{link.label}</p>
        </div>
      )}
    </div>
  );
}

function SpotifyEmbed({ link }: { link: Link }) {
  const embedUrl = getSpotifyEmbedUrl(link.url);

  if (!embedUrl) {
    return (
      <a href={link.url} target="_blank" rel="noopener" className="block rounded-xl bg-[#1db954]/10 p-4 text-center text-[13px] text-[#1db954]">
        🎵 {link.label || "Spotify"}
      </a>
    );
  }

  const isTrack = link.url.includes("/track/");
  const height = isTrack ? "152" : "352";

  return (
    <div className="overflow-hidden rounded-xl">
      <iframe
        src={embedUrl}
        width="100%"
        height={height}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="block"
        title={link.label || "Spotify"}
      />
    </div>
  );
}

function SoundCloudEmbed({ link }: { link: Link }) {
  return (
    <div>
      {link.label && (
        <p className="mb-2 text-[13px] font-medium text-white/70">{link.label}</p>
      )}
      <iframe
        width="100%"
        height="166"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(link.url)}&color=%235e6ad2&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
        className="block rounded-xl"
        title={link.label || "SoundCloud"}
      />
    </div>
  );
}

function ImageBlock({ link }: { link: Link }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/6 bg-white/2">
      {}
      <img
        src={link.url}
        alt={link.label || "Imagem"}
        className="w-full object-cover"
        loading="lazy"
      />
      {link.label && (
        <div className="px-4 py-3">
          <p className="text-[14px] font-medium text-white/80">{link.label}</p>
        </div>
      )}
    </div>
  );
}

function MapBlock({ link }: { link: Link }) {
  return <PublicMapLazy url={link.url} label={link.label || undefined} />;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getSpotifyEmbedUrl(url: string): string | null {

  const match = url.match(/open\.spotify\.com\/(track|album|playlist|artist|episode|show)\/([a-zA-Z0-9]+)/);
  if (match) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}?theme=0`;
  }
  return null;
}
