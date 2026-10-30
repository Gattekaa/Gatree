export function isPublicLinkAvailable(
  link: {
    enabled: boolean;
    scheduledStart: Date | null;
    scheduledEnd: Date | null;
    tree: { status: string };
  },
  now = new Date(),
): boolean {
  return (
    link.enabled &&
    link.tree.status === "ACTIVE" &&
    (!link.scheduledStart || link.scheduledStart <= now) &&
    (!link.scheduledEnd || link.scheduledEnd > now)
  );
}
