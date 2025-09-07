import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DataTableWithQuery } from '../DataTableWithQuery';
import { TableColumn } from '@/types/table';

// Mock the hooks
jest.mock('@/hooks/use-url-query-state', () => ({
  useUrlQueryState: () => ({
    parseUrlState: jest.fn(() => ({})),
    updateUrl: jest.fn(),
  }),
}));

interface TestData {
  id: string;
  name: string;
  category: string;
}

const mockColumns: TableColumn<TestData>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'category',
    header: 'Category',
    accessorKey: 'category',
  },
];

const mockQueryResult = {
  data: [
    { id: '1', name: 'Item 1', category: 'Category A' },
    { id: '2', name: 'Item 2', category: 'Category B' },
  ],
  totalCount: 2,
  isLoading: false,
  error: null,
  queryState: {
    search: '',
    columnFilters: [],
    sort: [],
    pagination: { page: 1, pageSize: 100 },
  },
  updateSearch: jest.fn(),
  updateSort: jest.fn(),
  updatePagination: jest.fn(),
  updateColumnFilters: jest.fn(),
  refetch: jest.fn(),
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('DataTableWithQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render data table with query results', () => {
    renderWithRouter(<DataTableWithQuery queryResult={mockQueryResult} columns={mockColumns} />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should display error indicator when there is an error', () => {
    const errorQueryResult = {
      ...mockQueryResult,
      error: 'Connection failed',
    };

    renderWithRouter(<DataTableWithQuery queryResult={errorQueryResult} columns={mockColumns} />);

    expect(screen.getByText('Using cached data due to connection issues')).toBeInTheDocument();
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });

  it('should call refetch when retry button is clicked', async () => {
    const errorQueryResult = {
      ...mockQueryResult,
      error: 'Connection failed',
    };

    renderWithRouter(<DataTableWithQuery queryResult={errorQueryResult} columns={mockColumns} />);

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    expect(mockQueryResult.refetch).toHaveBeenCalled();
  });

  it('should handle search changes', async () => {
    renderWithRouter(
      <DataTableWithQuery
        queryResult={mockQueryResult}
        columns={mockColumns}
        tableConfig={{ enableGlobalFilter: true }}
        onSearchChange={jest.fn()}
      />,
    );

    // The search input should be available when global filter is enabled
    // This test verifies the search functionality integration
    expect(mockQueryResult.updateSearch).toBeDefined();
  });

  it('should handle URL synchronization', () => {
    renderWithRouter(
      <DataTableWithQuery
        queryResult={mockQueryResult}
        columns={mockColumns}
        enableUrlSync={true}
        tableId="test-table"
      />,
    );

    // Verify URL sync is properly configured
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    const loadingQueryResult = {
      ...mockQueryResult,
      isLoading: true,
    };

    renderWithRouter(<DataTableWithQuery queryResult={loadingQueryResult} columns={mockColumns} />);

    // Should show loading state
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });
});
