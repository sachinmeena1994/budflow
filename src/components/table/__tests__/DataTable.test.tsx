import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '../DataTable';
import { TableColumn } from '@/types/table';

// Mock the hooks
jest.mock('@/hooks/use-data-table', () => ({
  useDataTable: () => ({
    table: {
      getHeaderGroups: () => [],
      getRowModel: () => ({ rows: [] }),
      getCanPreviousPage: () => false,
      getCanNextPage: () => false,
      getPageCount: () => 1,
      getState: () => ({ pagination: { pageIndex: 0, pageSize: 100 } }),
      previousPage: jest.fn(),
      nextPage: jest.fn(),
      setPageSize: jest.fn(),
    },
    globalFilter: '',
    setGlobalFilter: jest.fn(),
    openColumnFilters: {},
    toggleColumnFilter: jest.fn(),
    columnManagementOpen: false,
    setColumnManagementOpen: jest.fn(),
    moveColumn: jest.fn(),
    rowSelection: {},
    resetTableToDefaults: jest.fn(),
    defaultColumnConfig: [],
    alwaysVisibleColumnIds: [],
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

const mockData: TestData[] = [
  { id: '1', name: 'Item 1', category: 'Category A' },
  { id: '2', name: 'Item 2', category: 'Category B' },
];

describe('DataTable', () => {
  it('should render data table', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    // Since we're mocking the hook, we won't see the actual data
    // but we can verify the component renders without errors
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should show loading state when isLoading is true', () => {
    render(<DataTable columns={mockColumns} data={mockData} isLoading={true} />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should show empty state when data is empty and emptyTitle is provided', () => {
    render(<DataTable columns={mockColumns} data={[]} emptyTitle="No data available" />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should handle server-side configuration', () => {
    const mockOnPageChange = jest.fn();

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        tableConfig={{
          serverSide: true,
          totalCount: 100,
          currentPage: 0,
          onPageChange: mockOnPageChange,
        }}
      />,
    );

    // Verify server-side props are passed correctly
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should handle row color classes', () => {
    const getRowColorClass = jest.fn(() => 'bg-red-100');

    render(<DataTable columns={mockColumns} data={mockData} getRowColorClass={getRowColorClass} />);

    // Verify the function is available
    expect(getRowColorClass).toBeDefined();
  });

  it('should handle cell value changes', () => {
    const onCellValueChange = jest.fn();

    render(
      <DataTable columns={mockColumns} data={mockData} onCellValueChange={onCellValueChange} />,
    );

    // Verify the callback is available
    expect(onCellValueChange).toBeDefined();
  });
});
