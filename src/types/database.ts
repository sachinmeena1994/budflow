
export interface WorkTypeField {
  id: string;
  work_type: string;
  field_key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'dropdown' | 'date' | 'time';
  data_type: 'string' | 'number' | 'boolean' | 'date';
  options: Record<string, any>;
  calculated: boolean;
  required: boolean;
  field_order: number;
}

export interface Entry {
  id: string;
  task_id: string;
  work_type: string;
  user_id: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  name: string;
}

export interface Technician {
  id: string;
  name: string;
}

export interface Strain {
  id: string;
  name: string;
}

export interface Batch {
  id: string;
  product_name: string;
  strain_id: string;
}

export interface Role {
  id: string;
  label: string;
  permissions: Record<string, boolean>;
  work_type_access: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role_id: string;
  work_type_access: string[];
}
