
import { useState, useEffect } from "react";
import { ColumnFiltersState } from "@tanstack/react-table";

interface UseTableStateProps {
  initialState?: any;
  defaultSorting?: { id: string; desc: boolean }[];
  onStateChange?: (state: any) => void;
}

export function useTableState({ 
  initialState, 
  defaultSorting, 
  onStateChange 
}: UseTableStateProps) {
  // Initialize sorting state
  const [sorting, setSorting] = useState(
    initialState?.sorting || defaultSorting || []
  );
  
  // Initialize global filter state
  const [globalFilter, setGlobalFilter] = useState(
    initialState?.globalFilter || ""
  );
  
  // Initialize column filters state
  const [columnFilter, setColumnFilter] = useState<ColumnFiltersState>(
    Object.entries(initialState?.filters || {}).map(([id, value]) => ({ id, value }))
  );
  
  // Initialize column visibility state
  const [columnVisibility, setColumnVisibility] = useState(
    initialState?.columnVisibility || {}
  );
  
  // Initialize column order state
  const [columnOrder, setColumnOrder] = useState(
    initialState?.columnOrder || []
  );
  
  // Initialize row selection state
  const [rowSelection, setRowSelection] = useState(
    initialState?.rowSelection || {}
  );

  // Reset sorting to defaults
  const resetToDefaultSorting = () => {
    if (defaultSorting) {
      setSorting(defaultSorting);
    }
  };

  // Update external state when internal state changes
  useEffect(() => {
    if (onStateChange) {
      const newFilters = columnFilter.reduce((acc, filter) => {
        acc[filter.id] = filter.value;
        return acc;
      }, {} as Record<string, any>);

      const visibleColumnsArray = Object.entries(columnVisibility)
        .filter(([_, isVisible]) => isVisible)
        .map(([columnId]) => columnId);

      onStateChange({
        sorting,
        filters: newFilters,
        visibleColumns: visibleColumnsArray,
        globalFilter,
        columnVisibility,
        columnOrder,
        rowSelection,
      });
    }
  }, [sorting, columnFilter, columnVisibility, columnOrder, globalFilter, rowSelection, onStateChange]);

  return {
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
    columnFilter,
    setColumnFilter,
    columnVisibility,
    setColumnVisibility,
    columnOrder,
    setColumnOrder,
    rowSelection,
    setRowSelection,
    resetToDefaultSorting,
  };
}
