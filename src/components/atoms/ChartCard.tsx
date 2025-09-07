
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  className,
}) => {
  return (
    <Card className={cn(
      'shadow-sm border border-border/50',
      'hover:shadow-lg hover:scale-[1.01] transition-all duration-300 ease-in-out',
      'hover:border-border/80',
      className
    )}>
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-lg font-semibold text-foreground transition-colors duration-200">
          {title}
        </CardTitle>
        {subtitle && (
          <p className="text-sm text-muted-foreground transition-colors duration-200">
            {subtitle}
          </p>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {children}
      </CardContent>
    </Card>
  );
};
