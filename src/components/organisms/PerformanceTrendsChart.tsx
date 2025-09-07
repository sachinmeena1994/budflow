import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { PerformanceData } from '@/hooks/useDashboardData';
import { format, parseISO, isValid } from "date-fns";


interface PerformanceTrendsChartProps {
  data: PerformanceData | null;
  isLoading: boolean;
}

type WorkType = 'breakdown' | 'handTrim' | 'harvest' | 'machine';

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    const value = Number(payload[0]?.value ?? 0);
    const target = Number(payload[1]?.value ?? payload[0]?.payload?.target ?? 0);
    const difference = value - target;

    // ✅ format the date label
    let labelText = label;
    if (typeof label === "string") {
      try {
        const dt = parseISO(label);
        if (isValid(dt)) {
          labelText = format(dt, "MM/dd/yyyy");
        }
      } catch {
        // fallback: keep original label
      }
    }

    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 space-y-1">
        <p className="font-medium">{labelText}</p>
        <div className="space-y-1 text-sm">
          <p className="flex justify-between gap-4">
            <span className="text-primary">Current:</span>
            <span className="font-mono">{value.toLocaleString()}{unit}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span className="text-muted-foreground">Target:</span>
            <span className="font-mono">{target.toLocaleString()}{unit}</span>
          </p>
          <p
            className={`flex justify-between gap-4 ${
              difference >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            <span>Difference:</span>
            <span className="font-mono">
              {difference > 0 ? "+" : ""}
              {difference.toLocaleString()}
              {unit}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};


const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-48" />
    </div>
    <Skeleton className="h-[300px] w-full" />
  </div>
);

const PerformanceTrendsChart: React.FC<PerformanceTrendsChartProps> = ({ data, isLoading }) => {
  const [selectedWorkType, setSelectedWorkType] = useState<WorkType>('breakdown');

  const chartData = React.useMemo(() => {
    return data?.trendData?.[selectedWorkType] ?? [];
  }, [data, selectedWorkType]);

  const currentTarget = data?.workTypeTargets?.[selectedWorkType] || { label: '', target: 0, unit: '' };

  const averageValue = React.useMemo(() => {
    if (!chartData.length) return 0;
    const sum = chartData.reduce((acc, d) => acc + Number(d.value || 0), 0);
    return sum / chartData.length;
  }, [chartData]);

  const trend = React.useMemo(() => {
    if (chartData.length < 2) return '—';
    const mid = Math.floor(chartData.length / 2);
    const first = chartData.slice(0, mid);
    const second = chartData.slice(mid);
    const avg = (arr: typeof chartData) =>
      arr.reduce((s, d) => s + Number(d.value || 0), 0) / (arr.length || 1);
    const a = avg(first);
    const b = avg(second);
    if (b > a) return 'improving';
    if (b < a) return 'declining';
    return 'flat';
  }, [chartData]);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <LoadingSkeleton />
        </CardHeader>
      </Card>
    );
  }

  const peak = chartData.length ? Math.max(...chartData.map(d => Number(d.value || 0))) : 0;
  const low  = chartData.length ? Math.min(...chartData.map(d => Number(d.value || 0))) : 0;
  const targetY = Number.isFinite(Number(currentTarget.target))
  ? Number(currentTarget.target)
  : 0;

   const values = chartData.map(d => Number(d.value ?? 0));
  const dataMin = values.length ? Math.min(...values) : 0;
  const dataMax = values.length ? Math.max(...values) : 0;

  // exact domain that always includes the target (no padding)
  const minY = Math.min(dataMin, targetY);
  const maxY = Math.max(dataMax, targetY);
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance Trends
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Past 7 days</span>
              </div>
              <span>Avg: {averageValue.toFixed(1)}{currentTarget.unit}</span>
              <span className={`capitalize ${
                trend === 'improving' ? 'text-success'
                : trend === 'declining' ? 'text-warning'
                : 'text-muted-foreground'
              }`}>
                {trend === '—' ? 'No trend' : trend}
              </span>
            </div>
          </div>

          <Select value={selectedWorkType} onValueChange={(value: WorkType) => setSelectedWorkType(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {data?.workTypeTargets
                ? Object.entries(data.workTypeTargets).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))
                : null}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tickFormatter={(d: string) => {
    try {
      const dt = parseISO(d);
      return isValid(dt) ? format(dt, "MM/dd/yyyy") : d;
    } catch {
      return d;
    }
  }}
              />
<YAxis
  domain={[minY, maxY]}          // <- no +/- 10 padding
  axisLine={false}
  tickLine={false}
  className="text-xs"
  allowDecimals={false}
  allowDataOverflow={false}
/>

{Number.isFinite(targetY) && (
  <ReferenceLine
    y={targetY}
    stroke="hsl(var(--muted-foreground))"
    strokeDasharray="5 5"
 label={{ value: "Target", position: "insideBottomRight", offset: -15 }}

  />
)}

              <Tooltip content={<CustomTooltip unit={currentTarget.unit} />} />

              <ReferenceLine
                y={currentTarget.target}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 5" 
              />

              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {peak.toLocaleString()}{currentTarget.unit}
            </div>
            <div className="text-xs text-muted-foreground">Peak Performance</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">
              {averageValue.toFixed(1)}{currentTarget.unit}
            </div>
            <div className="text-xs text-muted-foreground">Average Performance</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-warning">
              {low.toLocaleString()}{currentTarget.unit}
            </div>
            <div className="text-xs text-muted-foreground">Lowest Performance</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceTrendsChart;
