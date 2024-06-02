"use server"

import TreeContainer from "@/components/treeContainer"
import { cookies } from 'next/headers'

export default async function EditTree({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const tree = await fetch(`${process.env.FRONTEND_BASE_URL}/api/tree/${params.id}`, {
    cache: "no-cache",
    headers: {
      ...(token && { Authorization: token.value })
    }
  }).then((res) => res.json())
  return (
    <TreeContainer tree_id={tree.path} tree={tree} />
  )
}