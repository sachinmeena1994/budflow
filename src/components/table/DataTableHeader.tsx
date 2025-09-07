import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, ChevronDown, Settings, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Table } from '@tanstack/react-table';
import { TableBulkAction, TableRowAction } from '@/types/table';
import { ManageColumnsDialog } from './ManageColumnsDialog';
import { RefreshButton } from './RefreshButton';
import { useState, useEffect } from 'react';

interface DataTableHeaderProps<TData> {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  enableGlobalFilter: boolean;
  enableColumnVisibility: boolean;
  table: Table<TData>;
  rowSelection: Record<string, boolean>;
  actions?: {
    rowActions?: TableRowAction[];
    showRowActionsColumn?: boolean;
    bulkActions?: TableBulkAction[];
  };
  selectedRowsCount?: number;
  enableMultiSelect?: boolean;
  onResetColumns?: () => void;
  alwaysVisibleColumnIds?: string[];
  showRefreshButton?: boolean;
  onRefresh?: () => void;
}

export function DataTableHeader<TData extends object>({
  globalFilter,
  setGlobalFilter,
  enableGlobalFilter,
  enableColumnVisibility,
  table,
  rowSelection,
  actions,
  selectedRowsCount = 0,
  enableMultiSelect = false,
  onResetColumns,
  alwaysVisibleColumnIds = [],
  showRefreshButton = false,
  onRefresh,
}: DataTableHeaderProps<TData>) {
  const [columnManagementOpen, setColumnManagementOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        setColumnManagementOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center space-x-2">
          {enableGlobalFilter && (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-8 w-[200px] pl-7 text-xs md:w-[250px]"
              />
            </div>
          )}

          {enableMultiSelect && selectedRowsCount > 0 && (
            <div className="ml-2 text-sm text-muted-foreground">
              {selectedRowsCount} {selectedRowsCount === 1 ? 'row' : 'rows'} selected
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {actions?.bulkActions && enableMultiSelect && selectedRowsCount > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  Actions ({selectedRowsCount})
                  <ChevronDown className="ml-1 h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.bulkActions.map((action) => {
                  // Get selected rows safely, ensuring we have valid row data
                  const selectedRows = Object.keys(rowSelection)
                    .map((index) => {
                      const rowIndex = parseInt(index);
                      const row = table.getRowModel().rows[rowIndex];
                      return row?.original;
                    })
                    .filter((row) => row !== undefined) as TData[];

                  const isDisabled = action.isDisabled ? action.isDisabled(selectedRows) : false;

                  return (
                    <DropdownMenuItem
                      key={action.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick(selectedRows);
                           table.resetRowSelection();
                      }}
                      disabled={isDisabled}
                      className={cn(
                        action.isDestructive && 'text-red-600',
                        isDisabled && 'cursor-not-allowed text-muted-foreground',
                      )}
                    >
                      {action.icon && <action.icon className="mr-1.5 h-3.5 w-3.5" />}
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {enableColumnVisibility && (
            <>
              {showRefreshButton && (
                <RefreshButton
                  onClick={onRefresh}
                  icon={<RefreshCcw className="mr-2 h-5 w-5" />}
                />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setColumnManagementOpen(true)}
                className="h-8 w-8"
                title="Manage Columns"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <ManageColumnsDialog
        table={table}
        open={columnManagementOpen}
        onReset={onResetColumns}
        onOpenChange={setColumnManagementOpen}
        alwaysVisibleColumnIds={alwaysVisibleColumnIds}
      />
    </>
  );
}
