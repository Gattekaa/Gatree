import connection from "@/connection";
import type { Component, Tree, User } from "@prisma/client";

export async function getUserTrees() {
  const { data } = await connection.get("/tree");
  return data;
}

export async function handleNewTree(title: string, status: string) {
  const { data } = await connection.post("/tree", { title, status });
  return data;
}

export async function handleDeleteTree(id: string) {
  const { data } = await connection.delete(`/tree/${id}`);
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
  const { data } = await connection.patch(`/tree/${id}`, {
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
  const { data } = await connection.patch(`/tree/${id}`, { status: newStatus });
  return data;
}

export async function getTree(
  id: string,
): Promise<Tree & { user: User; components: Component[] }> {
  const { data } = await connection.get(`/tree/${id}`);
  return data;
}

export async function getTreeQRCode(id: string) {
  const { data } = await connection.get(`/qrcode/tree/${id}`);
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
  const { data } = await connection.post("/component", {
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
  const { data } = await connection.delete(`/component/${id}`);
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
  const { data } = await connection.patch(`/component/${id}`, {
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
  const { data } = await connection.post(
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

export async function batchUpdateTreeLinks(
  tree_id: string,
  links: Component[],
): Promise<Component[]> {
  const { data } = await connection.post(`tree/${tree_id}/batch_update`, {
    links: links.map((link, idx) => ({ id: link.id, position: idx })),
  });

  return data.components;
}
