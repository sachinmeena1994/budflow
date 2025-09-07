
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, Trash2, Check, X } from 'lucide-react';
import { ProcessEntry } from '../../schemas/processSchemas';

interface RowActionsProps {
  row: ProcessEntry;
  isEditing: boolean;
  isAddingNew?: boolean;
  onEdit: (row: ProcessEntry) => void;
  onDelete: (id: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

export const RowActions: React.FC<RowActionsProps> = ({
  row,
  isEditing,
  isAddingNew = false,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}) => {
  if (isEditing || isAddingNew) {
    return (
      <div className="flex items-center gap-1 justify-start">
        <Button
          size="sm"
          onClick={onSave}
          className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          {isAddingNew ? 'Add' : 'Save'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          className="h-7 px-2 text-xs"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 justify-start">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(row)}
            className="h-7 px-2 text-primary hover:text-primary/80"
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Edit</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit this entry</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(row.id)}
            className="h-7 px-2 text-destructive hover:text-destructive/80"
            disabled={row.id === 'new-entry'}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Delete</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete this entry</TooltipContent>
      </Tooltip>
    </div>
  );
};
