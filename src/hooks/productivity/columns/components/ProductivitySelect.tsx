import React from "react";
import { SearchableSelect } from "@/components/atoms/SearchableSelect";
import { useProductivityForm } from "@/context/ProductivityFormContext";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectInputProps {
  rowId: string;
  fieldKey: string;
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  width?: "s" | "m" | "l";
  isReadOnly?: boolean;
}

export const SearchableSelectInput: React.FC<SearchableSelectInputProps> = ({
  rowId,
  fieldKey,
  options,
  placeholder = "Select option",
  searchPlaceholder = "Search...",
  emptyText = "No options found.",
  className = "w-full",
  width = "m",
  isReadOnly = false,
}) => {
  const { getCellValue, setCellValue } = useProductivityForm();
  
  const value = getCellValue(rowId, fieldKey, '');

  const handleValueChange = (newValue: string) => {
    setCellValue(rowId, fieldKey, newValue);
  };

  if (isReadOnly) {
    const selectedOption = options.find(opt => opt.value === value);
    return (
      <span className="text-xs text-muted-foreground px-2 py-1">
        {selectedOption?.label || value || placeholder}
      </span>
    );
  }

  return (
    <SearchableSelect
      options={options}
      value={value || undefined}
      onValueChange={handleValueChange}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyText={emptyText}
      className={className}
      width={width}
    />
  );
};