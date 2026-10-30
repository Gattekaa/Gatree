

const REFERRER_MAP: Record<string, string> = {

  "l.instagram.com": "Instagram",
  "instagram.com": "Instagram",
  "www.instagram.com": "Instagram",

  "t.co": "Twitter",
  "twitter.com": "Twitter",
  "x.com": "Twitter",

  "l.facebook.com": "Facebook",
  "lm.facebook.com": "Facebook",
  "m.facebook.com": "Facebook",
  "facebook.com": "Facebook",
  "www.facebook.com": "Facebook",
  "fb.me": "Facebook",

  "vm.tiktok.com": "TikTok",
  "www.tiktok.com": "TikTok",
  "tiktok.com": "TikTok",

  "lnkd.in": "LinkedIn",
  "linkedin.com": "LinkedIn",
  "www.linkedin.com": "LinkedIn",

  "youtube.com": "YouTube",
  "www.youtube.com": "YouTube",
  "youtu.be": "YouTube",
  "m.youtube.com": "YouTube",

  "google.com": "Google",
  "www.google.com": "Google",
  "google.com.br": "Google",
  "www.google.com.br": "Google",

  "api.whatsapp.com": "WhatsApp",
  "web.whatsapp.com": "WhatsApp",
  "whatsapp.com": "WhatsApp",

  "t.me": "Telegram",
  "telegram.me": "Telegram",

  "reddit.com": "Reddit",
  "www.reddit.com": "Reddit",
  "old.reddit.com": "Reddit",

  "pinterest.com": "Pinterest",
  "pin.it": "Pinterest",

  "threads.net": "Threads",
  "www.threads.net": "Threads",

  "l.messenger.com": "Messenger",
  "m.me": "Messenger",

  "discord.com": "Discord",
  "discordapp.com": "Discord",

  "snapchat.com": "Snapchat",
  "story.snapchat.com": "Snapchat",

  "twitch.tv": "Twitch",
  "www.twitch.tv": "Twitch",

  "open.spotify.com": "Spotify",

  "mail.google.com": "Gmail",
  "outlook.live.com": "Outlook",
  "mail.yahoo.com": "Yahoo Mail",
};

const UA_PATTERNS: { pattern: RegExp; source: string }[] = [
  { pattern: /Instagram/i, source: "Instagram" },
  { pattern: /FBAN|FBIOS|FB_IAB|FBAV/i, source: "Facebook" },
  { pattern: /BytedanceWebview|TikTok/i, source: "TikTok" },
  { pattern: /Twitter|TwitterAndroid/i, source: "Twitter" },
  { pattern: /LinkedInApp/i, source: "LinkedIn" },
  { pattern: /Snapchat/i, source: "Snapchat" },
  { pattern: /Pinterest/i, source: "Pinterest" },
  { pattern: /Telegram/i, source: "Telegram" },
  { pattern: /WhatsApp/i, source: "WhatsApp" },
  { pattern: /Discord/i, source: "Discord" },
  { pattern: /Line\//i, source: "Line" },
];

export function resolveReferrer(options: {
  refererHeader: string | null;
  userAgent: string;
  utmSource?: string | null;
}): string | null {
  const { refererHeader, userAgent, utmSource } = options;

  if (utmSource && utmSource.trim().length > 0) {
    return capitalizeSource(utmSource.trim());
  }

  if (refererHeader) {
    try {
      const url = new URL(refererHeader);
      const hostname = url.hostname.toLowerCase();

      if (REFERRER_MAP[hostname]) {
        return REFERRER_MAP[hostname];
      }

      const withoutWww = hostname.replace(/^www\./, "");
      if (REFERRER_MAP[withoutWww]) {
        return REFERRER_MAP[withoutWww];
      }

      for (const [domain, name] of Object.entries(REFERRER_MAP)) {
        if (hostname.endsWith(`.${domain}`) || hostname === domain) {
          return name;
        }
      }

      return withoutWww;
    } catch {

    }
  }

  if (userAgent) {
    for (const { pattern, source } of UA_PATTERNS) {
      if (pattern.test(userAgent)) {
        return source;
      }
    }
  }

  return null;
}

function capitalizeSource(source: string): string {

  const knownSources = [
    "Instagram", "Twitter", "Facebook", "TikTok", "LinkedIn",
    "YouTube", "WhatsApp", "Telegram", "Reddit", "Pinterest",
    "Threads", "Messenger", "Discord", "Snapchat", "Google",
    "Spotify", "Twitch", "Gmail", "Outlook",
  ];

  const match = knownSources.find(
    (s) => s.toLowerCase() === source.toLowerCase()
  );
  if (match) return match;

  return source.charAt(0).toUpperCase() + source.slice(1).toLowerCase();
}
