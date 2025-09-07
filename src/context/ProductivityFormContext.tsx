// /context/ProductivityFormContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { create } from "zustand";

/* ---------- Zustand store ---------- */

type Rows = Record<string, Record<string, any>>;

type ProductivityStore = {
  editingId: string | null;
  tempRow: Record<string, any> | null;
  rows: Rows;
  version: number;

  setEditingId: (id: string | null) => void;
  setTempRow: (row: Record<string, any> | null) => void;
  setCellValue: (rowId: string, fieldKey: string, value: any) => void;
  getCellValue: (rowId: string, fieldKey: string, defaultValue?: any) => any;
  clearCells: () => void;
  seedRow?: (rowId: string, patch: Record<string, any>) => void;
  clearRow?: (rowId: string) => void;
};

export const useProductivityStore = create<ProductivityStore>((set, get) => ({
  editingId: null,
  tempRow: null,
  rows: {},
  version: 0,

  setEditingId: (id) =>
    set((s) => ({ editingId: id, version: s.version + 1 })),

  setTempRow: (row) =>
    set((s) => ({ tempRow: row, version: s.version + 1 })),

  setCellValue: (rowId, fieldKey, value) =>
    set((s) => {
      const prevRow = s.rows[rowId] || {};
      if (prevRow[fieldKey] === value) return s;
      const nextRow = { ...prevRow, [fieldKey]: value };
      return { rows: { ...s.rows, [rowId]: nextRow }, version: s.version + 1 };
    }),

  getCellValue: (rowId, fieldKey, defaultValue = "") => {
    const row = get().rows[rowId];
    if (!row) return defaultValue;
    const v = row[fieldKey];
    return v === undefined ? defaultValue : v;
  },

  clearCells: () =>
    set((s) => ({ rows: {}, version: s.version + 1 })),

  seedRow: (rowId, patch) =>
    set((s) => {
      const prevRow = s.rows[rowId] || {};
      const nextRow = { ...prevRow, ...patch };
      return { rows: { ...s.rows, [rowId]: nextRow }, version: s.version + 1 };
    }),

  clearRow: (rowId) =>
    set((s) => {
      const next = { ...s.rows };
      delete next[rowId];
      return { rows: next, version: s.version + 1 };
    }),
}));

// Subscribe to a single cell so components re-render when that cell changes
export function useCell(rowId: string, fieldKey: string, fallback?: any) {
  return useProductivityStore(
    React.useCallback(
      (s) => {
        const v = s.rows[rowId]?.[fieldKey];
        return v === undefined ? fallback : v;
      },
      [rowId, fieldKey]
    )
  );
}


/* ---------- React Context ---------- */

type ProductivityFormContextType = ProductivityStore;

const ProductivityFormContext = createContext<ProductivityFormContextType | null>(null);

export const ProductivityFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const store = useProductivityStore();
  return (
    <ProductivityFormContext.Provider value={store}>
      {children}
    </ProductivityFormContext.Provider>
  );
};

export const useProductivityForm = () => {
  const ctx = useContext(ProductivityFormContext);
  if (!ctx) {
    throw new Error("useProductivityForm must be used within a ProductivityFormProvider");
  }
  return ctx;
};
