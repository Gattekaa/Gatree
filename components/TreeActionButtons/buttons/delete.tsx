import Alert from "@/components/dialog";
import Tooltip from "@/components/tooltip";
import { Button } from "@/components/ui/button";
import { handleDeleteTree } from "@/requests/trees";
import type { Tree } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, Trash } from "lucide-react";
import { useState } from "react";

interface DeleteButtonProps {
  tree: Tree;
}

export default function DeleteButton({ tree }: DeleteButtonProps) {
  const [deletePath, setDeletePath] = useState<string>("")
  const queryClient = useQueryClient()

  const deleteTreeMutation = useMutation({
    mutationFn: async () => await handleDeleteTree(deletePath),
    onSuccess: (response) => {
      queryClient.setQueryData(["user_trees"], (data: Tree[]) => {
        return data.filter((tree) => tree.id !== response.id)
      })
      setDeletePath("")
    }
  })

  return (
    <>
      <Alert
        open={!!deletePath}
        onOpenChange={() => setDeletePath("")}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete the tree and all of its components."
        alertFooter={<>
          <Button disabled={deleteTreeMutation.isPending} onClick={() => setDeletePath("")}>Cancel</Button>
          <Button disabled={deleteTreeMutation.isPending} onClick={() => deleteTreeMutation.mutate()}>
            {
              deleteTreeMutation.isPending ? <Loader2Icon size={20} className="animate-spin" /> : "I'm sure, delete it!"
            }
          </Button>
        </>}
      />
      <Tooltip text="Delete" side="left">
        <Button
          className="text-slate-400 w-8 h-8 text-sm rounded-full z-10"
          onClick={() => tree.path && setDeletePath(tree.path)}
          variant="outline"
          size="icon"
        >
          <Trash size={14} />
        </Button>
      </Tooltip>
    </>
  )
}