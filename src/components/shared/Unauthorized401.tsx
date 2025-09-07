import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

/**
 * Atomic Unauthorized401 component that renders consistent 401 experience
 * Used at page level when user lacks permission for the page's primary action
 */
export const Unauthorized401: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-warning" />
            <h3 className="text-lg font-semibold">Access Restricted</h3>
            <p className="text-muted-foreground">
              You do not have permission to access this page.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};