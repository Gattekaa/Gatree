import type { Dictionary } from "@/lib/i18n/dictionaries";

type Copy = Dictionary["onboarding"]["guided"]["steps"];
export type TourMode = "welcome" | "first-tree" | "manual";
export interface GuidedStep {
  id: keyof Copy;
  path: string;
  target: string;
  title: string;
  description: string;
  tip: string;
}

export function selectTourTree(
  trees: Array<{ slug: string; status: string }>,
  path: string,
) {
  const match = path.match(/^\/(?:editor|analytics)\/([^/]+)/);
  let current = match?.[1];
  try {
    if (current) current = decodeURIComponent(current);
  } catch {
    current = undefined;
  }
  return (
    trees.find((tree) => tree.slug === current) ??
    trees.find((tree) => tree.status === "ACTIVE")
  );
}

export function buildTourPlan(
  path: string,
  slug: string | undefined,
  copy: Copy,
  mode: TourMode = "manual",
): GuidedStep[] {
  const step = (id: keyof Copy, route: string, target: string): GuidedStep => ({
    id,
    path: route,
    target,
    ...copy[id],
  });
  if (mode === "welcome") slug = undefined;
  if (mode === "first-tree" && !slug) return [];
  const editorPath = slug ? `/editor/${encodeURIComponent(slug)}` : "";
  const analyticsPath = slug ? `/analytics/${encodeURIComponent(slug)}` : "";
  const dashboard = [
    step("dashboard", "/dashboard", '[data-tour="dashboard-overview"]'),
    step("createTree", "/dashboard", '[data-tour="dashboard-create"]'),
    ...(slug
      ? [
          step(
            "trees",
            "/dashboard",
            `[data-tour="dashboard-trees"] a[href$=${JSON.stringify(editorPath)}]`,
          ),
        ]
      : []),
  ];
  const groups = [
    { route: "/dashboard", steps: dashboard },
    {
      route: "/editor",
      steps: slug
        ? [
            step("editorTitle", editorPath, '[data-tour="editor-title"]'),
            step("addLink", editorPath, '[data-tour="editor-add-link"]'),
            step("appearance", editorPath, '[data-tour="editor-appearance"]'),
            step("preview", editorPath, '[data-tour="editor-preview"]'),
            step("sharing", editorPath, '[data-tour="editor-share"]'),
          ]
        : [],
    },
    {
      route: "/analytics",
      steps: slug
        ? [
            step(
              "analytics",
              analyticsPath,
              '[data-tour="analytics-overview"]',
            ),
            step("period", analyticsPath, '[data-tour="analytics-period"]'),
          ]
        : [],
    },
    {
      route: "/shortener",
      steps: [
        step("shortener", "/shortener", '[data-tour="shortener-create"]'),
        step("shortenerSearch", "/shortener", '[data-tour="shortener-search"]'),
      ],
    },
    {
      route: "/settings",
      steps: [
        step("preferences", "/settings", '[data-tour="settings-preferences"]'),
      ],
    },
  ];
  if (mode === "first-tree") {
    return groups
      .filter(
        (group) => group.route === "/editor" || group.route === "/analytics",
      )
      .flatMap((group) => group.steps);
  }
  const finish = step("finish", "/dashboard", '[data-tour="dashboard-create"]');
  if (mode === "welcome") {
    return groups
      .flatMap((group) => group.steps)
      .concat({ ...finish, ...copy.welcomeFinish });
  }
  const start = Math.max(
    0,
    groups.findIndex(
      (group) => path === group.route || path.startsWith(`${group.route}/`),
    ),
  );
  return [...groups.slice(start), ...groups.slice(0, start)]
    .flatMap((group) => group.steps)
    .concat(finish);
}
