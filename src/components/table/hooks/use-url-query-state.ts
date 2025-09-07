import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TableQueryState } from '@/types/query';

export interface UseUrlQueryStateProps {
  enableUrlSync?: boolean;
  tableId?: string;
  onStateChange?: (state: Partial<TableQueryState>) => void;
}

export function useUrlQueryState({
  enableUrlSync = false,
  tableId = 'table',
  onStateChange,
}: UseUrlQueryStateProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse URL state on mount
  const parseUrlState = useCallback((): Partial<TableQueryState> => {
    if (!enableUrlSync) return {};

    const prefix = tableId ? `${tableId}_` : '';

    try {
      const urlState: Partial<TableQueryState> = {};

      // Parse search
      const search = searchParams.get(`${prefix}search`);
      if (search) urlState.search = search;

      // Parse pagination
      const page = searchParams.get(`${prefix}page`);
      const pageSize = searchParams.get(`${prefix}pageSize`);
      if (page || pageSize) {
        urlState.pagination = {
          page: page ? parseInt(page) : 1,
          pageSize: pageSize ? parseInt(pageSize) : 100,
        };
      }

      // Parse sort
      const sortColumn = searchParams.get(`${prefix}sortColumn`);
      const sortOrder = searchParams.get(`${prefix}sortOrder`);
      if (sortColumn && sortOrder) {
        urlState.sort = [{ column: sortColumn, order: sortOrder as 'asc' | 'desc', sortIndex: 0 }];
      }

      // Parse column filters
      const filtersParam = searchParams.get(`${prefix}filters`);
      if (filtersParam) {
        try {
          const parsedFilters = JSON.parse(decodeURIComponent(filtersParam));
          urlState.columnFilters = parsedFilters.map(
            (f: {
              column: string;
              value: string | number | boolean | Date | null;
              filterType?: string;
            }) => ({
              column: f.column,
              value: f.value,
              filterType: f.filterType || 'text',
            }),
          );
        } catch (e) {
          console.warn('Failed to parse column filters from URL:', e);
        }
      }

      // Parse tab
      const tab = searchParams.get(`${prefix}tab`);
      if (tab) urlState.tab = tab;

      return urlState;
    } catch (error) {
      console.warn('Failed to parse URL state:', error);
      return {};
    }
  }, [searchParams, enableUrlSync, tableId]);

  // Debounced URL update to prevent too frequent updates
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedUpdateUrl = useCallback(
    (state: TableQueryState) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (!enableUrlSync || !state) return;

        // Ensure state has all required properties with defaults
        const safeState = {
          search: state.search || '',
          columnFilters: state.columnFilters || [],
          sort: state.sort || [],
          pagination: state.pagination || { page: 1, pageSize: 100 },
          tab: state.tab || '',
          ...state,
        };

        const prefix = tableId ? `${tableId}_` : '';
        const newParams = new URLSearchParams(searchParams);

        // Update search
        if (safeState.search) {
          newParams.set(`${prefix}search`, safeState.search);
        } else {
          newParams.delete(`${prefix}search`);
        }

        // Update pagination
        if (safeState.pagination && safeState.pagination.page !== 1) {
          newParams.set(`${prefix}page`, safeState.pagination.page.toString());
        } else {
          newParams.delete(`${prefix}page`);
        }

        if (safeState.pagination && safeState.pagination.pageSize !== 100) {
          newParams.set(`${prefix}pageSize`, safeState.pagination.pageSize.toString());
        } else {
          newParams.delete(`${prefix}pageSize`);
        }

        // Update sort
        if (safeState.sort && safeState.sort.length > 0) {
          const firstSort = safeState.sort[0];
          newParams.set(`${prefix}sortColumn`, firstSort.column);
          newParams.set(`${prefix}sortOrder`, String(firstSort.order));
        } else {
          newParams.delete(`${prefix}sortColumn`);
          newParams.delete(`${prefix}sortOrder`);
        }

        // Update column filters
        if (safeState.columnFilters && safeState.columnFilters.length > 0) {
          newParams.set(
            `${prefix}filters`,
            encodeURIComponent(JSON.stringify(safeState.columnFilters)),
          );
        } else {
          newParams.delete(`${prefix}filters`);
        }

        // Update tab
        if (safeState.tab) {
          newParams.set(`${prefix}tab`, safeState.tab);
        } else {
          newParams.delete(`${prefix}tab`);
        }

        // Only update URL if something actually changed
        const newSearchString = newParams.toString();
        if (newSearchString !== searchParams.toString()) {
          setSearchParams(newParams, { replace: true });
        }
      }, 500);
    },
    [enableUrlSync, tableId, searchParams, setSearchParams],
  );

  // Update URL when state changes
  const updateUrl = useCallback(
    (state: TableQueryState) => {
      if (!state) return;
      debouncedUpdateUrl(state);
    },
    [debouncedUpdateUrl],
  );

  useEffect(() => {
    if (!enableUrlSync || !onStateChange) return;

    // Parse initial URL state and notify parent
    const urlState = parseUrlState();
    if (Object.keys(urlState).length > 0) {
      onStateChange(urlState as TableQueryState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, enableUrlSync, onStateChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    parseUrlState,
    updateUrl,
  };
}
