import Tooltip from "@/components/tooltip";
import { Button } from "@/components/ui/button";
import type { Tree } from "@prisma/client";
import { Pencil } from "lucide-react";
import Link from "next/link";

interface EditButtonProps {
  tree: Tree
}

export default function EditButton({ tree }: EditButtonProps) {
  return (
    <Tooltip text="Edit" side="left">
      <Button variant="outline" size="icon" className="text-slate-400 w-8 h-8 text-sm rounded-full z-10">
        <Link
          href={`/edit/tree/${tree.path}`}
          className="w-full h-full flex justify-center items-center"
        >
          <Pencil size={14} />
        </Link>
      </Button>
    </Tooltip>
  )
}