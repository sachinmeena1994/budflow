
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
  badge?: React.ReactNode;
}

interface StandardTabsProps {
  tabs: TabItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  fullWidth?: boolean;
  variant?: "default" | "outline" | "underlined";
  className?: string;
  tabsListClassName?: string;
  contentClassName?: string;
  children?: React.ReactNode;
}

export const StandardTabs = ({
  tabs,
  value,
  onValueChange,
  fullWidth = false,
  variant = "default",
  className,
  tabsListClassName,
  contentClassName,
  children,
}: StandardTabsProps) => {
  // If no value is provided, use the first tab's value
  const defaultValue = value || (tabs.length > 0 ? tabs[0].value : undefined);

  // Define variant-specific styles
  const variantStyles = {
    default: "",
    outline: "border rounded-lg",
    underlined: "border-b",
  };

  return (
    <Tabs
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <TabsList
        className={cn(
          "flex h-auto mb-4",
          fullWidth ? "w-full justify-between" : "w-auto justify-start",
          variantStyles[variant],
          "pb-0 border-b",
          tabsListClassName
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className="flex items-center gap-2 px-4 py-2 h-auto"
          >
            {tab.label}
            {tab.badge}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent 
          key={tab.value} 
          value={tab.value}
          className={cn("pt-4", contentClassName)}
        >
          {tab.content || children}
        </TabsContent>
      ))}
    </Tabs>
  );
};
