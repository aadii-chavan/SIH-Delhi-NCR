import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PollutionSourcesChart } from "@/components/dashboard/PollutionSourcesChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Filter, X, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { airQualityData } from "@/data/airQualityData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

const SourceBreakdown = () => {
  const [selectedDate, setSelectedDate] = useState("2025-09-23");
  const [selectedZone, setSelectedZone] = useState("all");

  // Filter data based on selections
  const filteredData = airQualityData.sourceBreakdown.filter((item) => {
    const matchesDate = selectedDate === "all" || item.timestamp.includes(selectedDate);
    const matchesZone = selectedZone === "all" || item.zone === selectedZone;
    return matchesDate && matchesZone;
  });

  const currentData = filteredData.length > 0 ? filteredData[0] : airQualityData.sourceBreakdown[0];

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
    a.download = "pollution-sources.csv";
    a.click();
    URL.revokeObjectURL(url);
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
            Export Data
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
                    <Select value={selectedZone} onValueChange={setSelectedZone}>
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

        {/* Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <PollutionSourcesChart sources={currentData.sources} />
          
          {/* Source Details & Insights */}
          <Card className="card-gradient shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Source Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Summary header */}
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3 bg-secondary/40">
                  <div className="text-[11px] text-muted-foreground">Dominant Source</div>
                  <div className="text-sm font-medium text-foreground">
                    {dominant[0] === "stubble" ? "Stubble Burning" : dominant[0] === "traffic" ? "Vehicle Traffic" : dominant[0] === "industrial" ? "Industrial Emissions" : "Other Sources"}
                  </div>
                  <div className="text-lg font-bold">{dominant[1]}%</div>
                </div>
                <div className="rounded-lg border p-3 bg-secondary/40">
                  <div className="text-[11px] text-muted-foreground">Top-2 Share</div>
                  <div className="text-lg font-bold text-foreground">{top2Share}%</div>
                  <div className="text-[11px] text-muted-foreground">of total contribution</div>
                </div>
              </div>

              <div className="space-y-3">
                {Object.entries(currentData.sources).map(([source, percentage]) => {
                  const prevPct = prevData?.sources?.[source as keyof typeof currentData.sources] ?? undefined;
                  const delta = prevPct === undefined ? 0 : (percentage as number) - (prevPct as number);
                  const up = delta > 0;
                  const color = source === "stubble" ? "bg-orange-500" : source === "traffic" ? "bg-blue-500" : source === "industrial" ? "bg-red-500" : "bg-gray-500";
                  const label = source === "stubble" ? "Stubble Burning" : source === "traffic" ? "Vehicle Traffic" : source === "industrial" ? "Industrial Emissions" : "Other Sources";
                  const riskBadge = (percentage as number) >= 35 ? (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">High</span>
                  ) : (percentage as number) >= 25 ? (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200">Elevated</span>
                  ) : null;
                  return (
                    <div key={source} className="p-3 rounded-lg border bg-accent/30">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-foreground">
                          <span className="capitalize">{label}</span>
                          {riskBadge}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{percentage}%</span>
                          {prevPct !== undefined && (
                            <span className={`flex items-center text-xs ${up ? "text-red-600" : delta < 0 ? "text-green-600" : "text-muted-foreground"}`}>
                              {delta === 0 ? null : up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                              {delta === 0 ? "No change" : `${up ? "+" : ""}${delta}% vs prev`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 h-2 w-full rounded bg-muted overflow-hidden">
                        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
                      </div>
                      {prevPct !== undefined && (
                        <div className="mt-1 text-[11px] text-muted-foreground">Prev: {prevPct}%</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="card-gradient shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Raw Data</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SourceBreakdown;