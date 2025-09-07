
import { useState, useEffect } from "react";
import { TableState } from "@tanstack/react-table";

// Default table config
const defaultConfig = {
  enableSorting: true,
  enableFiltering: false,
  enableColumnVisibility: true,
  enablePagination: true,
  enableMultiSelect: false,
  enableGlobalFilter: false,
  enableMultiSort: true, // Enable multi-sort by default
  multiSortLimit: 3,
};

interface TableConfigOptions {
  persistState?: boolean;
  persistPageSize?: boolean;
  tableMode?: string;
}

interface TableConfigState {
  sorting?: { id: string; desc: boolean }[] | null;
  filters?: Record<string, any>;
  visibleColumns: string[];
}

/**
 * Custom hook for managing and persisting table configuration
 */
export function useTableConfig(
  tableId: string,
  initialConfig: Partial<typeof defaultConfig> = {},
  options: TableConfigOptions = { 
    persistState: true, 
    persistPageSize: true 
  }
) {
  const { persistState = true, persistPageSize = true, tableMode } = options;
  
  // Merge default and initial config
  const config = { ...defaultConfig, ...initialConfig };
  
  // Initialize state for table config
  const [tableState, setTableState] = useState<TableConfigState>({
    visibleColumns: [],
  });
  
  // Load saved state from localStorage on mount
  useEffect(() => {
    if (persistState) {
      try {
        const storageKey = tableMode 
          ? `table-state-${tableMode}`
          : `table-state-${tableId}`;
        const savedState = localStorage.getItem(storageKey);
        
        if (savedState) {
          setTableState(JSON.parse(savedState));
        }
      } catch (error) {
        console.error("Error loading table state:", error);
      }
    }
  }, [tableId, persistState, tableMode]);
  
  // Save state to localStorage when updated
  const handleStateChange = (newState: TableConfigState) => {
    if (!persistState) return;
    
    try {
      const storageKey = tableMode 
        ? `table-state-${tableMode}`
        : `table-state-${tableId}`;
      
      localStorage.setItem(storageKey, JSON.stringify(newState));
      setTableState(newState);
    } catch (error) {
      console.error("Error saving table state:", error);
    }
  };
  
  return {
    tableConfig: config,
    initialState: tableState,
    onStateChange: handleStateChange,
  };
}
