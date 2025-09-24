import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PollutionSourcesChart } from "@/components/dashboard/PollutionSourcesChart";
import { AQIMap } from "@/components/dashboard/AQIMap";
import { QuickStatsGrid } from "@/components/dashboard/QuickStatsGrid";
// Removed RecommendationCard, replaced with ForecastSummaryCard
import { ForecastSummaryCard } from "@/components/dashboard/ForecastSummaryCard";
import { airQualityData } from "@/data/airQualityData";

const Index = () => {
  const { currentAqi, aqiLocations, recommendation } = airQualityData;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Overview of air quality status, sources, and actions</p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <QuickStatsGrid />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Pollution Sources Chart */}
          <div className="xl:col-span-7">
            <PollutionSourcesChart sources={currentAqi.sources} className="h-full" />
          </div>

          {/* 24h Forecast Summary */}
          <div className="xl:col-span-5">
            <ForecastSummaryCard forecasts={airQualityData.forecasts.shortTerm} className="h-full" />
          </div>
        </div>

        {/* Interactive Map */}
        <div className="grid grid-cols-1 gap-6">
          <AQIMap locations={aqiLocations} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
