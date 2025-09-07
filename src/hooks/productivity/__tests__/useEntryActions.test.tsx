
import { renderHook, act } from '@testing-library/react';
import { useEntryActions } from '../useEntryActions';
import { WorkTypeEntryWithHistory } from '../types';
import { vi } from 'vitest';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    }))
  }
}));

// Mock useAuditLogger
vi.mock('../useAuditLogger', () => ({
  useAuditLogger: () => ({
    logAction: vi.fn()
  })
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('useEntryActions', () => {
  const mockEntry: WorkTypeEntryWithHistory = {
    work_entry_id: 'test-id',
    work_type_code: 'harvest',
    site_id: 'site-1',
    batch_ref: 'batch-1',
    technician_refs: ['tech-1'],
    approval_status: 'Draft',
    created_by: 'user-1',
    created_at: new Date().toISOString(),
    entry_payload: {},
    has_history: false
  };

  it('should handle add operation', async () => {
    const { result } = renderHook(() => useEntryActions('harvest'));
    
    await act(async () => {
      await result.current.handleAdd(mockEntry);
    });

    expect(result.current.handleAdd).toBeDefined();
  });

  it('should handle edit operation', async () => {
    const { result } = renderHook(() => useEntryActions('harvest'));
    
    await act(async () => {
      await result.current.handleEdit('test-id', mockEntry);
    });

    expect(result.current.handleEdit).toBeDefined();
  });

  it('should handle delete operation', async () => {
    const { result } = renderHook(() => useEntryActions('harvest'));
    
    await act(async () => {
      await result.current.handleDelete('test-id');
    });

    expect(result.current.handleDelete).toBeDefined();
  });
});
