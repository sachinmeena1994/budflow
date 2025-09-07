
import React from 'react';
import { cn } from '@/lib/utils';
import { textVariants } from '@/design-system/typography';
import { HStack } from '@/components/atoms/Stack';
import { Heading2, SmallText } from '@/components/atoms/Text';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  perms ?: any
}

/**
 * PageHeader organism for consistent page headers with title, description, and actions
 * Optimized for space efficiency with consistent font sizing
 */
export const PageHeader = ({
  title,
  description,
  actions,
  className,
  perms
}: PageHeaderProps) => {
  return (
    <div className={cn('mb-6', className)}>
      <HStack className="justify-between items-center flex-wrap gap-2">
        <div>
          <Heading2>{title}</Heading2>
          {description && (
            <SmallText className="text-muted-foreground">{description}</SmallText>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </HStack>
    </div>
  );
};
