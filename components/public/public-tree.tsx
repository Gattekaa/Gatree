import { DEFAULT_LINK_STYLE, LINK_RADIUS_MAP } from "@/lib/constants";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { FONT_CLASS_MAP } from "@/lib/fonts";
import type { BackgroundConfig, LinkStyleConfig } from "@/types";
import type { Link, Tree } from "@prisma/client";
import NextLink from "next/link";
import { AnimatedBackground } from "./animated-background";
import { PublicLink } from "./public-link";
import { SocialIconsBar } from "./social-icons-bar";

interface PublicTreeProps {
  tree: Tree & { links: Link[] };
  translations: {
    instagram: Dictionary["public"]["instagram"];
    poweredBy: string;
    notFound: string;
  };
}

export function PublicTree({ tree, translations }: PublicTreeProps) {
  const background = tree.background as BackgroundConfig | null;
  const linkStyle = (tree.linkStyle as LinkStyleConfig | null) || DEFAULT_LINK_STYLE;

  const backgroundStyle = getBackgroundStyle(background);
  const radiusValue = LINK_RADIUS_MAP[linkStyle.radius] || LINK_RADIUS_MAP.rounded;
  const isAnimated = background?.type === "animated";

  const fontFamily = tree.fontFamily as string | null;
  const fontClassName = FONT_CLASS_MAP[fontFamily || "Outfit"] || FONT_CLASS_MAP.Outfit;

  const content = (
    <div className={`w-full max-w-170 px-6 py-16 ${fontClassName}`}>

      <div className="mb-4 flex justify-center">
        {tree.avatar ? (
          
          <img
            src={tree.avatar}
            alt={tree.title}
            className="h-24 w-24 rounded-full object-cover shadow-lg shadow-black/30 ring-[3px] ring-white/10"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-white/15 to-white/5 shadow-lg shadow-black/30 ring-[3px] ring-white/10">
            <span className="text-3xl font-bold text-white/80">
              {tree.title?.[0]?.toUpperCase() || "G"}
            </span>
          </div>
        )}
      </div>

      {}
      <h1 className="text-center text-[20px] font-semibold leading-tight tracking-tight text-white">
        {tree.title}
      </h1>

      {}
      {tree.description && (
        <p className="mt-2 text-center text-body-sm text-white/70">
          {tree.description}
        </p>
      )}

      <SocialIconsBar treeId={tree.id} socialIcons={tree.socialIcons as Array<{ platform: string; url: string }> | null} />

      <div className="mt-8 flex flex-col gap-3">
        {tree.links.map((link) => (
          <PublicLink
            key={link.id}
            link={link}
            treeId={tree.id}
            defaultStyle={linkStyle}
            radius={radiusValue}
            instagramTranslations={translations.instagram}
          />
        ))}
      </div>

      {}
      <div className="mt-12 text-center">
        <NextLink
          href="/"
          className="text-caption text-white/40 transition-colors hover:text-white/60"
        >
          {translations.poweredBy}
        </NextLink>
      </div>
    </div>
  );

  if (isAnimated) {
    return (
      <AnimatedBackground variant={background.value || "dots"} config={background.config as Record<string, unknown> | undefined}>
        <div className="flex min-h-dvh w-full flex-col items-center">
          {content}
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <div className="flex min-h-dvh w-full flex-col items-center" style={backgroundStyle}>
      {content}
    </div>
  );
}

function getBackgroundStyle(background: BackgroundConfig | null): React.CSSProperties {
  if (!background) {
    return { backgroundColor: "#010102" };
  }

  switch (background.type) {
    case "solid":
      return { backgroundColor: background.value };
    case "gradient":
      return { background: background.value };
    case "image": {

      let imageUrl = background.value;
      try {
        const parsed = new URL(imageUrl);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          imageUrl = "";
        }
      } catch {
        imageUrl = "";
      }
      if (!imageUrl) return { backgroundColor: "#010102" };
      return {
        backgroundColor: "#010102",
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    case "animated":
      return { backgroundColor: "#010102" };
    default:
      return { backgroundColor: "#010102" };
  }
}
