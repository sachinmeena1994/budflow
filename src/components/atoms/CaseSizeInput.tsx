
import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CaseSizeInputProps {
  value: number;
  onChange: (value: number) => void;
  hasError?: boolean;
  placeholder?: string;
  className?: string;
}

export const CaseSizeInput: React.FC<CaseSizeInputProps> = ({
  value,
  onChange,
  hasError = false,
  placeholder = "0",
  className,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    onChange(newValue);
  };

  return (
    <Input
      type="number"
      value={value || ""}
      onChange={handleChange}
      placeholder={placeholder}
      min="0"
      className={cn(
        "w-full h-8 text-xs text-center",
        hasError && "border-red-500 focus:border-red-500",
        className
      )}
    />
  );
};
