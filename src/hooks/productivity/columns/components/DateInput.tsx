import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { format, parse, isValid as isValidDate } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { useProductivityForm } from "@/context/ProductivityFormContext";

type Props = {
  rowId: string;
  fieldKey: string;
  isReadOnly?: boolean;
  disableFuture?: boolean;
  className?: string;
};

const DATE_FMT = "MM/dd/yyyy";
const safeParseMDY = (s?: string) => {
  if (!s) return undefined;
  const d = parse(s, DATE_FMT, new Date());
  return isValidDate(d) ? d : undefined;
};

export const DateInput: React.FC<Props> = ({
  rowId,
  fieldKey,
  isReadOnly = false,
  disableFuture = true,
  className,
}) => {
  const { getCellValue, setCellValue } = useProductivityForm();
  const value: string = getCellValue(rowId, fieldKey, null);

  return (
    <InnerDatePicker
      value={value}
      onChange={(val) => setCellValue(rowId, fieldKey, val)}
      isReadOnlyField={isReadOnly}
      disableFuture={disableFuture}
      className={className}
    />
  );
};

type InnerProps = {
  value: string;
  onChange: (value: string) => void;
  isReadOnlyField: boolean;
  disableFuture?: boolean;
  className?: string;
};

const InnerDatePicker = memo(function InnerDatePicker({
  value,
  onChange,
  isReadOnlyField,
  disableFuture = true,
  className,
}: InnerProps) {


  const [open, setOpen] = useState(false);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const dateValue = safeParseMDY(value);

  // controlled month for reliable navigation
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (dateValue && (!disableFuture || dateValue <= today)) return dateValue;
    return today;
  });

  // only sync visible month when the *value* actually changes
  const lastValueRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (value !== lastValueRef.current) {
      lastValueRef.current = value;
      if (dateValue && (!disableFuture || dateValue <= today)) {
        setCurrentMonth(dateValue);
      }
    }
  }, [value, dateValue, disableFuture, today]);

  if (isReadOnlyField) {
    return (
      <Input
        type="text"
        value={dateValue ? format(dateValue, DATE_FMT) : ""}
        disabled
        className={cn("bg-muted text-muted-foreground h-8 text-xs", className)}
      />
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-8 text-xs justify-start text-left font-normal",
            !dateValue && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? format(dateValue, DATE_FMT) : "Pick a date"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          month={currentMonth}                 // controlled month
          onMonthChange={setCurrentMonth}      // prev/next now works
          toDate={disableFuture ? today : undefined}
          disabled={disableFuture ? [{ after: today }] : undefined}
          onSelect={(d) => {
            if (!d) return;
            const dd = new Date(d);
            dd.setHours(0, 0, 0, 0);
            if (disableFuture && dd > today) return;
            onChange(format(dd, DATE_FMT));    // write to central store
            setOpen(false);                    // close after pick
          }}
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
});
