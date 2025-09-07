import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableWithQuery } from '@/components/table/DataTableWithQuery';
import type { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { useTableQueryState } from '@/components/table/hooks/use-table-query-state';
import type { TableQueryResult } from '@/types/table';
import { WorkTypeBadge } from '@/components/atoms/WorkTypeBadge';

export interface FlaggedWorker {
  id: string;
  name: string;
  workType: string;
  gph: number;
  targetGph: number;
  premiumPercent: number;
  flagLevel: 'red' | 'orange';
  flagReason: string;
  created_at?: string | null;
}

interface FlaggedWorkersTableProps {
  workers: FlaggedWorker[] | undefined | null;
  isLoading: boolean;
  technicianOptions?: { id: string; name: string; email?: string }[];
  userOptions?: { id: string; name: string; email?: string }[];
}

const levelRank = (lvl: 'red' | 'orange') => (lvl === 'red' ? 0 : 1);

function colorByDelta(deltaPct: number) {
  // Correct bands:
  // Red:    <= -20%
  // Orange: -20% < deltaPct <= 0%
  // Green:  > 0%   (won't show in flagged list but keep for completeness)
  if (deltaPct <= -20) {
    return {
      badge: 'bg-red-50 text-red-600 border border-red-200',
      pill:  'bg-red-50 text-red-600',
    };
  }
  if (deltaPct <= 0) {
    return {
      badge: 'bg-amber-50 text-amber-600 border border-amber-200',
      pill:  'bg-amber-50 text-amber-600',
    };
  }
  return {
    badge: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    pill:  'bg-emerald-50 text-emerald-600',
  };
}



const FlaggedWorkersTable: React.FC<FlaggedWorkersTableProps> = ({
  workers,
  isLoading,
  technicianOptions,
  userOptions,
}) => {
  const incoming = Array.isArray(workers) ? workers : [];

  const nameMap = useMemo(() => {
    const m = new Map<string, string>();
    (technicianOptions ?? []).forEach((t) => m.set(String(t.id), t.name));
    (userOptions ?? []).forEach((u) => {
      if (!m.has(String(u.id))) m.set(String(u.id), u.name);
    });
    return m;
  }, [technicianOptions, userOptions]);

  type RowT = FlaggedWorker & { performancePct: number; deltaPct: number };
  const baseRows: RowT[] = useMemo(() => {
    return incoming.map((w) => {
      const resolvedName = nameMap.get(String(w.id)) ?? w.name ?? String(w.id);
      const performancePct = w.targetGph > 0 ? (w.gph / w.targetGph) * 100 : 0;
      const deltaPct = w.targetGph > 0 ? ((w.gph - w.targetGph) / w.targetGph) * 100 : 0;
      return { ...w, name: resolvedName, performancePct, deltaPct };
    });
  }, [incoming, nameMap]);

  // Same hook pattern as your Productivity table
  const tableQueryState = useTableQueryState<RowT>({
    enableApiMode: false,
    serverSide: false,
    defaultPageSize: 10,
  });

  // SAFEGUARD: make sure rowSelection is always an object
  const safeRowSelection = tableQueryState.rowSelection ?? {};

  const processedData = useMemo(() => {
    let result = [...baseRows];

    // search
    if (tableQueryState.queryState.search) {
      const q = tableQueryState.queryState.search.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((v) => String(v).toLowerCase().includes(q))
      );
    }

    // column filters
    tableQueryState.queryState.columnFilters.forEach((f) => {
      if (!f.value) return;
      result = result.filter((row: any) => {
        const fieldValue = row[f.id as keyof RowT];
        if (Array.isArray(f.value)) return f.value.includes(String(fieldValue));
        return String(fieldValue ?? '').toLowerCase().includes(String(f.value).toLowerCase());
      });
    });

    // sorting
    if (tableQueryState.queryState.sort.length > 0) {
      result.sort((a: any, b: any) => {
        for (const s of tableQueryState.queryState.sort) {
          const av = a[s.column as keyof RowT];
          const bv = b[s.column as keyof RowT];
          if (av < bv) return s.order === 'asc' ? -1 : 1;
          if (av > bv) return s.order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    // severity then worst first (keep after user sorts if you want it enforced)
    result.sort((a, b) => {
      const lvl = levelRank(a.flagLevel) - levelRank(b.flagLevel);
      if (lvl !== 0) return lvl;
      return a.performancePct - b.performancePct;
    });

    return result;
  }, [baseRows, tableQueryState.queryState]);

  const warnCount = useMemo(
    () => processedData.filter((w) => w.flagLevel === 'orange').length,
    [processedData]
  );
  const critCount = useMemo(
    () => processedData.filter((w) => w.flagLevel === 'red').length,
    [processedData]
  );

  const columns: ColumnDef<RowT>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
       enableSorting: false,
    enableColumnFilter: false,
    alwaysVisible: true,
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'workType',
      header: 'Work Type',
       enableSorting: false,
    enableColumnFilter: false,
    alwaysVisible: true,
       cell: ({ row }) => (
  <WorkTypeBadge
    workType={row.getValue('workType') as string}
    className="w-[70px] justify-center min-w-[70px]"
  />
),

      
    },
    {
      accessorKey: 'gph',
      header: 'GPH',
       enableSorting: false,
    enableColumnFilter: false,
    alwaysVisible: true,
      cell: ({ row }) => {
        const gph = Number(row.getValue('gph') ?? 0);
        const tgt = Number(row.original.targetGph ?? 0);
        const deltaPct = tgt > 0 ? ((gph - tgt) / tgt) * 100 : 0;
        const cls = colorByDelta(deltaPct).badge;
        return <Badge className={cls}>{gph.toFixed(1)}g/h</Badge>;
      },
    },
    // {
    //   accessorKey: 'premiumPercent',
    //   header: 'Premium %',
    //    enableSorting: false,
    // enableColumnFilter: false,
    // alwaysVisible: true,  
    //   cell: ({ row }) => <div className="font-mono">{row.getValue('premiumPercent')}%</div>,
    // },
    {
      accessorKey: 'flagReason',
      header: 'Flag Reason',
       enableSorting: false,
    enableColumnFilter: false,
    alwaysVisible: true,
      cell: ({ row }) => {
        const gph = Number(row.original.gph ?? 0);
        const tgt = Number(row.original.targetGph ?? 0);
        const deltaPct = tgt > 0 ? ((gph - tgt) / tgt) * 100 : 0;
        const pill = colorByDelta(deltaPct).pill;
        const flagReason = row.getValue('flagReason') as string;
        return (
          <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${pill}`}>
            <AlertTriangle className="h-3 w-3" />
            {flagReason}
          </div>
        );
      },
    },
  ];

  // ⚙️ Build the exact TableQueryResult shape (ensure rowSelection is an object)
  const queryResult: TableQueryResult<RowT> = useMemo(
    () => ({
      ...tableQueryState,
      rowSelection: safeRowSelection,          // ✅ never undefined
      setRowSelection: tableQueryState.setRowSelection,
      data: processedData,
      totalCount: processedData.length,
      isLoading,
    }),
    [tableQueryState, safeRowSelection, processedData, isLoading]
  );

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <CardTitle>Flagged Workers</CardTitle>
          <div className="ml-auto flex items-center gap-2">
            {warnCount > 0 && (
              <Badge variant="secondary" className="bg-warning/10 text-warning">
                {warnCount} Warning
              </Badge>
            )}
            {critCount > 0 && (
              <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                {critCount} Critical
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <DataTableWithQuery
          queryResult={queryResult}
          columns={columns}
          tableConfig={{
            tableId: 'flagged-workers',
            enableFiltering: false,
            enableSorting: false,
            enableColumnVisibility: false,
            enablePagination: true,
            enableGlobalFilter: false,
            enableMultiSelect: false,          // <- even if false, we still supply {}
            serverSide: false,
            getRowId: (row: RowT) => String(row.id),
      
          }}
          rowSelection={safeRowSelection}
          // onRowSelectionChange={tableQueryState.setRowSelection}
        />
      </CardContent>
    </Card>
  );
};

export default FlaggedWorkersTable;
