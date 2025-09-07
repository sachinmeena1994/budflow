
import { useState } from 'react';
import { ColumnFiltersState } from '@tanstack/react-table';

export function useTableFilters(initialState: any) {
  // Initialize global filter state
  const [globalFilter, setGlobalFilter] = useState('');

  // Initialize column filters state with enhanced filtering support
  const [columnFilter, setColumnFilter] = useState<ColumnFiltersState>(
    Object.entries(initialState?.filters || {}).map(([id, value]) => ({ id, value })),
  );

  // Track which column filters are open
  const [openColumnFilters, setOpenColumnFilters] = useState<Record<string, boolean>>({});

  // Toggle column filter popover
  const toggleColumnFilter = (columnId: string) => {
    setOpenColumnFilters((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  // Enhanced filter function that handles different data types
  const getFilterFunction = (filterType: string) => {
    switch (filterType) {
      case 'number':
        return (row: any, columnId: string, filterValue: any) => {
          if (!filterValue) return true;

          const cellValue = row.getValue(columnId);
          const numValue = parseFloat(cellValue);

          if (isNaN(numValue)) return false;

          const { min, max } = filterValue;

          if (min !== undefined && numValue < min) return false;
          if (max !== undefined && numValue > max) return false;

          return true;
        };

      case 'date':
        return (row: any, columnId: string, filterValue: any) => {
          if (!filterValue) return true;

          const cellValue = row.getValue(columnId);
          const cellDate = new Date(cellValue);

          if (isNaN(cellDate.getTime())) return false;

          const { from, to } = filterValue;

          if (from && cellDate < from) return false;
          if (to && cellDate > to) return false;

          return true;
        };

      case 'enum':
        return (row: any, columnId: string, filterValue: string[]) => {
          if (!filterValue || filterValue.length === 0) return true;

          const cellValue = row.getValue(columnId);
          return filterValue.includes(cellValue);
        };

      default:
        // String filter - case insensitive contains
        return (row: any, columnId: string, filterValue: string) => {
          if (!filterValue) return true;

          const cellValue = String(row.getValue(columnId) || '').toLowerCase();
          return cellValue.includes(filterValue.toLowerCase());
        };
    }
  };

  const resetGlobalFilter = () => {
    setGlobalFilter('');
  };

  return {
    globalFilter,
    setGlobalFilter,
    columnFilter,
    setColumnFilter,
    openColumnFilters,
    toggleColumnFilter,
    getFilterFunction,
    resetGlobalFilter,
  };
}
