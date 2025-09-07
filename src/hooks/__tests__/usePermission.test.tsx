
import { renderHook } from '@testing-library/react';
import { usePermission } from '../usePermission';
import { useRBAC } from '@/context/RBACContext';

// Mock the RBAC context
jest.mock('@/context/RBACContext');

const mockUseRBAC = useRBAC as jest.MockedFunction<typeof useRBAC>;

describe('usePermission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when permission exists and is true', () => {
    mockUseRBAC.mockReturnValue({
      permissions: {
        'view-inventory': true,
        'create-orders': false,
      },
      isLoading: false,
      error: null,
      refetchPermissions: jest.fn(),
    });

    const { result } = renderHook(() => 
      usePermission({ action: 'view-inventory' })
    );

    expect(result.current).toBe(true);
  });

  it('should return false when permission exists and is false', () => {
    mockUseRBAC.mockReturnValue({
      permissions: {
        'view-inventory': true,
        'create-orders': false,
      },
      isLoading: false,
      error: null,
      refetchPermissions: jest.fn(),
    });

    const { result } = renderHook(() => 
      usePermission({ action: 'create-orders' })
    );

    expect(result.current).toBe(false);
  });

  it('should return false when permission does not exist', () => {
    mockUseRBAC.mockReturnValue({
      permissions: {
        'view-inventory': true,
      },
      isLoading: false,
      error: null,
      refetchPermissions: jest.fn(),
    });

    const { result } = renderHook(() => 
      usePermission({ action: 'non-existent-permission' })
    );

    expect(result.current).toBe(false);
  });

  it('should return false when permissions are loading', () => {
    mockUseRBAC.mockReturnValue({
      permissions: {},
      isLoading: true,
      error: null,
      refetchPermissions: jest.fn(),
    });

    const { result } = renderHook(() => 
      usePermission({ action: 'view-inventory' })
    );

    expect(result.current).toBe(false);
  });

  it('should return false when there is an error', () => {
    mockUseRBAC.mockReturnValue({
      permissions: {
        'view-inventory': true,
      },
      isLoading: false,
      error: 'Permission fetch failed',
      refetchPermissions: jest.fn(),
    });

    const { result } = renderHook(() => 
      usePermission({ action: 'view-inventory' })
    );

    expect(result.current).toBe(false);
  });

  it('should handle empty permissions object', () => {
    mockUseRBAC.mockReturnValue({
      permissions: {},
      isLoading: false,
      error: null,
      refetchPermissions: jest.fn(),
    });

    const { result } = renderHook(() => 
      usePermission({ action: 'view-inventory' })
    );

    expect(result.current).toBe(false);
  });
});
