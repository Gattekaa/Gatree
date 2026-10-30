import {
  getSocialPlatform,
  normalizeSocialUrl,
  SOCIAL_PLATFORMS,
} from "@/lib/social-platforms";

export function socialClickId(treeId: string, platform: string): string {
  return treeId + ":social:" + (getSocialPlatform(platform)?.id || platform);
}

export function socialClickPath(treeId: string, platform: string): string {
  return (
    "/api/click/social/" +
    encodeURIComponent(treeId) +
    "/" +
    encodeURIComponent(getSocialPlatform(platform)?.id || platform)
  );
}

// Preserve historical counts when a social icon is removed or replaced.
export function socialAnalyticsTargets(treeId: string) {
  return SOCIAL_PLATFORMS.map((platform) => ({
    id: socialClickId(treeId, platform.id),
    label: platform.label,
    icon: platform.id,
  }));
}

export function resolveSocialDestination(
  icons: unknown,
  platformId: string,
): string | null {
  const platform = getSocialPlatform(platformId);
  if (!platform || !Array.isArray(icons)) return null;
  for (const icon of icons) {
    if (
      icon &&
      typeof icon.platform === "string" &&
      typeof icon.url === "string" &&
      getSocialPlatform(icon.platform)?.id === platform.id
    ) {
      const url = normalizeSocialUrl(platform.id, icon.url);
      if (url) return url;
    }
  }
  return null;
}
