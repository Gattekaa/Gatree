import Tooltip from "@/components/tooltip"
import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"
import { handleTreeStatusToggle } from "@/requests/trees"
import type { Tree } from "@prisma/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Power } from "lucide-react"

interface StatusButtonProps {
  tree: Tree
}

export default function StatusButton({ tree }: StatusButtonProps) {
  const queryClient = useQueryClient()
  const toggleTreeStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => await handleTreeStatusToggle(id, status),
    onSuccess: (data) => {
      queryClient.setQueryData(["user_trees"], (trees: Tree[]) => {
        return trees.map((tree) => {
          if (tree.id === data.id) {
            return data
          }
          return tree
        })
      })
    }
  })

  return (
    <Tooltip
      text={`${tree.status === "active" ? "Deactivate" : "Activate"} tree`}
      side="left"
    >
      <Toggle
        variant="outline"
        className="w-8 h-8 p-0 rounded-full text-slate-400 bg-slate-950 border-slate-800 "
        onClick={() => tree.path && toggleTreeStatusMutation.mutate({ id: tree.path, status: tree.status })}
      >
        <Power size={14} className={cn(
          tree.status !== "active" && "opacity-50"
        )} />
      </Toggle>
    </Tooltip>
  )
}