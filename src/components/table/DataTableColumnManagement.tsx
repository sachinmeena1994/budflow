import React, { useState, useEffect } from 'react';
import { Table } from '@tanstack/react-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DraggableList } from '@/components/molecules/DraggableList';
// import { ColumnConfig } from './types';
import { RefreshCcw } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { TableColumn } from '@/types/table';

export interface ColumnConfig {
  id: string;
  label: string;
  isVisible: boolean;
}

interface DataTableColumnManagementProps<TData> {
  isOpen: boolean;
  onClose: () => void;
  columns: TableColumn[];
  table: Table<TData>;
  defaultColumnConfig?: ColumnConfig[];
  alwaysVisibleColumnIds?: string[];
  onReset?: () => void;
}

export function DataTableColumnManagement<TData>({
  isOpen,
  onClose,
  columns,
  table,
  defaultColumnConfig,
  onReset,
  alwaysVisibleColumnIds = [],
}: DataTableColumnManagementProps<TData>) {
  const [columnItems, setColumnItems] = useState<ColumnConfig[]>([]);

  // Reset column items when dialog opens
  useEffect(() => {
    if (isOpen) {
      const columnOrder = table.getState().columnOrder;

      // Get all available columns and filter out any that shouldn't be in the dialog
      const availableColumns = table
        .getAllColumns()
        .filter((column) => column.id !== 'select' && column.getCanHide());

      // Map columns to ColumnConfig format
      const items: ColumnConfig[] = columnOrder
        .filter((columnId) => availableColumns.some((col) => col.id === columnId))
        .map((columnId) => {
          const column = table.getColumn(columnId);
          return {
            id: columnId,
            label:
              typeof column?.columnDef.header === 'string' ? column.columnDef.header : columnId,
            isVisible: column?.getIsVisible() || false,
          };
        });

      // Add any available columns not in the column order
      availableColumns.forEach((column) => {
        if (!items.some((item) => item.id === column.id)) {
          items.push({
            id: column.id,
            label:
              typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id,
            isVisible: column.getIsVisible(),
          });
        }
      });

      setColumnItems(items);
    }
  }, [isOpen, table]);

  // Handle column order changes
  const handleColumnOrderChange = (newItems: ColumnConfig[] | string[]) => {
    if (!Array.isArray(newItems) || newItems.length === 0) return;
    const typedItems = newItems as ColumnConfig[];
    setColumnItems(typedItems);

    const newOrder = typedItems.map((item) => item.id);
    table.setColumnOrder(newOrder);
  };

  // Handle visibility changes
  const handleVisibilityChange = (item: string | ColumnConfig, isVisible: boolean) => {
    if (typeof item === 'string') return;

    if (alwaysVisibleColumnIds.includes(item.id) && !isVisible) {
      return;
    }

    const column = table.getColumn(item.id);
    if (!column) return;

    column.toggleVisibility(isVisible);

    // Update local state to reflect the change
    setColumnItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isVisible } : i)));
  };

  // Handle reset to defaults
  const handleReset = () => {
    if (onReset) {
      onReset();
    }
    //update of columnItems after reset
    setTimeout(() => {
      const columnOrder = table.getState().columnOrder;
      const availableColumns = table
        .getAllColumns()
        .filter((column) => column.id !== 'select' && column.getCanHide());
      const items: ColumnConfig[] = columnOrder
        .filter((columnId) => availableColumns.some((col) => col.id === columnId))
        .map((columnId) => {
          const column = table.getColumn(columnId);
          return {
            id: columnId,
            label:
              typeof column?.columnDef.header === 'string' ? column.columnDef.header : columnId,
            isVisible: column?.getIsVisible() || false,
          };
        });
      availableColumns.forEach((column) => {
        if (!items.some((item) => item.id === column.id)) {
          items.push({
            id: column.id,
            label:
              typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id,
            isVisible: column.getIsVisible(),
          });
        }
      });
      setColumnItems(items);
    }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Manage Columns</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-2 text-sm text-muted-foreground">
            Drag to reorder columns. Toggle checkboxes to show or hide columns.
          </div>

          <div className="max-h-[400px] space-y-1 overflow-y-auto pr-2">
            <DraggableList
              items={columnItems}
              onChange={handleColumnOrderChange}
              showVisibilityToggle={true}
              onVisibilityChange={handleVisibilityChange}
              compact={true}
              renderItem={(item) => {
                if (typeof item === 'string') return item;

                // Check if this is an always visible column
                const isAlwaysVisible = alwaysVisibleColumnIds.includes(item.id);

                return (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`column-visibility-${item.id}`}
                      checked={item.isVisible}
                      onCheckedChange={(checked) => handleVisibilityChange(item, checked === true)}
                      disabled={isAlwaysVisible}
                    />
                    <label
                      htmlFor={`column-visibility-${item.id}`}
                      className={`cursor-pointer select-none text-sm ${isAlwaysVisible ? 'font-semibold' : ''}`}
                    >
                      {item.label}
                      {/* {isAlwaysVisible && (
                        <span className="ml-1 text-xs text-muted-foreground">(required)</span>
                      )} */}
                    </label>
                  </div>
                );
              }}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {(onReset || defaultColumnConfig) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-1"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Reset to Default
            </Button>
          )}
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
