import api from "@/connection";
import type { Component, Tree, User } from "@prisma/client";

export async function getUserTrees() {
  const { data } = await api.get("/tree");
  return data;
}

export async function handleNewTree(title: string, status: string) {
  const { data } = await api.post("/tree", { title, status });
  return data;
}

export async function handleDeleteTree(id: string) {
  const { data } = await api.delete(`/tree/${id}`);
  return data;
}

export async function handleEditTree({
  id,
  title,
  backgroundColor,
  theme,
}: {
  id: string;
  title?: string;
  backgroundColor?: string;
  theme?: string;
}) {
  const { data } = await api.patch(`/tree/${id}`, {
    title: title,
    backgroundColor: backgroundColor ?? null,
    theme: theme ?? null,
  });
  return data;
}

export async function handleTreeStatusToggle(
  id: string,
  status: string,
): Promise<Tree> {
  const newStatus = status === "active" ? "inactive" : "active";
  const { data } = await api.patch(`/tree/${id}`, { status: newStatus });
  return data;
}

export async function getTree(
  id: string,
): Promise<Tree & { user: User; components: Component[] }> {
  const { data } = await api.get(`/tree/${id}`);
  return data;
}

export async function getTreeQRCode(id: string) {
  const { data } = await api.get(`/qrcode/tree/${id}`);
  return data;
}

export async function handleNewTreeLink(
  tree_id: string,
  label: string,
  url: string,
  backgroundColor: string | undefined,
  textColor: string | undefined,
  outlined: boolean,
): Promise<Component> {
  const { data } = await api.post("/component", {
    tree_id,
    label,
    url,
    backgroundColor,
    textColor,
    outlined,
  });
  return data;
}

export async function handleDeleteTreeLink(id: string) {
  const { data } = await api.delete(`/component/${id}`);
  return data;
}

export async function handleEditTreeLink(
  id: string,
  label: string,
  url: string,
  backgroundColor: string | undefined,
  textColor: string | undefined,
  outlined: boolean,
) {
  const { data } = await api.patch(`/component/${id}`, {
    label,
    url,
    backgroundColor,
    textColor,
    outlined,
  });
  return data;
}

export async function handleTreeUploadPhoto(
  id: string,
  file: File | null,
): Promise<Tree> {
  if (!file) {
    throw new Error("No file provided");
  }
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post(
    `/tree/${id}/photo?filename=${file.name}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
}
