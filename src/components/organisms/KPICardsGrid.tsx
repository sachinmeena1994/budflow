import React ,{useMemo}from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Scissors, Bot, Leaf, AlertTriangle, Award, Percent } from "lucide-react";
import { KPIData } from "@/hooks/useDashboardData";
import {  getDateOptions ,useDashboardStore} from '@/store/dashboardStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type DayPeriod = "today" | "yesterday" | "last7days" | "last30days";

interface KPICardsGridProps {
  // allow either a map keyed by period OR a single KPIData object
  data: Record<DayPeriod, KPIData> | KPIData | null;
  selectedPeriod: DayPeriod;
  isLoading: boolean;
}

interface ProductivityCard {
  title: string;
  value: number;
  unit: string;
  target: number;
  status: "good" | "warning" | "danger";
  icon: React.ElementType;
}

const getColorByStatus = (status: "good" | "warning" | "danger") => {
  switch (status) {
    case "good":
      return "text-success";
    case "warning":
      return "text-warning";
    case "danger":
      return "text-destructive";
  }
};

const getBgColorByStatus = (status: "good" | "warning" | "danger") => {
  switch (status) {
    case "good":
      return "bg-success/10";
    case "warning":
      return "bg-warning/10";
    case "danger":
      return "bg-destructive/10";
  }
};


function isSingleKPI(d: KPICardsGridProps["data"]): d is KPIData {
  return !!d && typeof (d as KPIData).breakdown !== "undefined";
}

const KPICardsGrid: React.FC<KPICardsGridProps> = ({ data, selectedPeriod, isLoading }) => {

  const selectedDate = useDashboardStore((s) => s.selectedDate);
  const setSelectedDate = useDashboardStore((s) => s.setSelectedDate);
  const getPeriodData = (): KPIData | null => {
    if (!data) return null;
    if (isSingleKPI(data)) return data; // when a single KPIData is passed
    // when a period->KPIData map is passed
    const byPeriod = data as Partial<Record<DayPeriod, KPIData>>;
    return byPeriod[selectedPeriod] ?? byPeriod.today ?? byPeriod.yesterday ?? null;
  };

    const dateOptions = useMemo(() => getDateOptions(), []);

  const getProductivityData = (): ProductivityCard[] => {
    const periodData = getPeriodData();
    if (!periodData) return [];

    return [
      {
        title: "Breakdown",
        value: periodData.breakdown.value,
        unit: "g/hr",
        target: periodData.breakdown.target,
        status:
          periodData.breakdown.value >= periodData.breakdown.target
            ? "good"
            : periodData.breakdown.value >= periodData.breakdown.target * 0.95
              ? "warning"
              : "danger",
        icon: Scissors,
      },
      {
        title: "Hand Trim",
        value: periodData.handTrim.value,
        unit: "g/hr",
        target: periodData.handTrim.target,
        status:
          periodData.handTrim.value >= periodData.handTrim.target
            ? "good"
            : periodData.handTrim.value >= periodData.handTrim.target * 0.95
              ? "warning"
              : "danger",
        icon: Scissors,
      },
      {
        title: "Harvest",
        value: periodData.harvest.value,
        unit: "plants/hr",
        target: periodData.harvest.target,
        status:
          periodData.harvest.value >= periodData.harvest.target
            ? "good"
            : periodData.harvest.value >= periodData.harvest.target * 0.95
              ? "warning"
              : "danger",
        icon: Leaf,
      },
      {
        title: "Machine",
        value: periodData.machine.value,
        unit: "g/hr",
        target: periodData.machine.target,
        status:
          periodData.machine.value >= periodData.machine.target
            ? "good"
            : periodData.machine.value >= periodData.machine.target * 0.95
              ? "warning"
              : "danger",
        icon: Bot,
      },
      {
        title: "A vs B %",
        value: periodData.abRatio.value,
        unit: "%",
        target: periodData.abRatio.target,
        status:
          periodData.abRatio.value >= periodData.abRatio.target
            ? "good"
            : periodData.abRatio.value >= periodData.abRatio.target * 0.95
              ? "warning"
              : "danger",
        icon: Percent,
      },
      {
        title: "Premium Retention",
        value: periodData.premiumRetention.value,
        unit: "%",
        target: periodData.premiumRetention.target,
        status:
          periodData.premiumRetention.value >= periodData.premiumRetention.target
            ? "good"
            : "warning",
        icon: Award,
      },
      {
        title: "Flagged Workers",
        value: periodData.flaggedWorkers.value,
        unit: "",
        target: periodData.flaggedWorkers.target,
        status:
          periodData.flaggedWorkers.value <= periodData.flaggedWorkers.target
            ? "good"
            : periodData.flaggedWorkers.value <= periodData.flaggedWorkers.target * 1.5
              ? "warning"
              : "danger",
        icon: AlertTriangle,
      },
    ];
  };

  const productivityCards = getProductivityData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

return (
  <div className="border-b pb-4">
    {/* Top-right date picker */}
    <div className="flex justify-end mb-4">
      <Select
        value={selectedDate}
        onValueChange={(value) => {
          console.log('[Dashboard] onValueChange -> setSelectedDate:', value);
          setSelectedDate(value as typeof selectedDate);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select date" />
        </SelectTrigger>
        <SelectContent>
          {dateOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* KPI grid */}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
    {productivityCards.map((card, index) => {
  const Icon = card.icon;
  const percentage = card.target > 0 ? (card.value / card.target) * 100 : 0;
  const showProgress = card.title !== "Flagged Workers"; // ← hide target & % for flagged

  return (
    <Card key={index} className="animate-fade-in transition-all duration-200 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="pr-2 text-sm font-medium text-muted-foreground">
          {card.title}
        </CardTitle>
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-md ${getBgColorByStatus(card.status)}`}
        >
          <Icon
            className={`h-4 w-4 ${
              card.title === "Flagged Workers"
                ? "text-destructive"
                : card.title === "Premium Retention"
                ? "text-success"
                : getColorByStatus(card.status)
            }`}
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-1">
          {/* Value + unit */}
          <div className="flex items-baseline text-xl font-bold text-ellipsis">
            <span>{card.value.toLocaleString()}</span>
            {card.unit && (
              <span className="ml-1 text-sm font-medium text-muted-foreground">{card.unit}</span>
            )}
          </div>

          {/* Target (hidden for Flagged Workers) */}
          {showProgress && (
            <div className="text-xs text-muted-foreground text-ellipsis">
              Target: {card.target.toLocaleString()} {card.unit}
            </div>
          )}

          {/* % badge (hidden for Flagged Workers) */}
          {showProgress && (
            <Badge
              variant={card.status === "good" ? "default" : "secondary"}
              className={`text-xs ${
                card.status === "good"
                  ? "border-success/20 bg-success/10 text-success"
                  : card.status === "warning"
                  ? "border-warning/20 bg-warning/10 text-warning"
                  : "border-destructive/20 bg-destructive/10 text-destructive"
              }`}
            >
              {percentage.toFixed(0)}% of target
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
})}

    </div>
  </div>
);

};

export default KPICardsGrid;
