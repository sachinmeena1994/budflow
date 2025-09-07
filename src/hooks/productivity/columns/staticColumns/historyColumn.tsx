
import React from "react";
import { TableColumn } from "@/types/table";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { ColumnContext } from "../types";

export function createHistoryColumn(
  context: ColumnContext,
  canViewHistory: boolean
): TableColumn<Record<string, any>> | null {
  if (!canViewHistory) return null;

  const { onHistory } = context;

  return {
    id: "has_history",
    header: "History",
   cell: ({ row }) => (
          <div className="text-center w-12">
            {row.original.server_task_id ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onHistory(row.original.work_entry_id)}
                className="h-5 w-5 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-xs"
                title="View history"
              >
                <History className="h-3 w-3" />
              </Button>
            ) : (
              <span className="text-muted-foreground text-xs">-</span>
            )}
          </div>
        ),
    enableSorting: false,
    enableColumnFilter: false,
    alwaysVisible: true,
    accessorKey: "has_history",
    size: 48,
  };
}
