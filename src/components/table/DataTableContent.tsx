import { flexRender } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTableCell } from './DataTableCell';
import { cn } from '@/lib/utils';
import { ColumnFilterState, DataTableContentProps, SortItem, FilterValue } from '@/types/table';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { DataTableEmpty } from './DataTableEmpty';

export function DataTableContent<TData extends object>({
  table,
  enableMultiSelect = false,
  onRowClick,
  getRowColorClass,
  getRowProps,
  emptyTitle = 'No results.',
  emptyDescription,
  tableConfig,
  isLoading,
  getRowAttrs,
}: DataTableContentProps<TData>) {
  const [sortState, setSortState] = useState<SortItem[]>([]);
  const [filterState, setFilterState] = useState<ColumnFilterState[]>([]);
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);

  // Handler for sort change from DataTableCell
  const handleSortChange = useCallback(
    (
      { column, order }: { column: string; order: 'asc' | 'desc' | false },
      shiftKey: boolean = false,
    ) => {
      setSortState((prev) => {
        if (order === false) {
          // Remove column from sort state
          return prev.filter((s) => s.column !== column);
        }

        if (shiftKey) {
          // Multi-sort: add or update column in sort state
          const idx = prev.findIndex((s) => s.column === column);
          if (idx !== -1) {
            // Update order, keep sortIndex
            const updated = [...prev];
            updated[idx] = { ...updated[idx], order };
            return updated;
          }
          // Add new sort item with next sortIndex
          const nextSortIndex = prev.length;
          return [...prev, { column, order, sortIndex: nextSortIndex }];
        } else {
          // Single sort
          return [{ column, order, sortIndex: 0 }];
        }
      });
    },
    [],
  );

  // Handler for filter change from DataTableCell
  const handleFilterChange = useCallback(
    ({
      column,
      value,
      filterType,
    }: {
      column: string;
      value: FilterValue;
      filterType: 'text' | 'date';
    }) => {
      setFilterState((prev) => {
        const isEmptyValue =
          value === null ||
          value === '' ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'object' && value !== null && !value.from && !value.to);

        if (isEmptyValue) {
          // Remove column from filter state
          return prev.filter((f) => f.column !== column);
        }

        // Add or update filter
        const idx = prev.findIndex((f) => f.column === column);
        if (idx !== -1) {
          // Update existing filter
          const updated = [...prev];
          updated[idx] = { ...updated[idx], value, filterType };
          return updated;
        } else {
          // Add new filter
          return [...prev, { column, value, filterType }];
        }
      });
    },
    [],
  );

  useEffect(() => {
    tableConfig?.onSortChange?.(sortState);
  }, [sortState]);

  useEffect(() => {
    tableConfig?.onColumnFiltersChange?.(filterState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterState]);

  // Memoize the toggleColumnFilter function to prevent infinite renders
  const toggleColumnFilter = useCallback((columnId: string) => {
    setActiveFilterColumn((prev) => (prev === columnId ? null : columnId));
  }, []);

  // Memoize serverSide to prevent unnecessary re-renders
  const serverSide = useMemo(() => tableConfig?.serverSide, [tableConfig?.serverSide]);

  return (
    <div className="rounded-md border">
      <div className="max-h-[calc(100vh-300px)] w-full overflow-y-auto overflow-x-scroll">
        <table className="w-full caption-bottom text-sm">
          <thead className="sticky top-0 z-10 bg-background border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => {
                  return (
                    <th 
                      key={header.id} 
                      colSpan={header.colSpan}
                      className="h-12 px-2 text-left align-middle font-medium text-muted-foreground text-xs [&:has([role=checkbox])]:pr-0 whitespace-nowrap bg-background"
                    >
                      <div className="flex items-center">
                        <DataTableCell
                          header={header}
                          handleSortChange={handleSortChange}
                          handleFilterChange={handleFilterChange}
                          serverSide={serverSide}
                          sortState={sortState}
                          filterState={filterState}
                          activeFilterColumn={activeFilterColumn}
                          toggleColumnFilter={toggleColumnFilter}
                        />
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody className="[&_tr:last-child]:border-0">
            {isLoading ? (
              <tr>
                <td
                  colSpan={table.getVisibleFlatColumns().length}
                  className="h-96 text-center align-middle p-2 text-xs"
                >
                  <div className="flex h-full w-full items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                </td>
              </tr>
            ) : Array.isArray(table.getRowModel().rows) && table.getRowModel().rows.length ? (
              table
                .getRowModel()
                .rows.filter(
                  (row) =>
                    row &&
                    typeof row === 'object' &&
                    row.id &&
                    typeof row.getVisibleCells === 'function' &&
                    Array.isArray(row.getVisibleCells()),
                )
                .map((row) => {
                  const visibleCells = row.getVisibleCells();
                  const colorClass = getRowColorClass ? getRowColorClass(row.original) : undefined;
                  const baseAttrs = {
                    'data-row-root': true,
                    'data-row-id':
                      (row.original as any)?.work_entry_id ||
                      (row.original as any)?.id ||
                      row.id,
                  };
                   const injectedAttrs = getRowAttrs?.(row) ?? {};
                  const additionalProps =
                    getRowProps && typeof getRowProps === 'function'
                      ? getRowProps(row.original) || {}
                      : {};
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                        colorClass,
                        onRowClick ? 'cursor-pointer hover:bg-muted' : '',
                        'transition-colors',
                      )}
                      onClick={() => onRowClick && onRowClick(row.original)}
                      {...additionalProps}
                      {...baseAttrs}
                      {...injectedAttrs}
                      
                    >
                      {visibleCells.map((cell) => (
                        <td key={cell.id} className="p-2 align-middle text-xs [&:has([role=checkbox])]:pr-0">
                          {cell.column.id === 'select' ? (
                            <div onClick={(e) => e.stopPropagation()}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          ) : cell.column.columnDef.meta &&
                            (cell.column.columnDef.meta as any).editable ? (
                            <div onClick={(e) => e.stopPropagation()}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          ) : (
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td
                  colSpan={table.getVisibleFlatColumns().length}
                  className="h-24 text-center p-2 align-middle text-xs"
                >
                  <DataTableEmpty title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}