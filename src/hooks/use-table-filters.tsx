
import { useState } from "react";
import { ColumnFiltersState } from "@tanstack/react-table";

export function useTableFilters(initialState: any) {
  // Initialize global filter state
  const [globalFilter, setGlobalFilter] = useState("");
  
  // Initialize column filters state
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    Object.entries(initialState?.filters || {}).map(([id, value]) => ({ id, value }))
  );
  
  // Track which column filters are open
  const [openColumnFilters, setOpenColumnFilters] = useState<Record<string, boolean>>({});
  
  // Toggle column filter popover
  const toggleColumnFilter = (columnId: string) => {
    setOpenColumnFilters(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  return {
    globalFilter,
    setGlobalFilter,
    columnFilters,
    setColumnFilters,
    openColumnFilters,
    toggleColumnFilter
  };
}
