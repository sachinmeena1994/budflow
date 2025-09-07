
import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/useDebounce";

interface NumberFilterValue {
  min?: number;
  max?: number;
}

interface NumberFilterProps {
  value: NumberFilterValue | undefined;
  onChange: (value: NumberFilterValue | undefined) => void;
  onClear: () => void;
  hasActiveFilter: boolean;
}

export function NumberFilter({ value, onChange, onClear, hasActiveFilter }: NumberFilterProps) {
  const [localMin, setLocalMin] = useState(value?.min?.toString() || "");
  const [localMax, setLocalMax] = useState(value?.max?.toString() || "");
  
  const debouncedMin = useDebounce(localMin, 300);
  const debouncedMax = useDebounce(localMax, 300);

  useEffect(() => {
    setLocalMin(value?.min?.toString() || "");
    setLocalMax(value?.max?.toString() || "");
  }, [value]);

  useEffect(() => {
    const minNum = debouncedMin ? parseFloat(debouncedMin) : undefined;
    const maxNum = debouncedMax ? parseFloat(debouncedMax) : undefined;
    
    if (minNum !== undefined || maxNum !== undefined) {
      onChange({ min: minNum, max: maxNum });
    } else if (debouncedMin === "" && debouncedMax === "") {
      onChange(undefined);
    }
  }, [debouncedMin, debouncedMax, onChange]);

  const handleMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMin(e.target.value);
  }, []);

  const handleMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMax(e.target.value);
  }, []);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="min-value" className="text-xs font-medium">
          Minimum
        </Label>
        <Input
          id="min-value"
          type="number"
          placeholder="Min value"
          value={localMin}
          onChange={handleMinChange}
          className="h-8 text-xs"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="max-value" className="text-xs font-medium">
          Maximum
        </Label>
        <Input
          id="max-value"
          type="number"
          placeholder="Max value"
          value={localMax}
          onChange={handleMaxChange}
          className="h-8 text-xs"
        />
      </div>
    </div>
  );
}
