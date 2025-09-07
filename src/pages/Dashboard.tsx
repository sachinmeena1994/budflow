// Dashboard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import FlaggedWorkersTable from '@/components/organisms/FlaggedWorkersTable';
import KPICardsGrid from '@/components/organisms/KPICardsGrid';
import PerformanceTrendsChart from '@/components/organisms/PerformanceTrendsChart';
import TopPerformersTable from '@/components/organisms/TopPerformersTable';
import { PermissionGate } from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDashboardData } from '@/hooks/useDashboardData';
import { usePermission } from '@/hooks/usePermission';
import { Unauthorized401 } from '@/components/shared/Unauthorized401';
import { RefreshCw } from 'lucide-react';
import { useAuditLookupOptions } from '@/hooks/useAuditLookupOptions';
import { useDashboardStore } from '@/store/dashboardStore';
import { useMarket } from '@/context/MarketContext';
const Dashboard: React.FC = () => {
  const canViewDashboard = usePermission({ action: 'view-dashboard-page' });
  const canViewKpi      = usePermission({ action: 'view-kpi-stats' });
  const canViewTrends   = usePermission({ action: 'view-productivity-trend' });
  const canViewFlags    = usePermission({ action: 'view-flagged-workers' });
  const canViewTops     = usePermission({ action: 'view-top-performers' });
const { currentSite } = useMarket();
  const { technicianOptions, userOptions } = useAuditLookupOptions();
  const selectedDate = useDashboardStore(s => s.selectedDate);

  // Local site selection (nullable until options arrive)
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
// options from currentSite (single option)
const siteOptions = useMemo(() => {
  if (!currentSite) return [];
  return [{ id: currentSite.id, label: currentSite.site_alias }];
}, [currentSite]);

// site id for data fetching -> selectedSite if chosen, else currentSite
const effectiveSiteId = useMemo(() => {
  if (selectedSite && selectedSite !== '') return String(selectedSite);
  return currentSite?.id ? String(currentSite.id) : '';
}, [selectedSite, currentSite]);

  // Fetch data with the effective site so UI == data
  const {
    kpiData,
    flaggedWorkers,
    performanceData,
    topPerformers,
    isLoading,
    error,
    refetch,
  } = useDashboardData({ selectedDate, siteId: effectiveSiteId });

  useEffect(() => {
    const perfPoints =
      performanceData
        ? Object.values(performanceData.trendData).reduce((acc, series) => acc + series.length, 0)
        : 0;

    console.log('[Dashboard] data state', {
      isLoading,
      hasKpi: !!kpiData,
      flaggedCount: flaggedWorkers?.length ?? 0,
      topCount: topPerformers?.length ?? 0,
      perfPoints,
      error,
      effectiveSiteId,
    });
  }, [kpiData, flaggedWorkers, topPerformers, performanceData, isLoading, error, effectiveSiteId]);

  if (!canViewDashboard) return <Unauthorized401 />;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ">
        <div className="px-2 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Team Productivity Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
            <Select
  defaultValue={currentSite?.id ? String(currentSite.id) : undefined}
  onValueChange={(value) => setSelectedSite(String(value))}
  disabled={!siteOptions.length}
>
  <SelectTrigger className="w-[220px]">
    <SelectValue placeholder="Select site" />
  </SelectTrigger>
  <SelectContent>
    {(siteOptions ?? []).map((opt) => (
      <SelectItem key={String(opt.id)} value={String(opt.id)}>
        {opt.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>


              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="px-2 py-8 space-y-8 w-full max-w-full">
        {error ? (
          <div className="py-8 text-center text-destructive">
            Failed to load dashboard data: {String(error)}
          </div>
        ) : (
          <>
            <PermissionGate action="view-kpi-stats">
              <KPICardsGrid
                data={kpiData}
                selectedPeriod="today"
                isLoading={isLoading}
              />
            </PermissionGate>

            <PermissionGate action="view-productivity-trend">
              <PerformanceTrendsChart data={performanceData} isLoading={isLoading} />
            </PermissionGate>

            <PermissionGate action="view-flagged-workers">
              <FlaggedWorkersTable
                workers={flaggedWorkers}
                isLoading={isLoading}
                technicianOptions={technicianOptions}
                userOptions={userOptions}
              />
            </PermissionGate>

            <PermissionGate action="view-top-performers">
              <TopPerformersTable
                performers={topPerformers}
                isLoading={isLoading}
                technicianOptions={technicianOptions}
                userOptions={userOptions}
              />
            </PermissionGate>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
