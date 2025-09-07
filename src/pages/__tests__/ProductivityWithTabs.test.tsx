
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductivityWithTabs from '../ProductivityWithTabs';

// Mock all the hooks and components
vi.mock('@/hooks/use-productivity-manager', () => ({
  useProductivityManager: vi.fn(() => ({
    entries: [
      {
        work_entry_id: 'ENTRY-001',
        work_type: 'harvest',
        approval_status: 'Draft',
        created_at: '2024-01-01T00:00:00Z',
        entry_payload: { date: '2024-01-01' },
        has_history: false,
      },
    ],
    isLoading: false,
    editing_id: null,
    temp_row: null,
    validationErrors: [],
    showValidationAlert: false,
    handleDelete: vi.fn(),
    handleInputChange: vi.fn(),
    startEdit: vi.fn(),
    saveEdit: vi.fn(),
    cancelEdit: vi.fn(),
    addNewEntry: vi.fn(),
    closeValidationAlert: vi.fn(),
  })),
}));

vi.mock('@/hooks/use-approvals-manager', () => ({
  useApprovalsManager: vi.fn(() => ({
    entries: [
      {
        work_entry_id: 'ENTRY-002',
        work_type: 'harvest',
        approval_status: 'Submitted',
        created_at: '2024-01-02T00:00:00Z',
        entry_payload: { date: '2024-01-02' },
      },
    ],
    isLoading: false,
    approveEntry: vi.fn(),
    rejectEntry: vi.fn(),
    refetch: vi.fn(),
  })),
}));

vi.mock('../Productivity', () => ({
  default: () => (
    <div data-testid="productivity-page">
      <div>Productivity Entries</div>
    </div>
  ),
}));

vi.mock('../ApprovalsCenter', () => ({
  default: () => (
    <div data-testid="approvals-center">
      <div>Approval Center</div>
    </div>
  ),
}));

vi.mock('@/components/molecules/StandardTabs', () => ({
  StandardTabs: ({ tabs, value, onValueChange }: any) => (
    <div data-testid="standard-tabs">
      {tabs.map((tab: any) => (
        <button
          key={tab.value}
          onClick={() => onValueChange?.(tab.value)}
          className={value === tab.value ? 'active' : ''}
        >
          {tab.label}
          {tab.badge}
        </button>
      ))}
      {tabs.find((tab: any) => tab.value === value)?.content}
    </div>
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('ProductivityWithTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders productivity with tabs', () => {
    render(<ProductivityWithTabs />, { wrapper: createWrapper() });

    expect(screen.getByTestId('standard-tabs')).toBeInTheDocument();
    expect(screen.getByText('Productivity')).toBeInTheDocument();
    expect(screen.getByText('Approvals Center')).toBeInTheDocument();
  });

  it('renders productivity entries tab by default', () => {
    render(<ProductivityWithTabs />, { wrapper: createWrapper() });

    expect(screen.getByTestId('productivity-page')).toBeInTheDocument();
    expect(screen.getByText('Productivity Entries')).toBeInTheDocument();
  });

  it('switches to approval center tab when clicked', async () => {
    render(<ProductivityWithTabs />, { wrapper: createWrapper() });

    const approvalTab = screen.getByText('Approvals Center');
    fireEvent.click(approvalTab);

    await waitFor(() => {
      expect(screen.getByTestId('approvals-center')).toBeInTheDocument();
      expect(screen.getByText('Approval Center')).toBeInTheDocument();
    });
  });

  it('displays pending count badge on approval center tab', () => {
    render(<ProductivityWithTabs />, { wrapper: createWrapper() });

    const badge = screen.getByText('1');
    expect(badge).toBeInTheDocument();
  });

  it('handles tab switching correctly', async () => {
    render(<ProductivityWithTabs />, { wrapper: createWrapper() });

    // Start with productivity entries tab
    expect(screen.getByTestId('productivity-page')).toBeInTheDocument();

    // Switch to approval center
    const approvalTab = screen.getByText('Approvals Center');
    fireEvent.click(approvalTab);

    await waitFor(() => {
      expect(screen.getByTestId('approvals-center')).toBeInTheDocument();
    });

    // Switch back to productivity entries
    const productivityTab = screen.getByText('Productivity');
    fireEvent.click(productivityTab);

    await waitFor(() => {
      expect(screen.getByTestId('productivity-page')).toBeInTheDocument();
    });
  });

  it('updates badge count when approvals change', async () => {
    const { useApprovalsManager } = require('@/hooks/use-approvals-manager');
    
    // Initially show 1 pending
    const { rerender } = render(<ProductivityWithTabs />, { wrapper: createWrapper() });
    expect(screen.getByText('1')).toBeInTheDocument();

    // Mock updated hook with 2 pending
    useApprovalsManager.mockReturnValue({
      entries: [
        {
          work_entry_id: 'ENTRY-002',
          work_type: 'harvest',
          approval_status: 'Submitted',
        },
        {
          work_entry_id: 'ENTRY-003',
          work_type: 'machine',
          approval_status: 'Submitted',
        },
      ],
      isLoading: false,
      approveEntry: vi.fn(),
      rejectEntry: vi.fn(),
      refetch: vi.fn(),
    });

    rerender(<ProductivityWithTabs />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows no badge when no pending entries', () => {
    const { useApprovalsManager } = require('@/hooks/use-approvals-manager');
    
    useApprovalsManager.mockReturnValue({
      entries: [],
      isLoading: false,
      approveEntry: vi.fn(),
      rejectEntry: vi.fn(),
      refetch: vi.fn(),
    });

    render(<ProductivityWithTabs />, { wrapper: createWrapper() });

    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });
});
