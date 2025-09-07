
import React, { useMemo } from 'react';
import { ProcessEntry } from '../schemas/processSchemas';
import { StatusBadge } from '../components/atoms/StatusBadge';
import { WorkTypeBadge } from '../components/atoms/WorkTypeBadge';
import { ColumnConfig } from '../data/columnConfig';

type ProcessType = "harvest" | "hand" | "machine" | "breakdown";

interface UseColumnsProps {
  selectedWorkType: ProcessType | 'all' | '';
  editingId: string | null;
  handleFieldChange: (columnId: string, value: any) => void;
  handleEdit: (row: ProcessEntry) => void;
  onDeleteEntry: (id: string) => void;
}

const getColumnConfig = (selectedWorkType: ProcessType | 'all' | ''): ColumnConfig[] => {
  const baseColumns: ColumnConfig[] = [
    { id: 'taskId', header: 'Task ID', width: 'w-[100px]', type: 'text' },
    { id: 'date', header: 'Date', width: 'w-[120px]', type: 'date' },
    { id: 'status', header: 'Status', width: 'w-[120px]', type: 'status' },
    { id: 'notes', header: 'Notes', width: 'w-[200px]', type: 'text' },
  ];

  switch (selectedWorkType) {
    case 'harvest':
      return [
        ...baseColumns,
        { id: 'field', header: 'Field', width: 'w-[150px]', type: 'text' },
        { id: 'crop', header: 'Crop', width: 'w-[150px]', type: 'text' },
        { id: 'quantity', header: 'Quantity', width: 'w-[100px]', type: 'number' },
        { id: 'unit', header: 'Unit', width: 'w-[100px]', type: 'select', options: [{ value: 'kg', label: 'KG' }, { value: 'tons', label: 'Tons' }] },
      ];
    case 'hand':
      return [
        ...baseColumns,
        { id: 'laborers', header: 'Laborers', width: 'w-[80px]', type: 'number' },
        { id: 'task', header: 'Task', width: 'w-[150px]', type: 'text' },
        { id: 'hoursWorked', header: 'Hours Worked', width: 'w-[100px]', type: 'number' },
        { id: 'hourlyRate', header: 'Hourly Rate', width: 'w-[100px]', type: 'number' },
      ];
    case 'machine':
      return [
        ...baseColumns,
        { id: 'machineType', header: 'Machine Type', width: 'w-[150px]', type: 'text' },
        { id: 'operator', header: 'Operator', width: 'w-[150px]', type: 'text' },
        { id: 'fuelConsumption', header: 'Fuel Consumption', width: 'w-[120px]', type: 'number' },
        { id: 'distanceCovered', header: 'Distance Covered', width: 'w-[120px]', type: 'number' },
      ];
    case 'breakdown':
      return [
        ...baseColumns,
        { id: 'machineType', header: 'Machine Type', width: 'w-[150px]', type: 'text' },
        { id: 'breakdownType', header: 'Breakdown Type', width: 'w-[150px]', type: 'text' },
        { id: 'downtimeHours', header: 'Downtime (Hours)', width: 'w-[120px]', type: 'number' },
        { id: 'repairCost', header: 'Repair Cost', width: 'w-[120px]', type: 'number' },
      ];
    default:
      return baseColumns;
  }
};

export const useColumns = ({ selectedWorkType, editingId, handleFieldChange, handleEdit, onDeleteEntry }: UseColumnsProps) => {
  const columnConfig = useMemo(() => {
    return getColumnConfig(selectedWorkType);
  }, [selectedWorkType]);

  const columns = useMemo(() => {
    return columnConfig.map((config) => {
      const baseColumn = {
        id: config.id,
        accessorKey: config.id,
        header: config.header,
        enableSorting: true,
        enableFiltering: true,
        size: config.width ? parseInt(config.width.replace(/\D/g, '')) : undefined,
      };

      // Custom cell renderer for editable fields
      if (config.type === 'select' || config.type === 'number' || config.type === 'text') {
        return {
          ...baseColumn,
          cell: ({ row }: { row: any }) => {
            const isEditing = editingId === row.original.id;
            const value = row.original[config.id];

            if (isEditing) {
              // Render editable field based on type
              if (config.type === 'select' && config.options) {
                return (
                  <select
                    value={value || ''}
                    onChange={(e) => handleFieldChange(config.id, e.target.value)}
                    className="w-full h-8 text-xs px-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select...</option>
                    {config.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                );
              } else if (config.type === 'number') {
                return (
                  <input
                    type="number"
                    value={value || ''}
                    onChange={(e) => handleFieldChange(config.id, parseFloat(e.target.value) || 0)}
                    className="w-full h-8 text-xs px-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    step="0.01"
                  />
                );
              } else {
                return (
                  <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => handleFieldChange(config.id, e.target.value)}
                    className="w-full h-8 text-xs px-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                );
              }
            }

            // Render read-only cell with proper formatting
            if (config.type === 'status') {
              return <StatusBadge status={value} />;
            } else if (config.type === 'workType') {
              return <WorkTypeBadge workType={value} />;
            } else if (config.type === 'number' && typeof value === 'number') {
              return <span>{value.toFixed(2)}</span>;
            }

            return <span>{value || '-'}</span>;
          },
        };
      }

      // For display-only columns
      return {
        ...baseColumn,
        cell: ({ row }: { row: any }) => {
          const value = row.original[config.id];
          
          if (config.type === 'status') {
            return <StatusBadge status={value} />;
          } else if (config.type === 'workType') {
            return <WorkTypeBadge workType={value} />;
          } else if (config.type === 'number' && typeof value === 'number') {
            return <span>{value.toFixed(2)}</span>;
          }

          return <span>{value || '-'}</span>;
        },
      };
    });
  }, [columnConfig, editingId, handleFieldChange]);

  return { columns, columnConfig };
};
