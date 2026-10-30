import type { Link, LinkType, Tree, TreeStatus } from "@prisma/client";

export type TreeWithLinks = Tree & { links: Link[] };
export type TreeWithCounts = Tree & {
  views: number;
  clicks: number;
};

export interface TreeUpdate {
  title: string;
  description: string | null;
  slug: string;
  status: TreeStatus;
  avatar: string | null;
  background: BackgroundConfig | null;
  linkStyle: LinkStyleConfig | null;
  theme: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface BackgroundConfig {
  type: "solid" | "gradient" | "image" | "animated";
  value: string;
  config?: Record<string, unknown>;
}

export interface LinkStyleConfig {
  variant: "filled" | "outlined" | "brutal";
  radius: "sharp" | "rounded" | "pill";
  bgColor: string;
  textColor: string;
  shadowColor?: string;
}

export interface LinkCreate {
  label: string;
  url: string;
  icon?: string;
  type: LinkType;
  bgColor?: string;
  textColor?: string;
}

export interface LinkUpdate {
  label: string;
  url: string;
  icon: string | null;
  type: LinkType;
  enabled: boolean;
  bgColor: string | null;
  textColor: string | null;
}

export type Period = "today" | "7d" | "30d" | "90d" | "custom";

export interface PeriodRange {
  start: Date;
  end: Date;
}

export interface AnalyticsOverview {
  totalViews: number;
  totalViewsPrevious: number;
  uniqueVisitors: number;
  uniqueVisitorsPrevious: number;
  totalClicks: number;
  totalClicksPrevious: number;
  avgCTR: number;
  avgCTRPrevious: number;
  topLink: { label: string; clicks: number } | null;
}

export interface TimeSeriesData {
  date: string;
  count: number;
  previousCount?: number;
}

export interface LinkClickData {
  linkId: string;
  label: string;
  icon: string | null;
  clicks: number;
  clicksPrevious: number;
  ctr: number;
}

export interface DeviceData {
  device: string;
  count: number;
  percentage: number;
}

export interface CountryData {
  country: string;
  countryName: string;
  count: number;
  percentage: number;
}

export interface LocationData {
  name: string;
  parentName?: string;
  count: number;
  percentage: number;
}

export interface ReferrerData {
  referrer: string;
  count: number;
  percentage: number;
}

export interface Insight {
  id: string;
  type: "growth" | "decline" | "peak" | "recommendation";
  icon: string;
  title: string;
  description: string;
  value: number;
  generatedAt: Date;
}

export interface IconOption {
  name: string;
  label: string;
  category: "social" | "generic";
}

export interface ThemePreset {
  id: string;
  name: string;
  background: BackgroundConfig;
  linkStyle: LinkStyleConfig;
}
