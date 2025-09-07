import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { TableRowAction } from '@/types/table';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface RowActionsProps<T = unknown> {
  row: T;
  actions?: TableRowAction<T>[];
  onAction?: (actionId: string, row: T) => void;
}

export function RowActions<T = unknown>({ row, actions, onAction }: RowActionsProps<T>) {
  if (!actions || actions.length === 0) return null;

  const handleAction = (action: TableRowAction<T>) => {
    if (action.isDisabled?.(row)) {
      return;
    }

    if (action.confirmationMessage) {
      if (window.confirm(action.confirmationMessage)) {
        onAction?.(action.id, row);
      }
    } else {
      onAction?.(action.id, row);
    }
  };

  // Group actions by destructive property
  const standardActions = actions.filter((action) => !action.isDestructive);
  const destructiveActions = actions.filter((action) => action.isDestructive);

  // Special case for inventoryLocation tracking - check if property exists before using it
  const hasInventoryLocationName = row && typeof row === 'object' && 'inventoryLocationName' in row;
  const inventoryLocationBadge = hasInventoryLocationName ? (
    <div className="px-2 py-1.5 text-xs text-muted-foreground">
      <Badge variant="outline" className="bg-primary/10 text-primary">
        {String((row as Record<string, unknown>).inventoryLocationName)}
      </Badge>
    </div>
  ) : null;

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {inventoryLocationBadge}

          {inventoryLocationBadge && standardActions.length > 0 && <DropdownMenuSeparator />}

          {standardActions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={(e) => {
                e.stopPropagation();
                handleAction(action);
              }}
              disabled={action.isDisabled?.(row)}
              className="cursor-pointer"
            >
              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
              <span>{action.label}</span>
            </DropdownMenuItem>
          ))}

          {standardActions.length > 0 && destructiveActions.length > 0 && <DropdownMenuSeparator />}

          {destructiveActions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={(e) => {
                e.stopPropagation();
                handleAction(action);
              }}
              disabled={action.isDisabled?.(row)}
              className={cn(
                'cursor-pointer',
                action.isDestructive && 'text-destructive focus:text-destructive',
              )}
            >
              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
              <span>{action.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
