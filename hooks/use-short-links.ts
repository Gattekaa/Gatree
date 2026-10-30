"use client";

import { createShortLink, deleteShortLink, updateShortLink } from "@/actions/short-link";
import { BASE_QUERY_KEYS } from "@/lib/query-keys";
import type { CreateShortLinkInput, UpdateShortLinkInput } from "@/lib/validations";
import type { ShortLink } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface ShortLinksResponse {
  data: ShortLink[];
  total: number;
  page: number;
  totalPages: number;
}

interface ShortLinkKPIs {
  totalLinks: number;
  totalClicks30d: number;
  topLink: { slug: string; clicks: number } | null;
}

interface ShortLinkAnalyticsResponse {
  totalClicks: number;
  uniqueVisitors: number;
  uniqueVisitorsPrevious: number;
  percentageChange: number;
  timeSeries: { date: string; clicks: number }[];
  devices: { device: string; count: number; percentage: number }[];
  countries: { country: string; count: number; percentage: number }[];
  regions: { name: string; parentName?: string; count: number; percentage: number }[];
  cities: { name: string; parentName?: string; count: number; percentage: number }[];
  referrers: { referrer: string; count: number; percentage: number }[];
  insights: {
    id: string;
    type: string;
    icon: string;
    title: string;
    description: string;
    value: number;
    generatedAt: string;
  }[];
  hasEnoughData: boolean;
}

export function useShortLinks(search?: string, page?: number) {
  return useQuery({
    queryKey: BASE_QUERY_KEYS.shortLinks.list(search, page),
    queryFn: async (): Promise<ShortLinksResponse> => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (page) params.set("page", String(page));
      const res = await fetch(`/api/short-links?${params}`);
      if (!res.ok) throw new Error("Failed to fetch short links");
      return res.json();
    },
  });
}

export function useShortLink(slug: string) {
  return useQuery({
    queryKey: BASE_QUERY_KEYS.shortLinks.detail(slug),
    queryFn: async (): Promise<ShortLink> => {
      const res = await fetch(`/api/short-links/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch short link");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useShortLinkKPIs() {
  return useQuery({
    queryKey: BASE_QUERY_KEYS.shortLinks.kpis(),
    queryFn: async (): Promise<ShortLinkKPIs> => {
      const res = await fetch("/api/short-links/kpis");
      if (!res.ok) throw new Error("Failed to fetch KPIs");
      return res.json();
    },
  });
}

export function useShortLinkAnalytics(slug: string, period: string) {
  return useQuery({
    queryKey: BASE_QUERY_KEYS.shortLinks.analytics(slug, period),
    queryFn: async (): Promise<ShortLinkAnalyticsResponse> => {
      const res = await fetch(`/api/short-links/${slug}/analytics?period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: !!slug,
    refetchInterval: 60_000,
  });
}

export function useCreateShortLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateShortLinkInput) => {
      const result = await createShortLink(data);
      if ("error" in result) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BASE_QUERY_KEYS.shortLinks.all });
    },
  });
}

export function useUpdateShortLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateShortLinkInput }) => {
      const result = await updateShortLink(id, data);
      if ("error" in result) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BASE_QUERY_KEYS.shortLinks.all });
    },
  });
}

export function useDeleteShortLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteShortLink(id);
      if (result && "error" in result) throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BASE_QUERY_KEYS.shortLinks.all });
    },
  });
}
