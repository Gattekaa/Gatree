"use client";

import { createLink, deleteLink, reorderLinks, setPriorityLink, toggleLink, updateLink } from "@/actions/link";
import { updateTree } from "@/actions/tree";
import { BASE_QUERY_KEYS } from "@/lib/query-keys";
import type { Link, Tree } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type TreeWithLinks = Tree & { links: Link[] };

async function fetchTreeDetail(slug: string): Promise<TreeWithLinks> {
  const res = await fetch(`/api/trees/${slug}`);
  if (!res.ok) throw new Error("Failed to fetch tree");
  return res.json();
}

export function useTreeDetail(slug: string) {
  return useQuery({
    queryKey: BASE_QUERY_KEYS.trees.detail(slug),
    queryFn: () => fetchTreeDetail(slug),
    enabled: !!slug,
  });
}

export function useUpdateTree(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ treeId, data }: { treeId: string; data: { title?: string; description?: string | null; slug?: string; status?: "ACTIVE" | "INACTIVE" } }) => {
      const result = await updateTree(treeId, data);
      if (result && "error" in result) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BASE_QUERY_KEYS.trees.detail(slug) });
      queryClient.invalidateQueries({ queryKey: BASE_QUERY_KEYS.trees.list() });
    },
  });
}

export function useCreateLink(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ treeId, data }: {
      treeId: string;
      data: Parameters<typeof createLink>[1];
    }) => {
      const result = await createLink(treeId, data);
      if (result && "error" in result) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BASE_QUERY_KEYS.trees.detail(slug) });
    },
  });
}

export function useUpdateLink(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId, data }: {
      linkId: string;
      data: Parameters<typeof updateLink>[1];
    }) => {
      const result = await updateLink(linkId, data);
      if (result && "error" in result) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BASE_QUERY_KEYS.trees.detail(slug) });
    },
  });
}

export function useDeleteLink(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      const result = await deleteLink(linkId);
      if (result && "error" in result) throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BASE_QUERY_KEYS.trees.detail(slug) });
    },
  });
}

export function useReorderLinks(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ treeId, orderedIds }: { treeId: string; orderedIds: string[] }) => {
      const result = await reorderLinks(treeId, orderedIds);
      if (result && "error" in result) throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BASE_QUERY_KEYS.trees.detail(slug) });
    },
  });
}

export function useToggleLink(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId, enabled }: { linkId: string; enabled: boolean }) => {
      const result = await toggleLink(linkId, enabled);
      if (result && "error" in result) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BASE_QUERY_KEYS.trees.detail(slug) });
    },
  });
}

export function usePriorityLink(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId, priority }: { linkId: string; priority: boolean }) => {
      const result = await setPriorityLink(linkId, priority);
      if (result && "error" in result) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BASE_QUERY_KEYS.trees.detail(slug) });
    },
  });
}
