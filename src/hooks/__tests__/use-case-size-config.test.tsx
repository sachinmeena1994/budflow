
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCaseSizeConfig } from '../use-case-size-config';
import * as caseSizeConfigApi from '@/services/api/case-size-config-api';

// Mock the API
jest.mock('@/services/api/case-size-config-api');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockProducts = [
  {
    product_id: 'prod_001',
    product_name: 'Blue Dream 1/8th',
    category: 'Flower',
    erp_sku: 'BD-8TH-001',
    case_sizes: [8, 16, 24, 48, 96]
  },
  {
    product_id: 'prod_002',
    product_name: 'Sour Diesel Cartridge',
    category: 'Vape',
    erp_sku: 'SD-CART-002',
    case_sizes: [12, 24, 36, 48, 60]
  }
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useCaseSizeConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch case size configuration successfully', async () => {
    const mockApi = caseSizeConfigApi.caseSizeConfigApi as jest.Mocked<typeof caseSizeConfigApi.caseSizeConfigApi>;
    mockApi.fetchCaseSizeConfig.mockResolvedValue({ products: mockProducts });

    const { result } = renderHook(() => useCaseSizeConfig('CA'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.error).toBe(null);
    expect(result.current.hasChanges).toBe(false);
  });

  it('should handle fetch error', async () => {
    const mockApi = caseSizeConfigApi.caseSizeConfigApi as jest.Mocked<typeof caseSizeConfigApi.caseSizeConfigApi>;
    mockApi.fetchCaseSizeConfig.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCaseSizeConfig('CA'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.products).toEqual([]);
  });

  it('should detect changes when data is modified', async () => {
    const mockApi = caseSizeConfigApi.caseSizeConfigApi as jest.Mocked<typeof caseSizeConfigApi.caseSizeConfigApi>;
    mockApi.fetchCaseSizeConfig.mockResolvedValue({ products: mockProducts });

    const { result } = renderHook(() => useCaseSizeConfig('CA'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Modify the data
    const modifiedProducts = [...mockProducts];
    modifiedProducts[0] = {
      ...modifiedProducts[0],
      case_sizes: [10, 20, 30, 40, 50]
    };

    act(() => {
      result.current.handleDataChange(modifiedProducts);
    });

    expect(result.current.hasChanges).toBe(true);
    expect(result.current.products).toEqual(modifiedProducts);
  });

  it('should save changes successfully', async () => {
    const mockApi = caseSizeConfigApi.caseSizeConfigApi as jest.Mocked<typeof caseSizeConfigApi.caseSizeConfigApi>;
    mockApi.fetchCaseSizeConfig.mockResolvedValue({ products: mockProducts });
    mockApi.updateCaseSizeConfig.mockResolvedValue({ blocked: false });

    const { result } = renderHook(() => useCaseSizeConfig('CA'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Modify and save
    const modifiedProducts = [...mockProducts];
    modifiedProducts[0] = {
      ...modifiedProducts[0],
      case_sizes: [10, 20, 30, 40, 50]
    };

    act(() => {
      result.current.handleDataChange(modifiedProducts);
    });

    act(() => {
      result.current.handleSave();
    });

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false);
    });

    expect(mockApi.updateCaseSizeConfig).toHaveBeenCalledWith({
      market: 'CA',
      updates: [
        {
          product_id: 'prod_001',
          case_sizes: [10, 20, 30, 40, 50]
        }
      ]
    });
  });

  it('should handle blocked updates', async () => {
    const mockApi = caseSizeConfigApi.caseSizeConfigApi as jest.Mocked<typeof caseSizeConfigApi.caseSizeConfigApi>;
    mockApi.fetchCaseSizeConfig.mockResolvedValue({ products: mockProducts });
    mockApi.updateCaseSizeConfig.mockResolvedValue({
      blocked: true,
      affected_products: [
        { product_name: 'Blue Dream 1/8th', active_inventory: 150, open_orders: 3 }
      ]
    });

    const { result } = renderHook(() => useCaseSizeConfig('CA'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Modify and save
    const modifiedProducts = [...mockProducts];
    modifiedProducts[0] = {
      ...modifiedProducts[0],
      case_sizes: [10, 20, 30, 40, 50]
    };

    act(() => {
      result.current.handleDataChange(modifiedProducts);
    });

    act(() => {
      result.current.handleSave();
    });

    await waitFor(() => {
      expect(result.current.updateResult?.blocked).toBe(true);
    });

    expect(result.current.updateResult?.affected_products).toHaveLength(1);
  });

  it('should not save when no changes exist', async () => {
    const mockApi = caseSizeConfigApi.caseSizeConfigApi as jest.Mocked<typeof caseSizeConfigApi.caseSizeConfigApi>;
    mockApi.fetchCaseSizeConfig.mockResolvedValue({ products: mockProducts });

    const { result } = renderHook(() => useCaseSizeConfig('CA'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleSave();
    });

    expect(mockApi.updateCaseSizeConfig).not.toHaveBeenCalled();
  });

  it('should reset update result', async () => {
    const mockApi = caseSizeConfigApi.caseSizeConfigApi as jest.Mocked<typeof caseSizeConfigApi.caseSizeConfigApi>;
    mockApi.fetchCaseSizeConfig.mockResolvedValue({ products: mockProducts });
    mockApi.updateCaseSizeConfig.mockResolvedValue({ blocked: true });

    const { result } = renderHook(() => useCaseSizeConfig('CA'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Create an update result
    const modifiedProducts = [...mockProducts];
    modifiedProducts[0] = {
      ...modifiedProducts[0],
      case_sizes: [10, 20, 30, 40, 50]
    };

    act(() => {
      result.current.handleDataChange(modifiedProducts);
    });

    act(() => {
      result.current.handleSave();
    });

    await waitFor(() => {
      expect(result.current.updateResult?.blocked).toBe(true);
    });

    // Reset the result
    act(() => {
      result.current.resetUpdateResult();
    });

    expect(result.current.updateResult).toBe(undefined);
  });

  it('should handle save error', async () => {
    const mockApi = caseSizeConfigApi.caseSizeConfigApi as jest.Mocked<typeof caseSizeConfigApi.caseSizeConfigApi>;
    mockApi.fetchCaseSizeConfig.mockResolvedValue({ products: mockProducts });
    mockApi.updateCaseSizeConfig.mockRejectedValue(new Error('Save failed'));

    const { result } = renderHook(() => useCaseSizeConfig('CA'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Modify and save
    const modifiedProducts = [...mockProducts];
    modifiedProducts[0] = {
      ...modifiedProducts[0],
      case_sizes: [10, 20, 30, 40, 50]
    };

    act(() => {
      result.current.handleDataChange(modifiedProducts);
    });

    act(() => {
      result.current.handleSave();
    });

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false);
    });

    // Should still have changes since save failed
    expect(result.current.hasChanges).toBe(true);
  });
});
