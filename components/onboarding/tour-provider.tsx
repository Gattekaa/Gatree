"use client";

import { completeWelcomeTour } from "@/actions/onboarding";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import {
  createTourContinuationStore,
  createTourSeenStore,
  queuedTourTree,
  type TourContinuation,
} from "@/lib/onboarding";
import { stripLocale } from "@/lib/i18n/paths";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { GuidedWalkthrough } from "./guided-walkthrough";

const tourSeenStore = createTourSeenStore(() =>
  typeof window !== "undefined" ? window.localStorage : undefined,
);
const continuationStore = createTourContinuationStore(() =>
  typeof window !== "undefined" ? window.localStorage : undefined,
);
const TourContext = createContext<{
  startTour: () => void;
  treeCreated: (slug: string) => void;
} | null>(null);

export function useProductTour() {
  const context = useContext(TourContext);
  if (!context) throw new Error("Product tour must be inside TourProvider");
  return context;
}

export function TourProvider({
  userId,
  autoStart,
  translations,
  children,
}: {
  userId: string;
  autoStart: boolean;
  translations: Dictionary["onboarding"];
  children: ReactNode;
}) {
  const [manualOpen, setManualOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [continuationSlug, setContinuationSlug] = useState<string | null>(null);
  const pathname = usePathname();
  const completionStarted = useRef(false);
  const subscribe = useCallback((listener: () => void) => {
    const unsubscribe = tourSeenStore.subscribe(listener);
    const unsubscribeContinuation = continuationStore.subscribe(listener);
    window.addEventListener("storage", listener);
    return () => {
      unsubscribe();
      unsubscribeContinuation();
      window.removeEventListener("storage", listener);
    };
  }, []);
  const getSeen = useCallback(() => tourSeenStore.hasSeen(userId), [userId]);
  const seen = useSyncExternalStore(subscribe, getSeen, () => true);
  const getProgress = useCallback(
    () => continuationStore.getProgress(userId),
    [userId],
  );
  const progress = useSyncExternalStore<TourContinuation>(
    subscribe,
    getProgress,
    () => "idle",
  );
  const queuedSlug = queuedTourTree(progress, stripLocale(pathname));
  // Creation success queues this exact tree. Start only once its editor is open,
  // then keep the guide mounted while it navigates to analytics.
  if (!continuationSlug && !manualOpen && queuedSlug) {
    setContinuationSlug(queuedSlug);
  }
  const mode = manualOpen
    ? "manual"
    : continuationSlug
      ? "first-tree"
      : "welcome";
  const open =
    manualOpen || !!continuationSlug || (autoStart && !seen && !dismissed);

  function finishTour(reason: "complete" | "dismiss") {
    if (mode === "welcome" && reason === "complete") {
      continuationStore.waitForTree(userId);
    } else {
      continuationStore.finish(userId);
    }
    setManualOpen(false);
    setContinuationSlug(null);
    setDismissed(true);
    if (autoStart && !completionStarted.current) {
      completionStarted.current = true;
      tourSeenStore.markSeen(userId);
      // Local completion still suppresses the tour if the session update fails.
      void completeWelcomeTour().catch(() => {});
    }
  }

  return (
    <TourContext.Provider
      value={{
        startTour: () => setManualOpen(true),
        treeCreated: (slug) => continuationStore.treeCreated(userId, slug),
      }}
    >
      {children}
      {open && (
        <GuidedWalkthrough
          key={mode}
          mode={mode}
          treeSlug={continuationSlug ?? undefined}
          onFinish={finishTour}
          translations={translations}
        />
      )}
    </TourContext.Provider>
  );
}
