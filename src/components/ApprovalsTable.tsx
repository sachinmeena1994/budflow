import React, { useMemo, useState, useEffect } from "react";
import { DataTableWithQuery } from "@/components/table/DataTableWithQuery";
import { Checkbox } from "@/components/ui/checkbox";
import {
  TableRowAction,
  TableBulkAction,
  TableColumn,
} from "@/types/table";
import { ApprovalEntry } from "@/hooks/use-approvals-manager";
import { TableQueryResult } from "@/types/table";
import { RowSelectionState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Eye, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkTypeBadge } from "@/components/atoms/WorkTypeBadge";
import { format } from "date-fns";
import { useRBAC } from "@/context/RBACContext";

interface ApprovalsTableProps {
  queryResult: TableQueryResult<ApprovalEntry>;
  onApprove: (entry: ApprovalEntry) => void;
  onReject: (entry: ApprovalEntry) => void;
  onViewDetails: (entry: ApprovalEntry) => void;
  onSelectionChange: (rows: ApprovalEntry[]) => void;
  selectedRows: ApprovalEntry[];
  rowActions: TableRowAction<ApprovalEntry>[];
  bulkActions: TableBulkAction<ApprovalEntry>[];
  canApprove: boolean;
  canReject: boolean;
  canViewDetails: boolean;
}

export const ApprovalsTable: React.FC<ApprovalsTableProps> = ({
  queryResult,
  onApprove,
  onReject,
  onViewDetails,
  onSelectionChange,
  rowActions,
  bulkActions,
  canApprove,
  canReject,
  canViewDetails,
}) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { roleCode } = useRBAC();
  const allowColumnVisibility = useMemo(
    () => !["worker", "team_leader"].includes((roleCode ?? "").toLowerCase()),
    [roleCode]
  );

  const selectedRows = useMemo(() => {
    const selectedIds = Object.keys(rowSelection);
    return (
      queryResult?.data?.filter((entry) => selectedIds.includes(entry.id || "")) || []
    );
  }, [queryResult?.data, rowSelection]);

  useEffect(() => {
    onSelectionChange(selectedRows);
  }, [selectedRows, onSelectionChange]);

  const columns: TableColumn<ApprovalEntry>[] = useMemo(() => {
    const baseColumns: TableColumn<ApprovalEntry>[] = [
     {
  id: "rowSelect",
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      indeterminate={
        table.getIsSomePageRowsSelected() &&
        !table.getIsAllPageRowsSelected()
      }
      onCheckedChange={(checked) =>
        table.toggleAllPageRowsSelected(!!checked)
      }
      className="translate-y-0.5 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 text-xs"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      indeterminate={row.getIsSomeSelected()}
      onCheckedChange={(checked) => row.toggleSelected(!!checked)}
      className="translate-y-0.5 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 text-xs"
    />
  ),
  enableSorting: false,
  enableHiding: false,
  size: 40,
},

      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {canApprove && (
                  <DropdownMenuItem
                    onClick={() => onApprove(row.original)}
                    className="cursor-pointer text-green-600 hover:text-green-700"
                    disabled={row.original.approval_status === "Approved"}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </DropdownMenuItem>
                )}
                {canReject && (
                  <DropdownMenuItem
                    onClick={() => onReject(row.original)}
                    className="cursor-pointer text-red-600 hover:text-red-700"
                    disabled={row.original.approval_status === "Rejected"}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        enableSorting: false,
        enableFiltering: false,
        size: 48,
      },
    ];

    if (canViewDetails) {
      baseColumns.push({
        id: "Details",
        header: () => <div className="text-center">Details</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(row.original)}
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ),
        enableSorting: false,
        enableFiltering: false,
        size: 48,
      });
    }

    baseColumns.push(
      {
        id: "server_task_id",
        header: "Task ID",
        accessorKey: "server_task_id",
        enableSorting: true,
        enableFiltering: false,
        size: 160,
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.server_task_id?.toUpperCase() ?? "-"}
          </span>
        ),
      },
      {
        id: "work_type",
        header: "Work Type",
        accessorKey: "work_type",
        enableSorting: true,
        enableFiltering: false,
        size: 48,
        cell: ({ row }) => (
          <WorkTypeBadge
            workType={row.original.work_type}
            className="w-[70px] justify-center min-w-[70px]"
          />
        ),
      },
      {
        id: "approval_status",
        header: "Status",
        accessorKey: "approval_status",
        enableSorting: true,
        size: 48,
        enableFiltering: false,
        cell: ({ row }) => {
          const statusConfig = {
            Draft: { color: "bg-gray-400", label: "Draft" },
            Pending: { color: "bg-yellow-500", label: "Pending" },
            Submitted: { color: "bg-blue-500", label: "Submitted" },
            Approved: { color: "bg-green-500", label: "Approved" },
            Rejected: { color: "bg-red-500", label: "Rejected" },
          } as const;
          const cfg =
            statusConfig[
              row.original.approval_status as keyof typeof statusConfig
            ] ?? statusConfig.Draft;
          return (
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
              <span className="text-xs">{cfg.label}</span>
            </div>
          );
        },
      },
      {
        id: "Created",
        header: "Created At",
        accessorKey: "created_at",
        enableSorting: true,
        enableFiltering: false,
        size: 48,
        cell: ({ row }) => (
          <span className="text-xs">
            {format(row.original.created_at, "MM/dd/yyyy")}
          </span>
        ),
      }
    );

    return baseColumns;
  }, [canApprove, canReject, canViewDetails, onApprove, onReject, onViewDetails]);

  // 🔒 Control the order explicitly: select → actions → Details? → rest
  const columnOrder = useMemo(() => {
    const base = ["select", "actions"];
    if (canViewDetails) base.push("Details");
    base.push("server_task_id", "work_type", "approval_status", "Created");
    return base;
  }, [canViewDetails]);

  return (
    <DataTableWithQuery
      // Force re-mount when order shape changes
      key={columnOrder.join("|")}
      queryResult={queryResult}
      columns={columns}
      tableConfig={{
        tableId: "approvals_v2", // bump to avoid old persisted order
        enableFiltering: true,
        enableSorting: true,
        enableColumnVisibility: allowColumnVisibility,
        enablePagination: true,
        enableGlobalFilter: true,
        enableMultiSelect: true,
        getRowId: (row) => row.id || `temp-${Math.random()}`,
        serverSide: false,

        // 👉 controlled column order + left pinning for structural columns
        state: { columnOrder },
        onColumnOrderChange: () => {}, // keep controlled
        columnPinning: {
          left: ["select", "actions", ...(canViewDetails ? ["Details"] : [])],
        },
      }}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      actions={{
        bulkActions,
        showRowActionsColumn: false,
      }}
    />
  );
};
