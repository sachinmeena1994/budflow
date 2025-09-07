import React, { useEffect, useCallback, useMemo } from 'react';
import { DataTable } from './DataTable';
import {
  TableColumn,
  DataTableProps,
  SortItem,
  ColumnFilterState,
  TableQueryResult,
} from '@/types/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { useUrlQueryState } from '@/hooks/use-url-query-state';

interface DataTableWithQueryProps<TData extends object, TValue>
  extends Omit<DataTableProps<TData, TValue>, 'data'> {
  queryResult: TableQueryResult<TData>;
  onSearchChange?: (search: string) => void;
  onSortChange?: (sort: SortItem) => void;
  onPageChange?: (page: number, pageSize: number) => void;
  enableUrlSync?: boolean;
  tableId?: string;
  debug?: boolean;
  addEntryRow?: React.ReactNode
}

export function DataTableWithQuery<TData extends object, TValue>({
  queryResult,
  columns,
  tableConfig = {},
  onSearchChange,
  onSortChange,
  onPageChange,
  enableUrlSync = false,
  tableId = 'table',
  debug = false,
  rowSelection,
  addEntryRow,
  ...props
}: DataTableWithQueryProps<TData, TValue>) {
  const {
    data,
    totalCount,
    isLoading,
    error,
    queryState,
    updateSearch,
    updateSort,
    updatePagination,
    updateColumnFilters,
    refetch,
  } = queryResult;

  // // URL synchronization
  // const { parseUrlState, updateUrl } = useUrlQueryState({
  //   enableUrlSync,
  //   tableId,
  // });

  // // Update URL when query state changes
  // useEffect(() => {
  //   if (enableUrlSync) {
  //     updateUrl(queryState);
  //   }
  // }, [queryState, updateUrl, enableUrlSync]);

  // Handle search changes with proper debouncing
  const handleSearchChange = useCallback(
    (search: string) => {
      updateSearch(search);
      onSearchChange?.(search);
    },
    [updateSearch, onSearchChange],
  );

  // Handle sort changes
  const handleSortChange = useCallback(
    (sorting: SortItem[]) => {
      updateSort(sorting);
      // onSortChange?.(sorting);
    },
    [updateSort],
  );
  // Handle pagination changes - FIXED: Prevent reset loops
  const handlePageChange = useCallback(
    (pageIndex: number, pageSize: number) => {
      const newPagination = {
        page: pageIndex + 1,
        pageSize,
      };

      updatePagination(newPagination);
      onPageChange?.(newPagination.page, pageSize);
    },
    [updatePagination, onPageChange],
  );

  // Handle column filter changes
  const handleColumnFiltersChange = useCallback(
    (updater: ColumnFilterState[]) => {
      updateColumnFilters(updater);
    },
    [updateColumnFilters],
  );

  // Memoize table config to prevent unnecessary re-renders
  const enhancedTableConfig = useMemo(
    () => ({
      ...tableConfig,
      enablePagination: true,
      serverSide: false,
      totalCount,
      currentPage: queryState.pagination.page - 1,
      pageSize: queryState.pagination.pageSize,
      onPageChange: handlePageChange,
      onSortChange: handleSortChange,
      columnFilter: queryState.columnFilters,
      onColumnFiltersChange: handleColumnFiltersChange,
      globalFilter: queryState.search,
      onGlobalFilterChange: handleSearchChange,
      rowSelection: rowSelection ?? tableConfig.rowSelection,
    }),
    [
      tableConfig,
      totalCount,
      queryState.pagination.page,
      queryState.pagination.pageSize,
      queryState.search,
      queryState.columnFilters,
      handlePageChange,
      handleSortChange,
      handleColumnFiltersChange,
      handleSearchChange,
      rowSelection,
    ],
  );
const wrappedData = useMemo(() => {
  if (!addEntryRow) return data;
  return [{ __isAddRow: true, id: '__add_row__' } as TData, ...data];
}, [data, addEntryRow]);

useEffect(() => {
  props.onRowSelectionChange?.({});
}, [data, props.onRowSelectionChange]);
  return (
    <div className="space-y-2">
      {/* Error indicator */}
      {error && (
        <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm text-amber-800 dark:text-amber-200">
              Using cached data due to connection issues
            </span>
            <Badge variant="outline" className="text-xs">
              {error}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center space-x-1"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Retry</span>
          </Button>
        </div>
      )}

      <DataTable
        {...props}
    data={wrappedData}
        columns={columns}
        tableConfig={enhancedTableConfig}
        isLoading={isLoading}
        rowSelection={rowSelection ?? tableConfig.rowSelection}
        onRowSelectionChange={props.onRowSelectionChange}
      />
    </div>
  );
}
