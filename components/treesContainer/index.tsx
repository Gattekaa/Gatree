"use client"

import type { Tree } from "@prisma/client"

import { useQuery } from "@tanstack/react-query"
import { getUserTrees } from "@/requests/trees"
import { useUserContext } from "@/context/UserContext"
import AddNewTree from "../AddNewTree"
import TreeCard from "../TreeCard"
import TreeCardSkeleton from "../treeCardSkeleton"

export default function TreesContainer() {
  const { user } = useUserContext()
  const { data: trees, error: errorOnGetUserTrees, isPending: isUserTreesLoading } = useQuery({
    queryKey: ["user_trees"],
    queryFn: getUserTrees,
    enabled: !!user,
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between py-4">
        <h1 className="text-2xl font-bold text-center">Your Trees</h1>
      </div>
      <section className="grid grid-flow-row grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {!isUserTreesLoading && <AddNewTree />}
        {isUserTreesLoading && Array.from({ length: 4 }).map((_, index) => (
          <TreeCardSkeleton key={index} />
        ))}
        {!isUserTreesLoading && trees?.map((tree: Tree) => (
          <TreeCard key={tree.id} tree={tree} />
        ))}
      </section>
    </div >
  )
}