import { useState, useEffect } from 'react';
import { ColumnOrderState, VisibilityState } from '@tanstack/react-table';
import { ColumnConfig } from '@/types/table';

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

  const alwaysVisibleColumnIds = getAlwaysVisibleColumnIds();

  // Process column configuration
  const processColumnVisibility = () => {
    if (defaultColumnConfig && defaultColumnConfig.length > 0) {
      const visibleColumnIds = defaultColumnConfig
        .filter((col) => col.isVisible)
        .map((col) => col.id);

      const columnOrder = defaultColumnConfig.map((col) => col.id);
      const enableMultiSelect = tableConfig?.enableMultiSelect === true;

      let finalColumnOrder = [...columnOrder];

      if (enableMultiSelect) {
        finalColumnOrder = finalColumnOrder.filter((id) => id !== 'select');
        finalColumnOrder.unshift('select');
      }

      const visibilityState = columns.reduce((acc: VisibilityState, column: any) => {
        acc[column.id] = visibleColumnIds.includes(column.id);

        if (column.id === 'select' && enableMultiSelect) {
          acc[column.id] = true;
        }

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

    // Fallback logic
    const defaultVisibleColumns =
      tableConfig?.defaultVisibleColumns || columns.map((col) => col.id as string);

    const enableMultiSelect = tableConfig?.enableMultiSelect === true;

    const initialVisibleColumns =
      initialState?.visibleColumns && initialState.visibleColumns.length > 0
        ? initialState.visibleColumns
        : defaultVisibleColumns;

    let columnOrder = [...initialVisibleColumns];

    if (enableMultiSelect) {
      columnOrder = columnOrder.filter((id) => id !== 'select');
      columnOrder.unshift('select');
    }

    const visibilityState = columns.reduce((acc: VisibilityState, column: any) => {
      acc[column.id] = columnOrder.includes(column.id);

      if (column.id === 'select' && enableMultiSelect) {
        acc[column.id] = true;
      }

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

  const {
    columnOrder: initialColumnOrder,
    visibilityState: initialVisibility,
    defaultConfig,
  } = processColumnVisibility();

  const enableMultiSelect = tableConfig?.enableMultiSelect === true;

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

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialVisibility);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(initialColumnOrder);
  const [columnManagementOpen, setColumnManagementOpen] = useState(false);

  useEffect(() => {
    const newVisibility = initialVisibilityOnPageLoad();
    if (enableMultiSelect) {
      newVisibility.select = true;
    }
    setColumnVisibility(newVisibility);
  }, [columns, enableMultiSelect]);

  const handleSetColumnOrder = (newOrder: ColumnOrderState) => {
    if (enableMultiSelect) {
      let filteredOrder = newOrder.filter((id) => id !== 'select');
      filteredOrder.unshift('select');
      setColumnOrder(filteredOrder);
    } else {
      setColumnOrder(newOrder);
    }
  };

  const handleSetColumnVisibility = (
    newVisibility: VisibilityState | ((prevState: VisibilityState) => VisibilityState),
  ) => {
    const updatedVisibility =
      typeof newVisibility === 'function' ? newVisibility(columnVisibility) : newVisibility;

    if (enableMultiSelect) {
      updatedVisibility.select = true;
    }

    alwaysVisibleColumnIds.forEach((columnId) => {
      updatedVisibility[columnId] = true;
    });

    setColumnVisibility(updatedVisibility);
  };

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
