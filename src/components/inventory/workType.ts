export interface WorkTypeOption {
  value: string;
  label: string;
}

export interface WorkTypeField {
  field_key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'time' | 'select' | 'multi-select';
  data_type: 'string' | 'number' | 'date' | 'time' | 'uuid' | 'array';
  options?: WorkTypeOption[];
  required?: boolean;
  calculated?: boolean;
  order_index: number;
}

export interface WorkTypeEntry {
  id?: string;
  task_id: string | null;
  work_entry_id: string;
  work_type: string;
  work_type_code: string;
  site_id?: string | null;
  batch_ref?: string | null;
  technician_refs?: string[];
  approval_status?: string;
  created_by: string;
  created_at?: string;
  approved_by?: string | null;
  approved_at?: string | null;
  archived_at?: string | null;
  entry_payload: Record<string, any>;
}

// export const workTypeFields: { [key: string]: WorkTypeField[] } = {
//   harvest: [
//     { field_key: 'date', label: 'Date', type: 'date', data_type: 'date', required: true, order_index: 1 },
//     { field_key: 'total_plants', label: 'Total Plants', type: 'number', data_type: 'number', required: true, order_index: 2 },
//     { field_key: 'team_size', label: 'Team Size', type: 'number', data_type: 'number', required: true, order_index: 3 },
//     { field_key: 'duration_hours', label: 'Duration (Hours)', type: 'number', data_type: 'number', required: true, order_index: 4 },
//     { field_key: 'output_weight', label: 'Output Weight (g)', type: 'number', data_type: 'number', required: true, order_index: 5 },
//     { field_key: 'strain', label: 'Strain', type: 'select', data_type: 'string', required: true, order_index: 6 },
//     { field_key: 'comment', label: 'Comment', type: 'text', data_type: 'string', order_index: 7 },
//   ],
//   machine: [
//     { field_key: 'date', label: 'Date', type: 'date', data_type: 'date', required: true, order_index: 1 },
//     { field_key: 'input_weight', label: 'Input Weight (g)', type: 'number', data_type: 'number', required: true, order_index: 2 },
//     { field_key: 'output_weight', label: 'Output Weight (g)', type: 'number', data_type: 'number', required: true, order_index: 3 },
//     { field_key: 'strain', label: 'Strain', type: 'select', data_type: 'string', required: true, order_index: 4 },
//     { field_key: 'comment', label: 'Comment', type: 'text', data_type: 'string', order_index: 5 },
//   ],
//   hand: [
//     { field_key: 'date', label: 'Date', type: 'date', data_type: 'date', required: true, order_index: 1 },
//     { field_key: 'trim_weight', label: 'Trim Weight (g)', type: 'number', data_type: 'number', required: true, order_index: 2 },
//     { field_key: 'wet_weight', label: 'Wet Weight (g)', type: 'number', data_type: 'number', required: true, order_index: 3 },
//     { field_key: 'output_weight', label: 'Output Weight (g)', type: 'number', data_type: 'number', required: true, order_index: 4 },
//     { field_key: 'strain', label: 'Strain', type: 'select', data_type: 'string', required: true, order_index: 5 },
//     { field_key: 'comment', label: 'Comment', type: 'text', data_type: 'string', order_index: 6 },
//   ],
//   breakdown: [
//     { field_key: 'date', label: 'Date', type: 'date', data_type: 'date', required: true, order_index: 1 },
//     { field_key: 'comment', label: 'Comment', type: 'text', data_type: 'string', order_index: 2 },
//   ],
// };
