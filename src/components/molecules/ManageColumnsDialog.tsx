
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnConfig } from '../../data/columnConfig';

interface ManageColumnsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: ColumnConfig[];
  columnVisibility: Record<string, boolean>;
  onToggleColumn: (columnId: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

export const ManageColumnsDialog: React.FC<ManageColumnsDialogProps> = ({
  open,
  onOpenChange,
  columns,
  columnVisibility,
  onToggleColumn,
  onShowAll,
  onHideAll,
}) => {
  const visibleCount = columns.filter(col => columnVisibility[col.id] !== false).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Columns</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4 text-sm text-muted-foreground">
            {visibleCount} of {columns.length} columns visible
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {columns.map((column) => (
              <div key={column.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`column-${column.id}`}
                  checked={columnVisibility[column.id] !== false}
                  onCheckedChange={() => onToggleColumn(column.id)}
                />
                <label
                  htmlFor={`column-${column.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {column.header}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onShowAll}>
              Show All
            </Button>
            <Button variant="outline" size="sm" onClick={onHideAll}>
              Hide All
            </Button>
          </div>
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
