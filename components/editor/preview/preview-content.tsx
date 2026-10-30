"use client";

import { DEFAULT_LINK_STYLE, LINK_RADIUS_MAP } from "@/lib/constants";
import { getIconComponent } from "@/lib/icons";
import type { LinkStyleConfig } from "@/types";
import type { Link, Tree } from "@prisma/client";

interface PreviewContentProps {
  tree: Pick<Tree, "title" | "avatar" | "description" | "linkStyle">;
  links?: Link[];

  mockLinks?: string[];
  size?: "sm" | "md" | "lg";
  presentation?: "tree" | "marketing";
}

export function PreviewContent({
  tree,
  links,
  mockLinks,
  size = "md",
  presentation = "tree",
}: PreviewContentProps) {
  const isMarketing = presentation === "marketing";
  const linkStyle =
    (tree.linkStyle as LinkStyleConfig | null) || DEFAULT_LINK_STYLE;
  const radiusValue =
    LINK_RADIUS_MAP[linkStyle.radius] || LINK_RADIUS_MAP.rounded;
  const isOutlined = linkStyle.variant === "outlined";

  const activeLinks = links?.filter((l) => l.enabled);
  const displayLinks =
    activeLinks && activeLinks.length > 0 ? activeLinks : null;
  const fallbackLabels = mockLinks || ["Meu Portfolio", "Instagram", "Contato"];

  const sizes = {
    sm: {
      avatar: "h-10 w-10",
      avatarText: "text-[12px]",
      title: "text-[11px]",
      desc: "text-[9px]",
      link: "text-[9px] py-[6px]",
      gap: "gap-[5px]",
      mt: "mt-4",
      px: "px-4 pb-6 pt-10",
    },
    md: {
      avatar: "h-14 w-14",
      avatarText: "text-[16px]",
      title: "text-[14px]",
      desc: "text-[11px]",
      link: "text-[12px] py-2.5",
      gap: "gap-2.5",
      mt: "mt-6",
      px: "px-5 pb-8 pt-12",
    },
    lg: {
      avatar: "h-20 w-20",
      avatarText: "text-2xl",
      title: "text-[18px]",
      desc: "text-[13px]",
      link: "text-[14px] py-3.5",
      gap: "gap-3",
      mt: "mt-8",
      px: "px-8 pb-12 pt-10",
    },
  };

  const s = isMarketing
    ? {
        ...sizes.md,
        title: "text-[20px]",
        px: "px-[22px] pt-[25px] pb-[26px] max-lg:px-[18px]",
      }
    : sizes[size];

  return (
    <div className={`flex flex-col items-center ${s.px}`}>
      {tree.avatar ? (
        <img
          src={tree.avatar}
          alt={tree.title}
          className={`${s.avatar} rounded-full object-cover shadow-lg shadow-black/30 ring-[3px] ring-white/10`}
        />
      ) : (
        <div
          className={`${s.avatar} flex items-center justify-center rounded-full bg-linear-to-br from-white/15 to-white/5 shadow-lg shadow-black/30 ring-[3px] ring-white/10`}
        >
          <span className={`${s.avatarText} font-bold text-white/80`}>
            {tree.title?.[0]?.toUpperCase() || "G"}
          </span>
        </div>
      )}

      <h2
        className={`mt-3 text-center ${s.title} ${isMarketing ? "text-balance font-semibold leading-[1.2] tracking-[-.025em] text-[#f3f4ed]" : "font-bold text-white"}`}
      >
        {tree.title || "Sua Árvore"}
      </h2>

      {tree.description && (
        <p
          className={`mt-1 max-w-60 text-center leading-relaxed ${isMarketing ? "text-[#b5b8ab]" : "text-white/50"} ${s.desc}`}
        >
          {tree.description}
        </p>
      )}

      <div className={`${s.mt} flex w-full flex-col ${s.gap}`}>
        {displayLinks
          ? displayLinks.map((link) => {
              if (link.type === "HEADER") {
                return (
                  <p
                    key={link.id}
                    className="pb-0.5 pt-2 text-center text-[10px] font-semibold uppercase tracking-wider text-white/40"
                  >
                    {link.label}
                  </p>
                );
              }

              if (link.type === "TEXT") {
                return (
                  <p
                    key={link.id}
                    className={`text-center leading-relaxed text-white/60 ${s.desc}`}
                  >
                    {link.label}
                  </p>
                );
              }

              if (link.type === "YOUTUBE") {
                const videoId = link.url.match(
                  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
                )?.[1];
                if (videoId) {
                  return (
                    <div
                      key={link.id}
                      className="overflow-hidden rounded-lg border border-white/6 bg-white/2"
                    >
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
                        <div className="px-3 py-2">
                          <p className={`font-medium text-white/80 ${s.desc}`}>
                            {link.label}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }
              }

              if (link.type === "SPOTIFY") {
                const match = link.url.match(
                  /open\.spotify\.com\/(track|album|playlist|artist|episode|show)\/([a-zA-Z0-9]+)/,
                );
                if (match) {
                  const isTrack = match[1] === "track";
                  return (
                    <div
                      key={link.id}
                      className="overflow-hidden rounded-lg border border-white/6 bg-white/2"
                    >
                      <iframe
                        src={`https://open.spotify.com/embed/${match[1]}/${match[2]}?theme=0`}
                        width="100%"
                        height={isTrack ? "80" : "152"}
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        title={link.label || "Spotify"}
                      />
                      {link.label && (
                        <div className="px-3 py-2">
                          <p className={`font-medium text-white/80 ${s.desc}`}>
                            {link.label}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }
              }

              if (link.type === "IMAGE" && link.url && link.url !== "#") {
                return (
                  <div
                    key={link.id}
                    className="overflow-hidden rounded-lg border border-white/6 bg-white/2"
                  >
                    {}
                    <img
                      src={link.url}
                      alt={link.label || ""}
                      className="w-full object-cover"
                      loading="lazy"
                    />
                    {link.label && (
                      <div className="px-3 py-2">
                        <p className={`font-medium text-white/80 ${s.desc}`}>
                          {link.label}
                        </p>
                      </div>
                    )}
                  </div>
                );
              }

              const bgColor = link.bgColor || linkStyle.bgColor;
              const textColor = link.textColor || linkStyle.textColor;
              const shadowColor = linkStyle.shadowColor || "#000000";
              const IconComp = getIconComponent(link.icon);

              const btnStyle: React.CSSProperties = (() => {
                if (linkStyle.variant === "brutal") {
                  return {
                    borderRadius: radiusValue,
                    border: `2px solid ${textColor === "#ffffff" || textColor === "#f7f8f8" ? "rgba(255,255,255,0.6)" : "#000000"}`,
                    backgroundColor: bgColor,
                    color: textColor,
                    boxShadow: `3px 3px 0px ${shadowColor}`,
                  };
                }
                if (isOutlined) {
                  return {
                    borderRadius: radiusValue,
                    border: `2px solid ${bgColor}`,
                    color: textColor,
                    backgroundColor: "transparent",
                  };
                }
                return {
                  borderRadius: radiusValue,
                  backgroundColor: bgColor,
                  color: textColor,
                };
              })();

              return (
                <div
                  key={link.id}
                  className={`flex items-center justify-center gap-2 px-4 text-center font-semibold shadow-sm ${s.link}`}
                  style={btnStyle}
                >
                  {IconComp && <IconComp className="h-3.5 w-3.5" />}
                  {link.label}
                </div>
              );
            })
          : fallbackLabels.map((label) => {
              const fallbackStyle: React.CSSProperties = (() => {
                if (linkStyle.variant === "brutal") {
                  const shadowColor = linkStyle.shadowColor || "#000000";
                  return {
                    borderRadius: radiusValue,
                    border: `2px solid rgba(255,255,255,0.6)`,
                    backgroundColor: linkStyle.bgColor,
                    color: linkStyle.textColor,
                    boxShadow: `3px 3px 0px ${shadowColor}`,
                  };
                }
                if (isOutlined) {
                  return {
                    borderRadius: radiusValue,
                    border: `2px solid ${linkStyle.bgColor}`,
                    color: linkStyle.textColor,
                  };
                }
                return {
                  borderRadius: radiusValue,
                  backgroundColor: linkStyle.bgColor,
                  color: linkStyle.textColor,
                };
              })();
              return (
                <div
                  key={label}
                  className={`flex items-center justify-center px-4 text-center font-semibold shadow-sm ${s.link}`}
                  style={fallbackStyle}
                >
                  {label}
                </div>
              );
            })}

        {!displayLinks && !mockLinks && (
          <div className="flex flex-col items-center py-8">
            <div className="h-8 w-8 rounded-xl bg-white/4 ring-1 ring-white/6" />
            <p className="mt-3 text-[11px] text-white/25">
              Seus links aparecerão aqui
            </p>
          </div>
        )}
      </div>

      {}
      <div
        className={`mt-8 flex items-center gap-1.5 ${isMarketing ? "" : "opacity-25"}`}
      >
        {!isMarketing && <div className="h-2.5 w-2.5 rounded-sm bg-white/40" />}
        <span
          className={`text-[9px] ${isMarketing ? "text-[#b5b8ab]" : "text-white/50"}`}
        >
          Gatree
        </span>
      </div>
    </div>
  );
}
