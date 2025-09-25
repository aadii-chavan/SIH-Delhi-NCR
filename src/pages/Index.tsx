import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PollutionSourcesChart } from "@/components/dashboard/PollutionSourcesChart";
import { AQIMap } from "@/components/dashboard/AQIMap";
import { QuickStatsGrid } from "@/components/dashboard/QuickStatsGrid";
// Removed RecommendationCard, replaced with ForecastSummaryCard
import { ForecastSummaryCard } from "@/components/dashboard/ForecastSummaryCard";
import { airQualityData } from "@/data/airQualityData";
import { AQICard } from "@/components/dashboard/AQICard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAqiSimulation, ZoneKey } from "@/hooks/use-aqi-simulation";
import { useLanguage } from "@/hooks/use-language";
import { useMemo } from "react";
import { useAqiHistory } from "@/hooks/use-aqi-history";
import { AQITrendChart } from "@/components/dashboard/AQITrendChart";
import { useSourceShift } from "@/hooks/use-source-shift";

const Index = () => {
  const { currentAqi, aqiLocations } = airQualityData;
  const { t, toggle, lang } = useLanguage();
  const { aqi, center, zone, setZone, zones } = useAqiSimulation("Delhi");
  const { timeRange, setTimeRange, points } = useAqiHistory(zone, aqi);

  const ariaLiveMessage = useMemo(() => `${t("aqi")} ${aqi}, ${t("zone")}: ${zone}`, [aqi, t, zone]);

  // Map simulation zone to dataset zone label
  const datasetZone = zone === "Delhi" ? "Delhi Central" : zone;
  const latestZoneEntry = useMemo(() => {
    return airQualityData.sourceBreakdown
      .filter((it) => it.zone === datasetZone)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }, [datasetZone]);
  const shiftedSources = useSourceShift(latestZoneEntry?.sources ?? currentAqi.sources);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("dashboard")}</h1>
            <p className="text-muted-foreground">Overview of air quality status, sources, and actions</p>
          </div>
          <button
            className="rounded border px-2 py-1 text-sm"
            onClick={toggle}
            aria-label={lang === "en" ? "Switch to Hindi" : "Switch to English"}
          >
            {lang.toUpperCase()}
          </button>
        </div>

        {/* Quick Stats Grid */}
        <QuickStatsGrid />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Pollution Sources Chart */}
          <div className="xl:col-span-7">
            <PollutionSourcesChart sources={shiftedSources} className="h-full" />
          </div>

          {/* 24h Forecast Summary */}
          <div className="xl:col-span-5">
            <ForecastSummaryCard forecasts={airQualityData.forecasts.shortTerm} className="h-full" />
          </div>
        </div>

        {/* AQI & Map Section */}
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{t("select_zone")}</span>
              <Select value={zone} onValueChange={(v) => setZone(v as ZoneKey)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((z) => (
                    <SelectItem key={z.name} value={z.name}>{z.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div aria-live="polite" className="sr-only">{ariaLiveMessage}</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <AQICard aqi={aqi} location={`${t("current_aqi")} — ${zone}`} />
            </div>
            <div className="lg:col-span-2">
              <AQIMap locations={aqiLocations} center={center} />
            </div>
          </div>

          {/* Trend Chart */}
          <AQITrendChart
            points={points}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            title="24h Trend"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
