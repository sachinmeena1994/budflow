import { TableOptions } from '@tanstack/react-table';

// Extend the TableOptions interface from react-table
declare module '@tanstack/react-table' {
  interface TableOptions<TData> {
    enableMultiSelect?: boolean;
  }

  interface ColumnMeta<TData, TValue> {
    type?: 'editable' | 'default';
  }
}
