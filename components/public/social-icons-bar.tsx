import { getIconComponent } from "@/lib/icons";
import { getSocialPlatform, normalizeSocialUrl } from "@/lib/social-platforms";

import { socialClickPath } from "@/lib/social-clicks";

interface SocialIcon {
  platform: string;
  url: string;
}

export function SocialIconsBar({
  socialIcons,
  treeId,
}: {
  treeId: string;
  socialIcons: SocialIcon[] | null | undefined;
}) {
  if (!socialIcons?.length) return null;
  return (
    <div className="mt-4 flex flex-wrap items-start justify-center gap-x-3 gap-y-2">
      {socialIcons.map((icon) => {
        const platform = getSocialPlatform(icon.platform);
        const href = normalizeSocialUrl(icon.platform, icon.url);
        const Icon = getIconComponent(platform?.id);
        if (!platform || !href || !Icon) return null;
        return (
          <a
            key={platform.id}
            href={socialClickPath(treeId, platform.id)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={platform.label}
            title={platform.label}
            className="group flex min-h-16 min-w-12 flex-col items-center justify-center gap-1.5 rounded-xl px-1.5 py-1 text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          >
            <span className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/6 transition-colors group-hover:bg-white/12">
              <Icon className="size-4" />
            </span>
            <span className="text-[10px] font-medium leading-tight">
              {platform.label}
            </span>
          </a>
        );
      })}
    </div>
  );
}
