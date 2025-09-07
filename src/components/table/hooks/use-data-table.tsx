import { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  ColumnOrderState,
  Row,
} from '@tanstack/react-table';
import { RowActions } from '@/components/table/RowActions';
import { TableConfig, TableActions, TableColumn } from '@/types/table';

function isSameArray(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
// Fixed structural columns that must always be first if present
const FIXED_LEFT = ['rowSelect', 'actions', 'history'] as const;

function enforceFixedOrder(allIds: string[]): string[] {
  const uniq = (xs: string[]) => Array.from(new Set(xs));
  const fixed = FIXED_LEFT.filter(id => allIds.includes(id));
  const rest  = allIds.filter(id => !FIXED_LEFT.includes(id));
  return uniq([...fixed, ...rest]);
}

export function useDataTable<TData extends object>({
  columns,
  data,
  tableConfig,
  actions,
  onSelectionChange,
  selectedData,
  defaultSorting,
  getRowId,
  rowSelection,
  onRowSelectionChange,
}: {
  columns: TableColumn<TData>[];
  data: TData[];
  tableConfig: TableConfig & { tableId?: string }; // tableId is optional but recommended
  actions?: TableActions<TData>;
  onSelectionChange?: (selectedRows: TData[]) => void;
  selectedData?: TData[];
  defaultSorting?: { id: string; desc: boolean }[];
  getRowId?: (row: TData, index: number, parent?: any) => string;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (sel: Record<string, boolean>) => void;
}) {
  const tableId = tableConfig?.tableId ?? 'default';
  const ORDER_KEY = `table:${tableId}:columnOrder`;
  const VIS_KEY   = `table:${tableId}:columnVisibility`;

  // ---- Build final columns BEFORE any order/visibility state ----
  const processedColumns = useMemo(() => {
    if (!columns || columns.length === 0) return [];

    const cols = [...columns];

    // Only inject "actions" if not already present
    const hasActions = cols.some(c => c.id === 'actions');
    if (
      !hasActions &&
      actions?.rowActions &&
      actions.rowActions.length > 0 &&
      actions.showRowActionsColumn !== false
    ) {
      cols.unshift({
        id: 'actions',
        header: '',
        size: 50,
        cell: ({ row }: { row: Row<TData> }) => (
          <RowActions
            row={row.original}
            actions={actions.rowActions}
            onAction={(actionId: string, rowData: TData) => {
              const action = actions.rowActions?.find(a => a.id === actionId);
              if (action) action.onClick(rowData);
            }}
          />
        ),
        enableSorting: false,
        enableColumnFilter: false,
      } as any);
    }

    return cols;
  }, [columns, actions]);

  const allIds = useMemo(() => processedColumns.map(c => c.id), [processedColumns]);

  // ---- Filters / sorting UI state ----
  const [globalFilter, setGlobalFilter] = useState('');
  const [openColumnFilters, setOpenColumnFilters] = useState<Record<string, boolean>>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  // FIX: correct type for columnFilters
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // ---- Column Order (init from storage, else from columns) ----
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
    try {
      const raw = localStorage.getItem(ORDER_KEY);
      if (raw) {
        const saved: string[] = JSON.parse(raw);
        // keep only existing ids, then append any new ones
        const kept = saved.filter(id => allIds.includes(id));
        const missing = allIds.filter(id => !kept.includes(id));
        return enforceFixedOrder([...kept, ...missing]);
      }
    } catch {}
    return enforceFixedOrder(allIds);
  });

  // ---- Column Pinning (keeps structural columns visually left) ----
  const [columnPinning, setColumnPinning] = useState<{left: string[]; right: string[]}>({
    left: FIXED_LEFT.filter(id => allIds.includes(id)),
    right: [],
  });

  // ---- Column Visibility (init from storage, else initialVisible flags) ----
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    try {
      const raw = localStorage.getItem(VIS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    const init: VisibilityState = {};
    processedColumns.forEach(col => {
      if (col.initialVisible === false) init[col.id] = false;
    });
    // Force structural columns visible if present
    FIXED_LEFT.forEach(id => {
      if (allIds.includes(id)) init[id] = true;
    });
    return init;
  });

  // Always-visible list for consumers
  const alwaysVisibleColumnIds = useMemo(
    () => processedColumns.filter(col => col.alwaysVisible).map(col => col.id),
    [processedColumns]
  );

  // ---- Reconcile when the columns prop changes (e.g., feature toggles, backend fields) ----
  useEffect(() => {
    const allIds = columns.map(c => c.id);

    // Reconcile order: drop missing, append new
    setColumnOrder(prev => {
      const kept = prev.filter(id => allIds.includes(id));
      const missing = allIds.filter(id => !kept.includes(id));
      const next    = enforceFixedOrder([...kept, ...missing]);
      return isSameArray(prev, next) ? prev : next;
    });

    // Keep pinning valid
    setColumnPinning(p => ({
      left: FIXED_LEFT.filter(id => allIds.includes(id)),
      right: p.right ?? [],
    }));

    // Reconcile visibility (force structural columns visible)
    setColumnVisibility(prev => {
      const next: Record<string, boolean> = {};
      allIds.forEach(id => {
        if (FIXED_LEFT.includes(id as any)) {
          next[id] = true;
        } else if (id in prev) {
          next[id] = prev[id];
        } else {
          const def = processedColumns.find(c => c.id === id);
          if (def?.initialVisible === false) next[id] = false;
        }
      });
      return next;
    });
  }, [allIds, processedColumns]);

  // ---- Persist to localStorage whenever order / visibility changes ----
  useEffect(() => {
    try { localStorage.setItem(ORDER_KEY, JSON.stringify(columnOrder)); } catch {}
  }, [ORDER_KEY, columnOrder]);

  useEffect(() => {
    try { localStorage.setItem(VIS_KEY, JSON.stringify(columnVisibility)); } catch {}
  }, [VIS_KEY, columnVisibility]);

  // Toggle header filter popovers
  const toggleColumnFilter = (columnId: string) => {
    setOpenColumnFilters(prev => ({ ...prev, [columnId]: !prev[columnId] }));
  };

  // ---- Table ----
  const table = useReactTable({
    data,
    columns: processedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: tableConfig.serverSide ? getCoreRowModel() : getFilteredRowModel(),
    getRowId: getRowId || tableConfig.getRowId,
    state: {
      sorting,
      globalFilter: tableConfig.serverSide ? '' : globalFilter,
      columnFilters,
      rowSelection,
      columnVisibility,
      columnOrder,
      columnPinning,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: tableConfig.serverSide ? undefined : setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: (updater) => {
      setColumnOrder(curr => {
        const next = typeof updater === 'function' ? updater(curr) : updater;
        return enforceFixedOrder(next);
      });
    },
    onColumnPinningChange: setColumnPinning,
    enableRowSelection: true,
    enableMultiRowSelection: tableConfig.enableMultiRowSelection ?? true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    initialState: { pagination: { pageSize: 100 } },
  });

  // Reset (also clears localStorage for this table)
  const resetTableToDefaults = () => {
    setGlobalFilter('');
    setSorting([]);
    setColumnFilters([]);
    setOpenColumnFilters({});

    const originalIds = processedColumns.map(col => col.id);
    setColumnOrder(enforceFixedOrder(originalIds));

    const initialVisibility: VisibilityState = {};
    processedColumns.forEach(col => {
      if (FIXED_LEFT.includes(col.id as any)) initialVisibility[col.id] = true;
      else if (col.initialVisible === false) initialVisibility[col.id] = false;
    });
    setColumnVisibility(initialVisibility);

    setColumnPinning({
      left: FIXED_LEFT.filter(id => originalIds.includes(id)),
      right: [],
    });

    try {
      localStorage.removeItem(ORDER_KEY);
      localStorage.removeItem(VIS_KEY);
      // If you persist pinning, clear it here too.
    } catch {}
  };

  return {
    table,
    globalFilter,
    setGlobalFilter,
    openColumnFilters,
    toggleColumnFilter,
    rowSelection,
    resetTableToDefaults,
    alwaysVisibleColumnIds,
  };
}
