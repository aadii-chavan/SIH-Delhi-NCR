import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PollutionSourcesChart } from "@/components/dashboard/PollutionSourcesChart";
import { LiveSourceImpactAnalysis } from "@/components/dashboard/LiveSourceImpactAnalysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Filter, X, TrendingUp, TrendingDown, AlertTriangle, Activity, RefreshCw, Minus } from "lucide-react";
import { airQualityData } from "@/data/airQualityData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { AQICard } from "@/components/dashboard/AQICard";
import { useAqiSimulation, ZoneKey } from "@/hooks/use-aqi-simulation";
import { useSourceShift } from "@/hooks/use-source-shift";
import { SankeyDiagram } from "@/components/dashboard/SankeyDiagram";
import { useBackendSourceImpact } from "@/hooks/use-backend-source-impact";

const SourceBreakdown = () => {
  const [selectedDate, setSelectedDate] = useState("2025-09-23");
  const [selectedZone, setSelectedZone] = useState("all");
  const [windFactor, setWindFactor] = useState([0]);
  const [stubbleScenario, setStubbleScenario] = useState([0]);
  const [scenarioApplied, setScenarioApplied] = useState(false);
  const { aqi, zone, setZone } = useAqiSimulation("Delhi");
  const { data: backendData, loading, error, refetch, lastUpdated } = useBackendSourceImpact();
  const ariaLiveMessage = useMemo(() => `AQI ${aqi}, Zone: ${zone}`, [aqi, zone]);

  // Use backend data if available, otherwise fallback to hardcoded data
  const currentData = useMemo(() => {
    if (backendData) {
      return {
        timestamp: backendData.timestamp || new Date().toISOString(),
        zone: backendData.zone,
        sources: backendData.sources
      };
    }
    
    // Fallback to hardcoded data
    const filteredData = airQualityData.sourceBreakdown.filter((item) => {
      const matchesDate = selectedDate === "all" || item.timestamp.includes(selectedDate);
      const matchesZone = selectedZone === "all" || item.zone === selectedZone;
      return matchesDate && matchesZone;
    });
    
    return filteredData.length > 0 ? filteredData[0] : airQualityData.sourceBreakdown[0];
  }, [backendData, selectedDate, selectedZone]);

  // Filter data based on selections (for table display)
  const filteredData = airQualityData.sourceBreakdown.filter((item) => {
    const matchesDate = selectedDate === "all" || item.timestamp.includes(selectedDate);
    const matchesZone = selectedZone === "all" || item.zone === selectedZone;
    return matchesDate && matchesZone;
  });

  const adjustedSources = useMemo(() => {
    const base = { ...currentData.sources } as typeof currentData.sources;
    // Apply wind factor as a mock redistribution (higher wind reduces local traffic share slightly)
    const wind = windFactor[0];
    const trafficAdj = Math.max(0, base.traffic - Math.round(wind * 0.5));
    const stubbleAdj = Math.max(0, base.stubble - Math.round(stubbleScenario[0]));
    let residual = base.traffic - trafficAdj + base.stubble - stubbleAdj;
    const industrialAdj = Math.min(100, base.industrial + Math.round(residual * 0.4));
    const otherAdj = Math.min(100, base.other + Math.round(residual * 0.6));
    const total = stubbleAdj + trafficAdj + industrialAdj + otherAdj;
    // Normalize to 100
    return {
      stubble: Math.round((stubbleAdj / total) * 100),
      traffic: Math.round((trafficAdj / total) * 100),
      industrial: Math.round((industrialAdj / total) * 100),
      other: 100 - Math.round((stubbleAdj / total) * 100) - Math.round((trafficAdj / total) * 100) - Math.round((industrialAdj / total) * 100),
    };
  }, [currentData.sources, windFactor, stubbleScenario]);

  useEffect(() => {
    if (scenarioApplied) {
      localStorage.setItem("policy_scenario_sources", JSON.stringify({
        date: selectedDate,
        zone: selectedZone,
        windFactor: windFactor[0],
        stubbleReductionPct: stubbleScenario[0],
        adjustedSources,
      }));
    }
  }, [scenarioApplied, selectedDate, selectedZone, windFactor, stubbleScenario, adjustedSources]);

  // Previous sample for same zone (closest earlier timestamp) for trend deltas
  const zoneEntries = airQualityData.sourceBreakdown
    .filter((it) => it.zone === currentData.zone)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const currentIdx = zoneEntries.findIndex((it) => it.timestamp === currentData.timestamp);
  const prevData = currentIdx >= 0 ? zoneEntries[currentIdx + 1] : undefined;

  const entriesSorted = Object.entries(currentData.sources).sort((a, b) => b[1] - a[1]);
  const dominant = entriesSorted[0];
  const top2Share = entriesSorted.slice(0, 2).reduce((sum, [, v]) => sum + (v as number), 0);

  const exportCSV = () => {
    if (backendData) {
      // Export live data
      const headers = ["Source", "Current %", "Previous %", "Change %", "Risk Level", "Impact"];
      const rows = Object.entries(backendData.sources).map(([source, current]) => {
        const previous = backendData.previous[source as keyof typeof backendData.previous];
        const delta = current - previous;
        const getSourceLabel = (source: string) => {
          switch (source) {
            case 'stubble': return 'Stubble Burning';
            case 'traffic': return 'Vehicle Traffic';
            case 'industrial': return 'Industrial Emissions';
            case 'other': return 'Other Sources';
            default: return source;
          }
        };
        const getRiskLevel = (percentage: number) => {
          if (percentage >= 35) return 'High';
          if (percentage >= 25) return 'Elevated';
          if (percentage >= 15) return 'Moderate';
          return 'Low';
        };
        const getImpactDescription = (source: string, percentage: number) => {
          switch (source) {
            case 'stubble':
              return percentage >= 30 ? 'Severe respiratory impact' : 
                     percentage >= 20 ? 'Moderate health risk' : 'Low impact';
            case 'traffic':
              return percentage >= 35 ? 'High NO2 exposure' : 
                     percentage >= 25 ? 'Elevated traffic pollution' : 'Normal levels';
            case 'industrial':
              return percentage >= 25 ? 'Industrial emissions high' : 
                     percentage >= 15 ? 'Moderate industrial impact' : 'Low industrial activity';
            case 'other':
              return percentage >= 20 ? 'Multiple sources active' : 'Minimal other sources';
            default:
              return 'Standard impact';
          }
        };
        return [
          getSourceLabel(source),
          current,
          previous,
          delta.toFixed(1),
          getRiskLevel(current),
          getImpactDescription(source, current)
        ];
      });
      
      const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `live-pollution-sources-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Export historical data
      const headers = ["Date", "Zone", "Stubble Burning (%)", "Traffic (%)", "Industrial (%)", "Other (%)"];
      const rows = filteredData.map(item => [
        item.timestamp.split("T")[0],
        item.zone,
        item.sources.stubble,
        item.sources.traffic,
        item.sources.industrial,
        item.sources.other
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "historical-pollution-sources.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pollution Source Breakdown</h1>
            <p className="text-muted-foreground">Detailed analysis of pollution sources across Delhi-NCR</p>
          </div>
          <Button onClick={exportCSV} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            {backendData ? "Export Live Data" : "Export Historical Data"}
          </Button>
        </div>

        {/* Compact Filters Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            <span className="hidden sm:inline">Showing for</span>
            <span className="sm:ml-1 font-medium text-foreground">
              {selectedDate === "all" ? "All Dates" : selectedDate}
            </span>
            <span className="mx-1">·</span>
            <span className="font-medium text-foreground">
              {selectedZone === "all" ? "All Zones" : selectedZone}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(selectedDate !== "all" || selectedZone !== "all") && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => {
                  setSelectedDate("all");
                  setSelectedZone("all");
                }}
                title="Clear filters"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="default" size="sm" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1.5">Date</div>
                    <Select value={selectedDate} onValueChange={setSelectedDate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dates</SelectItem>
                        <SelectItem value="2025-09-23">September 23, 2025</SelectItem>
                        <SelectItem value="2025-09-22">September 22, 2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1.5">NCR Zone</div>
                    <Select value={selectedZone} onValueChange={(v) => {
                      setSelectedZone(v);
                      if (v !== "all") setZone(v as ZoneKey);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Zones</SelectItem>
                        <SelectItem value="Delhi Central">Delhi Central</SelectItem>
                        <SelectItem value="Noida">Noida</SelectItem>
                        <SelectItem value="Gurgaon">Gurgaon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">Filters apply immediately</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => {
                        setSelectedDate("all");
                        setSelectedZone("all");
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div aria-live="polite" className="sr-only">{ariaLiveMessage}</div>

        {/* Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <PollutionSourcesChart sources={useSourceShift(scenarioApplied ? adjustedSources : currentData.sources)} />
          
          {/* Live Source Impact Analysis */}
          <LiveSourceImpactAnalysis />
        </div>

        {/* Sankey Diagram */}
        <Card className="card-gradient shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Source Flow (Scenario)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              <SankeyDiagram
                className="w-full h-[280px]"
                sources={scenarioApplied ? adjustedSources : currentData.sources}
                destinationLabel={selectedZone === "all" ? currentData.zone : selectedZone}
              />
            </div>
          </CardContent>
        </Card>

        {/* Scenario & Factors */}
        <Card className="card-gradient shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Scenario Modeling & Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Wind Speed Factor: {windFactor[0]}%</label>
                <Slider value={windFactor} onValueChange={setWindFactor} step={5} max={40} />
                <p className="text-xs text-muted-foreground">Higher wind disperses traffic-related pollution mock-reduction.</p>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Reduce Stubble by: {stubbleScenario[0]}%</label>
                <Slider value={stubbleScenario} onValueChange={setStubbleScenario} step={5} max={50} />
                <p className="text-xs text-muted-foreground">Scenario: policy to curb stubble burning.</p>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={() => setScenarioApplied(true)} className="flex-1">Apply Scenario</Button>
                <Button variant="outline" onClick={() => { setWindFactor([0]); setStubbleScenario([0]); setScenarioApplied(false); }}>
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Data Table */}
        <Card className="card-gradient shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
              Live Source Data
              <div className="flex items-center gap-2">
                {backendData && (
                  <Badge variant="secondary" className="text-xs">
                    <Activity className="w-3 h-3 mr-1" />
                    Live Data
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={refetch} disabled={loading} className="h-6 w-6 p-0">
                  {loading ? <Activity className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {backendData ? (
              <div className="space-y-4">
                {/* Current Live Data */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Current Analysis (Live)</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>Current %</TableHead>
                        <TableHead>Previous %</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Impact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(backendData.sources).map(([source, current]) => {
                        const previous = backendData.previous[source as keyof typeof backendData.previous];
                        const delta = current - previous;
                        const isIncrease = delta > 0;
                        const isDecrease = delta < 0;
                        const isNoChange = delta === 0;
                        
                        const getSourceLabel = (source: string) => {
                          switch (source) {
                            case 'stubble': return 'Stubble Burning';
                            case 'traffic': return 'Vehicle Traffic';
                            case 'industrial': return 'Industrial Emissions';
                            case 'other': return 'Other Sources';
                            default: return source;
                          }
                        };

                        const getRiskLevel = (percentage: number) => {
                          if (percentage >= 35) return { level: 'High', color: 'text-red-600 bg-red-50' };
                          if (percentage >= 25) return { level: 'Elevated', color: 'text-orange-600 bg-orange-50' };
                          if (percentage >= 15) return { level: 'Moderate', color: 'text-yellow-600 bg-yellow-50' };
                          return { level: 'Low', color: 'text-green-600 bg-green-50' };
                        };

                        const getImpactDescription = (source: string, percentage: number) => {
                          switch (source) {
                            case 'stubble':
                              return percentage >= 30 ? 'Severe respiratory impact' : 
                                     percentage >= 20 ? 'Moderate health risk' : 'Low impact';
                            case 'traffic':
                              return percentage >= 35 ? 'High NO2 exposure' : 
                                     percentage >= 25 ? 'Elevated traffic pollution' : 'Normal levels';
                            case 'industrial':
                              return percentage >= 25 ? 'Industrial emissions high' : 
                                     percentage >= 15 ? 'Moderate industrial impact' : 'Low industrial activity';
                            case 'other':
                              return percentage >= 20 ? 'Multiple sources active' : 'Minimal other sources';
                            default:
                              return 'Standard impact';
                          }
                        };

                        const risk = getRiskLevel(current);
                        const impact = getImpactDescription(source, current);

                        return (
                          <TableRow key={source}>
                            <TableCell className="font-medium">{getSourceLabel(source)}</TableCell>
                            <TableCell className="font-bold">{current}%</TableCell>
                            <TableCell>{previous}%</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {isIncrease && <TrendingUp className="w-3 h-3 text-red-600" />}
                                {isDecrease && <TrendingDown className="w-3 h-3 text-green-600" />}
                                {isNoChange && <Minus className="w-3 h-3 text-muted-foreground" />}
                                <span className={`text-xs ${isIncrease ? 'text-red-600' : isDecrease ? 'text-green-600' : 'text-muted-foreground'}`}>
                                  {isNoChange ? 'No change' : `${isIncrease ? '+' : ''}${delta.toFixed(1)}%`}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-xs ${risk.color}`} variant="secondary">
                                {risk.level}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-32">
                              {impact}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Data Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center p-3 bg-secondary/40 rounded-lg">
                    <div className="text-xs text-muted-foreground">Zone</div>
                    <div className="font-semibold">{backendData.zone}</div>
                  </div>
                  <div className="text-center p-3 bg-secondary/40 rounded-lg">
                    <div className="text-xs text-muted-foreground">Last Updated</div>
                    <div className="font-semibold text-xs">
                      {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Unknown'}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-secondary/40 rounded-lg">
                    <div className="text-xs text-muted-foreground">Data Source</div>
                    <div className="font-semibold text-xs">CPCB + NASA FIRMS</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Fallback to historical data */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Historical Data (Fallback)</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Zone</TableHead>
                        <TableHead>Stubble Burning (%)</TableHead>
                        <TableHead>Traffic (%)</TableHead>
                        <TableHead>Industrial (%)</TableHead>
                        <TableHead>Other (%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.timestamp.split("T")[0]}</TableCell>
                          <TableCell>{item.zone}</TableCell>
                          <TableCell>{item.sources.stubble}%</TableCell>
                          <TableCell>{item.sources.traffic}%</TableCell>
                          <TableCell>{item.sources.industrial}%</TableCell>
                          <TableCell>{item.sources.other}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
                  <div className="text-sm text-yellow-800">Backend connection unavailable</div>
                  <div className="text-xs text-yellow-600">Showing historical data instead</div>
                </div>
              </div>
            )}
            
            {scenarioApplied && (
              <div className="mt-4 text-xs text-muted-foreground">
                Export will include scenario context (wind/stubble adjustments).
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SourceBreakdown;