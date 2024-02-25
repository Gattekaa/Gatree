import api from "@/connection";
import type { Tree } from "@prisma/client";

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
}: {
  id: string;
  title?: string;
  backgroundColor?: string;
}) {
  const { data } = await api.patch(`/tree/${id}`, {
    title: title,
    backgroundColor: backgroundColor ?? null,
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

export async function getTree(id: string) {
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
): Promise<Tree> {
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
