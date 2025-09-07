import React from 'react';
import { cn } from '@/lib/utils';
import { textVariants } from '@/design-system/typography';

type TextProps = {
  variant?: keyof typeof textVariants;
  as?: React.ElementType;
  className?: string;
  color?: string;
} & React.HTMLAttributes<HTMLElement>;

/**
 * Text component for consistent typography across the application
 */
export const Text = ({
  variant = 'body',
  as: Component = 'p',
  className,
  color,
  ...props
}: TextProps) => {
  return (
    <Component
      className={cn(textVariants[variant], color && `text-${color}`, className)}
      {...props}
    />
  );
};

// Pre-configured components for common text elements
export const Heading1 = (props: Omit<TextProps, 'variant' | 'as'>) => (
  <Text variant="h1" as="h1" {...props} />
);

export const Heading2 = (props: Omit<TextProps, 'variant' | 'as'>) => (
  <Text variant="h2" as="h2" {...props} />
);

export const Heading3 = (props: Omit<TextProps, 'variant' | 'as'>) => (
  <Text variant="h3" as="h3" {...props} />
);

export const Heading4 = (props: Omit<TextProps, 'variant' | 'as'>) => (
  <Text variant="h4" as="h4" {...props} />
);

export const Heading5 = (props: Omit<TextProps, 'variant' | 'as'>) => (
  <Text variant="h5" as="h5" {...props} />
);

export const Paragraph = (props: Omit<TextProps, 'variant' | 'as'>) => (
  <Text variant="body" as="p" {...props} />
);

export const SmallText = (props: Omit<TextProps, 'variant' | 'as'>) => (
  <Text variant="bodySmall" as="span" {...props} />
);

export const Caption = (props: Omit<TextProps, 'variant' | 'as'>) => (
  <Text variant="caption" as="span" {...props} />
);
