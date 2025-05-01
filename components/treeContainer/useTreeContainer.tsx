import { useDebounce } from "@/helpers/useDebounce";
import {
  batchUpdateTreeLinks,
  handleAvailablePath,
  handleDeleteTreeLink,
  handleEditTree,
  handleNewTreeLink,
  handleToggleTreeDisableLink,
} from "@/requests/trees";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Component, Tree } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DisabledInfoProps } from ".";

type Props = {
  treeData: Tree & { components: Component[] };
  tree_id: string;
};

export function useTreeContainer({ treeData, tree_id }: Props) {
  const { push } = useRouter();

  const [tree, setTree] = useState(treeData);
  const [components, setComponents] = useState<Component[]>(
    treeData.components ?? [],
  );
  const [deleteId, setDeleteId] = useState<string>("");
  const [disabledInfo, setDisabledInfo] = useState<DisabledInfoProps>();
  const [newLink, setNewLink] = useState<boolean>(false);
  const [edit, setEdit] = useState<Component>({} as Component);
  const [positionChanged, setPositionChanged] = useState<boolean>(false);

  const [editButtonColor, setEditButtonColor] = useState({
    openModal: false,
    color: "",
  });

  const [editTextColor, setEditTextColor] = useState({
    openModal: false,
    color: "",
  });

  const formSchema = z.object({
    title: z.string().min(1, "Name is required"),
    url: z.string().min(1, "URL is required"),
    outlined: z.boolean().optional(),
    type: z.enum(["component", "youtube-video"]),
  });

  const updatePathSchema = z
    .object({
      path: z.string().min(1, "Path is required"),
      path_available: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.path_available) {
        ctx.addIssue({
          code: "custom",
          message: "Path is not available",
        });
      }
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    values: {
      title: edit.label ?? "My awesome link",
      url: edit.url ?? "",
      backgroundColor: edit.backgroundColor ?? "",
      outlined: edit.outlined ?? false,
      type: edit.type ?? "component",
    },
  });

  const updatePathForm = useForm({
    resolver: zodResolver(updatePathSchema),
    values: {
      path: tree.path,
      path_available: false,
    },
  });

  const outlinedChanges = form.watch("outlined");
  const fallbackInitial = tree?.title?.[0]?.toUpperCase();

  const newLinkMutation = useMutation({
    mutationFn: () =>
      handleNewTreeLink(
        tree.id,
        form.getValues("title"),
        form.getValues("url"),
        editButtonColor.color,
        editTextColor.color,
        form.getValues("outlined"),
        form.getValues("type"),
      ),
    onSuccess: (response: Component) => {
      const updated = [...components, response];
      setTree({ ...tree, components: updated });
      setComponents(updated);
      setNewLink(false);
      form.reset();
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.error);
      }
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (id: string) => handleDeleteTreeLink(id),
    onSuccess: (response) => {
      const filtered = tree.components.filter((c) => c.id !== response.id);
      setTree({ ...tree, components: filtered });
      setComponents(filtered);
      setDeleteId("");
    },
  });

  const toggleLinkDisabledMutation = useMutation({
    mutationFn: (data: DisabledInfoProps) =>
      handleToggleTreeDisableLink(data.id, data.disabled),
    onSuccess: (response) => {
      setTree({
        ...tree,
        components: tree.components.map((component) => {
          if (component.id === response.id) {
            return { ...component, disabled: response.disabled };
          }
          return component;
        }),
      });

      setDisabledInfo(undefined);
      setComponents((components) => {
        return components.map((component) => {
          if (component.id === response.id) {
            return { ...component, disabled: response.disabled };
          }
          return component;
        });
      });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.error);
      }
    },
  });

  const editTreeMutation = useMutation({
    mutationFn: (action?: string) =>
      handleEditTree({
        id: tree_id,
        backgroundColor:
          action === "remove" ? undefined : (tree.backgroundColor ?? undefined),
        theme: tree.theme ?? undefined,
        path: updatePathForm.getValues("path") ?? undefined,
      }),
    onSuccess: (response) => {
      if (response.path !== treeData.path) {
        push(`/edit/tree/${response.path}`);
      }
      setTree({
        ...tree,
        title: response.title,
        backgroundColor: response.backgroundColor,
      });
    },
  });

  const batchUpdateLinksMutation = useMutation({
    mutationFn: () => batchUpdateTreeLinks(treeData.id, components),
    onSuccess: () => {
      setPositionChanged(false);
      toast.success("Links position updated successfully");
    },
    onError: () => {
      setComponents(treeData.components);
    },
  });

  const availablePathMutation = useMutation({
    mutationFn: async () => {
      const path = updatePathForm.getValues("path");
      if (path === tree.path) {
        return { available: true };
      }
      if (path) {
        return await handleAvailablePath(path);
      }
      throw new Error("Path cannot be null");
    },
    onSuccess: (data) => {
      updatePathForm.clearErrors("path");
      updatePathForm.setValue("path_available", data.available);
      if (!data.available) {
        updatePathForm.setError("path", {
          type: "manual",
          message: "Path is not available",
        });
      }
    },
  });

  const hasPathChanged = useDebounce(updatePathForm.watch("path") ?? "", 500);

  useEffect(() => {
    if (hasPathChanged) {
      availablePathMutation.mutate();
    }
  }, [hasPathChanged]);

  useEffect(() => {
    const baseColor = "rgb(248 250 252)";
    if (form.getValues("outlined")) {
      setEditButtonColor({
        openModal: false,
        color: edit.backgroundColor ?? baseColor,
      });
      setEditTextColor({
        openModal: false,
        color: edit.textColor ?? baseColor,
      });
    } else {
      setEditButtonColor({
        openModal: false,
        color: edit.backgroundColor ?? "",
      });
      setEditTextColor({
        openModal: false,
        color: edit.textColor ?? "",
      });
    }
  }, [outlinedChanges]);

  function handleBackgroundChange(action = "change") {
    editTreeMutation.mutate(action);
  }

  const handleReorder = (newOrder: Component[]) => {
    setPositionChanged(true);
    setComponents(newOrder);
  };

  return {
    tree,
    setTree,
    deleteId,
    setDeleteId,
    disabledInfo,
    setDisabledInfo,
    newLink,
    setNewLink,
    edit,
    setEdit,
    components,
    setComponents,
    positionChanged,
    setPositionChanged,
    editButtonColor,
    setEditButtonColor,
    editTextColor,
    setEditTextColor,
    form,
    updatePathForm,
    handleBackgroundChange,
    newLinkMutation,
    deleteLinkMutation,
    toggleLinkDisabledMutation,
    editTreeMutation,
    batchUpdateLinksMutation,
    availablePathMutation,
    handleReorder,
    fallbackInitial,
  };
}
