
import { useState } from "react";
import { SortingState } from "@tanstack/react-table";

export function useTableSorting(
  initialState: any,
  defaultSorting?: { id: string; desc: boolean }[]
) {
  // Initialize sorting state from default sorting, saved configuration, or empty array
  const [sorting, setSorting] = useState<SortingState>(
    defaultSorting || initialState?.sorting || []
  );

  return {
    sorting,
    setSorting,
    resetToDefaultSorting: () => {
      if (defaultSorting) {
        setSorting(defaultSorting);
      }
    }
  };
}
