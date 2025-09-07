// TopPerformersTable.tsx
import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTableWithQuery } from "@/components/table/DataTableWithQuery";
import type { ColumnDef } from "@tanstack/react-table";
import { TrendingUp } from "lucide-react";
import { useTableQueryState } from "@/components/table/hooks/use-table-query-state";
import type { TableQueryResult } from "@/types/table";
import { format, parseISO, isValid } from "date-fns";
import { WorkTypeBadge } from "../atoms/WorkTypeBadge";

export type PerformerRow = {
  techId: string;
  name: string;
  workType: "breakdown" | "hand trim" | "harvest" | "machine";
  value: number;    // current rate
  unit: string;     // "g/hr" | "plants/hr"
  target: number;
  deltaAbs: number;
  deltaPct: number;
  created_at?: string | null; // ISO for Date column
};

interface TopPerformersTableProps {
  performers: PerformerRow[];
  isLoading: boolean;
  technicianOptions?: { id: string; name: string; email?: string }[];
  userOptions?: { id: string; name: string; email?: string }[];
}

const titleForWorkType: Record<PerformerRow["workType"], string> = {
  breakdown: "Breakdown",
  hand: "Hand Trim",
  harvest: "Harvest",
  machine: "Machine",
};

const fmt = (n: number, d = 1) =>
  Number.isFinite(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d })
    : "0.0";

const TopPerformersTable: React.FC<TopPerformersTableProps> = ({
  performers,
  isLoading,
  technicianOptions,
  userOptions,
}) => {
  // Build name lookup
  const techNameById = useMemo(() => {
    const m = new Map<string, string>();
    (technicianOptions ?? []).forEach((t) => m.set(String(t.id), t.name));
    (userOptions ?? []).forEach((u) => {
      if (!m.has(String(u.id))) m.set(String(u.id), u.name);
    });
    return m;
  }, [technicianOptions, userOptions]);

  // Enrich rows: resolved name + efficiency
  type RowT = PerformerRow & { efficiency: number };
  const baseRows: RowT[] = useMemo(() => {
    const list = Array.isArray(performers) ? performers : [];
    return list.map((p) => {
      const resolvedName = techNameById.get(String(p.techId)) ?? p.name ?? String(p.techId);
      const efficiency = p.target > 0 ? (p.value / p.target) * 100 : 0;
      return { ...p, name: resolvedName, efficiency };
    });
  }, [performers, techNameById]);

  // Query state (client-side) — same as your Productivity table
  const tableQueryState = useTableQueryState<RowT>({
    enableApiMode: false,
    serverSide: false,
    defaultPageSize: 10,
  });

  // 🔒 Guarantee rowSelection is always an object
  const safeRowSelection = tableQueryState.rowSelection ?? {};

  // Apply search / filters / sorting
  const processedData = useMemo(() => {
    let result = [...baseRows];

    // Search
    if (tableQueryState.queryState.search) {
      const q = tableQueryState.queryState.search.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((v) => String(v).toLowerCase().includes(q))
      );
    }

    // Column filters
    tableQueryState.queryState.columnFilters.forEach((f) => {
      if (!f.value) return;
      result = result.filter((row: any) => {
        const fieldValue = row[f.id as keyof RowT];
        if (Array.isArray(f.value)) return f.value.includes(String(fieldValue));
        return String(fieldValue ?? "").toLowerCase().includes(String(f.value).toLowerCase());
      });
    });

    // Sorting
    if (tableQueryState.queryState.sort.length > 0) {
      result.sort((a: any, b: any) => {
        for (const s of tableQueryState.queryState.sort) {
          const av = a[s.column as keyof RowT];
          const bv = b[s.column as keyof RowT];
          if (av < bv) return s.order === "asc" ? -1 : 1;
          if (av > bv) return s.order === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    // Default ranking: highest efficiency first
    result.sort((a, b) => b.efficiency - a.efficiency);
    return result;
  }, [baseRows, tableQueryState.queryState]);

  // Columns
  const columns: ColumnDef<RowT>[] = [
    {
      accessorKey: "name",
      header: "Name",
       enableSorting: false,
    enableColumnFilter: false,
    alwaysVisible: true,
      cell: ({ row }) => <div className="font-medium">{row.getValue("name") as string}</div>,
    },
   {
  accessorKey: "workType",
  header: "Work Type",
  enableSorting: false,
  enableColumnFilter: false,
  alwaysVisible: true,
  cell: ({ row }) => {
    const wtRaw = (row.getValue("workType") as string) ?? "";
    const wtForBadge = wtRaw.toLowerCase() === "hand" ? "hand trim" : wtRaw;
    return (
      <WorkTypeBadge
        workType={wtForBadge}
        className="w-[70px] justify-center min-w-[70px]"
      />
    );
  },
},

    {
      accessorKey: "value",
      header: "GPH",
       enableSorting: false,
    enableColumnFilter: false,
    alwaysVisible: true,
      cell: ({ row }) => {
        const v = Number(row.getValue("value") ?? 0);
        const unit = (row.original?.unit as string) || "g/h";
        return (
          <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200">
            {fmt(v)} {unit === "g/hr" ? "g/h" : unit}
          </Badge>
        );
      },
    },
    {
      accessorKey: "efficiency",
      header: "Efficiency",
       enableSorting: false,
    enableColumnFilter: false,
    alwaysVisible: true,
      cell: ({ row }) => (
        <div className="font-mono text-emerald-600">
          {fmt(row.getValue("efficiency") as number, 0)}%
        </div>
      ),
    },
  ];

  // Build query result exactly as DataTableWithQuery expects
  const queryResult: TableQueryResult<RowT> = useMemo(
    () => ({
      ...tableQueryState,
      rowSelection: safeRowSelection,                 // ✅ never undefined
      setRowSelection: tableQueryState.setRowSelection,
      data: processedData,
      totalCount: processedData.length,
      isLoading,
    }),
    [tableQueryState, safeRowSelection, processedData, isLoading]
  );

  // Stable row id
  const getRowId = (row: RowT) => `${row.techId}-${row.workType}`;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle>Top Performers</CardTitle>
          <div className="ml-auto">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {processedData.length} High Performers
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTableWithQuery
          queryResult={queryResult}
          columns={columns}
          tableConfig={{
            tableId: "top-performers",
            enableFiltering: false,
            enableSorting: false,
            enableColumnVisibility: false,
            enablePagination: true,
            enableGlobalFilter: false,
            enableMultiSelect: false,
            serverSide: false,
            getRowId,
            pageSizeOptions: [5, 10, 20, 50],
          }}
          // Pass selection explicitly as well (some implementations read props directly)
          rowSelection={safeRowSelection}
          onRowSelectionChange={tableQueryState.setRowSelection}
        />
      </CardContent>
    </Card>
  );
};

export default TopPerformersTable;
