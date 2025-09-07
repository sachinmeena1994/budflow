import React from 'react';
import { DataTableProps, TableColumn } from '@/types/table';
import { useDataTable } from './hooks/use-data-table';
import { DataTableContent, DataTableHeader, DataTablePagination } from '.';

export function DataTable<TData extends object, TValue = unknown>({
  columns,
  data,
  tableConfig = {},
  isLoading = false,
  emptyTitle,
  emptyDescription,
  getRowColorClass,
  onSelectionChange,
  actions,
  onRowClick,
  getRowProps,
  rowSelection,
  onRowSelectionChange,
  ...props
}: DataTableProps<TData, TValue> & { onRefresh?: () => void }) {
  const {
    table,
    globalFilter,
    setGlobalFilter,
    openColumnFilters,
    toggleColumnFilter,
    resetTableToDefaults,
    alwaysVisibleColumnIds,
  } = useDataTable<TData>({
    columns: columns as TableColumn<TData>[],
    data,
    tableConfig,
    actions,
    onSelectionChange,
    defaultSorting: props.defaultSorting,
    selectedData: props.selectedData,
    getRowId: tableConfig.getRowId,
    rowSelection,
    onRowSelectionChange,
  });

  const handleGlobalFilterChange = (value: string) => {
    if (tableConfig.serverSide && tableConfig.onGlobalFilterChange) {
      tableConfig.onGlobalFilterChange(value);
    }
    setGlobalFilter(value);
  };
return (
  <div className="space-y-4" role="main">
    <DataTableHeader
      globalFilter={globalFilter}
      setGlobalFilter={handleGlobalFilterChange}
      enableGlobalFilter={!!tableConfig?.enableGlobalFilter}
      enableColumnVisibility={!!tableConfig?.enableColumnVisibility}
      table={table}
      rowSelection={rowSelection}
      actions={actions}
selectedRowsCount={rowSelection ? Object.keys(rowSelection).length : 0}
      enableMultiSelect={!!tableConfig?.enableMultiSelect}
      onResetColumns={resetTableToDefaults}
      alwaysVisibleColumnIds={alwaysVisibleColumnIds}
      showRefreshButton={tableConfig.showRefreshButton || false}
      onRefresh={props.onRefresh || tableConfig.onRefresh}
    />

    <DataTableContent
      table={table}
      openColumnFilters={openColumnFilters}
      toggleColumnFilter={toggleColumnFilter}
      enableMultiSelect={!!tableConfig?.enableMultiSelect}
      onRowClick={onRowClick}
      getRowColorClass={getRowColorClass}
      getRowProps={getRowProps}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      tableConfig={tableConfig}
      isLoading={isLoading}
        getRowAttrs={(row) => ({
    tabIndex: -1,
    'data-row-root': true,
    'data-row-id':
      (row.original as any)?.work_entry_id ||
      (row.original as any)?.id ||
      row.id,
  })}
    />

    {tableConfig.enablePagination && (
      <DataTablePagination table={table} tableConfig={tableConfig} />
    )}

    {/* ✅ This line will restore Save/Cancel footer */}
    {props.saveFooter}
  </div>
);

}
