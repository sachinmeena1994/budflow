
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProductivityColumns } from '../useProductivityColumns';

// Mock the dependencies
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn((config) => {
    const queryKey = config.queryKey[0];
    
    switch (queryKey) {
      case 'sites':
        return { data: [{ id: 'site1', name: 'Site 1' }] };
      case 'batches':
        return { data: [{ id: 'batch1', name: 'Batch 1' }] };
      case 'technicians':
        return { data: [{ id: 'tech1', name: 'Tech 1' }] };
      case 'strains':
        return { data: [{ id: 'strain1', name: 'Strain 1' }] };
      case 'users':
        return { data: [{ id: 'user1', full_name: 'User 1' }] };
      case 'work-type-fields':
        return { data: [{ id: 'field1', field_key: 'custom_field', label: 'Custom Field', type: 'text' }] };
      default:
        return { data: [] };
    }
  })
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    })),
  },
}));

describe('useProductivityColumns', () => {
  const mockProps = {
    workType: 'harvest',
    editingId: null,
    tempRow: null,
    onInputChange: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns columns and history modal for harvest work type', () => {
    const { result } = renderHook(() => useProductivityColumns(mockProps));
    
    expect(result.current.columns).toBeDefined();
    expect(result.current.historyModal).toBeDefined();
    expect(result.current.workTypeFields).toBeDefined();
    expect(Array.isArray(result.current.columns)).toBe(true);
  });

  it('returns fewer columns for "all" work type', () => {
    const { result: allResult } = renderHook(() => 
      useProductivityColumns({ ...mockProps, workType: 'all' })
    );
    
    const { result: specificResult } = renderHook(() => 
      useProductivityColumns({ ...mockProps, workType: 'harvest' })
    );
    
    expect(allResult.current.columns.length).toBeLessThan(specificResult.current.columns.length);
  });

  it('includes standard columns for all work types', () => {
    const { result } = renderHook(() => useProductivityColumns(mockProps));
    
    const columnIds = result.current.columns.map(col => col.id);
    
    expect(columnIds).toContain('actions');
    expect(columnIds).toContain('history');
    expect(columnIds).toContain('task_id');
    expect(columnIds).toContain('work_type');
    expect(columnIds).toContain('site_id');
  });

  it('includes work-type specific columns for harvest', () => {
    const { result } = renderHook(() => 
      useProductivityColumns({ ...mockProps, workType: 'harvest' })
    );
    
    const columnIds = result.current.columns.map(col => col.id);
    
    expect(columnIds).toContain('comment');
    expect(columnIds).toContain('grams_per_hour');
  });

  it('handles editing state correctly', () => {
    const { result } = renderHook(() => 
      useProductivityColumns({ 
        ...mockProps, 
        editingId: 'test-id',
        tempRow: { id: 'test-id', test_field: 'test_value' }
      })
    );
    
    expect(result.current.columns).toBeDefined();
    expect(result.current.columns.length).toBeGreaterThan(0);
  });

  it('memoizes columns correctly', () => {
    const { result, rerender } = renderHook((props) => 
      useProductivityColumns(props), 
      { initialProps: mockProps }
    );
    
    const initialColumns = result.current.columns;
    
    // Rerender with same props
    rerender(mockProps);
    
    expect(result.current.columns).toBe(initialColumns);
  });
});
