import { create } from 'zustand';

// Define the union type for work types
export type WorkTypeKey = 'all' | 'breakdown' | 'hand' | 'harvest' | 'machine';

interface CellState {
  rowId: string;
  fieldKey: string;
  value: any;
}

interface ProductivityState {
  cells: Map<string, any>;
  editingId: string | null;
  tempRow: Record<string, any> | null;

  // NEW: globally selected work type
  selectedWorkType: WorkTypeKey;
}

interface ProductivityActions {
  setCellValue: (rowId: string, fieldKey: string, value: any) => void;
  getCellValue: (rowId: string, fieldKey: string, defaultValue?: any) => any;
  setEditingId: (id: string | null) => void;
  setTempRow: (row: Record<string, any> | null) => void;
  clearCells: () => void;
  getCellKey: (rowId: string, fieldKey: string) => string;

  // NEW: setter for globally selected work type
  setSelectedWorkType: (wt: WorkTypeKey) => void;
}

type ProductivityStore = ProductivityState & ProductivityActions;

export const useProductivityStore = create<ProductivityStore>((set, get) => ({
  cells: new Map(),
  editingId: null,
  tempRow: null,

  // default work type
  selectedWorkType: 'all' as WorkTypeKey,

  getCellKey: (rowId: string, fieldKey: string) => `${rowId}:${fieldKey}`,

  setCellValue: (rowId: string, fieldKey: string, value: any) => {
    const key = get().getCellKey(rowId, fieldKey);
    set((state) => {
      const newCells = new Map(state.cells);
      newCells.set(key, value);
      return { cells: newCells };
    });
  },

  getCellValue: (rowId: string, fieldKey: string, defaultValue = '') => {
    const key = get().getCellKey(rowId, fieldKey);
    return get().cells.get(key) ?? defaultValue;
  },

  setEditingId: (id: string | null) => {
    set({ editingId: id });
  },

  setTempRow: (row: Record<string, any> | null) => {
    set({ tempRow: row });
  },

  clearCells: () => {
    set({ cells: new Map() });
  },

  setSelectedWorkType: (wt: WorkTypeKey) => {
    set({ selectedWorkType: wt });
  },
}));

// Custom hook for cell-level access
export const useCell = (rowId: string, fieldKey: string) => {
  const { getCellValue, setCellValue } = useProductivityStore();

  const value = getCellValue(rowId, fieldKey);
  const setValue = (newValue: any) => setCellValue(rowId, fieldKey, newValue);

  return [value, setValue] as const;
};
