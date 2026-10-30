export function updateWelcomeTourFlag(
  current: unknown,
  trigger?: "signIn" | "signUp" | "update",
  update?: { user?: { showWelcomeTour?: unknown } },
) {
  if (trigger === "signUp") return true;
  if (trigger === "signIn") return false;
  if (trigger === "update" && update?.user?.showWelcomeTour === false)
    return false;
  return current === true;
}

export function createTourSeenStore(
  getStorage: () => Pick<Storage, "getItem" | "setItem"> | undefined,
) {
  const seen = new Set<string>();
  const listeners = new Set<() => void>();
  const key = (userId: string) => `gatree:welcome-tour:v1:${userId}`;
  return {
    hasSeen(userId: string) {
      if (seen.has(userId)) return true;
      try {
        return getStorage()?.getItem(key(userId)) === "done";
      } catch {
        return false;
      }
    },
    markSeen(userId: string) {
      seen.add(userId);
      try {
        getStorage()?.setItem(key(userId), "done");
      } catch {
        // Private browsers can reject storage; keep the choice for this session.
      }
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export type TourContinuation = "idle" | "waiting" | "done" | `tree:${string}`;

export function queuedTourTree(progress: TourContinuation, path: string) {
  if (!progress.startsWith("tree:")) return null;
  const slug = progress.slice(5);
  return path === `/editor/${encodeURIComponent(slug)}` ? slug : null;
}

export function createTourContinuationStore(
  getStorage: () => Pick<Storage, "getItem" | "setItem"> | undefined,
) {
  const memory = new Map<string, TourContinuation>();
  const listeners = new Set<() => void>();
  const key = (userId: string) => `gatree:tree-tour:v1:${userId}`;
  const read = (userId: string): TourContinuation => {
    try {
      const storage = getStorage();
      if (storage) {
        const value = storage.getItem(key(userId));
        if (value === "waiting" || value === "done") return value;
        if (value?.startsWith("tree:") && value.length > 5)
          return value as TourContinuation;
        return "idle";
      }
    } catch {
      // Fall back to memory when browser storage is unavailable.
    }
    return memory.get(userId) ?? "idle";
  };
  const write = (userId: string, value: TourContinuation) => {
    memory.set(userId, value);
    try {
      getStorage()?.setItem(key(userId), value);
    } catch {
      // Keep progress for the current app session.
    }
    listeners.forEach((listener) => listener());
  };
  return {
    getProgress: read,
    waitForTree(userId: string) {
      if (read(userId) === "idle") write(userId, "waiting");
    },
    treeCreated(userId: string, slug: string) {
      if (read(userId) === "waiting" && slug) write(userId, `tree:${slug}`);
    },
    finish(userId: string) {
      write(userId, "done");
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
