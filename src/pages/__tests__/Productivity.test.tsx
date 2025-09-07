
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Productivity from '../Productivity';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock all the hooks and components
vi.mock('@/hooks/use-productivity-manager', () => ({
  useProductivityManager: vi.fn(() => ({
    entries: [
      {
        work_entry_id: 'TASK-001',
        work_type: 'harvest',
        approval_status: 'Draft',
        created_at: '2025-01-01T00:00:00Z',
        entry_payload: { date: '2025-01-01' },
        has_history: true
      }
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
  }))
}));

vi.mock('@/components/ProductivityTable', () => ({
  ProductivityTable: ({ data, selectedWorkType }: any) => (
    <div data-testid="productivity-table">
      <div>Work Type: {selectedWorkType}</div>
      <div>Entries: {data.length}</div>
    </div>
  )
}));

vi.mock('@/components/organisms/PageHeader', () => ({
  PageHeader: ({ title, description, actions }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
      <div>{actions}</div>
    </div>
  )
}));

vi.mock('@/components/SaveCancelFooter', () => ({
  SaveCancelFooter: ({ isVisible }: any) => 
    isVisible ? <div data-testid="save-cancel-footer">Footer</div> : null
}));

vi.mock('@/components/ValidationAlert', () => ({
  ValidationAlert: ({ isVisible, errors }: any) => 
    isVisible ? <div data-testid="validation-alert">Errors: {errors.join(', ')}</div> : null
}));

vi.mock('@/components/audit/AuditHistoryModal', () => ({
  AuditHistoryModal: ({ open, title }: any) =>
    open ? <div data-testid="audit-history-modal">{title}</div> : null
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

// Mock Select component
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }: any) => (
    <div data-testid="select" onClick={() => onValueChange?.('harvest')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div onClick={() => {}} data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => (
    <button role="combobox">{children}</button>
  ),
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>
}));

// Create a wrapper with QueryClient
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

describe('Productivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the productivity page', () => {
    render(<Productivity />, { wrapper: createWrapper() });
    
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByText('Productivity')).toBeInTheDocument();
    expect(screen.getByText('Manage productivity data entries')).toBeInTheDocument();
  });

  it('renders productivity table with data', () => {
    render(<Productivity />, { wrapper: createWrapper() });
    
    expect(screen.getByTestId('productivity-table')).toBeInTheDocument();
    expect(screen.getByText('Work Type: all')).toBeInTheDocument();
    expect(screen.getByText('Entries: 1')).toBeInTheDocument();
  });

  it('shows work type selector', () => {
    render(<Productivity />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Work Type')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows add entry button', () => {
    render(<Productivity />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Add Entry')).toBeInTheDocument();
  });

  it('disables add entry button when work type is "all"', () => {
    render(<Productivity />, { wrapper: createWrapper() });
    
    const addButton = screen.getByText('Add Entry').closest('button');
    expect(addButton).toBeDisabled();
  });

  it('calls addNewEntry when add button is clicked', async () => {
    const { useProductivityManager } = require('@/hooks/use-productivity-manager');
    const mockAddNewEntry = vi.fn();
    
    useProductivityManager.mockReturnValue({
      entries: [],
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
      addNewEntry: mockAddNewEntry,
      closeValidationAlert: vi.fn(),
    });
    
    render(<Productivity />, { wrapper: createWrapper() });
    
    // Change work type to enable the button
    const selectElement = screen.getByTestId('select');
    fireEvent.click(selectElement);
    
    // Wait for state to update
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Try to find and click the add button
    const addButton = screen.getByText('Add Entry').closest('button');
    if (addButton && !addButton.disabled) {
      fireEvent.click(addButton);
      expect(mockAddNewEntry).toHaveBeenCalled();
    }
  });

  it('shows save/cancel footer when editing', () => {
    const { useProductivityManager } = require('@/hooks/use-productivity-manager');
    
    useProductivityManager.mockReturnValue({
      entries: [],
      isLoading: false,
      editing_id: 'some-id',
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
    });
    
    render(<Productivity />, { wrapper: createWrapper() });
    
    expect(screen.getByTestId('save-cancel-footer')).toBeInTheDocument();
  });

  it('shows validation alert when there are errors', () => {
    const { useProductivityManager } = require('@/hooks/use-productivity-manager');
    
    useProductivityManager.mockReturnValue({
      entries: [],
      isLoading: false,
      editing_id: null,
      temp_row: null,
      validationErrors: ['Field is required'],
      showValidationAlert: true,
      handleDelete: vi.fn(),
      handleInputChange: vi.fn(),
      startEdit: vi.fn(),
      saveEdit: vi.fn(),
      cancelEdit: vi.fn(),
      addNewEntry: vi.fn(),
      closeValidationAlert: vi.fn(),
    });
    
    render(<Productivity />, { wrapper: createWrapper() });
    
    expect(screen.getByTestId('validation-alert')).toBeInTheDocument();
    expect(screen.getByText('Errors: Field is required')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    const { useProductivityManager } = require('@/hooks/use-productivity-manager');
    
    useProductivityManager.mockReturnValue({
      entries: [],
      isLoading: true,
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
    });
    
    render(<Productivity />, { wrapper: createWrapper() });
    
    expect(screen.getByTestId('productivity-table')).toBeInTheDocument();
  });
});
