import { Reorder, useDragControls } from "framer-motion";
import { Grip, MoreHorizontal } from "lucide-react";

// Dropdown Menu Imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Component } from "@prisma/client";
import type { Dispatch, SetStateAction } from "react";
import type { DisabledInfoProps } from "../treeContainer";
import { Button } from "../ui/button";
import { YoutubeVideo } from "../youtubeVideo";

interface TreeItemProps {
  component: Component;
  setEdit: (component: Component) => void;
  setEditButtonColor: Dispatch<
    SetStateAction<{ openModal: boolean; color: string }>
  >;
  setEditTextColor: Dispatch<
    SetStateAction<{
      openModal: boolean;
      color: string;
    }>
  >;
  setDeleteId: (id: string) => void;
  setDisabledInfo: (info: DisabledInfoProps) => void;
}

export default function TreeItem({
  component,
  setEdit,
  setEditButtonColor,
  setEditTextColor,
  setDeleteId,
  setDisabledInfo,
}: Readonly<TreeItemProps>) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      className="bg-gray-500/5 backdrop-blur-lg pb-4 flex flex-col rounded-md border border-transparent hover:border-white/20"
      key={component.position}
      animate={{ opacity: 1 }}
      dragControls={controls}
      dragListener={false}
      style={{ touchAction: "none" }}
      value={component}
      as="li"
    >
      <div
        style={{
          opacity: (component.disabled ?? true) ? 0.3 : 1,
        }}
      >
        <header className="flex px-4 py-2 justify-between items-center select-none">
          <Grip
            size={18}
            onPointerDown={(e) => controls.start(e)}
            className="cursor-grab"
            style={{ touchAction: "none" }}
          />

          <span className="text-sm font-medium text-gray-400">
            {(component.disabled ?? true) ? "Disabled" : "Enabled"}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setDeleteId(component.id)}>
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setDisabledInfo({
                    id: component.id,
                    disabled: !(component.disabled ?? true),
                  })
                }
              >
                {(component.disabled ?? true) ? "Enable" : "Disable"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setEdit(component);
                  setEditButtonColor({
                    openModal: false,
                    color: component.backgroundColor ?? "",
                  });
                  setEditTextColor({
                    openModal: false,
                    color: component.textColor ?? "",
                  });
                }}
              >
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="px-4 select-none">
          {component.type === "youtube-video" ? (
            <YoutubeVideo url={component.url} />
          ) : (
            <Button
              className="select-none"
              style={{
                ...(component.outlined && {
                  outlineWidth: "2px",
                  outlineColor: component.backgroundColor ?? undefined,
                  outlineStyle: "solid",
                }),
                background: !component.outlined
                  ? (component.backgroundColor ?? undefined)
                  : "transparent",
                color: component.textColor ?? undefined,
              }}
              variant="tree_link"
            >
              {component.label}
            </Button>
          )}
        </div>
      </div>
    </Reorder.Item>
  );
}
