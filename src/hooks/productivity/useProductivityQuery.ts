
import { useMemo } from "react";
import { WorkTypeEntryWithHistory } from "@/hooks/productivity/types";
import { useTableQueryState } from "@/components/table/hooks/use-table-query-state";
import { TableQueryResult } from "@/types/table";

type UseProductivityQueryArgs = {
  entries: WorkTypeEntryWithHistory[];
  isLoading: boolean;
};

export function useProductivityQuery(
  args: UseProductivityQueryArgs
): TableQueryResult<WorkTypeEntryWithHistory> {
  const { entries, isLoading } = args;

  const tableQueryResult = useTableQueryState<WorkTypeEntryWithHistory>({
    enableApiMode: false,
    serverSide: false,
    defaultPageSize: 100,
  });

  const processedData = useMemo(() => {
    let result = [...entries];

    // Apply search filter
    if (tableQueryResult.queryState.search) {
      const searchTerm = tableQueryResult.queryState.search.toLowerCase();
      result = result.filter(entry => 
        Object.values(entry).some(value => 
          String(value).toLowerCase().includes(searchTerm)
        )
      );
    }

    // Apply column filters
    tableQueryResult.queryState.columnFilters.forEach(filter => {
      if (filter.value) {
        result = result.filter(entry => {
          const fieldValue = entry[filter.id as keyof WorkTypeEntryWithHistory];
          if (Array.isArray(filter.value)) {
            return filter.value.includes(String(fieldValue));
          }
          return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
        });
      }
    });

    // Apply sorting
    if (tableQueryResult.queryState.sort.length > 0) {
      result.sort((a, b) => {
        for (const sortItem of tableQueryResult.queryState.sort) {
          const aValue = a[sortItem.column as keyof WorkTypeEntryWithHistory];
          const bValue = b[sortItem.column as keyof WorkTypeEntryWithHistory];
          
          if (aValue < bValue) return sortItem.order === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortItem.order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [entries, tableQueryResult.queryState]);

  return {
    ...tableQueryResult,
    data: processedData,
    totalCount: processedData.length,
    isLoading,
  };
}
