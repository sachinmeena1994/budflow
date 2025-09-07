
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  className,
}) => {
  const getTooltipContent = (title: string) => {
    const tooltips: Record<string, string> = {
      'Total Technicians': 'Number of active technicians working this week',
      'Avg Productivity': 'Average units processed per hour across all work types',
      'Total Hours': 'Total hours logged by all technicians this week',
      'Quality Score': 'Average quality rating for completed work this week'
    };
    return tooltips[title] || title;
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className={cn(
          'h-24 shadow-sm border border-border/50 cursor-pointer',
          'hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-in-out',
          'hover:border-border/80',
          className
        )}>
          <CardContent className="px-4 py-2 h-full flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
              <p className="text-2xl font-bold text-foreground transition-colors duration-200">{value}</p>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
            <div className="text-muted-foreground/60 transition-colors duration-200 hover:text-muted-foreground/80">
              {icon}
            </div>
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">{getTooltipContent(title)}</p>
      </TooltipContent>
    </Tooltip>
  );
};
