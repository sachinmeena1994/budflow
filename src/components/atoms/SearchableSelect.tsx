import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { focusNext, focusPrev } from "@/utils/focus-row";

interface SearchableSelectProps {
  options: { value: string; label: string }[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  width?: "s" | "m" | "l";
  autoAdvance?: boolean; // <-- new
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  disabled = false,
  className,
  searchPlaceholder = "Search...",
  emptyText = "No options found.",
  width = "s",
  autoAdvance = true,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const widthClass = width === "l" ? "w-64" : width === "m" ? "w-40" : "w-full";

  // const advance = React.useCallback(
  //   (dir: "next" | "prev" = "next") => {
  //     if (!autoAdvance || !triggerRef.current) return;
  //     setTimeout(() => {
  //       if (!triggerRef.current) return;
  //       if (dir === "next") focusNext(triggerRef.current!);
  //       else focusPrev(triggerRef.current!);
  //     }, 0);
  //   },
  //   [autoAdvance]
  // );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          // data-focusable="true"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(widthClass, "justify-between h-8 text-xs", className)}
          disabled={disabled}
          // onKeyDown={(e) => {
          //   // Keep Tab in-row even when menu is closed
          //   if (e.key === "Tab") {
          //     e.preventDefault();
          //     e.stopPropagation();
          //     if (e.shiftKey) advance("prev");
          //     else advance("next");
          //   }
          //   if (e.key === "Enter") {
          //     e.preventDefault();
          //     setOpen((o) => !o);
          //   }
          // }}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(widthClass, "p-0 z-50")}
        align="start"
        // onKeyDownCapture={(e) => {
        //   if (e.key === "Tab") {
        //     e.preventDefault();
        //     e.stopPropagation();
        //     setOpen(false);
        //     if (e.shiftKey) advance("prev");
        //     else advance("next");
        //   }
        // }}
      >
        <Command shouldFilter>
          <CommandInput placeholder={searchPlaceholder} className="h-8 text-xs" />
          <CommandList>
            <CommandEmpty className="text-xs py-2">{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.value}`}
                  className="text-xs py-1"
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                    // advance("next");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-3 w-3",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
