"use server"

import TreeContainer from "@/components/treeContainer"

export default async function EditTree({ params }: { params: { id: string } }) {
  const tree = await fetch(`${process.env.FRONTEND_BASE_URL}/api/tree/${params.id}`, {
    cache: "no-cache",
  }).then((res) => res.json())
  return (
    <TreeContainer tree_id={params.id} tree={tree} />
  )
}