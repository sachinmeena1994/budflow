
import { cn } from "@/lib/utils";

interface PlatformIndicatorProps {
  platform: "Jane" | "Dutchie";
  className?: string;
}

export function PlatformIndicator({ platform, className }: PlatformIndicatorProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5",
        className
      )}
    >
      <span
        className={cn("h-2.5 w-2.5 rounded-full", {
          "bg-blue-500": platform === "Jane",
          "bg-green-500": platform === "Dutchie",
        })}
      />
      <span className="text-sm font-medium">{platform}</span>
    </div>
  );
}
