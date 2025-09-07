import { WorkTypeEntry } from "@/components/inventory/workType";

export interface ExportOptions {
  filename?: string;
  includeAllColumns?: boolean;
  dateFormat?: string;
}

// Format date to MM/dd/yyyy consistently
export const formatDateForExport = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${month}-${day}-${year}`;
};

// Extract all dynamic fields from entry_payload across all entries
const getAllDynamicFields = (entries: WorkTypeEntry[]): string[] => {
  const dynamicFields = new Set<string>();
  
  entries.forEach(entry => {
    if (entry.entry_payload && typeof entry.entry_payload === 'object') {
      Object.keys(entry.entry_payload).forEach(key => {
        dynamicFields.add(key);
      });
    }
  });
  
  return Array.from(dynamicFields).sort();
};

// Convert entries to CSV data with all columns
export const convertToCSV = (entries: WorkTypeEntry[], options: ExportOptions = {}): string => {
  if (!entries || entries.length === 0) {
    return 'No data to export';
  }

  // Static columns that should always be included
  const staticColumns = [
    'work_entry_id',
    'task_id',
    'date',
    'work_type_code',
    'site_id',
    'approval_status',
    'created_at',
    'updated_at'
  ];

  // Get all dynamic fields from entry_payload
  const dynamicFields = getAllDynamicFields(entries);
  
  // Combine static and dynamic columns
  const allColumns = [...staticColumns, ...dynamicFields];
  
  // Create header row
  const headers = allColumns.map(col => {
    // Format column names to be more readable
    switch (col) {
      case 'work_entry_id': return 'Entry ID';
      case 'task_id': return 'Task ID';
      case 'date': return 'Date';
      case 'work_type_code': return 'Work Type';
      case 'site_id': return 'Site';
      case 'approval_status': return 'Status';
      case 'created_at': return 'Created Date';
      case 'updated_at': return 'Updated Date';
      default: return col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  });

  // Create data rows
  const rows = entries.map(entry => {
    return allColumns.map(col => {
      let value: any;
      
      // Handle static columns
      if (staticColumns.includes(col)) {
        value = entry[col as keyof WorkTypeEntry];
        
        // Format dates
        if ((col === 'date' || col === 'created_at' || col === 'updated_at') && value) {
          value = formatDateForExport(value);
        }
      } 
      // Handle dynamic columns from entry_payload
      else if (entry.entry_payload && typeof entry.entry_payload === 'object') {
        value = entry.entry_payload[col];
        
        // Format dates in dynamic fields if they look like dates
        if (value && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
          value = formatDateForExport(value);
        }
      }
      
      // Handle null/undefined values
      if (value === null || value === undefined) {
        return '';
      }
      
      // Convert to string and escape quotes
      const stringValue = String(value);
      
      // Escape quotes and wrap in quotes if needed
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    });
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  return csvContent;
};

// Download CSV file
export const downloadCSV = (entries: WorkTypeEntry[], options: ExportOptions = {}): void => {
  const csvContent = convertToCSV(entries, options);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  
  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = options.filename || `productivity_export_${timestamp}.csv`;
  link.setAttribute('download', filename);
  
  // Trigger download
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};

// Export selected rows
export const exportSelectedRows = (
  selectedRows: WorkTypeEntry[],
  workType: string,
  options: ExportOptions = {}
): void => {
  if (!selectedRows || selectedRows.length === 0) {
    console.warn('No rows selected for export');
    return;
  }
  
  const filename = options.filename || `${workType}_selected_export_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(selectedRows, {
    ...options,
    filename
  });
};

// Export all rows
export const exportAllRows = (
  allRows: WorkTypeEntry[],
  workType: string,
  options: ExportOptions = {}
): void => {
  if (!allRows || allRows.length === 0) {
    console.warn('No data available for export');
    return;
  }
  
  const filename = options.filename || `${workType}_all_export_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(allRows, {
    ...options,
    filename
  });
};