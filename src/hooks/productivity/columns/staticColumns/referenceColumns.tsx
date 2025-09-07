import React from "react";
import { TableColumn } from "@/types/table";
import { renderInput } from "../renderInput";
import { ColumnContext } from "../types";
import { technicianFilterFn } from "./utils";

export function createReferenceColumns(context: ColumnContext): TableColumn<Record<string, any>>[] {
  const { workType, technicianOptions } = context;

  const columns: TableColumn<Record<string, any>>[] = [
    {
      id: "Site",
      header: () => (
        <span className="text-xs">
          Site <span className="text-red-500">*</span>
        </span>
      ),
      accessorFn: (row) => {
        const siteName =
          context?.siteOptions?.find((s) => s.value === row.site_id)?.label || "";
        return siteName;
      },
      cell: ({ row }) => (
        <div className="w-28 min-h-[32px] flex items-center px-1">
          {renderInput("site_id", "select", row.original, context)}
        </div>
      ),
      enableSorting: true,
      enableFiltering: true,
      enableColumnFilter: true,
      size: 112,
    },

    {
      id: "Strain",
      header: () => (
        <span className="text-xs">
          Strain <span className="text-red-500">*</span>
        </span>
      ),
      // 🔑 return a scalar string (strain name) so column filter/sort work cleanly
      accessorFn: (row) => {
        // value might live in entry_payload or top-level
        const strainId =
          row?.entry_payload?.strain ??
          row?.strain ??
          "";

        if (!strainId) return "";

        const match = context.strainOptions.find((s) => s.id === strainId);
        return match?.name ?? ""; // ← searchable/sortable text
      },
      // keep your select UI exactly as-is
      cell: ({ row }) => (
        <div className="w-24 min-h-[32px] flex items-center px-1">
          {renderInput("strain", "select", row.original, context)}
        </div>
      ),
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      size: 120,
    },
  ];

  // Add technician column for non-harvest work types
  if (workType?.toLowerCase() !== "harvest") {
    columns.splice(1, 0, {
      id: "Technician",
      header: () => (
        <span className="text-xs">
          Technicians {workType?.toLocaleLowerCase() !== "breakdown" &&  <span className="text-red-500">*</span>}
        </span>
      ),
      // Always return an array of IDs from either location
      accessorFn: (row) => {
        const ids = Array.isArray(row.technician_refs)
          ? row.technician_refs
          : Array.isArray(row.entry_payload?.technician_refs)
            ? row.entry_payload.technician_refs
            : [];
        return ids;
      },
      cell: ({ row }) => (
        <div className="w-32 min-h-[32px] flex items-center px-1">
          {renderInput("technician_refs", "multi-select", row.original, context)}
        </div>
      ),
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      filterFn: (row, columnId, filterValue) => 
        technicianFilterFn(row, columnId, filterValue, technicianOptions),
      size: 150,
    });
  }

  return columns;
}
