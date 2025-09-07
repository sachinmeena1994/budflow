
import React from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CaseSizeErrorIconProps {
  quantity: number;
  standardCaseSize: number;
  className?: string;
}

export function CaseSizeErrorIcon({ quantity, standardCaseSize, className }: CaseSizeErrorIconProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
            className
          )}>
            <Info size={12} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-xs">
            Invalid case size: {quantity}. Expected multiple of {standardCaseSize}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
