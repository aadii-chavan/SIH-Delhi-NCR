import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AQICard } from "@/components/dashboard/AQICard";
import { PollutionSourcesChart } from "@/components/dashboard/PollutionSourcesChart";
import { AQIMap } from "@/components/dashboard/AQIMap";
import { QuickStatsGrid } from "@/components/dashboard/QuickStatsGrid";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
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
          {/* Current AQI Card */}
          <div className="xl:col-span-3">
            <AQICard
              aqi={currentAqi.aqi}
              location="Delhi-NCR Average"
              trend={{
                change: airQualityData.quickStats.trend.change,
                direction: airQualityData.quickStats.trend.direction,
              }}
              className="h-full"
            />
          </div>

          {/* Pollution Sources Chart */}
          <div className="xl:col-span-5">
            <PollutionSourcesChart sources={currentAqi.sources} className="h-full" />
          </div>

          {/* AI Recommendation */}
          <div className="xl:col-span-4">
            <RecommendationCard recommendation={recommendation} className="h-full" />
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
