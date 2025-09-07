import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WorkTypeBadgeProps {
  workType?: string | null;   // ← allow any string
  className?: string;
}

const COLORS: Record<string, string> = {
    breakdown: "bg-red-100 text-red-800 border-red-200",
    harvest :"bg-orange-100 text-orange-800 border-orange-200",
     hand: "bg-green-100 text-green-800 border-green-200",
    machine:  "bg-blue-100 text-blue-800 border-blue-200"
  
};

function normalizeKey(raw?: string | null) {
  const s = (raw || "").toLowerCase().trim();
  if (s.includes("harvest")) return "harvest";
  if (s.includes("machine")) return "machine";
  if (s.includes("hand")) return "hand";           
  if (s.includes("break")) return "breakdown";
  return "unknown";
}

function niceLabel(raw?: string | null) {
  const s = (raw || "").trim();
  if (!s) return "—";
  return s.replace(/\b\w/g, (c) => c.toUpperCase()); 
}

export const WorkTypeBadge: React.FC<WorkTypeBadgeProps> = ({ workType, className }) => {
  const key = normalizeKey(workType);
  return (
    <Badge
      variant="outline"
      className={cn(
        "whitespace-nowrap px-2 py-0.5 text-xs min-w-[70px] justify-center", // ← no wrap + fixed width
        COLORS[key],
        className
      )}
    >
      {niceLabel(workType)}
    </Badge>
  );
};
