import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StringFilter } from './StringFilter';
import { DateFilter } from './DateFilter';
import { ColumnFilterState, FilterValue, DateFilterValue, TableColumn } from '@/types/table';
import { Column } from '@tanstack/react-table';

interface ColumnFilterProps<TData> {
  column: Column<TData, unknown>;
  isOpen: boolean;
  onToggle: () => void;
  onFilterChange?: (column: string, value: FilterValue, filterType: 'text' | 'date') => void;
  serverSide?: boolean;
  filterState?: ColumnFilterState[];
}

export function ColumnFilter<TData>({
  column,
  isOpen,
  onToggle,
  onFilterChange,
  serverSide = false,
  filterState = [],
}: ColumnFilterProps<TData>) {
  // Get filter value based on server-side or client-side mode
  let columnFilterValue: FilterValue;
  if (serverSide && filterState) {
    const found = filterState.find((f) => f.column === column.id);
    columnFilterValue = found ? found.value : '';
  } else {
    columnFilterValue = column.getFilterValue() || '';
  }

  const hasActiveFilter =
    (Array.isArray(columnFilterValue) && columnFilterValue.length > 0) ||
    (typeof columnFilterValue === 'string' && columnFilterValue.trim().length > 0) ||
    (typeof columnFilterValue === 'object' &&
      columnFilterValue !== null &&
      (columnFilterValue as DateFilterValue).from !== undefined);

  const getHeaderText = () => {
    if (typeof column.columnDef.header === 'string') {
      return column.columnDef.header;
    }
    return column.id;
  };

  const filterType = (column.columnDef as TableColumn)?.filterType || 'text';
  const [inputValue, setInputValue] = useState<FilterValue>(columnFilterValue || '');
  const [lastAppliedValue, setLastAppliedValue] = useState<string>('');

  // Immediate filter change for text and date filters
  useEffect(() => {
    if (isOpen) {
      const safeVal = typeof inputValue === 'string' ? inputValue.trim() : inputValue;
      if (safeVal !== lastAppliedValue) {
        if (serverSide) {
          onFilterChange?.(column.id, safeVal, filterType);
        } else {
          column.setFilterValue(safeVal);
        }
        setLastAppliedValue(safeVal as string);
      }
    }
  }, [inputValue, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setLastAppliedValue('');
    }
  }, [isOpen]);

  // Handle filter change from child filter components
  const handleChange = (val: FilterValue) => {
    setInputValue(val ?? '');
    const safeVal = typeof val === 'string' ? val.trim() : val;
    if (filterType === 'date' || filterType === 'text') {
      if (serverSide) {
        onFilterChange?.(column.id, safeVal, filterType);
      } else {
        column.setFilterValue(safeVal);
      }
      setLastAppliedValue(safeVal as string);
    }
  };

  const handleClearFilter = useCallback(() => {
    setInputValue('');
    setLastAppliedValue('');
    if (serverSide) {
      onFilterChange?.(column.id, '', filterType);
    } else {
      column.setFilterValue('');
    }
  }, [column, onFilterChange, serverSide, filterType]);

  const renderFilterContent = () => {
    switch (filterType) {
      case 'date':
        return (
          <DateFilter
            value={inputValue as DateFilterValue | undefined}
            onChange={handleChange}
            onClear={handleClearFilter}
            hasActiveFilter={hasActiveFilter}
          />
        );
      case 'text':
      default:
        return (
          <StringFilter
            value={inputValue as string}
            onChange={handleChange}
            onClear={handleClearFilter}
            hasActiveFilter={hasActiveFilter}
          />
        );
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={onToggle}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-5 w-5 bg-transparent p-0 hover:bg-transparent"
        >
          <Filter
            className={cn(
              'h-3.5 w-3.5',
              hasActiveFilter ? 'text-primary' : 'text-muted-foreground',
              'transition-colors hover:text-accent',
            )}
          />
          {hasActiveFilter && (
            <span className="absolute -right-[2px] -top-[2px] flex h-3 w-3 items-center justify-center rounded-full bg-primary text-xs text-secondary-foreground" />
          )}
          <span className="sr-only">Filter {getHeaderText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 sticky top-9 z-30 max-h-[60vh] overflow-auto"
        align="start"
        style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
      >
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Filter {getHeaderText()}</h4>
            {hasActiveFilter || inputValue ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilter}
                className="h-6 px-2 text-xs"
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
            ) : null}
          </div>
          {renderFilterContent()}
        </div>
      </PopoverContent>
    </Popover>
  );
}
