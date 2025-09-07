
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BadgeFieldProps {
  value: string | number;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export const BadgeField: React.FC<BadgeFieldProps> = ({
  value,
  variant = 'secondary',
  className,
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toFixed(2);
    }
    return val;
  };

  return (
    <Badge variant={variant} className={cn('font-mono', className)}>
      {formatValue(value)}
    </Badge>
  );
};
