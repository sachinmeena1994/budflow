
import React from "react";
import { DataTable } from "@/components/table/DataTable";
import { TableColumn } from "@/components/table/types";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  createdAt: string;
}

interface TaskTableProps {
  data: Task[];
  isLoading: boolean;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  data,
  isLoading,
}) => {
  const columns: TableColumn<Task>[] = [
    {
      id: "title",
      header: "Title",
      accessorKey: "title",
      enableSorting: true,
      enableFiltering: true,
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      enableSorting: true,
      enableFiltering: true,
      cell: ({ row }) => (
        <Badge variant={row.original.status === "completed" ? "default" : "secondary"}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      accessorKey: "priority",
      enableSorting: true,
      enableFiltering: true,
      cell: ({ row }) => (
        <Badge variant={row.original.priority === "high" ? "destructive" : "secondary"}>
          {row.original.priority}
        </Badge>
      ),
    },
    {
      id: "assignee",
      header: "Assignee",
      accessorKey: "assignee",
      enableSorting: true,
      enableFiltering: true,
    },
    {
      id: "createdAt",
      header: "Created At",
      accessorKey: "createdAt",
      enableSorting: true,
      enableFiltering: false,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
    />
  );
};
