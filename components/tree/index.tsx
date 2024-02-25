"use client"

import { getTree } from "@/requests/trees"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "../ui/skeleton"
import { Button } from "../ui/button"
import type { Component } from "@prisma/client"
import Link from "next/link"
import AnimatedBackground from "../animatedBackground"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Label } from "../ui/label"

export default function Tree({ tree_id }: { tree_id: string }) {
  const { data: tree, isPending: isTreeLoading } = useQuery({
    queryKey: ["tree"],
    queryFn: () => getTree(tree_id),
  })

  const fallbackInitial = tree?.title?.[0]?.toUpperCase()
  return (
    <AnimatedBackground>
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
                  <AvatarImage src={tree.photo} className="object-cover" />
                  <AvatarFallback>{fallbackInitial}</AvatarFallback>
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
                  <li key={index}>
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
                        style={{
                          ...(component.outlined && {
                            outlineWidth: "2px",
                            outlineColor: component.backgroundColor || undefined,
                            outlineStyle: "solid",
                          }),
                          background: !component.outlined ? component.backgroundColor || undefined : "transparent",
                          color: component.textColor || undefined,

                        }}
                        variant="tree_link"
                        className="hover:opacity-60 !duration-150"
                        asChild
                      >
                        <Link href={link} target="_blank" rel="noreferrer">{component.label}</Link>
                      </Button>
                    </li>
                  )
                )
              })
            }
          </ul>
        </div>
      </main>
    </AnimatedBackground>
  )
}