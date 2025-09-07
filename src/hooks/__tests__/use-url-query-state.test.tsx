
import { renderHook, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useUrlQueryState } from '../use-url-query-state';

const mockSetSearchParams = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('useUrlQueryState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.clear();
  });

  it('should parse URL state correctly', () => {
    mockSearchParams.set('table_search', 'test');
    mockSearchParams.set('table_page', '2');
    mockSearchParams.set('table_pageSize', '50');

    const { result } = renderHook(() =>
      useUrlQueryState({
        enableUrlSync: true,
        tableId: 'table',
      }),
      { wrapper }
    );

    const urlState = result.current.parseUrlState();

    expect(urlState.search).toBe('test');
    expect(urlState.pagination?.page).toBe(2);
    expect(urlState.pagination?.pageSize).toBe(50);
  });

  it('should update URL when state changes', () => {
    const { result } = renderHook(() =>
      useUrlQueryState({
        enableUrlSync: true,
        tableId: 'table',
      }),
      { wrapper }
    );

    const testState = {
      search: 'new search',
      columnFilters: [],
      sort: [{ column: 'name', order: 'asc' as const }],
      pagination: { page: 3, pageSize: 25 },
    };

    act(() => {
      result.current.updateUrl(testState);
    });

    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it('should handle empty state gracefully', () => {
    const { result } = renderHook(() =>
      useUrlQueryState({
        enableUrlSync: true,
        tableId: 'table',
      }),
      { wrapper }
    );

    const urlState = result.current.parseUrlState();

    expect(urlState).toEqual({});
  });

  it('should not update URL when sync is disabled', () => {
    const { result } = renderHook(() =>
      useUrlQueryState({
        enableUrlSync: false,
        tableId: 'table',
      }),
      { wrapper }
    );

    const testState = {
      search: 'test',
      columnFilters: [],
      sort: [],
      pagination: { page: 1, pageSize: 100 },
    };

    act(() => {
      result.current.updateUrl(testState);
    });

    expect(mockSetSearchParams).not.toHaveBeenCalled();
  });

  it('should parse column filters from URL', () => {
    const filters = [{ column: 'category', values: ['A', 'B'] }];
    mockSearchParams.set('table_filters', encodeURIComponent(JSON.stringify(filters)));

    const { result } = renderHook(() =>
      useUrlQueryState({
        enableUrlSync: true,
        tableId: 'table',
      }),
      { wrapper }
    );

    const urlState = result.current.parseUrlState();

    expect(urlState.columnFilters).toEqual(filters);
  });
});
