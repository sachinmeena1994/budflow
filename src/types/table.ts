import { ColumnDef, Header, Row, Table } from '@tanstack/react-table';
import { LucideIcon } from 'lucide-react';

// ============================================================================
// CORE FILTER TYPES
// ============================================================================

export interface DateFilterValue {
  from?: Date;
  to?: Date;
}

export type FilterValue = string | DateFilterValue;

export interface ColumnFilterState {
  column: string;
  value: FilterValue;
  filterType: 'text' | 'date';
}

// ============================================================================
// SORT TYPES
// ============================================================================

export interface SortItem {
  column: string;
  order: 'asc' | 'desc' | false;
  sortIndex: number;
}

// ============================================================================
// QUERY STATE TYPES
// ============================================================================

export interface TableQueryState {
  search: string;
  columnFilters: ColumnFilterState[];
  sort: SortItem[];
  pagination: { page: number; pageSize: number };
  tab: string;
  importStatus?: string;
}

export interface UseTableQueryStateProps<TData = unknown> {
  initialState?: Partial<TableQueryState>;
  defaultPageSize?: number;
  fetchFunction?: (state: TableQueryState) => Promise<{
    data: TData[];
    totalCount: number;
  }>;
  enableApiMode?: boolean;
  tab?: string;
  marketCode?: string;
  serverSide?: boolean;
}

export interface TableQueryResult<TData = unknown> {
  data: TData[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  queryState: TableQueryState;
  updateSearch: (search: string) => void;
  updateColumnFilters: (filters: ColumnFilterState[]) => void;
  updateSort: (sort: SortItem[]) => void;
  updatePagination: (pagination: { page: number; pageSize: number }) => void;
  updateTab: (tab: string) => void;
  refetch: () => Promise<void>;
}

// ============================================================================
// COLUMN TYPES
// ============================================================================

export type TableColumn<TData = unknown> = ColumnDef<TData> & {
  alwaysVisible?: boolean; // If true, user cannot uncheck this column
  initialVisible?: boolean; // If false, column is hidden by default
  filterType?: 'text' | 'date'; // Default: 'text'
};

// ============================================================================
// ACTION TYPES
// ============================================================================

export interface TableRowAction<TData = unknown> {
  id: string;
  label: string;
  icon?: LucideIcon;
  isDestructive?: boolean;
  onClick: (row: TData) => void;
  isDisabled?: (row: TData) => boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  confirmationMessage?: string;
    visible?: (row: TData) => boolean;     
  disabled?: (row: TData) => boolean; 
}

export interface TableBulkAction<TData = unknown> {
  id: string;
  label: string;
  icon?: LucideIcon;
  isDestructive?: boolean;
  onClick: (selectedRows: TData[]) => void;
  isDisabled?: (selectedRows: TData[]) => boolean;
  hidden?: (row: TData) => boolean;      
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export interface TableActions<TData = unknown> {
  rowActions?: TableRowAction<TData>[];
  bulkActions?: TableBulkAction<TData>[];
  showRowActionsColumn?: boolean;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface TableConfig {
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableColumnVisibility?: boolean;
  enablePagination?: boolean;
  enableGlobalFilter?: boolean;
  enableMultiSelect?: boolean;
  enableMultiRowSelection?: boolean;
  enableMultiSort?: boolean;
  enableColumnFilters?: boolean;
  enableRowActions?: boolean;
  enableBulkActions?: boolean;
  defaultPageSize?: number;
  stickyHeader?: boolean;
  serverSide?: boolean;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (pageIndex: number, pageSize: number) => void;
  onSortChange?: (sorting: SortItem[]) => void;
  onColumnFiltersChange?: (filters: ColumnFilterState[]) => void;
  onGlobalFilterChange?: (search: string) => void;
  globalFilter?: string;
  getRowId?: (row: any, index: number, parent?: any) => string;
  rowSelection?: Record<string, boolean>;
  onRefresh?: () => void;
  showRefreshButton?: boolean;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface DataTableProps<TData extends object, TValue = unknown> {
  columns: TableColumn<TData>[];
  data: TData[];
  tableConfig?: TableConfig;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  getRowColorClass?: (row: TData) => string;
  onSelectionChange?: (selectedRows: TData[]) => void;
  actions?: TableActions<TData>;
  onRowClick?: (row: TData) => void;
  getRowProps?: (row: TData) => Record<string, unknown>;
  defaultSorting?: { id: string; desc: boolean }[];
  selectedData?: TData[];
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (sel: Record<string, boolean>) => void;
  onRefresh?: () => void; 
    getRowAttrs?: (row: Row<TData>) => Record<string, any>;
}

export interface DataTableCellProps<TData> {
  header: Header<TData, unknown>;
  serverSide: boolean;
  sortState?: SortItem[];
  filterState?: ColumnFilterState[];
  activeFilterColumn: string | null;
  toggleColumnFilter: (columnId: string) => void;
  handleSortChange: (
    { column, order }: { column: string; order: 'asc' | 'desc' | false },
    shiftKey: boolean,
  ) => void;
  handleFilterChange: ({
    column,
    value,
    filterType,
  }: {
    column: string;
    value: FilterValue;
    filterType: 'text' | 'date';
  }) => void;
}

export interface DataTableContentProps<TData> {
  table: Table<TData>;
  tableConfig?: TableConfig;
  emptyTitle?: string;
  emptyDescription?: string;
  openColumnFilters: Record<string, boolean>;
  toggleColumnFilter: (columnId: string) => void;
  enableMultiSelect?: boolean;
  onRowClick?: (row: TData) => void;
  getRowColorClass?: (row: TData) => string | undefined;
  getRowProps?: (row: TData) => Record<string, unknown>;
  isLoading?: boolean;
  sortState?: SortItem[];
  filterState?: ColumnFilterState[];
  activeFilterColumn?: string | null;
  handleSortChange?: (
    { column, order }: { column: string; order: 'asc' | 'desc' | false },
    shiftKey: boolean,
  ) => void;
  handleFilterChange?: ({
    column,
    value,
    filterType,
  }: {
    column: string;
    value: FilterValue;
    filterType: 'text' | 'date';
  }) => void;
}

// ============================================================================
// LEGACY TYPES (kept for backward compatibility, consider removing)
// ============================================================================

export interface ColumnConfig {
  id: string;
  label: string;
  isVisible: boolean;
}

// Legacy filter type - replaced by ColumnFilterState
export interface ColumnFilter {
  column: string;
  value: string | number | boolean | Date | null;
  filterType: 'text' | 'date' | 'enum';
}

// Legacy sort type - replaced by SortItem
export interface SortConfig {
  column: string;
  order: 'asc' | 'desc' | false;
  sortIndex: number;
}
