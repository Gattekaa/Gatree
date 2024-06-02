"use client"

import type { Tree } from "@prisma/client"
import { MovingBorderContainer } from "../ui/moving-border"
import Link from "next/link"
import Tooltip from "../tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { cn } from "@/lib/utils"
import { DeleteButton, EditButton, QRCodeButton, StatusButton } from "../TreeActionButtons/index"

interface TreeCardProps {
  tree: Tree
}

export default function TreeCard({ tree }: TreeCardProps) {
  const fallbackInitial = tree.title.charAt(0).toUpperCase()
  return (
    <MovingBorderContainer
      key={tree.id}
      borderRadius="12px"
      borderClassName="opacity-0 group-hover:opacity-100 duration-150"
      className="bg-black hover:bg-gray-950 duration-150"
      containerClassName={cn(
        "w-full h-[350px] group duration-150",
        tree.status !== "active" && "opacity-50"
      )}
    >
      <article className="w-full h-full relative backdrop-blur-sm flex flex-col items-center p-6 gap-4">
        <Link href={`/tree/${tree.path}`} className="w-full h-full absolute top-0 left-0 -z-10" />
        <Avatar className="w-[80px] h-[80px] -z-20">
          <AvatarImage src={tree.photo || ""} className="object-cover" />
          <AvatarFallback>{fallbackInitial}</AvatarFallback>
        </Avatar>
        <h2 className="font-bold -z-20 truncate">
          {tree.title}
        </h2>
        <section className="flex flex-col absolute top-4 right-4 gap-2">
          <StatusButton tree={tree} />
          <EditButton tree={tree} />
          <QRCodeButton tree={tree} />
          <DeleteButton tree={tree} />
        </section>
      </article>
      <footer className="absolute bottom-0 w-full flex justify-center py-2">
        <Tooltip
          text={
            <span>
              <p>Total of visits on this tree</p>
              <p className="text-xs opacity-60">Does not include your visits</p>
            </span>
          }
        >
          <small className="opacity-50 text-xs">
            {tree.visits} visit{tree.visits === 1 ? "" : "s"}
          </small>
        </Tooltip>
      </footer>
    </MovingBorderContainer>
  )
}