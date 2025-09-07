import React from 'react';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';

export const DataTableLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};
