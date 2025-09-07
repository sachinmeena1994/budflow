
import React, { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { cn } from "@/lib/utils";

// This interface can be used directly as a type or extended
export interface DraggableItem {
  id: string;
  label?: string;
  isVisible?: boolean;
}

// Make the items type flexible - either string or DraggableItem
export type DraggableListItem = string | DraggableItem;

interface DraggableListProps<T extends DraggableListItem> {
  items: T[];
  onChange: (items: T[]) => void;
  onSelect?: (item: T, index: number) => void;
  selectedItem?: string;
  className?: string;
  itemClassName?: string;
  selectedItemClassName?: string;
  disabled?: boolean;
  renderItem?: (item: T, index: number) => React.ReactNode;
  onVisibilityChange?: (item: T, isVisible: boolean) => void;
  showVisibilityToggle?: boolean;
  compact?: boolean;
}

export function DraggableList<T extends DraggableListItem>({
  items,
  onChange,
  onSelect,
  selectedItem,
  className,
  itemClassName,
  selectedItemClassName = "bg-muted",
  disabled = false,
  renderItem,
  onVisibilityChange,
  showVisibilityToggle = false,
  compact = false,
}: DraggableListProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => 
        typeof item === 'string' ? item === active.id : item.id === active.id
      );
      const newIndex = items.findIndex((item) => 
        typeof item === 'string' ? item === over.id : item.id === over.id
      );
      
      onChange(arrayMove(items, oldIndex, newIndex));
    }
    
    setActiveId(null);
  };

  const getItemId = (item: T): string => {
    return typeof item === 'string' ? item : item.id;
  };
  
  const getItemLabel = (item: T): string => {
    if (typeof item === 'string') {
      return item;
    } else if (item.label) {
      return item.label;
    } else {
      return item.id;
    }
  };

  const handleClick = (item: T, index: number) => {
    if (onSelect && !disabled) {
      onSelect(item, index);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={(event) => setActiveId(String(event.active.id))}
    >
      <SortableContext 
        items={items.map(item => getItemId(item))}
        strategy={verticalListSortingStrategy}
      >
        <div className={cn("space-y-1", className)}>
          {items.map((item, index) => {
            const id = getItemId(item);
            const isSelected = selectedItem === id;
            
            return (
              <SortableItem
                key={id}
                id={id}
                disabled={disabled}
                className={cn(
                  "p-2 rounded-md border cursor-pointer transition-colors",
                  isSelected && selectedItemClassName,
                  compact ? "p-1" : "",
                  itemClassName
                )}
                onClick={() => handleClick(item, index)}
              >
                {renderItem ? renderItem(item, index) : getItemLabel(item)}
              </SortableItem>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
