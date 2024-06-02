"use server"

import TreeContainer from "@/components/treeContainer"
import { cookies } from 'next/headers'
import { redirect } from "next/navigation"

export default async function EditTree({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  
  const tree = await fetch(`${process.env.FRONTEND_BASE_URL}/api/tree/${params.id}`, {
    cache: "no-cache",
    headers: {
      ...(token && { Authorization: token.value })
    }
  }).then((res) => res.json()).catch(() => redirect("/auth/login"))

  const user = await fetch(`${process.env.FRONTEND_BASE_URL}/api/auth/get_current_user`, {
    cache: "no-cache",
    headers: {
      ...(token && { Authorization: token.value })
    }
  }).then((res) => res.json()).catch(() => redirect("/auth/login"))

  const userId = user?.user?.id
  const isTreeOwner = userId === tree.userId
  const canRender = (tree.id && userId && isTreeOwner)

  if (!isTreeOwner) {
    redirect("/auth/login")
  }

  return (
    canRender && <TreeContainer tree_id={tree.path} tree={tree} />
  )
}