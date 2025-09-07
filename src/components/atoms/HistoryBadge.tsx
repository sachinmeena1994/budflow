
import React from 'react';

interface HistoryBadgeProps {
  hasHistory: boolean;
  onClick: () => void;
}

export function HistoryBadge({ hasHistory, onClick }: HistoryBadgeProps) {
  if (!hasHistory) {
    return (
      <span className="text-xs text-gray-500">
        None
      </span>
    );
  }

  return (
    <button
      onClick={onClick}
      className="text-xs text-green-600 hover:text-green-700 hover:underline"
    >
      Available
    </button>
  );
}
