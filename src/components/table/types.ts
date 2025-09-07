
import { ColumnDef } from "@tanstack/react-table";

export interface TableColumn<T = any> extends Omit<ColumnDef<T>, 'header' | 'cell'> {
  id?: string;
  accessorKey?: string;
  header: string;
  cell?: ({ row }: { row: { getValue: (key: string) => any; original: T } }) => React.ReactNode;
  enableSorting?: boolean;
  enableHiding?: boolean;
  enableFiltering?: boolean;
  alwaysVisible?: boolean;
  size?: number;
  minSize?: number;
  maxSize?: number;
}

export interface ColumnConfig {
  id: string;
  key: string;
  label: string;
  visible: boolean;
  isVisible: boolean;
  sortable?: boolean;
  filterable?: boolean;
}

export interface TableRowAction<T = any> {
  id: string;
  label: string;
  onClick: (row: T) => void;
  icon?: React.ComponentType<any>;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  disabled?: (row: T) => boolean;
  isDestructive?: boolean;
}

export interface TableBulkAction<T = any> {
  id: string;
  label: string;
  onClick: (rows: T[]) => void;
  icon?: React.ComponentType<any>;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  isDisabled?: (rows: T[]) => boolean;
  hidden?: (rows: T[]) => boolean;
  isDestructive?: boolean;
}

export type ImportStatusType = "idle" | "inProgress" | "commitPending" | "committed" | "failed" | "discarded";
