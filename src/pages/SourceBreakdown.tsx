import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PollutionSourcesChart } from "@/components/dashboard/PollutionSourcesChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Filter, X } from "lucide-react";
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
          
          {/* Source Details */}
          <Card className="card-gradient shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Source Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(currentData.sources).map(([source, percentage]) => (
                  <div key={source} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium text-foreground capitalize">
                        {source === "stubble" ? "Stubble Burning" : 
                         source === "traffic" ? "Vehicle Traffic" :
                         source === "industrial" ? "Industrial Emissions" : "Other Sources"}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {source === "stubble" ? "Agricultural waste burning in neighboring states" :
                         source === "traffic" ? "Vehicle emissions from roads and highways" :
                         source === "industrial" ? "Factories and industrial activities" : "Construction, dust, and other sources"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">{percentage}%</div>
                    </div>
                  </div>
                ))}
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