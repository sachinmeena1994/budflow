import { flexRender } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { CaretSortIcon } from '@/components/atoms/icons/CaretSortIcon';
import { cn } from '@/lib/utils';
import { ColumnFilter } from './filters/ColumnFilter';
import { DataTableCellProps } from '@/types/table';

export function DataTableCell<TData extends object>({
  header,
  activeFilterColumn,
  toggleColumnFilter,
  handleSortChange,
  handleFilterChange,
  serverSide,
  sortState,
  filterState,
}: DataTableCellProps<TData>) {
  const canSort = header.column.getCanSort();
  const canFilter = header.column.getCanFilter();

  let isSorted: 'asc' | 'desc' | false = false;
  let sortIndex: number | undefined = undefined;

  if (serverSide && sortState) {
    const found = sortState.find((s) => s.column === header.column.id);
    if (found) {
      isSorted = found.order;
      sortIndex = found.sortIndex;
    }
  } else {
    isSorted = header.column.getIsSorted();
    sortIndex = header.column.getSortIndex();
  }

  const handleSort = (e: React.MouseEvent) => {
    e.preventDefault();

    if (serverSide) {
      // Determine next sort order
      let nextOrder: 'asc' | 'desc' | false = 'asc';
      if (isSorted === 'asc') nextOrder = 'desc';
      else if (isSorted === 'desc') nextOrder = false;
      handleSortChange({ column: header.column.id, order: nextOrder }, e.shiftKey);
    } else {
      header.column.toggleSorting(undefined, e.shiftKey);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="font-medium">
        {flexRender(header.column.columnDef.header, header.getContext())}
      </div>

      {canSort && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSort}
          className="h-5 w-5 bg-transparent p-0 hover:bg-transparent"
        >
          <CaretSortIcon
            direction={isSorted === 'asc' ? 'asc' : 'desc'}
            sortIndex={sortIndex}
            className={cn(
              'h-3.5 w-3.5',
              isSorted ? 'text-primary' : 'text-muted-foreground',
              'transition-colors hover:text-accent',
            )}
          />
          <span className="sr-only">Sort {isSorted === 'asc' ? 'descending' : 'ascending'}</span>
        </Button>
      )}

      {canFilter && (
        <ColumnFilter
          column={header?.column}
          serverSide={serverSide}
          filterState={filterState}
          isOpen={activeFilterColumn === header?.column?.id}
          onToggle={() => toggleColumnFilter(header?.column?.id)}
          onFilterChange={(column, value, filterType) =>
            handleFilterChange({ column, value, filterType })
          }
        />
      )}
    </div>
  );
}

// interface DataTableCellEditableProps {
//   cell: any;
//   onCellValueChange?: (row: any, update: { field: string; value: any }) => void;
// }

// export function DataTableCellEditable({ cell, onCellValueChange }: DataTableCellEditableProps) {
//   // Add comprehensive null safety checks
//   if (!cell || !cell.column || !cell.row || !cell.row.original) {
//     return <div className="py-1">-</div>;
//   }

//   // If a custom cell renderer is provided, use that
//   if (cell.column.columnDef.cell) {
//     try {
//       return flexRender(cell.column.columnDef.cell, cell.getContext());
//     } catch (error) {
//       console.warn('Error rendering custom cell:', error);
//       return <div className="py-1">-</div>;
//     }
//   }

//   // Check if this column is editable
//   const isEditable = cell.column.columnDef.meta?.editable;

//   // Get the cell value with fallback and null safety
//   let cellValue = '';
//   try {
//     cellValue = cell.getValue ? cell.getValue() : '';
//   } catch (error) {
//     console.warn('Error getting cell value:', error);
//     cellValue = '';
//   }

//   // If not editable, just render the value
//   if (!isEditable) {
//     return <div className="py-1">{cellValue || '-'}</div>;
//   }

//   // Get column type for appropriate input type
//   const type = cell.column.columnDef.meta?.type || 'text';

//   // Handle change events with null safety
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target) return;

//     let value: any = e.target.value;

//     // Convert to appropriate type
//     if (type === 'number') {
//       value = parseFloat(value) || 0;
//     }

//     if (onCellValueChange && cell.row.original) {
//       onCellValueChange(cell.row.original, { field: cell.column.id, value });
//     }
//   };

//   // Render appropriate input
//   return (
//     <Input
//       type={type}
//       value={cellValue || ''}
//       onChange={handleChange}
//       className="h-8 w-full rounded border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
//     />
//   );
// }
