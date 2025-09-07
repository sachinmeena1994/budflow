import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface RefreshButtonProps {
  onClick?: () => void;
  label?: ReactNode;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function RefreshButton({
  onClick,
  label = 'Refresh',
  icon,
  className = '',
  disabled = false,
}: RefreshButtonProps) {
  return (
    <Button
      className={cn(
        'ml-2 flex h-9 items-center justify-center rounded-md bg-primary px-3 text-white transition-colors hover:bg-primary/90',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      <span className="font-poppins text-justify text-[14px] font-medium leading-6 tracking-[0.28px]">
        {label}
      </span>
    </Button>
  );
}
