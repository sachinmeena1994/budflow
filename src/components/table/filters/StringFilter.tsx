import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';

interface StringFilterProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  onClear: () => void;
  hasActiveFilter: boolean;
}

export function StringFilter({ value, onChange, onClear, hasActiveFilter }: StringFilterProps) {
  const [localValue, setLocalValue] = useState(value || '');
  const debouncedValue = useDebounce(localValue, 500);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value || '');
    inputRef.current?.focus();
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue ?? '');
    }
  }, [debouncedValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  return (
    <div className="space-y-2 p-2">
      <Input
        ref={inputRef}
        placeholder="Filter..."
        value={localValue}
        onChange={handleChange}
        className="h-8 text-xs"
      />
    </div>
  );
}
