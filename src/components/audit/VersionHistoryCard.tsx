import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Clock, User } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  action: string;
  version: number;
  created_at: string;
  user_name?: string;
  old_data?: any;
  new_data?: any;
  comment?: string;
}

interface VersionHistoryCardProps {
  log: AuditLog;
  isExpanded: boolean;
  onToggle: () => void;
}

export function VersionHistoryCard({ log, isExpanded, onToggle }: VersionHistoryCardProps) {

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "created":
        return "bg-green-100 text-green-800 border-green-200";
      case "updated":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM dd, yyyy 'at' HH:mm");
    } catch {
      return timestamp;
    }
  };

  const renderDataChanges = () => {
    if (!log.old_data && !log.new_data) return null;

    const changes = [];
    
    if (log.old_data && log.new_data) {
      // Compare old and new data
      const oldKeys = Object.keys(log.old_data);
      const newKeys = Object.keys(log.new_data);
      const allKeys = [...new Set([...oldKeys, ...newKeys])];

      for (const key of allKeys) {
        const oldValue = log.old_data[key];
        const newValue = log.new_data[key];
        
        if (oldValue !== newValue) {
          changes.push(
            <div key={key} className="bg-yellow-50 p-2 rounded border">
              <div className="font-medium text-sm text-gray-700">{key}</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-red-600 bg-red-50 px-2 py-1 rounded">
                  {oldValue?.toString() || "null"}
                </span>
                <span>→</span>
                <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                  {newValue?.toString() || "null"}
                </span>
              </div>
            </div>
          );
        }
      }
    } else if (log.new_data) {
      // New entry
      Object.entries(log.new_data).forEach(([key, value]) => {
        changes.push(
          <div key={key} className="bg-green-50 p-2 rounded border">
            <div className="font-medium text-sm text-gray-700">{key}</div>
            <div className="text-xs text-green-600">
              {value?.toString() || "null"}
            </div>
          </div>
        );
      });
    }

    return changes.length > 0 ? (
      <div className="space-y-2">
        <div className="font-medium text-sm">Changes:</div>
        <div className="space-y-1">{changes}</div>
      </div>
    ) : null;
  };

  return (
    <Card className="w-full mb-2">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-2 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${getActionColor(log.action)}`}>
                  {log.action.toUpperCase()} v{log.version}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Changed by: {log.user_name || "Unknown"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(log.created_at)}
                </span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {log.comment && (
              <div className="mb-3 p-2 bg-blue-50 rounded border">
                <div className="font-medium text-sm text-gray-700">Comment:</div>
                <div className="text-sm">{log.comment}</div>
              </div>
            )}
            {renderDataChanges()}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}