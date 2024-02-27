// Sheet Imports
import {
  Sheet,
  SheetContent,

  SheetTrigger,
} from "@/components/ui/sheet"
import Tooltip from "../tooltip";
import { Button } from "../ui/button";
import { PaletteIcon } from "lucide-react";
import ColorPicker from "react-best-gradient-color-picker";
import ThemePicker from "../themePicker";
import type { Component, Tree } from "@prisma/client";

export default function BackgroundChange({
  tree,
  theme,
  handleBackgroundChange,
  editTreeMutation,
  treeId,
  setTree
}: {
  tree: Tree & { components: Component[] },
  theme: string,
  handleBackgroundChange: (action?: "remove") => void,
  editTreeMutation: { isPending: boolean },
  treeId: string,
  setTree: React.Dispatch<React.SetStateAction<Tree & { components: Component[] }>>
}) {
  return (
    <Sheet onOpenChange={() => handleBackgroundChange()}>
      <SheetTrigger>
        <Tooltip text="Change background color">
          <Button asChild size="icon" className="rounded-full">
            <p>
              <PaletteIcon size={20} />
            </p>
          </Button>
        </Tooltip>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-10 overflow-y-auto justify-between items-center border-l-slate-800">
        <ColorPicker
          value={tree.backgroundColor || undefined}
          onChange={(color) => setTree((prev) => ({ ...prev, backgroundColor: color, theme: null }))}
          className="pt-8"
        />

        <ThemePicker
          initialTheme={theme}
          treeId={treeId}
          setTree={setTree}
        />
        <Button
          disabled={editTreeMutation.isPending}
          className="w-full"
          onClick={() => {
            handleBackgroundChange("remove");
            setTree((prev) => ({ ...prev, theme: null, backgroundColor: null }));
          }}
        >
          Remove background
        </Button>
      </SheetContent>
    </Sheet>
  )
}