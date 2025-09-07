import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { RefreshCcw } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface ColumnManagementItem {
  id: string;
  label: string;
  isVisible: boolean;
}

interface ManageColumnsDialogProps<TData> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
  onReset?: () => void;
  alwaysVisibleColumnIds?: string[];
  tab?: string;
}

export function ManageColumnsDialog<TData>({
  open,
  onOpenChange,
  table,
  onReset,
  alwaysVisibleColumnIds = [],
}: ManageColumnsDialogProps<TData>) {
  const [columnItems, setColumnItems] = useState<ColumnManagementItem[]>([]);


  const FALLBACK_LOCKED_LEFT = useMemo(() => ['select', 'actions'], []);


  const lockedLeftIds = useMemo(() => {
    const presentIds = new Set(table.getAllLeafColumns().map((c) => c.id));
    const merged = [...new Set([...(alwaysVisibleColumnIds || []), ...FALLBACK_LOCKED_LEFT])];
    return merged.filter((id) => presentIds.has(id));
  }, [table, alwaysVisibleColumnIds, FALLBACK_LOCKED_LEFT]);


  useEffect(() => {
    if (!open) return;
    const { left = [], right = [] } = table.getState().columnPinning ?? {};
    const newLeft = Array.from(new Set([...(left || []), ...lockedLeftIds]));
    table.setColumnPinning({ left: newLeft, right });
  }, [open, table, lockedLeftIds]);

  const createColumnItems = useCallback((tbl: Table<TData>): ColumnManagementItem[] => {
    const leaf = tbl.getAllLeafColumns();
    const availableColumns = leaf.filter(
      (column) => !lockedLeftIds.includes(column.id) && column.getCanHide()
    );

    const columnOrder = tbl.getState().columnOrder;
    const orderedColumnIds =
      columnOrder.length > 0
        ? columnOrder.filter((id) => availableColumns.some((col) => col.id === id))
        : availableColumns.map((col) => col.id);

    const items: ColumnManagementItem[] = orderedColumnIds.map((columnId) => {
      const column = tbl.getColumn(columnId);
      return {
        id: columnId,
        label:
          typeof column?.columnDef.header === 'string'
            ? (column.columnDef.header as string)
            : columnId,
        isVisible: column?.getIsVisible() ?? true,
      };
    });

    // Add any available columns not in the order
    availableColumns.forEach((column) => {
      if (!items.some((i) => i.id === column.id)) {
        items.push({
          id: column.id,
          label:
            typeof column.columnDef.header === 'string'
              ? (column.columnDef.header as string)
              : column.id,
          isVisible: column.getIsVisible(),
        });
      }
    });

    return items;
  }, [lockedLeftIds]);

  useEffect(() => {
    if (open) setColumnItems(createColumnItems(table));
  }, [open, table, createColumnItems]);

  const handleColumnOrderChange = (newItems: ColumnManagementItem[] | string[]) => {
    if (!Array.isArray(newItems) || newItems.length === 0) return;

    const typed = newItems as ColumnManagementItem[];
    setColumnItems(typed);


    const managedOrder = typed.map((i) => i.id);


    const allLeafIds = table.getAllLeafColumns().map((c) => c.id);
    const remaining = allLeafIds.filter(
      (id) => !lockedLeftIds.includes(id) && !managedOrder.includes(id)
    );

    const finalOrder = [...lockedLeftIds, ...managedOrder, ...remaining];
    table.setColumnOrder(finalOrder);
  };

  const handleVisibilityChange = (
    item: string | ColumnManagementItem,
    isVisible: boolean
  ) => {
    if (typeof item === 'string') return;


    if (lockedLeftIds.includes(item.id) || alwaysVisibleColumnIds.includes(item.id)) {
      return;
    }

    const column = table.getColumn(item.id);
    if (!column) return;

    column.toggleVisibility(isVisible);

    setColumnItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isVisible } : i))
    );
  };

  const handleReset = () => {
    onReset?.();


    setTimeout(() => {
      const items = createColumnItems(table);
      setColumnItems(items);

      const allLeafIds = table.getAllLeafColumns().map((c) => c.id);
      const managedIds = items.map((i) => i.id);
      const remaining = allLeafIds.filter(
        (id) => !lockedLeftIds.includes(id) && !managedIds.includes(id)
      );
      table.setColumnOrder([...lockedLeftIds, ...managedIds, ...remaining]);

      // Re-pin left for good measure
      const { right = [] } = table.getState().columnPinning ?? {};
      table.setColumnPinning({ left: lockedLeftIds, right });
    }, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Manage Columns</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-2 text-sm text-muted-foreground">
            Drag to reorder columns. Toggle checkboxes to show or hide columns.
          </div>

          {/* Optional: show which columns are locked/hidden from the list */}
          {lockedLeftIds.length > 0 && (
            <div className="mb-2 text-[11px] text-muted-foreground">
              Locked to the left (not shown here): {lockedLeftIds.join(', ')}
            </div>
          )}

          <div className="max-h-[400px] space-y-1 overflow-y-auto pr-2">
            <DraggableList
              items={columnItems}
              onChange={handleColumnOrderChange}
              showVisibilityToggle={true}
              onVisibilityChange={handleVisibilityChange}
              compact={true}
              renderItem={(item) => {
                if (typeof item === 'string') return item;

                // "Mandatory" here means not allowed to hide (we already removed locked ones)
                const isMandatory =
                  alwaysVisibleColumnIds.includes(item.id) &&
                  !lockedLeftIds.includes(item.id);

                return (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`column-visibility-${item.id}`}
                      checked={item.isVisible}
                      onCheckedChange={(checked) =>
                        handleVisibilityChange(item, checked === true)
                      }
                      disabled={isMandatory}
                    />
                    <label
                      htmlFor={`column-visibility-${item.id}`}
                      className={`cursor-pointer select-none text-sm ${
                        isMandatory ? 'font-semibold text-foreground' : 'text-foreground'
                      }`}
                    >
                      {item.label}
                    </label>
                  </div>
                );
              }}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {onReset && (
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
