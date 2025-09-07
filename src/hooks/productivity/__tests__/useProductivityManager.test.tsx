
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProductivityManager } from '../useProductivityManager';
import { WorkTypeEntryWithHistory } from '../types';

// Mock the dependencies
vi.mock('../useEntryFetch', () => ({
  useEntryFetch: vi.fn(() => ({
    fetchedEntries: [],
    isLoading: false,
    refetch: vi.fn(),
  })),
}));

vi.mock('../useEntryActions', () => ({
  useEntryActions: vi.fn(() => ({
    handleAdd: vi.fn(),
    handleEdit: vi.fn(),
    handleDelete: vi.fn(),
  })),
}));

vi.mock('../useTaskIdGenerator', () => ({
  useTaskIdGenerator: vi.fn(() => ({
    generateNextTaskIdFromDB: vi.fn(() => Promise.resolve('TASK-001')),
  })),
}));

vi.mock('../useProductivityUIState', () => ({
  useProductivityUIState: vi.fn(() => ({
    editing_id: null,
    temp_row: null,
    validationErrors: [],
    showValidationAlert: false,
    generateTempId: vi.fn(() => 'temp-1'),
    handleInputChange: vi.fn(),
    startEdit: vi.fn(),
    validateCurrentEntry: vi.fn(),
    resetEditState: vi.fn(),
    closeValidationAlert: vi.fn(),
    setTempRow: vi.fn(),
    setEditingId: vi.fn(),
  })),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
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

describe('useProductivityManager', () => {
  const mockEntries: WorkTypeEntryWithHistory[] = [
    {
      work_entry_id: 'ENTRY-001',
      work_type: 'harvest',
      work_type_code: 'harvest',
      site_id: 'site1',
      batch_ref: 'batch1',
      technician_refs: ['tech1'],
      approval_status: 'Draft',
      created_by: 'user1',
      created_at: '2024-01-01T00:00:00Z',
      entry_payload: {
        date: '2024-01-01',
        total_plants: 100,
        comment: 'Test entry',
      },
      has_history: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty entries', () => {
    const { result } = renderHook(() => useProductivityManager('harvest'), {
      wrapper: createWrapper(),
    });

    expect(result.current.entries).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should update entries when fetchedEntries changes', async () => {
    const { useEntryFetch } = require('../useEntryFetch');
    useEntryFetch.mockReturnValue({
      fetchedEntries: mockEntries,
      isLoading: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useProductivityManager('harvest'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(1);
      expect(result.current.entries[0].work_entry_id).toBe('ENTRY-001');
    });
  });

  it('should add new entry when addNewEntry is called', async () => {
    const { useProductivityUIState } = require('../useProductivityUIState');
    const mockSetEditingId = vi.fn();
    const mockSetTempRow = vi.fn();

    useProductivityUIState.mockReturnValue({
      editing_id: null,
      temp_row: null,
      validationErrors: [],
      showValidationAlert: false,
      generateTempId: vi.fn(() => 'temp-1'),
      handleInputChange: vi.fn(),
      startEdit: vi.fn(),
      validateCurrentEntry: vi.fn(),
      resetEditState: vi.fn(),
      closeValidationAlert: vi.fn(),
      setTempRow: mockSetTempRow,
      setEditingId: mockSetEditingId,
    });

    const { result } = renderHook(() => useProductivityManager('harvest'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.addNewEntry();
    });

    expect(mockSetEditingId).toHaveBeenCalledWith('temp-1');
    expect(mockSetTempRow).toHaveBeenCalled();
  });

  it('should not add new entry when work type is "all"', async () => {
    const { result } = renderHook(() => useProductivityManager('all'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.addNewEntry();
    });

    expect(result.current.entries).toHaveLength(0);
  });

  it('should save edit for existing entry', async () => {
    const { useProductivityUIState } = require('../useProductivityUIState');
    const { useEntryActions } = require('../useEntryActions');
    
    const mockHandleEdit = vi.fn();
    const mockResetEditState = vi.fn();
    const mockRefetch = vi.fn();

    useEntryActions.mockReturnValue({
      handleAdd: vi.fn(),
      handleEdit: mockHandleEdit,
      handleDelete: vi.fn(),
    });

    useProductivityUIState.mockReturnValue({
      editing_id: 'ENTRY-001',
      temp_row: mockEntries[0],
      validationErrors: [],
      showValidationAlert: false,
      generateTempId: vi.fn(),
      handleInputChange: vi.fn(),
      startEdit: vi.fn(),
      validateCurrentEntry: vi.fn(),
      resetEditState: mockResetEditState,
      closeValidationAlert: vi.fn(),
      setTempRow: vi.fn(),
      setEditingId: vi.fn(),
    });

    const { useEntryFetch } = require('../useEntryFetch');
    useEntryFetch.mockReturnValue({
      fetchedEntries: mockEntries,
      isLoading: false,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useProductivityManager('harvest'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.saveEdit();
    });

    expect(mockHandleEdit).toHaveBeenCalledWith('ENTRY-001', expect.objectContaining({
      work_entry_id: 'ENTRY-001',
    }));
    expect(mockResetEditState).toHaveBeenCalled();
  });

  it('should cancel edit and remove temp entry', () => {
    const { useProductivityUIState } = require('../useProductivityUIState');
    const mockResetEditState = vi.fn();

    useProductivityUIState.mockReturnValue({
      editing_id: 'temp-1',
      temp_row: null,
      validationErrors: [],
      showValidationAlert: false,
      generateTempId: vi.fn(),
      handleInputChange: vi.fn(),
      startEdit: vi.fn(),
      validateCurrentEntry: vi.fn(),
      resetEditState: mockResetEditState,
      closeValidationAlert: vi.fn(),
      setTempRow: vi.fn(),
      setEditingId: vi.fn(),
    });

    const { result } = renderHook(() => useProductivityManager('harvest'), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.cancelEdit();
    });

    expect(mockResetEditState).toHaveBeenCalled();
  });

  it('should handle loading state', () => {
    const { useEntryFetch } = require('../useEntryFetch');
    useEntryFetch.mockReturnValue({
      fetchedEntries: [],
      isLoading: true,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useProductivityManager('harvest'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
