export const SOCIAL_PLATFORMS = [
  {
    id: "instagram",
    label: "Instagram",
    placeholder: "https://www.instagram.com/seu-perfil",
    hosts: ["instagram.com"],
  },
  {
    id: "twitter",
    label: "X / Twitter",
    placeholder: "https://x.com/seu-perfil",
    hosts: ["x.com", "twitter.com"],
  },
  {
    id: "youtube",
    label: "YouTube",
    placeholder: "https://www.youtube.com/@seu-canal",
    hosts: ["youtube.com", "youtu.be"],
  },
  {
    id: "github",
    label: "GitHub",
    placeholder: "https://github.com/seu-perfil",
    hosts: ["github.com"],
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    placeholder: "https://www.linkedin.com/in/seu-perfil",
    hosts: ["linkedin.com"],
  },
  {
    id: "facebook",
    label: "Facebook",
    placeholder: "https://www.facebook.com/seu-perfil",
    hosts: ["facebook.com", "fb.com"],
  },
  {
    id: "tiktok",
    label: "TikTok",
    placeholder: "https://www.tiktok.com/@seu-perfil",
    hosts: ["tiktok.com"],
  },
  {
    id: "twitch",
    label: "Twitch",
    placeholder: "https://www.twitch.tv/seu-canal",
    hosts: ["twitch.tv"],
  },
  {
    id: "discord",
    label: "Discord",
    placeholder: "https://discord.gg/seu-convite",
    hosts: ["discord.gg", "discord.com", "discordapp.com"],
  },
  {
    id: "spotify",
    label: "Spotify",
    placeholder: "https://open.spotify.com/user/seu-perfil",
    hosts: ["open.spotify.com"],
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    placeholder: "https://wa.me/5511999999999",
    hosts: ["wa.me", "whatsapp.com"],
  },
  {
    id: "telegram",
    label: "Telegram",
    placeholder: "https://t.me/seu-perfil",
    hosts: ["t.me", "telegram.me", "telegram.org"],
  },
  {
    id: "threads",
    label: "Threads",
    placeholder: "https://www.threads.com/@seu-perfil",
    hosts: ["threads.com", "threads.net"],
  },
  {
    id: "pinterest",
    label: "Pinterest",
    placeholder: "https://www.pinterest.com/seu-perfil",
    hosts: ["pinterest.com", "pinterest.com.br", "pin.it"],
  },
  {
    id: "snapchat",
    label: "Snapchat",
    placeholder: "https://www.snapchat.com/add/seu-perfil",
    hosts: ["snapchat.com"],
  },
  {
    id: "soundcloud",
    label: "SoundCloud",
    placeholder: "https://soundcloud.com/seu-perfil",
    hosts: ["soundcloud.com"],
  },
] as const;

export function getSocialPlatform(id: string) {
  return SOCIAL_PLATFORMS.find(
    (platform) => platform.id === (id === "x" ? "twitter" : id),
  );
}

export function normalizeSocialUrl(
  platformId: string,
  value: string,
): string | null {
  const platform = getSocialPlatform(platformId);
  if (!platform || !value.trim()) return null;
  const input = value.trim();
  try {
    const url = new URL(
      /^[a-z][a-z\d+.-]*:/i.test(input) ? input : `https://${input}`,
    );
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.port
    )
      return null;
    if (
      !platform.hosts.some(
        (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
      )
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}
