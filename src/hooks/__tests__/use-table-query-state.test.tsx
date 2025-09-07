
import { renderHook, act } from '@testing-library/react';
import { useTableQueryState } from '../use-table-query-state';

describe('useTableQueryState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useTableQueryState({}));

    expect(result.current.queryState).toEqual({
      search: '',
      columnFilters: [],
      sort: [],
      pagination: { page: 1, pageSize: 100 },
    });
    expect(result.current.data).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should initialize with custom initial state', () => {
    const initialState = {
      search: 'test',
      pagination: { page: 2, pageSize: 50 },
    };

    const { result } = renderHook(() => 
      useTableQueryState({ initialState })
    );

    expect(result.current.queryState.search).toBe('test');
    expect(result.current.queryState.pagination).toEqual({ page: 2, pageSize: 50 });
  });

  it('should update search and reset pagination', () => {
    const { result } = renderHook(() => useTableQueryState({}));

    act(() => {
      result.current.updateSearch('new search');
    });

    expect(result.current.queryState.search).toBe('new search');
    expect(result.current.queryState.pagination.page).toBe(1);
  });

  it('should update column filters and reset pagination', () => {
    const { result } = renderHook(() => useTableQueryState({}));

    const filters = [{ column: 'name', values: ['test'] }];

    act(() => {
      result.current.updateColumnFilters(filters);
    });

    expect(result.current.queryState.columnFilters).toEqual(filters);
    expect(result.current.queryState.pagination.page).toBe(1);
  });

  it('should update sort and reset pagination', () => {
    const { result } = renderHook(() => useTableQueryState({}));

    const sort = [{ column: 'name', order: 'asc' as const }];

    act(() => {
      result.current.updateSort(sort);
    });

    expect(result.current.queryState.sort).toEqual(sort);
    expect(result.current.queryState.pagination.page).toBe(1);
  });

  it('should update pagination without resetting page', () => {
    const { result } = renderHook(() => useTableQueryState({}));

    const pagination = { page: 3, pageSize: 25 };

    act(() => {
      result.current.updatePagination(pagination);
    });

    expect(result.current.queryState.pagination).toEqual(pagination);
  });

  it('should handle API mode with fetch function', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      data: [{ id: 1, name: 'test' }],
      totalCount: 1,
    });

    const { result } = renderHook(() => 
      useTableQueryState({
        fetchFunction: mockFetch,
        enableApiMode: true,
      })
    );

    expect(result.current.isLoading).toBe(true);

    // Wait for the async operation to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockFetch).toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => 
      useTableQueryState({
        fetchFunction: mockFetch,
        enableApiMode: true,
      })
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('API Error');
    expect(result.current.isLoading).toBe(false);
  });

  it('should provide refetch function', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      data: [],
      totalCount: 0,
    });

    const { result } = renderHook(() => 
      useTableQueryState({
        fetchFunction: mockFetch,
        enableApiMode: true,
      })
    );

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockFetch).toHaveBeenCalledTimes(2); // Initial + refetch
  });
});
