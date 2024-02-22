"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getTree } from "@/requests/trees"
import type { Component } from "@prisma/client"
import { Label } from "@radix-ui/react-label"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

export default function TreePage({ params }: { params: { id: string } }) {

  const tree_id = params.id
  const { data: tree, isPending: isTreeLoading } = useQuery({
    queryKey: ["tree"],
    queryFn: () => getTree(tree_id),
  })

  const usernameInitial = tree?.user?.username?.[0]?.toUpperCase()
  const userAvatar = tree?.user?.avatar

  return (
    <main
      style={{ background: tree?.backgroundColor }}
      className="w-full h-full flex flex-col items-center"
    >
      <div className="w-full md:w-[500px] px-4 py-24 flex flex-col gap-10">
        <div className="flex flex-col flex-1 items-center gap-4">
          {
            isTreeLoading ? (
              <Skeleton className="w-[100px] h-[100px] rounded-full" />
            ) : (
              <Avatar className="w-[100px] h-[100px]">
                <AvatarImage src={userAvatar} />
                <AvatarFallback>{usernameInitial}</AvatarFallback>
              </Avatar>
            )
          }
          <Label className="text-xl">
            {
              isTreeLoading ? (
                <Skeleton className="w-28 h-7 rounded-full" />
              ) : (
                tree?.title
              )
            }
          </Label>
        </div>
        <ul className="flex flex-col gap-6">
          {
            isTreeLoading && (
              Array.from({ length: 5 }).map((_, index) => (
                <li key={index} className="bg-gray-500/10 pb-4 flex flex-col px-4">
                  <header className="flex py-2 justify-end">
                    <Skeleton className="w-8 h-8 rounded-md" />
                  </header>
                  <Skeleton className="w-full h-[50px] rounded-full" />
                </li>
              )))
          }
          {
            tree?.components?.map((component: Component) => {
              const linkHasMethod = component.url.startsWith("http")
              const link = linkHasMethod ? component.url : `//${component.url}`
              return (
                (
                  <li key={component.id} >
                    <Button
                      style={{ background: component.backgroundColor || undefined, color: component.textColor || undefined }}
                      variant="tree_link"
                      asChild
                    >
                      <Link href={link}>{component.label}</Link>
                    </Button>
                  </li>
                )
              )
            })
          }
        </ul>
      </div>
    </main>
  )
}