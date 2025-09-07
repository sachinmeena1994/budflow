
import React from "react";
import { TableColumn } from "@/types/table";

export function createSelectionColumn(): TableColumn<Record<string, any>> {
  return {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        className="text-xs accent-red-500"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        className="text-xs accent-red-500"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    alwaysVisible: true,
    size: 32,
    accessorKey: "select",
  };
}
