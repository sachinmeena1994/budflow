
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Heading3, SmallText } from "@/components/atoms/Typography";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard = ({ title, value, icon: Icon, trend, className }: StatCardProps) => {
  return (
    <Card className={cn("hover:shadow-md transition-shadow duration-300", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <SmallText className="font-medium uppercase tracking-wide">
            {title}
          </SmallText>
          <Icon className="h-5 w-5 text-slate-400" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <Heading3 className="text-2xl font-bold">{value}</Heading3>
          {trend && (
            <div className="flex items-center gap-1">
              <SmallText 
                className={cn(
                  "font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "+" : ""}{trend.value}
              </SmallText>
              <SmallText>vs last month</SmallText>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
