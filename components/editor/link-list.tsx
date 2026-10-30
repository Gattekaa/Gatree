"use client";

import type { EditorTranslations } from "@/app/[lang]/(dashboard)/editor/[slug]/client";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Link } from "@prisma/client";
import { LinkItem } from "./link-item";

interface LinkListProps {
  links: Link[];
  onReorder: (links: Link[]) => void;
  onEdit: (link: Link) => void;
  onDelete: (linkId: string, returnFocus: HTMLButtonElement | null) => void;
  onToggle: (linkId: string, enabled: boolean) => void;
  translations: EditorTranslations;
}

export function LinkList({
  links,
  onReorder,
  onEdit,
  onDelete,
  onToggle,
  translations,
}: LinkListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex);
    onReorder(reordered);
  }

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center border border-dashed border-brutal-green py-12 text-center">
        <p className="break-words text-brutal-green text-sm leading-[1.5]">
          {translations.editor.emptyLinks}
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={links.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {links.map((link) => (
            <LinkItem
              key={link.id}
              link={link}
              onEdit={() => onEdit(link)}
              onDelete={(returnFocus) => onDelete(link.id, returnFocus)}
              onToggle={(enabled) => onToggle(link.id, enabled)}
              translations={translations}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
