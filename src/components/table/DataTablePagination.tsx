import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableConfig } from '@/types/table';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  tableConfig: TableConfig;
}

export function DataTablePagination<TData>({
  table,
  tableConfig,
}: DataTablePaginationProps<TData>) {
  const {
    serverSide,
    totalCount,
    currentPage,
    onPageChange,
    pageSize: serverPageSize,
  } = tableConfig;
  // Use server-side values if available, otherwise fall back to table state

  const pageSize =
    serverSide && serverPageSize ? serverPageSize : table.getState().pagination.pageSize;

  const pageCount =
    serverSide && totalCount ? Math.ceil(totalCount / pageSize) : table.getPageCount();

  const pageIndex =
    serverSide && currentPage !== undefined ? currentPage : table.getState().pagination.pageIndex;

  const handlePageChange = (newPageIndex: number) => {
    if (tableConfig.serverSide && tableConfig.onPageChange) {
      tableConfig.onPageChange(newPageIndex, pageSize);
    } else {
      table.setPageIndex(newPageIndex);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (tableConfig.serverSide && tableConfig.onPageChange) {
      tableConfig.onPageChange(0, newPageSize); // Reset to first page
    } else {
      table.setPageSize(newPageSize);
    }
  };
  
if (totalCount == undefined) {
  return null;
}
return (
  <div className="flex items-center justify-between px-2">
    <div className="flex-1 text-sm text-muted-foreground">
      {tableConfig.serverSide && typeof totalCount === 'number' ? (
        <>
          Showing {pageIndex * pageSize + 1} to{' '}
          {Math.min((pageIndex + 1) * pageSize, totalCount)} of {totalCount} entries
        </>
      ) : (
        <>
          {
            (table?.getFilteredRowModel()?.rows.filter((row) => row.getIsSelected()) ?? []).length
          }{' '}
          of {table?.getFilteredRowModel()?.rows.length ?? 0} row(s) selected.
        </>
      )}
    </div>

    {/* pagination controls below remain unchanged */}
    <div className="flex items-center space-x-6 lg:space-x-8">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">Rows per page</p>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => handlePageSizeChange(Number(value))}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[25, 50, 75, 100].map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex w-[100px] items-center justify-center text-sm font-medium">
        Page {pageIndex + 1} of {pageCount}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => handlePageChange(0)}
          disabled={pageIndex === 0}
        >
          <span className="sr-only">Go to first page</span>
          <DoubleArrowLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => handlePageChange(pageIndex - 1)}
          disabled={pageIndex === 0}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => handlePageChange(pageIndex + 1)}
          disabled={pageIndex >= pageCount - 1}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => handlePageChange(pageCount - 1)}
          disabled={pageIndex >= pageCount - 1}
        >
          <span className="sr-only">Go to last page</span>
          <DoubleArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);

}
