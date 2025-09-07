
import { WorkTypeEntry } from '@/components/inventory/workType';

// Create a mock function that mimics the CSV download logic from Productivity.tsx
const formatValueForCSV = (value: any): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" && value.includes("T")) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  }
  return String(value);
};

const downloadCSV = (rows: WorkTypeEntry[]) => {
  if (!rows || rows.length === 0) {
    throw new Error("No data to export");
  }

  const columnHeaders = [
    { key: "task_id", header: "Task ID" },
    { key: "date", header: "Date" },
    { key: "work_type", header: "Work Type" },
    { key: "site", header: "Site" },
    { key: "batch_product", header: "Batch/Product" },
    { key: "technician", header: "Technician" },
    { key: "status", header: "Status" },
    { key: "trim_weight", header: "Trim Weight" },
    { key: "wet_weight", header: "Wet Weight" },
    { key: "issue", header: "Issue" },
    { key: "has_history", header: "History" },
  ];

  const headers = columnHeaders.map(col => col.header).join(',');
  
  const csvRows = rows.map(row => 
    columnHeaders.map(col => {
      const value = row[col.key as keyof WorkTypeEntry];
      const formattedValue = formatValueForCSV(value);
      return formattedValue.includes(',') || formattedValue.includes('"') 
        ? `"${formattedValue.replace(/"/g, '""')}"` 
        : formattedValue;
    }).join(',')
  );
  
  const csvContent = [headers, ...csvRows].join('\n');
  return csvContent;
};

describe('CSV Export Utilities', () => {
  const mockData: WorkTypeEntry[] = [
    {
      id: '1',
      task_id: 'TASK-001',
      date: '2025-01-01T00:00:00Z',
      work_type: 'harvest',
      site: 'Site A',
      batch_product: 'Batch 1',
      technician: 'John Doe',
      status: 'Draft',
      created_at: '2025-01-01T00:00:00Z',
      trim_weight: 100,
      wet_weight: 200,
      issue: null,
    },
    {
      id: '2',
      task_id: 'TASK-002',
      date: '2025-01-02T00:00:00Z',
      work_type: 'machine',
      site: 'Site B',
      batch_product: 'Batch 2',
      technician: 'Jane Smith',
      status: 'Approved',
      created_at: '2025-01-02T00:00:00Z',
      trim_weight: 150,
      wet_weight: 300,
      issue: 'Equipment issue',
    }
  ];

  describe('formatValueForCSV', () => {
    it('returns empty string for null values', () => {
      expect(formatValueForCSV(null)).toBe('');
      expect(formatValueForCSV(undefined)).toBe('');
    });

    it('formats ISO date strings to MM/dd/yyyy', () => {
      expect(formatValueForCSV('2025-01-01T00:00:00Z')).toBe('2025-01-01');
      expect(formatValueForCSV('2025-12-31T23:59:59Z')).toBe('2025-12-31');
    });

    it('returns string representation for other values', () => {
      expect(formatValueForCSV('test')).toBe('test');
      expect(formatValueForCSV(123)).toBe('123');
      expect(formatValueForCSV(true)).toBe('true');
    });

    it('handles non-date strings with T character', () => {
      expect(formatValueForCSV('Test string')).toBe('Test string');
      expect(formatValueForCSV('T-shirt')).toBe('T-shirt');
    });
  });

  describe('downloadCSV', () => {
    it('generates correct CSV headers', () => {
      const csvContent = downloadCSV(mockData);
      const lines = csvContent.split('\n');
      
      expect(lines[0]).toBe('Task ID,Date,Work Type,Site,Batch/Product,Technician,Status,Trim Weight,Wet Weight,Issue,History');
    });

    it('formats data rows correctly', () => {
      const csvContent = downloadCSV(mockData);
      const lines = csvContent.split('\n');
      
      expect(lines[1]).toBe('TASK-001,2025-01-01,harvest,Site A,Batch 1,John Doe,Draft,100,200,,');
      expect(lines[2]).toBe('TASK-002,2025-01-02,machine,Site B,Batch 2,Jane Smith,Approved,150,300,Equipment issue,');
    });

    it('escapes values containing commas', () => {
      const dataWithCommas = [{
        ...mockData[0],
        site: 'Site A, Building 1',
        issue: 'Issue, multiple problems'
      }];
      
      const csvContent = downloadCSV(dataWithCommas);
      const lines = csvContent.split('\n');
      
      expect(lines[1]).toContain('"Site A, Building 1"');
      expect(lines[1]).toContain('"Issue, multiple problems"');
    });

    it('escapes values containing quotes', () => {
      const dataWithQuotes = [{
        ...mockData[0],
        site: 'Site "A"',
        issue: 'Machine "broken"'
      }];
      
      const csvContent = downloadCSV(dataWithQuotes);
      const lines = csvContent.split('\n');
      
      expect(lines[1]).toContain('"Site ""A"""');
      expect(lines[1]).toContain('"Machine ""broken"""');
    });

    it('throws error for empty data', () => {
      expect(() => downloadCSV([])).toThrow('No data to export');
      expect(() => downloadCSV(null as any)).toThrow('No data to export');
    });

    it('handles null and undefined values in data', () => {
      const dataWithNulls = [{
        ...mockData[0],
        technician: null,
        issue: undefined,
        trim_weight: null
      }];
      
      const csvContent = downloadCSV(dataWithNulls as any);
      const lines = csvContent.split('\n');
      
      // Should have empty values for null/undefined fields
      expect(lines[1]).toContain(',,');
    });
  });
});
