
import { useState, useMemo } from 'react';
import { ColumnConfig } from '../data/columnConfig';

export const useColumnVisibility = (allColumns: ColumnConfig[]) => {
  // Initialize all columns as visible by default
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    allColumns.forEach(col => {
      initial[col.id] = true;
    });
    return initial;
  });

  const visibleColumns = useMemo(() => {
    return allColumns.filter(col => columnVisibility[col.id] !== false);
  }, [allColumns, columnVisibility]);

  const toggleColumn = (columnId: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  const showAllColumns = () => {
    const newVisibility: Record<string, boolean> = {};
    allColumns.forEach(col => {
      newVisibility[col.id] = true;
    });
    setColumnVisibility(newVisibility);
  };

  const hideAllColumns = () => {
    const newVisibility: Record<string, boolean> = {};
    allColumns.forEach(col => {
      newVisibility[col.id] = false;
    });
    setColumnVisibility(newVisibility);
  };

  return {
    columnVisibility,
    visibleColumns,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
  };
};
