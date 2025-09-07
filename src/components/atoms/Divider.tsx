
import React from 'react';
import { cn } from '@/lib/utils';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * Divider component for consistent separation between elements
 */
export const Divider = ({
  orientation = 'horizontal',
  className,
}: DividerProps) => {
  return (
    <div
      className={cn(
        'bg-border',
        orientation === 'horizontal' 
          ? 'h-[1px] w-full my-4' 
          : 'h-full w-[1px] mx-4',
        className
      )}
      role="separator"
    />
  );
};
