"use client";

import { useTrees } from "@/hooks/use-trees";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getLocalePrefix, stripLocale } from "@/lib/i18n/paths";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GuidedTour } from "./guided-tour";
import {
  buildTourPlan,
  selectTourTree,
  type GuidedStep,
  type TourMode,
} from "./tour-plan";

export function GuidedWalkthrough({
  mode,
  treeSlug,
  translations,
  onFinish,
}: {
  mode: TourMode;
  treeSlug?: string;
  translations: Dictionary["onboarding"];
  onFinish: (reason: "complete" | "dismiss") => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [initialPath] = useState(pathname);
  const [plan, setPlan] = useState<GuidedStep[] | null>(null);
  const [index, setIndex] = useState(0);
  const { data, isLoading } = useTrees();
  const startPath =
    mode === "welcome" ? "/dashboard" : stripLocale(initialPath);

  if (!plan && (mode !== "manual" || !isLoading)) {
    const tree = selectTourTree(data?.trees ?? [], stripLocale(initialPath));
    setPlan(
      buildTourPlan(
        startPath,
        treeSlug ?? tree?.slug,
        translations.guided.steps,
        mode,
      ),
    );
  }

  const fallback = buildTourPlan(
    startPath,
    treeSlug,
    translations.guided.steps,
    mode,
  )[0];
  const step = plan?.[index] ?? fallback;
  const routeReady = stripLocale(pathname) === step.path;
  const prefix = getLocalePrefix(initialPath);

  useEffect(() => {
    if (!plan || routeReady) return;
    router.push(`${prefix}${step.path}`, { scroll: false });
  }, [plan, routeReady, prefix, router, step.path]);

  return (
    <GuidedTour
      step={step}
      index={index}
      total={plan?.length ?? 1}
      translations={translations}
      transitioning={!plan || !routeReady}
      onBack={() => setIndex((value) => Math.max(0, value - 1))}
      onNext={() => {
        if (!plan) return;
        if (index === plan.length - 1) onFinish("complete");
        else setIndex((value) => value + 1);
      }}
      onFinish={() => onFinish("complete")}
      onDismiss={() => onFinish("dismiss")}
    />
  );
}
