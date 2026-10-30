import type { IconOption, ThemePreset } from "@/types";

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://gatree.app";

export function getAppDomain(): string {
  return APP_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function getShortLinkDomain(): string {
  const url = APP_URL;
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function getShortLinkUrl(slug: string): string {
  return `${APP_URL}/s/${slug}`;
}

export function getShortLinkDisplay(slug: string): string {
  return `${getShortLinkDomain()}/s/${slug}`;
}

export interface ThemeCategory {
  id: string;
  name: string;
  themes: ThemePreset[];
}

export const THEME_CATEGORIES: ThemeCategory[] = [
  {
    id: "minimal",
    name: "Minimalista",
    themes: [
      {
        id: "minimal-dark",
        name: "Dark",
        background: { type: "solid", value: "#0a0a0a" },
        linkStyle: { variant: "filled", radius: "rounded", bgColor: "#1e2028", textColor: "#f7f8f8" },
      },
      {
        id: "minimal-charcoal",
        name: "Charcoal",
        background: { type: "solid", value: "#111111" },
        linkStyle: { variant: "filled", radius: "rounded", bgColor: "#252525", textColor: "#e0e0e0" },
      },
      {
        id: "minimal-slate",
        name: "Slate",
        background: { type: "solid", value: "#0f172a" },
        linkStyle: { variant: "filled", radius: "rounded", bgColor: "#1e293b", textColor: "#e2e8f0" },
      },
      {
        id: "minimal-outlined",
        name: "Outlined",
        background: { type: "solid", value: "#050505" },
        linkStyle: { variant: "outlined", radius: "rounded", bgColor: "#ffffff", textColor: "#ffffff" },
      },
      {
        id: "minimal-pill",
        name: "Pills",
        background: { type: "solid", value: "#0d0d0d" },
        linkStyle: { variant: "filled", radius: "pill", bgColor: "#1a1a2e", textColor: "#f0f0f0" },
      },
    ],
  },
  {
    id: "gradients",
    name: "Gradientes",
    themes: [
      {
        id: "ocean-gradient",
        name: "Ocean",
        background: { type: "gradient", value: "linear-gradient(135deg, #0c1445 0%, #1a3a5c 50%, #0d2137 100%)" },
        linkStyle: { variant: "filled", radius: "rounded", bgColor: "rgba(255,255,255,0.08)", textColor: "#f7f8f8" },
      },
      {
        id: "lavender-glow",
        name: "Lavender",
        background: { type: "gradient", value: "linear-gradient(180deg, #1a1035 0%, #0d0620 100%)" },
        linkStyle: { variant: "outlined", radius: "pill", bgColor: "#5e6ad2", textColor: "#f7f8f8" },
      },
      {
        id: "aurora",
        name: "Aurora",
        background: { type: "gradient", value: "linear-gradient(135deg, #0a192f 0%, #112240 30%, #1d3461 60%, #0a192f 100%)" },
        linkStyle: { variant: "filled", radius: "rounded", bgColor: "rgba(100,200,255,0.1)", textColor: "#ccd6f6" },
      },
      {
        id: "midnight-purple",
        name: "Midnight",
        background: { type: "gradient", value: "linear-gradient(180deg, #1a0533 0%, #0d0118 50%, #000000 100%)" },
        linkStyle: { variant: "filled", radius: "pill", bgColor: "#2a1055", textColor: "#e0d0ff" },
      },
      {
        id: "cosmic",
        name: "Cosmic",
        background: { type: "gradient", value: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" },
        linkStyle: { variant: "filled", radius: "rounded", bgColor: "rgba(255,255,255,0.07)", textColor: "#e8e0f0" },
      },
      {
        id: "ember",
        name: "Ember",
        background: { type: "gradient", value: "linear-gradient(160deg, #1a0000 0%, #2d0a0a 40%, #1a0505 100%)" },
        linkStyle: { variant: "filled", radius: "rounded", bgColor: "#3d1515", textColor: "#ffcaca" },
      },
    ],
  },
  {
    id: "nature",
    name: "Natureza",
    themes: [
      {
        id: "forest",
        name: "Forest",
        background: { type: "gradient", value: "linear-gradient(160deg, #0a1a0f 0%, #0d2818 50%, #071510 100%)" },
        linkStyle: { variant: "filled", radius: "rounded", bgColor: "#1a3d2b", textColor: "#d4f5e0" },
      },
      {
        id: "deep-sea",
        name: "Deep Sea",
        background: { type: "gradient", value: "linear-gradient(180deg, #001220 0%, #001830 50%, #000a15 100%)" },
        linkStyle: { variant: "filled", radius: "rounded", bgColor: "#0a2a40", textColor: "#b8e0f0" },
      },
      {
        id: "earth",
        name: "Earth",
        background: { type: "gradient", value: "linear-gradient(160deg, #1a1008 0%, #2a1a0a 50%, #0f0a05 100%)" },
        linkStyle: { variant: "filled", radius: "rounded", bgColor: "#3d2a15", textColor: "#f5e0c8" },
      },
      {
        id: "northern-lights",
        name: "Northern",
        background: { type: "gradient", value: "linear-gradient(180deg, #001a1a 0%, #002020 30%, #001515 60%, #000d0d 100%)" },
        linkStyle: { variant: "filled", radius: "pill", bgColor: "#0a3d3d", textColor: "#b8fff0" },
      },
    ],
  },
  {
    id: "vibrant",
    name: "Vibrantes",
    themes: [
      {
        id: "neon-cyber",
        name: "Neon",
        background: { type: "solid", value: "#0a0a0a" },
        linkStyle: { variant: "outlined", radius: "sharp", bgColor: "#00ff88", textColor: "#00ff88" },
      },
      {
        id: "sunset",
        name: "Sunset",
        background: { type: "gradient", value: "linear-gradient(135deg, #1a0a0a 0%, #2d1515 50%, #1a0f05 100%)" },
        linkStyle: { variant: "filled", radius: "pill", bgColor: "#8b2252", textColor: "#ffd4e8" },
      },
      {
        id: "electric-blue",
        name: "Electric",
        background: { type: "gradient", value: "linear-gradient(180deg, #000814 0%, #001d3d 50%, #000814 100%)" },
        linkStyle: { variant: "filled", radius: "rounded", bgColor: "#003566", textColor: "#48cae4" },
      },
      {
        id: "hot-pink",
        name: "Pink",
        background: { type: "gradient", value: "linear-gradient(135deg, #1a0010 0%, #2d0020 50%, #0d0008 100%)" },
        linkStyle: { variant: "filled", radius: "pill", bgColor: "#ff006e", textColor: "#ffffff" },
      },
      {
        id: "golden",
        name: "Gold",
        background: { type: "solid", value: "#0a0a05" },
        linkStyle: { variant: "outlined", radius: "rounded", bgColor: "#c9a227", textColor: "#c9a227" },
      },
    ],
  },
  {
    id: "neobrutalist",
    name: "Bold",
    themes: [
      {
        id: "brutal-black",
        name: "Black",
        background: { type: "solid", value: "#f5f5f0" },
        linkStyle: { variant: "brutal", radius: "sharp", bgColor: "#ffffff", textColor: "#000000", shadowColor: "#000000" },
      },
      {
        id: "brutal-yellow",
        name: "Yellow",
        background: { type: "solid", value: "#0a0a0a" },
        linkStyle: { variant: "brutal", radius: "sharp", bgColor: "#FFC900", textColor: "#000000", shadowColor: "#ffffff" },
      },
      {
        id: "brutal-pink",
        name: "Pink",
        background: { type: "solid", value: "#0a0a0a" },
        linkStyle: { variant: "brutal", radius: "sharp", bgColor: "#FF90E8", textColor: "#000000", shadowColor: "#ffffff" },
      },
      {
        id: "brutal-green",
        name: "Green",
        background: { type: "solid", value: "#0a0a0a" },
        linkStyle: { variant: "brutal", radius: "sharp", bgColor: "#C8FF00", textColor: "#000000", shadowColor: "#ffffff" },
      },
      {
        id: "brutal-blue",
        name: "Blue",
        background: { type: "solid", value: "#0a0a0a" },
        linkStyle: { variant: "brutal", radius: "sharp", bgColor: "#90A8ED", textColor: "#000000", shadowColor: "#ffffff" },
      },
      {
        id: "brutal-white",
        name: "White",
        background: { type: "solid", value: "#1a1a1a" },
        linkStyle: { variant: "brutal", radius: "sharp", bgColor: "#f7f8f8", textColor: "#000000", shadowColor: "#FFC900" },
      },
    ],
  },
  {
    id: "animated",
    name: "Animados",
    themes: [
      {
        id: "animated-dots",
        name: "Dots",
        background: { type: "animated", value: "dots", config: { base: "linear-gradient(180deg, #0a0a1a 0%, #0d0d2b 100%)" } },
        linkStyle: { variant: "filled", radius: "rounded", bgColor: "rgba(255,255,255,0.08)", textColor: "#f7f8f8" },
      },
      {
        id: "animated-particles",
        name: "Particles",
        background: { type: "animated", value: "particles", config: { base: "linear-gradient(135deg, #080820 0%, #0a0a2e 50%, #05051a 100%)" } },
        linkStyle: { variant: "filled", radius: "rounded", bgColor: "rgba(94,106,210,0.15)", textColor: "#f7f8f8" },
      },
      {
        id: "animated-waves",
        name: "Waves",
        background: { type: "animated", value: "waves", config: { base: "linear-gradient(180deg, #020210 0%, #0a0a30 50%, #050520 100%)" } },
        linkStyle: { variant: "filled", radius: "pill", bgColor: "rgba(255,255,255,0.06)", textColor: "#f7f8f8" },
      },
      {
        id: "animated-aurora",
        name: "Aurora",
        background: { type: "animated", value: "aurora", config: { base: "linear-gradient(180deg, #000a0a 0%, #001515 50%, #000808 100%)" } },
        linkStyle: { variant: "filled", radius: "rounded", bgColor: "rgba(100,200,180,0.1)", textColor: "#e0fff0" },
      },
      {
        id: "animated-fireflies",
        name: "Fireflies",
        background: { type: "animated", value: "fireflies", config: { base: "linear-gradient(180deg, #0a0a05 0%, #151508 50%, #0a0a03 100%)" } },
        linkStyle: { variant: "outlined", radius: "rounded", bgColor: "#ffd700", textColor: "#ffd700" },
      },
      {
        id: "animated-rain",
        name: "Rain",
        background: { type: "animated", value: "rain", config: { base: "linear-gradient(180deg, #05080f 0%, #0a1020 50%, #030810 100%)" } },
        linkStyle: { variant: "filled", radius: "rounded", bgColor: "rgba(100,150,255,0.1)", textColor: "#ccd6f6" },
      },
      {
        id: "animated-stars",
        name: "Stars",
        background: { type: "animated", value: "stars", config: { base: "linear-gradient(180deg, #020208 0%, #05051a 40%, #000005 100%)" } },
        linkStyle: { variant: "filled", radius: "pill", bgColor: "rgba(255,255,255,0.05)", textColor: "#f7f8f8" },
      },
      {
        id: "animated-gradient-flow",
        name: "Flow",
        background: { type: "animated", value: "gradient-flow", config: { base: "linear-gradient(135deg, #0a0515 0%, #080820 50%, #050510 100%)" } },
        linkStyle: { variant: "filled", radius: "rounded", bgColor: "rgba(255,255,255,0.08)", textColor: "#f7f8f8" },
      },
      {
        id: "animated-bubbles",
        name: "Bubbles",
        background: { type: "animated", value: "bubbles", config: { base: "linear-gradient(180deg, #020815 0%, #061025 50%, #030810 100%)" } },
        linkStyle: { variant: "outlined", radius: "pill", bgColor: "rgba(150,200,255,0.3)", textColor: "#cce0ff" },
      },
      {
        id: "animated-snow",
        name: "Snow",
        background: { type: "animated", value: "snow", config: { base: "linear-gradient(180deg, #0a1020 0%, #151d35 50%, #0a1020 100%)" } },
        linkStyle: { variant: "filled", radius: "rounded", bgColor: "rgba(255,255,255,0.1)", textColor: "#f0f4ff" },
      },
      {
        id: "animated-matrix",
        name: "Matrix",
        background: { type: "animated", value: "matrix", config: { base: "#000000" } },
        linkStyle: { variant: "outlined", radius: "sharp", bgColor: "#00cc50", textColor: "#00ff66" },
      },
      {
        id: "animated-confetti",
        name: "Confetti",
        background: { type: "animated", value: "confetti", config: { base: "linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)" } },
        linkStyle: { variant: "filled", radius: "pill", bgColor: "rgba(255,255,255,0.1)", textColor: "#f7f8f8" },
      },
      {
        id: "animated-smoke",
        name: "Smoke",
        background: { type: "animated", value: "smoke", config: { base: "linear-gradient(180deg, #050508 0%, #0a0a12 50%, #050508 100%)" } },
        linkStyle: { variant: "filled", radius: "rounded", bgColor: "rgba(255,255,255,0.06)", textColor: "#e0e0e8" },
      },
    ],
  },
];

export const THEME_PRESETS: ThemePreset[] = THEME_CATEGORIES.flatMap((cat) => cat.themes);

export const LINK_ICONS: IconOption[] = [

  { name: "instagram", label: "Instagram", category: "social" },
  { name: "twitter", label: "Twitter / X", category: "social" },
  { name: "youtube", label: "YouTube", category: "social" },
  { name: "github", label: "GitHub", category: "social" },
  { name: "linkedin", label: "LinkedIn", category: "social" },
  { name: "facebook", label: "Facebook", category: "social" },
  { name: "tiktok", label: "TikTok", category: "social" },
  { name: "twitch", label: "Twitch", category: "social" },
  { name: "discord", label: "Discord", category: "social" },
  { name: "spotify", label: "Spotify", category: "social" },
  { name: "whatsapp", label: "WhatsApp", category: "social" },
  { name: "telegram", label: "Telegram", category: "social" },

  { name: "globe", label: "Website", category: "generic" },
  { name: "mail", label: "Email", category: "generic" },
  { name: "shopping-bag", label: "Loja", category: "generic" },
  { name: "music", label: "Música", category: "generic" },
  { name: "video", label: "Vídeo", category: "generic" },
  { name: "file-text", label: "Documento", category: "generic" },
  { name: "calendar", label: "Agenda", category: "generic" },
  { name: "map-pin", label: "Localização", category: "generic" },
  { name: "link", label: "Link genérico", category: "generic" },
];

export const DEFAULT_LINK_STYLE = {
  variant: "filled" as const,
  radius: "rounded" as const,
  bgColor: "#1e2028",
  textColor: "#f7f8f8",
  shadowColor: "#000000",
};

export const DEFAULT_BACKGROUND = {
  type: "solid" as const,
  value: "#010102",
};

export const LINK_RADIUS_MAP = {
  sharp: "4px",
  rounded: "8px",
  pill: "9999px",
} as const;

export const CURATED_FONTS = [

  { id: "inter", name: "Inter", family: "Inter", category: "sans-serif" },
  { id: "space-grotesk", name: "Space Grotesk", family: "Space Grotesk", category: "sans-serif" },
  { id: "sora", name: "Sora", family: "Sora", category: "sans-serif" },
  { id: "plus-jakarta-sans", name: "Plus Jakarta Sans", family: "Plus Jakarta Sans", category: "sans-serif" },
  { id: "archivo", name: "Archivo", family: "Archivo", category: "sans-serif" },
  { id: "outfit", name: "Outfit", family: "Outfit", category: "sans-serif" },

  { id: "playfair-display", name: "Playfair Display", family: "Playfair Display", category: "serif" },
  { id: "cormorant-garamond", name: "Cormorant Garamond", family: "Cormorant Garamond", category: "serif" },
  { id: "lora", name: "Lora", family: "Lora", category: "serif" },
  { id: "fraunces", name: "Fraunces", family: "Fraunces", category: "serif" },
  { id: "bitter", name: "Bitter", family: "Bitter", category: "serif" },

  { id: "bebas-neue", name: "Bebas Neue", family: "Bebas Neue", category: "display" },
  { id: "righteous", name: "Righteous", family: "Righteous", category: "display" },
  { id: "comfortaa", name: "Comfortaa", family: "Comfortaa", category: "display" },
  { id: "fredoka", name: "Fredoka", family: "Fredoka", category: "display" },
  { id: "lexend", name: "Lexend", family: "Lexend", category: "sans-serif" },
  { id: "space-mono", name: "Space Mono", family: "Space Mono", category: "monospace" },

  { id: "caveat", name: "Caveat", family: "Caveat", category: "handwriting" },
  { id: "dancing-script", name: "Dancing Script", family: "Dancing Script", category: "handwriting" },

  { id: "jetbrains-mono", name: "JetBrains Mono", family: "JetBrains Mono", category: "monospace" },
  { id: "fira-code", name: "Fira Code", family: "Fira Code", category: "monospace" },
] as const;

export type CuratedFont = (typeof CURATED_FONTS)[number];
