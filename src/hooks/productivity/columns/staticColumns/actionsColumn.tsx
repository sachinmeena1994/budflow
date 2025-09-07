import React from "react";
import { TableColumn } from "@/types/table";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnContext } from "../types";
import { isApproved } from "./utils";
import { useProductivityStore } from "@/store/centralStore";

export function createActionsColumn(
  context: ColumnContext,
  canEdit: boolean,
  canDelete: boolean
): TableColumn<Record<string, any>> | null {
  
  const selectedWorkType = useProductivityStore.getState().selectedWorkType;

  // If work type is "all" or no permissions, hide the column
  if (!canEdit && !canDelete) return null;
  if (selectedWorkType === "all") return null;

  const { onEdit, onDelete } = context;

  return {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const entry = row.original;
      if (isApproved(entry)) return null;
      return (
        <div className="flex justify-end pr-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 p-0 text-xs">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-24">
              {canEdit && (
                <DropdownMenuItem
                  onClick={() => onEdit(entry)}
                  className="cursor-pointer text-xs py-1"
                >
                  Edit
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(entry.work_entry_id)}
                  className="text-red-600 cursor-pointer hover:text-red-700 text-xs py-1"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
    alwaysVisible: true,
    accessorKey: "actions",
    size: 60,
  };
}
