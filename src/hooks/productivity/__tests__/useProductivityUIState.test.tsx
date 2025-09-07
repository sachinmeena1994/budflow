
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useProductivityUIState } from '../useProductivityUIState';
import { WorkTypeEntryWithHistory } from '../types';

// Mock the workTypeFields data
vi.mock('@/components/inventory/workType', () => ({
  workTypeFields: {
    harvest: [
      { field_key: 'date', label: 'Date', type: 'date', required: true },
      { field_key: 'total_plants', label: 'Total Plants', type: 'number', required: true },
    ],
  },
}));

describe('useProductivityUIState', () => {
  const mockEntry: WorkTypeEntryWithHistory = {
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
    },
    has_history: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useProductivityUIState('harvest'));

    expect(result.current.editing_id).toBeNull();
    expect(result.current.temp_row).toBeNull();
    expect(result.current.validationErrors).toEqual([]);
    expect(result.current.showValidationAlert).toBe(false);
  });

  it('should start editing correctly', () => {
    const { result } = renderHook(() => useProductivityUIState('harvest'));

    act(() => {
      result.current.startEdit(mockEntry);
    });

    expect(result.current.editing_id).toBe('ENTRY-001');
    expect(result.current.temp_row).toEqual(mockEntry);
  });

  it('should handle input change correctly', () => {
    const { result } = renderHook(() => useProductivityUIState('harvest'));

    act(() => {
      result.current.startEdit(mockEntry);
    });

    act(() => {
      result.current.handleInputChange('total_plants', 150);
    });

    expect(result.current.temp_row?.entry_payload?.total_plants).toBe(150);
  });

  it('should reset edit state correctly', () => {
    const { result } = renderHook(() => useProductivityUIState('harvest'));

    act(() => {
      result.current.startEdit(mockEntry);
    });

    act(() => {
      result.current.resetEditState();
    });

    expect(result.current.editing_id).toBeNull();
    expect(result.current.temp_row).toBeNull();
  });

  it('should generate temp id correctly', () => {
    const { result } = renderHook(() => useProductivityUIState('harvest'));

    const tempId1 = result.current.generateTempId();
    const tempId2 = result.current.generateTempId();

    expect(tempId1).toMatch(/^temp-\d+$/);
    expect(tempId2).toMatch(/^temp-\d+$/);
    expect(tempId1).not.toBe(tempId2);
  });

  it('should validate current entry', () => {
    const { result } = renderHook(() => useProductivityUIState('harvest'));

    act(() => {
      result.current.startEdit({
        ...mockEntry,
        entry_payload: { date: '', total_plants: 0 },
      });
    });

    act(() => {
      result.current.validateCurrentEntry();
    });

    expect(result.current.validationErrors.length).toBeGreaterThan(0);
    expect(result.current.showValidationAlert).toBe(true);
  });

  it('should close validation alert', () => {
    const { result } = renderHook(() => useProductivityUIState('harvest'));

    act(() => {
      result.current.startEdit(mockEntry);
    });

    act(() => {
      result.current.validateCurrentEntry();
    });

    act(() => {
      result.current.closeValidationAlert();
    });

    expect(result.current.showValidationAlert).toBe(false);
  });
});
