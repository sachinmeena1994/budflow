
import React, { useState, useEffect, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface EnumFilterProps {
  value: string[] | undefined;
  onChange: (value: string[] | undefined) => void;
  onClear: () => void;
  hasActiveFilter: boolean;
  options: string[];
}

export function EnumFilter({ value, onChange, onClear, hasActiveFilter, options }: EnumFilterProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>(value || []);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setSelectedValues(value || []);
  }, [value]);

  const filteredOptions = useMemo(() => {
    return options.filter((option) => option.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [options, searchTerm]);

  const handleValueChange = (option: string, checked: boolean) => {
    let newValues: string[];

    if (checked) {
      newValues = [...selectedValues, option];
    } else {
      newValues = selectedValues.filter((v) => v !== option);
    }

    setSelectedValues(newValues);
    onChange(newValues.length > 0 ? newValues : undefined);
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">Select values:</Label>
      <Input
        placeholder="Filter..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-2"
      />
      <ScrollArea className="h-40 w-full">
        <div className="space-y-2 pr-4">
          {filteredOptions.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`filter-${option}`}
                checked={selectedValues.includes(option)}
                onCheckedChange={(checked) => handleValueChange(option, !!checked)}
              />
              <Label
                htmlFor={`filter-${option}`}
                className="text-xs font-normal cursor-pointer"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
