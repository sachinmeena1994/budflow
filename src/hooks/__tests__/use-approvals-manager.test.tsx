
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApprovalsManager } from '../use-approvals-manager';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ data: [], error: null })),
        })),
        order: vi.fn(() => ({ data: [], error: null })),
      })),
      update: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })),
      channel: vi.fn(() => ({
        on: vi.fn(() => ({
          on: vi.fn(() => ({
            subscribe: vi.fn(),
          })),
        })),
      })),
    })),
  },
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

describe('useApprovalsManager', () => {
  const mockEntries = [
    {
      work_entry_id: 'ENTRY-001',
      work_type_code: 'harvest',
      approval_status: 'Submitted',
      created_by: 'user1',
      created_at: '2024-01-01T00:00:00Z',
      entry_payload: { date: '2024-01-01' },
    },
    {
      work_entry_id: 'ENTRY-002',
      work_type_code: 'machine',
      approval_status: 'Submitted',
      created_by: 'user2',
      created_at: '2024-01-02T00:00:00Z',
      entry_payload: { date: '2024-01-02' },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useApprovalsManager(), {
      wrapper: createWrapper(),
    });

    expect(result.current.entries).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('should fetch entries on mount', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    supabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ data: mockEntries, error: null })),
        })),
      })),
      channel: vi.fn(() => ({
        on: vi.fn(() => ({
          on: vi.fn(() => ({
            subscribe: vi.fn(),
          })),
        })),
      })),
    });

    const { result } = renderHook(() => useApprovalsManager(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(2);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should approve entry successfully', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    supabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ data: mockEntries, error: null })),
        })),
      })),
      update: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })),
      channel: vi.fn(() => ({
        on: vi.fn(() => ({
          on: vi.fn(() => ({
            subscribe: vi.fn(),
          })),
        })),
      })),
    });

    const { result } = renderHook(() => useApprovalsManager(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(2);
    });

    await act(async () => {
      await result.current.approveEntry('ENTRY-001');
    });

    expect(supabase.from().update).toHaveBeenCalledWith({
      approval_status: 'Approved',
      approved_by: 'b9647e6b-3ab2-4cbe-ad1f-f86d666567d6',
      approved_at: expect.any(String),
    });
  });

  it('should reject entry successfully', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    supabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ data: mockEntries, error: null })),
        })),
      })),
      update: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })),
      channel: vi.fn(() => ({
        on: vi.fn(() => ({
          on: vi.fn(() => ({
            subscribe: vi.fn(),
          })),
        })),
      })),
    });

    const { result } = renderHook(() => useApprovalsManager(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(2);
    });

    await act(async () => {
      await result.current.rejectEntry('ENTRY-001');
    });

    expect(supabase.from().update).toHaveBeenCalledWith({
      approval_status: 'Rejected',
      approved_by: 'b9647e6b-3ab2-4cbe-ad1f-f86d666567d6',
      approved_at: expect.any(String),
    });
  });

  it('should handle approval errors', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    supabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ data: mockEntries, error: null })),
        })),
      })),
      update: vi.fn(() => ({ eq: vi.fn(() => ({ error: { message: 'Update failed' } })) })),
      channel: vi.fn(() => ({
        on: vi.fn(() => ({
          on: vi.fn(() => ({
            subscribe: vi.fn(),
          })),
        })),
      })),
    });

    const { result } = renderHook(() => useApprovalsManager(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(2);
    });

    await act(async () => {
      await result.current.approveEntry('ENTRY-001');
    });

    const { toast } = require('sonner');
    expect(toast.error).toHaveBeenCalledWith('Failed to approve entry');
  });
});
