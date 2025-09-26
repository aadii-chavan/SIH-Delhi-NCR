import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle, Clock } from "lucide-react";
import { useLiveAQI } from "@/hooks/use-live-aqi";
import { Spinner } from "@/components/common/Spinner";

interface LiveAQICardProps {
  city?: string;
  className?: string;
}

export function LiveAQICard({ city = "delhi", className }: LiveAQICardProps) {
  const { data, loading, error, refetch, lastUpdated } = useLiveAQI(city);

  const getTrendIcon = () => {
    if (!data?.trend) return null;
    switch (data.trend.direction) {
      case "up":
        return <TrendingUp className="w-4 h-4" />;
      case "down":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    if (!data?.trend) return "";
    switch (data.trend.direction) {
      case "up":
        return "text-red-600 bg-red-50";
      case "down":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  if (error) {
    return (
      <Card className={`card-gradient shadow-soft hover:shadow-medium smooth-transition ${className}`}>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span>Current AQI — Delhi (Live)</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">Failed to load AQI data</span>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`card-gradient shadow-soft hover:shadow-medium smooth-transition ${className}`}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <span>Current AQI — Delhi (Live)</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="h-6 w-6 p-0"
          >
            {loading ? <Spinner size="sm" /> : <RefreshCw className="w-3 h-3" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Main AQI Display */}
          <div className="text-center">
            {loading && !data ? (
              <div className="flex items-center justify-center space-x-2">
                <Spinner size="sm" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-4xl font-bold text-foreground mb-1">
                  {data?.aqi || '--'}
                </div>
                <Badge 
                  className={`${data?.color || 'aqi-moderate'} px-3 py-1 text-sm font-medium`}
                  variant="secondary"
                >
                  {data?.status || 'Unknown'}
                </Badge>
              </>
            )}
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="text-xs text-muted-foreground text-center flex items-center gap-1 justify-center">
              <Clock className="w-3 h-3" />
              Last updated: {formatLastUpdated(lastUpdated)}
            </div>
          )}

          {/* AQI Scale Indicator */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground text-center">
              Air Quality Level
            </div>
            <div className="relative h-2 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 rounded-full overflow-hidden">
              {data && (
                <div 
                  className="absolute top-0 w-1 h-full bg-white border border-gray-400 rounded-sm"
                  style={{ 
                    left: `${Math.min(Math.max((data.aqi / 500) * 100, 0), 100)}%`,
                    transform: 'translateX(-50%)'
                  }}
                />
              )}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>Good</span>
              <span>Moderate</span>
              <span>Unhealthy</span>
              <span>500+</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
