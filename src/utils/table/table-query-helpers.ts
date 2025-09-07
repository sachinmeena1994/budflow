// Table query utility functions
import { ColumnFilterState, TableQueryState } from '@/types/table';

export type TableQueryPayload = {
  marketCode: string;
  pagination: {
    page: number;
    pageSize: number;
  };
  tab?: string;
  search?: string;
  columnFilter?: any;
  sort?: {
    column: string;
    order: string;
  };
  status?: string;
};

export function buildTableQueryPayload({
  queryState,
  marketCode,
  columnNameMap = {},
  status = '',
}: {
  queryState: TableQueryState;
  marketCode: string;
  columnNameMap?: Record<string, string>;
  status?: string;
}) {
  const payload: TableQueryPayload = {
    marketCode,
    pagination: {
      page: queryState.pagination.page,
      pageSize: queryState.pagination.pageSize,
    },
  };

  // Only include tab if it has a value
  if (queryState.tab && queryState.tab.trim()) {
    payload.tab = queryState.tab;
  }

  // Only include search if it has a value and is at least 3 characters
  if (queryState.search && queryState.search.trim()) {
    payload.search = queryState.search;
  }

  // Only include columnFilter if there are filters
  if (queryState.columnFilters && queryState.columnFilters.length > 0) {
    payload.columnFilter = queryState.columnFilters.map((filter) => ({
      column: columnNameMap[filter.column] || filter.column,
      value: filter.value,
      type: filter.filterType,
    }));
  }

  // Only include sort if there is a sort configuration
  if (queryState.sort && queryState.sort.length > 0) {
    payload.sort = {
      column: columnNameMap[queryState.sort[0].column] || queryState.sort[0].column,
      order: String(queryState.sort[0].order),
    };
  }

  // Only include status if it has a value
  if (status) {
    payload.status = status;
  }

  return payload;
}

export function createCacheKey(state: TableQueryState, marketCode: string): string {
  const stableState = {
    ...state,
    sort: state.sort ? [...state.sort].sort((a, b) => a.column.localeCompare(b.column)) : [],
    columnFilters: state.columnFilters
      ? [...state.columnFilters].sort((a, b) => a.column.localeCompare(b.column))
      : [],
  };
  return `${marketCode}-${state.tab}-${JSON.stringify(stableState)}`;
}
