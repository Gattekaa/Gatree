"use client";

import { createTree, deleteTree, updateTree } from "@/actions/tree";
import { BASE_QUERY_KEYS } from "@/lib/query-keys";
import type { Tree } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type TreeWithCounts = Tree & {
  views: number;
  clicks: number;
};

interface TreesResponse {
  trees: TreeWithCounts[];
  totals: { views: number; clicks: number };
}

async function fetchTrees(): Promise<TreesResponse> {
  const res = await fetch("/api/trees");
  if (!res.ok) throw new Error("Failed to fetch trees");
  return res.json();
}

export function useTrees() {
  return useQuery({
    queryKey: BASE_QUERY_KEYS.trees.list(),
    queryFn: fetchTrees,
  });
}

export function useCreateTree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; slug: string }) => {
      const result = await createTree(data);
      if (result && "error" in result) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BASE_QUERY_KEYS.trees.all });
    },
  });
}

export function useDeleteTree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (treeId: string) => {
      const result = await deleteTree(treeId);
      if (result && "error" in result) throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BASE_QUERY_KEYS.trees.all });
    },
  });
}

export function useToggleTreeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ treeId, status }: { treeId: string; status: "ACTIVE" | "INACTIVE" }) => {
      const result = await updateTree(treeId, { status });
      if (result && "error" in result) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BASE_QUERY_KEYS.trees.all });
    },
  });
}
