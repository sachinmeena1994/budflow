import { useState, useEffect } from "react";
import { RowSelectionState } from "@tanstack/react-table";

export function useRowSelection<TData extends object>({
  data,
  selectedData,
  onSelectionChange
}: {
  data: TData[];
  selectedData?: TData[];
  onSelectionChange?: (selectedRows: TData[]) => void;
}) {
  // Initialize row selection with the provided selectedData if available
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(() => {
    if (!selectedData || !selectedData.length) return {};
    
    // Create a map of selected rows
    const selectionMap: RowSelectionState = {};
    
    // Map selectedData to indices in the data array
    selectedData.forEach(selectedItem => {
      // Find the index of the selected item in the data array
      const index = data.findIndex(item => {
        // Use id property if available
        if ('id' in selectedItem && 'id' in item) {
          return (selectedItem as any).id === (item as any).id;
        }
        // Otherwise fallback to checking the entire object
        return JSON.stringify(selectedItem) === JSON.stringify(item);
      });
      
      if (index !== -1) {
        selectionMap[index] = true;
      }
    });
    
    return selectionMap;
  });

  // Notify parent component when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = Object.keys(rowSelection).map(
        (index) => data[parseInt(index)]
      );
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, onSelectionChange, data]);

  return {
    rowSelection,
    setRowSelection
  };
}
