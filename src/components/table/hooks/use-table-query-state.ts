import { isEqual } from 'lodash';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { TableQueryState, UseTableQueryStateProps, TableQueryResult } from '@/types/table';
import { SortItem, ColumnFilterState } from '@/types/table';
import { createCacheKey } from '@/utils/table/table-query-helpers';

export function useTableQueryState<TData = unknown>({
  initialState = {},
  defaultPageSize = 100,
  fetchFunction,
  enableApiMode = false,
  tab = '',
  marketCode = '',
  serverSide = true,
}: UseTableQueryStateProps<TData>): TableQueryResult<TData> {
  const queryCache = useRef(
    new Map<string, { data: TData[]; totalCount: number; timestamp: number }>(),
  ).current;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Initialize query state
  const [queryState, setQueryState] = useState<TableQueryState>({
    search: initialState.search || '',
    columnFilters: initialState.columnFilters || [],
    sort: initialState.sort || [],
    pagination: {
      page: initialState.pagination?.page || 1,
      pageSize: initialState.pagination?.pageSize || defaultPageSize,
    },
    tab: initialState.tab || tab || '',
  });

  // API state
  const [data, setData] = useState<TData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [market, setMarket] = useState<string>(marketCode);
  const [error, setError] = useState<string | null>(null);
  const [lastSuccessfulData, setLastSuccessfulData] = useState<{
    data: TData[];
    totalCount: number;
  } | null>(null);

  const searchRef = useRef(queryState.search);

  // Debounced values with different timings
  const debouncedSearch = useDebounce(queryState.search, 500);
  const debouncedColumnFilters = useDebounce(queryState.columnFilters, 500);

  // Create the effective query state for API calls
  const effectiveQueryState = useMemo(
    () => ({
      ...queryState,
      search: debouncedSearch,
      columnFilters: debouncedColumnFilters,
    }),
    [queryState, debouncedSearch, debouncedColumnFilters],
  );

  // Helper to get cached data if not expired
  const getCachedData = useCallback(
    (cacheKey: string) => {
      const cached = queryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached;
      }
      return null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // queryCache and CACHE_DURATION are stable refs/constants
  );

  // Fetch data function
  const fetchData = useCallback(
    async (state: TableQueryState, forceRefetch = false) => {
      if (!enableApiMode || !fetchFunction) {
        return;
      }

      const cacheKey = createCacheKey(state, marketCode);

      // Check cache first unless force refetch
      if (!forceRefetch) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          setData(cachedData.data);
          setTotalCount(cachedData.totalCount);
          setError(null);
          return;
        }
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchFunction(state);

        // Cache the result
        queryCache.set(cacheKey, {
          data: result.data,
          totalCount: result.totalCount,
          timestamp: Date.now(),
        });

        setData(result.data);
        setTotalCount(result.totalCount);
        setLastSuccessfulData({
          data: result.data,
          totalCount: result.totalCount,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(errorMessage);

        toast.error('Failed to load data', {
          description: 'Using cached data if available',
          duration: 2000,
        });

        // Fallback to last successful data if available
        if (lastSuccessfulData) {
          setData(lastSuccessfulData.data);
          setTotalCount(lastSuccessfulData.totalCount);
        }
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enableApiMode, fetchFunction, getCachedData, lastSuccessfulData, marketCode],
    // queryCache is a stable ref and doesn't need to be in dependencies
  );

  // Fetch data when debounced values, sorting, or pagination change
  useEffect(() => {
    if (serverSide) {
      fetchData(effectiveQueryState);
    }
  }, [serverSide, fetchData, effectiveQueryState]);

  // Update functions with state management
  const updateSearch = useCallback((search: string) => {
    searchRef.current = search;
    setQueryState((prev) => ({
      ...prev,
      search,
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  const updateColumnFilters = useCallback((filters: ColumnFilterState[]) => {
    setQueryState((prev) => {
      if (isEqual(prev.columnFilters, filters)) {
        return prev;
      }
      return {
        ...prev,
        columnFilters: filters,
        pagination: { ...prev.pagination, page: 1 },
      };
    });
  }, []);

  const updateSort = useCallback((sorting: SortItem[]) => {
    setQueryState((prev) => ({
      ...prev,
      sort: sorting,
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  const updatePagination = useCallback((pagination: { page: number; pageSize: number }) => {
    setQueryState((prev) => ({
      ...prev,
      pagination,
    }));
  }, []);

  const updateTab = useCallback((newTab: string) => {
    setQueryState((prev) => ({
      ...prev,
      tab: newTab,
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  // If tab prop changes and update query state
  useEffect(() => {
    setQueryState((prev) => {
      if (tab !== undefined && tab !== prev.tab) {
        return {
          ...prev,
          tab,
          pagination: { ...prev.pagination, page: 1 },
        };
      }
      return prev;
    });
  }, [tab]);

  // Update market when marketCode prop changes and invalidate cache
  useEffect(() => {
    if (marketCode !== market) {
      setMarket(marketCode);
      // Clear cache when market changes
      queryCache.clear();
      // Force refetch when market changes
      if (enableApiMode && fetchFunction && serverSide) {
        const stateForFetch = {
          ...queryState,
          search: debouncedSearch,
        };
        fetchData(stateForFetch, true);
      }
    }
  }, [
    marketCode,
    market,
    enableApiMode,
    fetchFunction,
    queryState,
    debouncedSearch,
    fetchData,
    queryCache,
    serverSide,
  ]);

  const refetch = useCallback(async () => {
    const stateForFetch = {
      ...queryState,
      search: debouncedSearch,
    };
    await fetchData(stateForFetch, true);
  }, [fetchData, queryState, debouncedSearch]);

  // Return the current query state (with immediate search updates for UI)
  const currentQueryState = useMemo(
    () => ({
      ...queryState,
      search: searchRef.current,
      columnFilters: queryState.columnFilters,
    }),
    [queryState],
  );

  return {
    data,
    totalCount,
    isLoading,
    error,
    queryState: currentQueryState,
    updateSearch,
    updateColumnFilters,
    updateSort,
    updatePagination,
    updateTab,
    refetch,
  };
}
