import { useMemo } from "react";
// ⬇️ alias the data hook
import { useApprovalsManager as useApprovalsData, ApprovalEntry } from "@/hooks/use-approvals-manager";
import { useTableQueryState } from "@/components/table/hooks/use-table-query-state";
import { TableQueryResult } from "@/types/table";
import { useMarket } from "@/context/MarketContext";
import { useFilteredEntries } from "@/hooks/useFilteredEntries";

export function useApprovalsManagerTable(): {
  queryResult: TableQueryResult<ApprovalEntry>;
  approveEntry: (entryId: string, comment?: string, opts?: { silent?: boolean }) => Promise<void>;
  rejectEntry:  (entryId: string, comment?: string, opts?: { silent?: boolean }) => Promise<void>;
  deleteEntry:  (entryId: string) => Promise<void>;
  refetch: () => Promise<void>;
}{
  const {
    entries,
    isLoading,
    approveEntry,
    rejectEntry,
    deleteEntry,
    refetch,
  } = useApprovalsData(); // ⬅️ now calls the imported hook, not itself

  const { currentMarket, sites } = useMarket();

  const marketFilteredEntries = useFilteredEntries(
    entries,
    "all",
    sites,
    currentMarket?.code || ""
  );

  const tableQueryResult = useTableQueryState<ApprovalEntry>({
    enableApiMode: false,
    serverSide: false,
    defaultPageSize: 100,
  });

  const processedData = useMemo(() => {
    let result = [...marketFilteredEntries];

    // search
    if (tableQueryResult.queryState.search) {
      const s = tableQueryResult.queryState.search.toLowerCase();
      result = result.filter(entry =>
        Object.values(entry).some(v => String(v).toLowerCase().includes(s))
      );
    }

    // column filters
    tableQueryResult.queryState.columnFilters.forEach(filter => {
      if (filter.value) {
        result = result.filter(entry => {
          const fieldValue = entry[filter.column as keyof ApprovalEntry];
          if (Array.isArray(filter.value)) {
            return filter.value.includes(String(fieldValue));
          }
          return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
        });
      }
    });

    // sorting
    if (tableQueryResult.queryState.sort.length > 0) {
      result.sort((a, b) => {
        for (const s of tableQueryResult.queryState.sort) {
          const av = a[s.column as keyof ApprovalEntry] as any;
          const bv = b[s.column as keyof ApprovalEntry] as any;
          if (av < bv) return s.order === "asc" ? -1 : 1;
          if (av > bv) return s.order === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [marketFilteredEntries, tableQueryResult.queryState]);

  const queryResult = useMemo(() => ({
    ...tableQueryResult,
    data: processedData,
    totalCount: processedData.length,
    isLoading,
  }), [tableQueryResult, processedData, isLoading]);

  return {
    queryResult,
    approveEntry,
    rejectEntry,
    deleteEntry,
    refetch,
  };
}
