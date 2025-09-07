import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateFilterValue {
  from?: Date;
  to?: Date;
}

interface DateFilterProps {
  value: DateFilterValue | undefined;
  onChange: (value: DateFilterValue | undefined) => void;
  onClear: () => void;
  hasActiveFilter: boolean;
}

export function DateFilter({ value, onChange, onClear, hasActiveFilter }: DateFilterProps) {
  const [fromDate, setFromDate] = useState<Date | undefined>(value?.from);
  const [toDate, setToDate] = useState<Date | undefined>(value?.to);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  useEffect(() => {
    setFromDate(value?.from);
    setToDate(value?.to);
  }, [value]);

  const handleFromDateChange = (date: Date | undefined) => {
    setFromDate(date);
    setFromOpen(false);

    // Only call onChange if both dates are set or both are cleared
    if (!date && !toDate) {
      onChange(undefined);
    } else if (date && toDate) {
      const newValue = {
        from: date,
        to: toDate,
      };
      onChange(newValue);
    }
  };

  const handleToDateChange = (date: Date | undefined) => {
    setToDate(date);
    setToOpen(false);

    // Only call onChange if both dates are set or both are cleared
    if (!fromDate && !date) {
      onChange(undefined);
    } else if (fromDate && date) {
      const newValue = {
        from: fromDate,
        to: date,
      };
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs font-medium">From Date</Label>
        <Popover open={fromOpen} onOpenChange={setFromOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'h-8 w-full justify-start text-left text-xs font-normal',
                !fromDate && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-3 w-3" />
              {fromDate ? format(fromDate, 'PPP') : 'Pick start date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={handleFromDateChange}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">To Date</Label>
        <Popover open={toOpen} onOpenChange={setToOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'h-8 w-full justify-start text-left text-xs font-normal',
                !toDate && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-3 w-3" />
              {toDate ? format(toDate, 'PPP') : 'Pick end date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={handleToDateChange}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
