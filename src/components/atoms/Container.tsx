
import React from 'react';
import { cn } from '@/lib/utils';
import { layout } from '@/design-system/spacing';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof layout.container;
  padding?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Container component for consistent maximum widths
 */
export const Container = ({
  size = 'xl',
  padding = true,
  className,
  children,
  ...rest
}: ContainerProps) => {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        layout.container[size],
        padding && 'px-4 md:px-6',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
