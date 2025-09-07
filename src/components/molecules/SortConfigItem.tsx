
import React from "react";
interface MenuSortConfig {
  field: string;
  direction: "asc" | "desc";
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SortConfigItemProps {
  label: string;
  sortConfig: MenuSortConfig;
  onChange: (newConfig: MenuSortConfig) => void;
  className?: string;
  examples?: string[];
}

export const SortConfigItem: React.FC<SortConfigItemProps> = ({
  label,
  sortConfig,
  onChange,
  className,
  examples,
}) => {
  const handleDirectionChange = (value: string) => {
    onChange({
      ...sortConfig,
      direction: value as "asc" | "desc",
    });
  };

  const getDirectionLabel = () => {
    switch (label) {
      case "Packaging Size":
        return sortConfig.direction === "asc" ? "Small to Large" : "Large to Small";
      default:
        return sortConfig.direction === "asc" ? "A-Z" : "Z-A";
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-col gap-2">
        <Label>{label}</Label>
        <div className="flex flex-col space-y-1">
          <Select
            value={sortConfig.direction}
            onValueChange={handleDirectionChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={getDirectionLabel()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">
                {label === "Packaging Size" ? "Small to Large" : "A-Z"}
              </SelectItem>
              <SelectItem value="desc">
                {label === "Packaging Size" ? "Large to Small" : "Z-A"}
              </SelectItem>
            </SelectContent>
          </Select>
          {examples && (
            <p className="text-xs text-muted-foreground">
              Example values: {examples.join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
