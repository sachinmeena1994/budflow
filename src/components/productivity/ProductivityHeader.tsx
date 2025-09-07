import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";

type ProductivityHeaderProps = {
  selectedWorkType: string;
  onWorkTypeChange: (val: string) => void;
  onAddEntry: () => void;
  isGeneratingTaskId: boolean;
  workTypeOptions: Array<{ value: string; label: string }>;
  perms: { add: boolean };
};

export const ProductivityHeader: React.FC<ProductivityHeaderProps> = ({
  selectedWorkType,
  onWorkTypeChange,
  onAddEntry,
  isGeneratingTaskId,
  workTypeOptions,
  perms,
}) => {
  return (
    <div className="flex gap-4 items-end">
      <div className="flex flex-col gap-1">
        <Label htmlFor="work-type-select" className="text-sm font-medium">
          Work Type
        </Label>
        <Select value={selectedWorkType} onValueChange={onWorkTypeChange}>
          <SelectTrigger id="work-type-select" className="w-[160px]">
            <SelectValue placeholder="Work Type" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            <SelectItem value="all">All Types</SelectItem>
            {workTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hide the button entirely if no permission */}
      {perms.add && (
        <Button
          onClick={onAddEntry}
          disabled={selectedWorkType === "all" || isGeneratingTaskId}
          className="disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          {isGeneratingTaskId ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Add Entry
            </>
          )}
        </Button>
      )}
    </div>
  );
};
