
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface CaretSortIconProps {
  direction?: 'asc' | 'desc' | undefined;
  className?: string;
  sortIndex?: number; // Add sort index to show multi-sort order
}

export function CaretSortIcon({ direction, className = '', sortIndex }: CaretSortIconProps) {
  if (direction === 'asc') {
    return (
      <div className="relative inline-flex items-center">
        <ArrowUp className={className} size={16} />
        {sortIndex !== undefined && sortIndex > 0 && (
          <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-primary text-white rounded-full w-3 h-3 flex items-center justify-center">
            {sortIndex + 1}
          </span>
        )}
      </div>
    );
  } else if (direction === 'desc') {
    return (
      <div className="relative inline-flex items-center">
        <ArrowDown className={className} size={16} />
        {sortIndex !== undefined && sortIndex > 0 && (
          <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-primary text-white rounded-full w-3 h-3 flex items-center justify-center">
            {sortIndex + 1}
          </span>
        )}
      </div>
    );
  }
  
  // For unsorted state, display both arrows with reduced opacity
  return (
    <div className="relative inline-flex items-center">
      <ArrowUp className={`${className} opacity-30`} size={16} />
    </div>
  );
}
