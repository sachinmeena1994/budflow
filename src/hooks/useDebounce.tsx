import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
    // Use JSON.stringify to perform a deep comparison of the value, 
    // which is crucial for objects and arrays.
  }, [delay, JSON.stringify(value)]);

  return debouncedValue;
}
