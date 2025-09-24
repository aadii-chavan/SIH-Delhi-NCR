import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Filter, Calendar } from "lucide-react";
import { airQualityData } from "@/data/airQualityData";

const Reports = () => {
  const [reportType, setReportType] = useState("sources");
  const [dateRange, setDateRange] = useState("last-week");
  const [location, setLocation] = useState("all");

  const getReportData = () => {
    switch (reportType) {
      case "sources":
        return airQualityData.sourceBreakdown.map(item => ({
          date: item.timestamp.split("T")[0],
          location: item.zone,
          stubble: item.sources.stubble,
          traffic: item.sources.traffic,
          industrial: item.sources.industrial,
          other: item.sources.other,
        }));
      case "forecasts":
        return airQualityData.forecasts.shortTerm.map(item => ({
          time: item.time,
          location: item.zone,
          aqi: item.aqi,
        }));
      case "interventions":
        return airQualityData.interventions.map(item => ({
          name: item.name,
          start: item.start,
          end: item.end,
          aqiBefore: item.aqiBefore,
          aqiAfter: item.aqiAfter,
          impact: item.impact,
        }));
      default:
        return [];
    }
  };

  const exportCSV = () => {
    const data = getReportData();
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(header => row[header as keyof typeof row]).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}-report-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    // Mock PDF export - in a real application, you would use a library like jsPDF
    const data = getReportData();
    console.log("Exporting PDF with data:", data);
    
    // Create a simple text-based PDF content
    const pdfContent = `
Delhi-NCR Air Quality Report
Report Type: ${reportType}
Date Range: ${dateRange}
Location: ${location}

Generated on: ${new Date().toLocaleString()}

Data Summary:
${JSON.stringify(data, null, 2)}
    `;

    const blob = new Blob([pdfContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}-report-${dateRange}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reportData = getReportData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Generate and download comprehensive air quality reports</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportCSV} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button onClick={exportPDF} className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Report Configuration */}
        <Card className="card-gradient shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sources">Pollution Sources</SelectItem>
                    <SelectItem value="forecasts">AQI Forecasts</SelectItem>
                    <SelectItem value="interventions">Interventions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-week">Last Week</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="last-quarter">Last Quarter</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Location</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All NCR</SelectItem>
                    <SelectItem value="delhi-central">Delhi Central</SelectItem>
                    <SelectItem value="noida">Noida</SelectItem>
                    <SelectItem value="gurgaon">Gurgaon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-gradient shadow-soft">
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <Calendar className="w-6 h-6 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Report Period</p>
                <p className="text-lg font-bold text-foreground capitalize">{dateRange.replace("-", " ")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient shadow-soft">
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <FileText className="w-6 h-6 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Report Type</p>
                <p className="text-lg font-bold text-foreground capitalize">{reportType}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient shadow-soft">
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <div className="w-6 h-6 mx-auto bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">{reportData.length}</span>
                </div>
                <p className="text-sm text-muted-foreground">Data Points</p>
                <p className="text-lg font-bold text-foreground">{reportData.length} Records</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient shadow-soft">
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <Download className="w-6 h-6 mx-auto text-green-600" />
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-bold text-green-600">Ready</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Preview */}
        <Card className="card-gradient shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Data Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    {reportData.length > 0 && Object.keys(reportData[0]).map((header) => (
                      <TableHead key={header} className="capitalize">{header.replace(/([A-Z])/g, ' $1').trim()}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.slice(0, 10).map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, cellIndex) => (
                        <TableCell key={cellIndex}>
                          {typeof value === 'string' && value.includes('T') ? 
                            new Date(value).toLocaleString() : 
                            String(value)
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {reportData.length > 10 && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  Showing first 10 of {reportData.length} records. Export to see all data.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;