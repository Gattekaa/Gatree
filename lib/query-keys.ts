

export const BASE_QUERY_KEYS = {

  trees: {
    all: ["trees"] as const,
    list: () => [...BASE_QUERY_KEYS.trees.all, "list"] as const,
    detail: (slug: string) => [...BASE_QUERY_KEYS.trees.all, "detail", slug] as const,
    slugAvailability: (slug: string) => [...BASE_QUERY_KEYS.trees.all, "slug", slug] as const,
  },

  links: {
    all: ["links"] as const,
    byTree: (treeId: string) => [...BASE_QUERY_KEYS.links.all, "tree", treeId] as const,
    detail: (linkId: string) => [...BASE_QUERY_KEYS.links.all, "detail", linkId] as const,
  },

  analytics: {
    all: ["analytics"] as const,
    overview: (treeId: string, period: string) =>
      [...BASE_QUERY_KEYS.analytics.all, "overview", treeId, period] as const,
    viewsTimeSeries: (treeId: string, period: string) =>
      [...BASE_QUERY_KEYS.analytics.all, "views-time-series", treeId, period] as const,
    clicksByLink: (treeId: string, period: string) =>
      [...BASE_QUERY_KEYS.analytics.all, "clicks-by-link", treeId, period] as const,
    devices: (treeId: string, period: string) =>
      [...BASE_QUERY_KEYS.analytics.all, "devices", treeId, period] as const,
    countries: (treeId: string, period: string) =>
      [...BASE_QUERY_KEYS.analytics.all, "countries", treeId, period] as const,
    referrers: (treeId: string, period: string) =>
      [...BASE_QUERY_KEYS.analytics.all, "referrers", treeId, period] as const,
    insights: (treeId: string) =>
      [...BASE_QUERY_KEYS.analytics.all, "insights", treeId] as const,
    byTree: (treeId: string) =>
      [...BASE_QUERY_KEYS.analytics.all, treeId] as const,
  },

  user: {
    all: ["user"] as const,
    session: () => [...BASE_QUERY_KEYS.user.all, "session"] as const,
  },

  shortLinks: {
    all: ["short-links"] as const,
    list: (search?: string, page?: number) =>
      [...BASE_QUERY_KEYS.shortLinks.all, "list", search ?? "", page ?? 1] as const,
    detail: (slug: string) =>
      [...BASE_QUERY_KEYS.shortLinks.all, "detail", slug] as const,
    kpis: () => [...BASE_QUERY_KEYS.shortLinks.all, "kpis"] as const,
    analytics: (slug: string, period: string) =>
      [...BASE_QUERY_KEYS.shortLinks.all, "analytics", slug, period] as const,
    slugAvailability: (slug: string) =>
      [...BASE_QUERY_KEYS.shortLinks.all, "slug-check", slug] as const,
  },
} as const;
