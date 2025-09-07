import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ProductivityTable } from '../ProductivityTable';
import { WorkTypeEntryWithHistory } from '@/hooks/productivity/types';

// Mock the hooks and components
vi.mock('@/hooks/useProductivityColumns', () => ({
  useProductivityColumns: vi.fn(() => ({
    columns: [
      { id: 'task_id', header: 'Task ID' },
      { id: 'date', header: 'Date' }
    ]
  }))
}));

vi.mock('@/components/table/DataTableWithQuery', () => ({
  DataTableWithQuery: ({ data, columns }: any) => (
    <div data-testid="data-table-with-query">
      <div>Data: {data?.length || 0} items</div>
      <div>Columns: {columns?.length || 0}</div>
    </div>
  )
}));

vi.mock('@/context/RBACContext', () => ({
  useRBAC: vi.fn(() => ({
    roleCode: 'admin'
  }))
}));

const mockEntries: WorkTypeEntryWithHistory[] = [
  {
    work_entry_id: 'entry-1',
    task_id: 'task-1',
    date: '2024-01-01',
    work_type: 'Hand Trim',
    site_id: 'site-1',
    technician_id: 'tech-1',
    status: 'Pending',
    created_at: '2024-01-01T00:00:00Z',
    history: []
  }
];

const mockQueryState = {
  search: '',
  columnFilters: [],
  sort: [],
  pagination: { page: 1, pageSize: 10 },
  tab: 'all'
};

describe('ProductivityTable', () => {
  const defaultProps = {
    queryResult: {
      data: mockEntries,
      totalCount: mockEntries.length,
      isLoading: false,
      error: null,
      queryState: mockQueryState,
      updateSearch: vi.fn(),
      updateColumnFilters: vi.fn(),
      updateSort: vi.fn(),
      updatePagination: vi.fn(),
      updateTab: vi.fn(),
      refetch: vi.fn(),
    },
    selectedWorkType: 'all',
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onHistory: vi.fn(),
    onSelectionChange: vi.fn(),
    rowActions: [],
    bulkActions: [],
    rowSelection: {},
    setRowSelection: vi.fn(),
    saveFooter: undefined,
    editingId: null,
    tempRow: null,
    onInputChange: vi.fn(),
    perms: {
      view: true,
      add: true,
      edit: true,
      delete: true,
      viewHistory: true
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders successfully', () => {
    render(<ProductivityTable {...defaultProps} />);
    expect(screen.getByTestId('data-table-with-query')).toBeInTheDocument();
  });

  it('passes correct data to DataTableWithQuery', () => {
    render(<ProductivityTable {...defaultProps} />);
    expect(screen.getByText('Data: 1 items')).toBeInTheDocument();
    expect(screen.getByText('Columns: 2')).toBeInTheDocument();
  });
});