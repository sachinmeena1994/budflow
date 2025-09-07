import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, ChevronDown, Settings, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Table } from '@tanstack/react-table';
import { TableConfig } from '@/types/table';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  openColumnFilters: Record<string, boolean>;
  toggleColumnFilter: (columnId: string) => void;
  setColumnManagementOpen: (open: boolean) => void;
  tableConfig: TableConfig;
  resetTableToDefaults: () => void;
  rowSelection: Record<string, boolean>;
}

export function DataTableToolbar<TData extends object>({
  table,
  globalFilter,
  setGlobalFilter,
  openColumnFilters,
  toggleColumnFilter,
  setColumnManagementOpen,
  tableConfig,
  resetTableToDefaults,
  rowSelection,
}: DataTableToolbarProps<TData>) {
  const selectedRowsCount = Object.keys(rowSelection).length;

  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center space-x-2">
        {tableConfig.enableGlobalFilter && (
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

        {tableConfig.enableMultiSelect && selectedRowsCount > 0 && (
          <div className="ml-2 text-sm text-muted-foreground">
            {selectedRowsCount} {selectedRowsCount === 1 ? 'row' : 'rows'} selected
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={resetTableToDefaults}
          className="h-8 text-xs"
          title="Reset to defaults"
        >
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          Reset
        </Button>

        {tableConfig.enableColumnVisibility && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setColumnManagementOpen(true)}
            className="h-8 text-xs"
            title="Manage Columns"
          >
            <Settings className="mr-1 h-3.5 w-3.5" />
            Columns
          </Button>
        )}
      </div>
    </div>
  );
}
