import { useState, useEffect } from 'react';
import { ColumnOrderState, VisibilityState } from '@tanstack/react-table';
import { ColumnConfig } from '@/components/table/types';

interface ColumnManagementOptions {
  columns: any[];
  tableConfig: any;
  initialState: any;
  defaultColumnConfig?: ColumnConfig[];
}

export function useColumnManagement({
  columns,
  tableConfig,
  initialState,
  defaultColumnConfig,
}: ColumnManagementOptions) {
  // Get always visible columns
  const getAlwaysVisibleColumnIds = (): string[] => {
    return columns.filter((column) => column.alwaysVisible === true).map((column) => column.id);
  };

  const getNonActiveColumnIds = (): string[] => {
    return columns.filter((column) => column.initialVisible === false).map((column) => column.id);
  };

  const alwaysVisibleColumnIds = getAlwaysVisibleColumnIds();

  // Process column configuration
  const processColumnVisibility = () => {
    // If defaultColumnConfig is provided, use it for visibility and order
    if (defaultColumnConfig && defaultColumnConfig.length > 0) {
      // Extract visible columns from the default config
      const visibleColumnIds = defaultColumnConfig
        .filter((col) => col.isVisible)
        .map((col) => col.id);

      // Extract column order from the default config
      const columnOrder = defaultColumnConfig.map((col) => col.id);

      // Check if multi-select is enabled
      const enableMultiSelect = tableConfig?.enableMultiSelect === true;

      // Prepare the column order with select column always at index 0 if enabled
      let finalColumnOrder = [...columnOrder];

      // Handle select column for multi-select tables
      if (enableMultiSelect) {
        // Remove any existing select column
        finalColumnOrder = finalColumnOrder.filter((id) => id !== 'select');
        // Add select column at index 0
        finalColumnOrder.unshift('select');
      }

      // Create visibility state object
      const visibilityState = columns.reduce((acc: VisibilityState, column: any) => {
        // Set visibility based on default config
        acc[column.id] = visibleColumnIds.includes(column.id);

        // If it's the select column and multi-select is enabled, force visibility to true
        if (column.id === 'select' && enableMultiSelect) {
          acc[column.id] = true;
        }

        // Always show columns marked as alwaysVisible
        if (alwaysVisibleColumnIds.includes(column.id)) {
          acc[column.id] = true;
        }

        return acc;
      }, {} as VisibilityState);

      return {
        columnOrder: finalColumnOrder,
        visibilityState,
        defaultConfig: defaultColumnConfig,
      };
    }

    // Fallback to original logic if no defaultColumnConfig provided
    // Get default visible columns from config or use all columns
    const defaultVisibleColumns =
      tableConfig?.defaultVisibleColumns || columns.map((col) => col.id as string);

    // Check if multi-select is enabled
    const enableMultiSelect = tableConfig?.enableMultiSelect === true;

    // Get initial visible columns from state or fallback to defaults
    const initialVisibleColumns =
      initialState?.visibleColumns && initialState.visibleColumns.length > 0
        ? initialState.visibleColumns
        : defaultVisibleColumns;

    // Prepare the column order with select column always at index 0 if enabled
    let columnOrder = [...initialVisibleColumns];

    // Handle select column for multi-select tables
    if (enableMultiSelect) {
      // Remove any existing select column
      columnOrder = columnOrder.filter((id) => id !== 'select');
      // Add select column at index 0
      columnOrder.unshift('select');
    }

    // Create visibility state object
    const visibilityState = columns.reduce((acc: VisibilityState, column: any) => {
      // Default visibility based on whether the column is in the visible columns array
      acc[column.id] = columnOrder.includes(column.id);

      // If it's the select column and multi-select is enabled, force visibility to true
      if (column.id === 'select' && enableMultiSelect) {
        acc[column.id] = true;
      }

      // Always show columns marked as alwaysVisible
      if (alwaysVisibleColumnIds.includes(column.id)) {
        acc[column.id] = true;
      }

      return acc;
    }, {} as VisibilityState);

    return {
      columnOrder,
      visibilityState,
      defaultConfig: null,
    };
  };

  // Initialize state based on processed configuration
  const {
    columnOrder: initialColumnOrder,
    visibilityState: initialVisibility,
    defaultConfig,
  } = processColumnVisibility();

  const enableMultiSelect = tableConfig?.enableMultiSelect === true;

  // Helper to compute visibility state based on alwaysVisible and initialVisible
  const initialVisibilityOnPageLoad = () => {
    return columns.reduce((acc: VisibilityState, column: any) => {
      if (column.alwaysVisible === true) {
        acc[column.id] = true;
      } else if (column.initialVisible === false) {
        acc[column.id] = false;
      } else {
        acc[column.id] = true;
      }
      return acc;
    }, {} as VisibilityState);
  };

  useEffect(() => {
    const newVisibility = initialVisibilityOnPageLoad();
    if (enableMultiSelect) {
      newVisibility.select = true;
    }
    setColumnVisibility(newVisibility);
  }, [columns, enableMultiSelect]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialVisibility);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(initialColumnOrder);

  // State for column management dialog
  const [columnManagementOpen, setColumnManagementOpen] = useState(false);

  // Override setColumnOrder to ensure select column remains at index 0 when multi-select is enabled
  const handleSetColumnOrder = (newOrder: ColumnOrderState) => {
    if (enableMultiSelect) {
      // Filter out select column
      let filteredOrder = newOrder.filter((id) => id !== 'select');
      // Add select column at index 0
      filteredOrder.unshift('select');
      setColumnOrder(filteredOrder);
    } else {
      setColumnOrder(newOrder);
    }
  };

  // Override setColumnVisibility to ensure select column remains visible
  // and alwaysVisible columns remain visible
  const handleSetColumnVisibility = (
    newVisibility: VisibilityState | ((prevState: VisibilityState) => VisibilityState),
  ) => {
    // Prepare updated visibility state
    const updatedVisibility =
      typeof newVisibility === 'function' ? newVisibility(columnVisibility) : newVisibility;

    // Force select column to be visible if multi-select is enabled
    if (enableMultiSelect) {
      updatedVisibility.select = true;
    }

    // Force alwaysVisible columns to be visible
    alwaysVisibleColumnIds.forEach((columnId) => {
      updatedVisibility[columnId] = true;
    });

    setColumnVisibility(updatedVisibility);
  };

  // Function to reset column configuration to defaults
  const resetToDefaults = () => {
    if (defaultColumnConfig) {
      const defaultOrder = defaultColumnConfig.map((item) => item.id);
      handleSetColumnOrder(defaultOrder);
    }
    const newVisibility = initialVisibilityOnPageLoad();
    if (enableMultiSelect) {
      newVisibility.select = true;
    }
    handleSetColumnVisibility(newVisibility);
  };

  return {
    columnVisibility,
    setColumnVisibility: handleSetColumnVisibility,
    columnOrder,
    setColumnOrder: handleSetColumnOrder,
    columnManagementOpen,
    setColumnManagementOpen,
    resetToDefaults,
    defaultColumnConfig: defaultConfig || defaultColumnConfig,
    alwaysVisibleColumnIds,
  };
}
