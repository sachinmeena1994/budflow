
import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/atoms/Text';
import { VStack } from '@/components/atoms/Stack';

interface FormFieldProps {
  label: string;
  id?: string; // For backwards compatibility
  htmlFor?: string; // Make htmlFor optional for backward compatibility
  placeholder?: string; // Add missing placeholder property
  type?: string; // Add missing type property
  value?: string; // Add missing value property
  onChange?: any; // Add missing onChange property
  helper?: string; // Add missing helper property (description alias)
  error?: string;
  description?: string;
  required?: boolean;
  className?: string;
  children?: React.ReactNode; // Make children optional for cases where component renders its own input
}

/**
 * FormField molecule component for consistent form inputs with labels and error messages
 */
export const FormField = ({
  label,
  htmlFor,
  error,
  description,
  helper, // Support helper as alias for description
  required = false,
  className,
  children,
  placeholder,
  type,
  value,
  onChange,
  id,
}: FormFieldProps) => {
  // Use helper if description is not provided
  const displayDescription = description || helper;
  
  // Generate htmlFor from id if not provided
  const labelFor = htmlFor || id;
  
  // If no children provided, render a basic input
  const inputElement = children || (
    <input
      id={labelFor}
      type={type || 'text'}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
  
  return (
    <VStack spacing="xs" className={cn('w-full', className)}>
      <Label htmlFor={labelFor} className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      
      {displayDescription && (
        <Text variant="caption" className="text-muted-foreground -mt-1">
          {displayDescription}
        </Text>
      )}
      
      {inputElement}
      
      {error && (
        <Text variant="caption" className="text-destructive">
          {error}
        </Text>
      )}
    </VStack>
  );
};
