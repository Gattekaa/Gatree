"use client";

import { useAutoSave } from "@/hooks/use-auto-save";
import {
  AtSign,
  Briefcase,
  Camera,
  Gamepad2,
  Globe,
  MessageCircle,
  Music,
  Pin,
  Play,
  Send,
  Terminal,
  Tv,
} from "lucide-react";
import { useCallback, useState } from "react";

interface SocialIcon {
  platform: string;
  url: string;
}

interface SocialIconsEditorProps {
  socialIcons: SocialIcon[];
  onSave: (icons: SocialIcon[]) => void;
}

const SOCIAL_PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: AtSign },
  { id: "twitter", label: "Twitter / X", icon: Send },
  { id: "tiktok", label: "TikTok", icon: Music },
  { id: "github", label: "GitHub", icon: Terminal },
  { id: "linkedin", label: "LinkedIn", icon: Briefcase },
  { id: "youtube", label: "YouTube", icon: Play },
  { id: "facebook", label: "Facebook", icon: Globe },
  { id: "twitch", label: "Twitch", icon: Tv },
  { id: "discord", label: "Discord", icon: Gamepad2 },
  { id: "threads", label: "Threads", icon: MessageCircle },
  { id: "pinterest", label: "Pinterest", icon: Pin },
  { id: "snapchat", label: "Snapchat", icon: Camera },
] as const;

export function SocialIconsEditor({
  socialIcons,
  onSave,
}: SocialIconsEditorProps) {
  const [urls, setUrls] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const icon of socialIcons) {
      map[icon.platform] = icon.url;
    }
    return map;
  });

  const derivedIcons = SOCIAL_PLATFORMS.filter((p) => urls[p.id]?.trim()).map(
    (p) => ({ platform: p.id, url: urls[p.id].trim() }),
  );

  const saveFn = useCallback(
    async (icons: SocialIcon[]) => {
      onSave(icons);
    },
    [onSave],
  );

  useAutoSave(JSON.stringify(derivedIcons), async (serialized) => {
    const parsed = JSON.parse(serialized) as SocialIcon[];
    await saveFn(parsed);
  });

  function handleUrlChange(platformId: string, value: string) {
    setUrls((prev) => ({ ...prev, [platformId]: value }));
  }

  const filledCount = derivedIcons.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-balance break-words font-semibold text-ink flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 bg-brutal-pink" />
            Redes Sociais
          </h3>
          <p className="break-words mt-1 text-ink-subtle text-sm leading-[1.5]">
            Adicione URLs das suas redes. Apenas as preenchidas aparecerão na
            página.
          </p>
        </div>
        {filledCount > 0 && (
          <span className="border border-brutal-pink px-2 py-0.5 text-xs font-medium text-brutal-pink">
            {filledCount} ativa{filledCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SOCIAL_PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          const hasValue = !!urls[platform.id]?.trim();

          return (
            <div
              key={platform.id}
              className={`border p-3 transition-colors ${
                hasValue
                  ? "border-brutal-pink bg-surface-2"
                  : "border-hairline-strong bg-surface-2"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 rounded-lg items-center justify-center ${
                    hasValue ? "bg-brutal-pink/10" : "bg-surface-3"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      hasValue ? "text-brutal-pink" : "text-ink-tertiary"
                    }`}
                  />
                </div>
                <span
                  className={`text-[13px] font-medium ${
                    hasValue ? "text-ink" : "text-ink-subtle"
                  }`}
                >
                  {platform.label}
                </span>
              </div>
              <input
                data-slot="input"
                type="url"
                value={urls[platform.id] || ""}
                onChange={(e) => handleUrlChange(platform.id, e.target.value)}
                placeholder={`https://${platform.id}.com/seu-perfil`}
                className="h-12 w-full rounded-xl border border-hairline-strong bg-canvas px-3 py-2 text-[16px] text-ink placeholder:text-ink-tertiary outline-none transition-colors focus:border-primary sm:text-[14px]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
