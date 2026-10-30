"use client";

import { updateTree } from "@/actions/tree";
import type { EditorTranslations } from "@/app/[lang]/(dashboard)/editor/[slug]/client";
import { getLocalePrefix } from "@/lib/i18n/paths";
import { BASE_QUERY_KEYS } from "@/lib/query-keys";
import type { Link, Tree } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

export function useUpdateTreeUrl(
  treeId: string,
  slug: string,
  translations: EditorTranslations,
) {
  const client = useQueryClient();
  const router = useRouter();
  const prefix = getLocalePrefix(usePathname());

  return useMutation({
    mutationFn: async (newSlug: string) => {
      const result = await updateTree(treeId, { slug: newSlug });
      if ("error" in result) throw new Error(result.error);
      return result;
    },
    onSuccess: async (updated) => {
      const oldKey = BASE_QUERY_KEYS.trees.detail(slug);
      await client.cancelQueries({ queryKey: oldKey, exact: true });
      const cached = client.getQueryData<Tree & { links: Link[] }>(oldKey);
      if (cached)
        client.setQueryData(BASE_QUERY_KEYS.trees.detail(updated.slug), {
          ...cached,
          ...updated,
        });
      void client.invalidateQueries({ queryKey: BASE_QUERY_KEYS.trees.list() });
      void client.invalidateQueries({
        queryKey: [...BASE_QUERY_KEYS.trees.all, "slug"],
      });
      // Do not refetch the obsolete slug while its editor is still mounted.
      router.replace(`${prefix}/editor/${updated.slug}`);
      toast.success(translations.editor.urlEditor.saved);
    },
    onError: (error) => {
      const key = error.message.replace(
        "errors.",
        "",
      ) as keyof typeof translations.errors;
      toast.error(translations.errors[key] || translations.errors.updateSlug);
    },
  });
}
