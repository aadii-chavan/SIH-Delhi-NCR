import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, AlertTriangle, Clock } from "lucide-react";
import { useBackendSourceImpact } from "@/hooks/use-backend-source-impact";

export function LiveSourceImpactAnalysis({ className }: { className?: string }) {
  const { data, loading, error, refetch, lastUpdated } = useBackendSourceImpact();

  const analysis = useMemo(() => {
    if (!data) return null;

    const { sources, previous } = data;
    
    // Calculate dominant source
    const entriesSorted = Object.entries(sources).sort((a, b) => b[1] - a[1]);
    const dominant = entriesSorted[0];
    
    // Calculate top-2 share
    const top2Share = entriesSorted.slice(0, 2).reduce((sum, [, v]) => sum + v, 0);
    
    // Calculate changes vs previous
    const changes = Object.entries(sources).map(([key, current]) => {
      const prev = previous[key as keyof typeof previous];
      const delta = current - prev;
      return {
        source: key,
        current,
        previous: prev,
        delta,
        isIncrease: delta > 0,
        isDecrease: delta < 0,
        isNoChange: delta === 0
      };
    });

    return {
      dominant,
      top2Share,
      changes,
      sources
    };
  }, [data]);

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'stubble': return 'Stubble Burning';
      case 'traffic': return 'Vehicle Traffic';
      case 'industrial': return 'Industrial Emissions';
      case 'other': return 'Other Sources';
      default: return source;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'stubble': return 'bg-orange-500';
      case 'traffic': return 'bg-blue-500';
      case 'industrial': return 'bg-red-500';
      case 'other': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskBadge = (percentage: number) => {
    if (percentage >= 35) {
      return <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">High</span>;
    } else if (percentage >= 25) {
      return <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200">Elevated</span>;
    }
    return null;
  };

  if (loading) {
    return (
      <Card className={`card-gradient shadow-soft ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading source analysis...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`card-gradient shadow-soft ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
            <span className="ml-2">Error loading data: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  const { dominant, top2Share, changes } = analysis;

  return (
    <Card className={`card-gradient shadow-soft ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
          Source Impact Analysis
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatLastUpdated(lastUpdated)}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={refetch} disabled={loading} className="h-6 w-6 p-0">
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary header */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3 bg-secondary/40">
            <div className="text-[11px] text-muted-foreground">Dominant Source</div>
            <div className="text-sm font-medium text-foreground">
              {getSourceLabel(dominant[0])}
            </div>
            <div className="text-lg font-bold">{dominant[1]}%</div>
          </div>
          <div className="rounded-lg border p-3 bg-secondary/40">
            <div className="text-[11px] text-muted-foreground">Top-2 Share</div>
            <div className="text-lg font-bold text-foreground">{top2Share}%</div>
            <div className="text-[11px] text-muted-foreground">of total contribution</div>
          </div>
        </div>

        {/* Source breakdown with changes */}
        <div className="space-y-3">
          {changes.map(({ source, current, previous, delta, isIncrease, isDecrease, isNoChange }) => (
            <div key={source} className="p-3 rounded-lg border bg-accent/30">
              <div className="flex items-center justify-between">
                <div className="font-medium text-foreground">
                  <span>{getSourceLabel(source)}</span>
                  {getRiskBadge(current)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{current}%</span>
                  {!isNoChange && (
                    <span className={`flex items-center text-xs ${isIncrease ? "text-red-600" : "text-green-600"}`}>
                      {isIncrease ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {isIncrease ? "+" : ""}{delta}% vs prev
                    </span>
                  )}
                  {isNoChange && (
                    <span className="flex items-center text-xs text-muted-foreground">
                      No change
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-2 h-2 w-full rounded bg-muted overflow-hidden">
                <div className={`h-full ${getSourceColor(source)}`} style={{ width: `${current}%` }} />
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">Prev: {previous}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
