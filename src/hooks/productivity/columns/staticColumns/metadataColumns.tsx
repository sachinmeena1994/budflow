import React from "react";
import { TableColumn } from "@/types/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { renderInput } from "../renderInput";
import { ColumnContext } from "../types";
import { WorkTypeBadge } from "@/components/atoms/WorkTypeBadge";
import {
  technicianFilterFn,
  dateFilterFn,
  toIsoDateLocal,
  getWorkTypeBadgeStyle,
} from "./utils";

export function createMetadataColumns(
  context: ColumnContext
): TableColumn<Record<string, any>>[] {
  const { workType, userOptions, strainOptions, siteOptions, technicianOptions } =
    context;

  const columns: TableColumn<Record<string, any>>[] = [
    // 🔹 Task ID
    {
        id: "task_id",
        header: "Task ID",
        accessorKey: "server_task_id",
        cell: ({ row }) => (
          <div className="w-20 min-h-[32px] flex items-center px-1">
            <span className="text-xs font-mono text-gray-900 font-medium">
              {row.original.server_task_id?.toUpperCase() || "TASK-X"}
            </span>
          </div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
        filterType: "text",
        enableFiltering: true,
        size: 80,
      },

    // 🔹 Approval Status
    {
      id: "approval_status",
      header: "Status",
      accessorKey: "approval_status",
      cell: ({ row }) => {
        const status = row.original.approval_status;
        const config =
          (
            {
              Draft: { color: "bg-gray-400", label: "Draft" },
              Pending: { color: "bg-yellow-500", label: "Pending" },
              Submitted: { color: "bg-blue-500", label: "Submitted" },
              Approved: { color: "bg-green-500", label: "Approved" },
              Rejected: { color: "bg-red-500", label: "Rejected" },
            } as const
          )[status] ?? { color: "bg-gray-400", label: "Draft" };

        return (
          <div className="flex items-center gap-1 w-20 min-h-[32px] px-1">
            <span className={`w-1.5 h-1.5 rounded-full ${config.color}`} />
            <span className="text-xs">{config.label}</span>
          </div>
        );
      },
      enableSorting: true,
      enableColumnFilter: true,
      enableFiltering: true,
      size: 80,
    },

        // 🔹 Date
    {
      id: "date",
      header: () => (
        <span className="text-xs">
          Date <span className="text-red-500">*</span>
        </span>
      ),
      accessorFn: (row) => {
        const raw = row?.entry_payload?.date ?? row?.date ?? null;
        return toIsoDateLocal(raw);
      },
      cell: ({ row }) => (
        <div className="w-28 min-h-[32px] flex items-center px-1">
          {renderInput("date", "date", row.original, context)}
        </div>
      ),
      enableSorting: true,
      enableColumnFilter: true,
      filterFn: dateFilterFn,
      filterType: "date",
      enableFiltering: true,
      size: 112,
    },

    
    // 🔹 Work Type
    {
  id: "work_type",
  header: () => <span className="text-xs">Work Type</span>,
  accessorKey: "work_type",
  cell: ({ row }) => (
    <div className="w-20 min-h-[32px] flex items-center px-1">
      <WorkTypeBadge
        workType={row.original.work_type}
        className="w-[70px] justify-center min-w-[70px]"
      />
    </div>
  ),
  enableSorting: true,
  enableFiltering: true,
  size: 80,
},

    // 🔹 Site
    {
      id: "Site",
      header: () => (
        <span className="text-xs">
          Site <span className="text-red-500">*</span>
        </span>
      ),
      accessorFn: (row) => {
        return siteOptions?.find((s) => s.value === row.site_id)?.label || "";
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

    // 🔹 Technician (only if not harvest)
    ...(workType?.toLowerCase() !== "harvest"
      ? [
          {
            id: "Technician",
            header: () => (
              <span className="text-xs">
                Technicians{" "}
                {workType?.toLowerCase() !== "breakdown" && (
                  <span className="text-red-500">*</span>
                )}
              </span>
            ),
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
                {renderInput(
                  "technician_refs",
                  "multi-select",
                  row.original,
                  context
                )}
              </div>
            ),
            enableSorting: true,
            enableColumnFilter: true,
            enableGlobalFilter: true,
            filterFn: (row, columnId, filterValue) =>
              technicianFilterFn(row, columnId, filterValue, technicianOptions),
            size: 150,
          },
        ]
      : []),

    // 🔹 Strain
    {
      id: "Strain",
      header: () => (
        <span className="text-xs">
          Strain <span className="text-red-500">*</span>
        </span>
      ),
      accessorFn: (row) => {
        const strainId = row?.entry_payload?.strain ?? row?.strain ?? "";
        if (!strainId) return "";
        const match = strainOptions.find((s) => s.id === strainId);
        return match?.name ?? "";
      },
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



    // 🔹 Created (date + user)
    {
      id: "Created",
      header: () => <span className="text-xs">Created</span>,
      accessorFn: (row) => toIsoDateLocal(row?.created_at),
      cell: ({ row }) => {
        const createdAt = row.original.created_at;
        const createdBy = row.original.created_by;
        const user =
          userOptions?.find((u) => u.id === createdBy) ||
          (() => {
            const local = localStorage.getItem("loggedUser");
            if (!local) return null;
            const logged = JSON.parse(local);
            return logged.id === createdBy ? logged : null;
          })();

        return (
          <div className="w-28 min-h-[32px] flex items-center px-1">
            <div className="text-xs">
              <div className="text-gray-700">
                {createdAt ? format(createdAt, "MM/dd/yyyy") : "-"}
              </div>
              <div className="text-gray-500 text-[10px]">
                {user?.name || "System"}
              </div>
            </div>
          </div>
        );
      },
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      filterFn: dateFilterFn,
      filterType: "date",
      size: 112,
    },

    // 🔹 Comment (only if workType != all)
    ...(workType !== "all"
      ? [
          {
            id: "Comment",
            header: () => <span className="text-xs">Comment</span>,
            accessorFn: (row) =>
              row.comment ?? row.entry_payload?.comment ?? "",
            cell: ({ row }) => (
              <div className="w-32 min-h-[32px] flex items-center px-1">
                {renderInput("comment", "text", row.original, context)}
              </div>
            ),
            enableSorting: true,
            enableColumnFilter: true,
            enableFiltering: true,
            size: 128,
          },
        ]
      : []),
  ];

  return columns;
}
