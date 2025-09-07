
import React from 'react';
import { cn } from '@/lib/utils';
import { layout } from '@/design-system/spacing';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  spacing?: keyof typeof layout.gap;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Stack component for consistent layout spacing
 */
export const Stack = ({
  direction = 'column',
  spacing = 'md',
  align = 'start',
  justify = 'start',
  wrap = false,
  className,
  children,
  ...rest
}: StackProps) => {
  return (
    <div
      className={cn(
        'flex',
        direction === 'row' ? 'flex-row' : 'flex-col',
        layout.gap[spacing],
        `items-${align}`,
        `justify-${justify}`,
        wrap && 'flex-wrap',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

// Shorthand components
export const HStack = (props: Omit<StackProps, 'direction'>) => (
  <Stack direction="row" {...props} />
);

export const VStack = (props: Omit<StackProps, 'direction'>) => (
  <Stack direction="column" {...props} />
);
