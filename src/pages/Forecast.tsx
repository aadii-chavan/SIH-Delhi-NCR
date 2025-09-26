import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Line } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ChartOptions 
} from "chart.js";
import { TrendingUp, Calendar, Download, Clock, Gauge } from "lucide-react";
import { airQualityData, getAQIStatus } from "@/data/airQualityData";
// Removed baseline AQI card
import { useAqiSimulation } from "@/hooks/use-aqi-simulation";
import { useAqiHistory } from "@/hooks/use-aqi-history";
import { AQITrendChart } from "@/components/dashboard/AQITrendChart";
import { useLanguage } from "@/hooks/use-language";
import { useForecast } from "@/hooks/use-forecast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Forecast = () => {
  const [activeTab, setActiveTab] = useState("short-term");
  const { aqi, zone } = useAqiSimulation("Delhi");
  const { timeRange, setTimeRange, points } = useAqiHistory(zone, aqi);
  const { t } = useLanguage();
  const { forecastData, loading: forecastLoading, error: forecastError, lastUpdated } = useForecast("delhi", 5 * 60 * 1000); // refresh every 5 min
  const ariaLiveMessage = useMemo(() => `${t("baseline")}: ${t("aqi")} ${aqi}`, [aqi, t]);

  // Use live forecast data for short-term, fallback to hardcoded if empty
  const shortTermData = forecastData.length > 0 ? forecastData.map((item) => ({
    time: item.time,
    aqi: item.aqi,
    zone: "Delhi Central"
  })) : airQualityData.forecasts.shortTerm;
  const seasonalData = airQualityData.forecasts.seasonal;
  const [windAdj, setWindAdj] = useState([0]);
  const [tempInvAdj, setTempInvAdj] = useState([0]);

  // 24hr Average
  const avg24hr = shortTermData.length >= 24
    ? Math.round(shortTermData.slice(0, 24).reduce((sum, item) => sum + item.aqi, 0) / 24)
    : Math.round(shortTermData.reduce((sum, item) => sum + item.aqi, 0) / (shortTermData.length || 1));

  // Peak AQI and when it is expected
  let peakAqi = 0;
  let peakTime = '';
  if (shortTermData.length > 0) {
    const peak = shortTermData.reduce((max, item) => item.aqi > max.aqi ? item : max, shortTermData[0]);
    peakAqi = peak.aqi;
    peakTime = new Date(peak.time).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  // Improvement Expected: first time AQI drops by at least 10% after the peak
  let improvementTime = '';
  let improvementAqi = null;
  if (shortTermData.length > 0 && peakAqi > 0) {
    const peakIdx = shortTermData.findIndex(item => item.aqi === peakAqi);
    for (let i = peakIdx + 1; i < shortTermData.length; i++) {
      if (shortTermData[i].aqi <= peakAqi * 0.9) {
        improvementTime = new Date(shortTermData[i].time).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
        improvementAqi = shortTermData[i].aqi;
        break;
      }
    }
  }

  // Prepare chart data
  const chartData = {
    labels: shortTermData.map(item => {
      const date = new Date(item.time);
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric",
        hour: "2-digit"
      });
    }),
    datasets: [
      {
        label: "AQI Forecast (Sensitivity)",
        data: shortTermData.map(item => {
          const base = item.aqi;
          const windFactor = 1 + windAdj[0] / 100;
          const tempFactor = 1 + tempInvAdj[0] / 100;
          return Math.round(base * windFactor * tempFactor);
        }),
        borderColor: "hsl(217, 91%, 60%)",
        backgroundColor: "hsl(217, 91%, 60% / 0.1)",
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: "hsl(217, 91%, 60%)",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "hsl(224, 71%, 4%)",
        titleColor: "hsl(0, 0%, 98%)",
        bodyColor: "hsl(0, 0%, 98%)",
        borderColor: "hsl(217, 91%, 60%)",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const aqi = context.parsed.y;
            const { status } = getAQIStatus(aqi);
            return `AQI: ${aqi} (${status})`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "hsl(220, 13%, 91%)",
        },
        ticks: {
          color: "hsl(220, 9%, 46%)",
        },
      },
      y: {
        beginAtZero: true,
        max: 400,
        grid: {
          color: "hsl(220, 13%, 91%)",
        },
        ticks: {
          color: "hsl(220, 9%, 46%)",
        },
      },
    },
  };

  const exportForecast = () => {
    const headers = ["Time", "AQI", "Status", "Zone"];
    const rows = shortTermData.map(item => {
      const { status } = getAQIStatus(item.aqi);
      return [
        item.time,
        item.aqi,
        status,
        item.zone
      ];
    });
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aqi-forecast.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("forecast_title")}</h1>
            <p className="text-muted-foreground">Short-term and seasonal air quality predictions for Delhi-NCR</p>
          </div>
          <Button onClick={exportForecast} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Forecasts
          </Button>
        </div>

        <div aria-live="polite" className="sr-only">{ariaLiveMessage}</div>

        {/* Baseline section removed */}

        {/* Forecast Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto">
            <TabsTrigger value="short-term" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Short-term (72hr)
            </TabsTrigger>
            <TabsTrigger value="seasonal" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Seasonal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="short-term" className="space-y-6">
            {/* Forecast Chart */}
            <Card className="card-gradient shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  72-Hour AQI Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>

            {/* Forecast Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="card-gradient shadow-soft">
                <CardContent className="p-4 text-center">
                  <div className="space-y-2">
                    <Clock className="mx-auto w-7 h-7 text-blue-500 mb-1" />
                    <p className="text-sm text-muted-foreground">24hr Average</p>
                    <p className="text-2xl font-bold text-foreground">{avg24hr}</p>
                    <p className="text-xs text-muted-foreground">{getAQIStatus(avg24hr).status}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-gradient shadow-soft">
                <CardContent className="p-4 text-center">
                  <div className="space-y-2">
                    <Gauge className="mx-auto w-7 h-7 text-red-500 mb-1" />
                    <p className="text-sm text-muted-foreground">Peak AQI</p>
                    <p className="text-2xl font-bold text-red-600">{peakAqi}</p>
                    <p className="text-xs text-muted-foreground">Expected {peakTime}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-gradient shadow-soft">
                <CardContent className="p-4 text-center">
                  <div className="space-y-2">
                    <TrendingUp className="mx-auto w-7 h-7 text-green-600 mb-1" />
                    <p className="text-sm text-muted-foreground">Improvement Expected</p>
                    {improvementTime ? (
                      <>
                        <span className="text-2xl font-bold text-green-600">{improvementTime}</span>
                        <p className="text-xs text-muted-foreground">AQI drops to {improvementAqi}</p>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">No improvement expected</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Forecast Table */}
            <Card className="card-gradient shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Detailed Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>AQI</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Zone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shortTermData.map((item, index) => {
                      const { status, color } = getAQIStatus(item.aqi);
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(item.time).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </TableCell>
                          <TableCell className="font-bold">{item.aqi}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                              {status}
                            </span>
                          </TableCell>
                          <TableCell>{item.zone}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seasonal" className="space-y-6">
            <Card className="card-gradient shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Winter 2025 Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-foreground mb-1">Wind speed impact: {windAdj[0]}%</div>
                      <input type="range" min={-20} max={20} step={5} value={windAdj[0]} onChange={(e) => setWindAdj([parseInt(e.target.value)])} className="w-full" />
                      <div className="text-xs text-muted-foreground">Adjust wind influence on AQI</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground mb-1">Temperature inversion impact: {tempInvAdj[0]}%</div>
                      <input type="range" min={-20} max={20} step={5} value={tempInvAdj[0]} onChange={(e) => setTempInvAdj([parseInt(e.target.value)])} className="w-full" />
                      <div className="text-xs text-muted-foreground">Adjust inversion influence on AQI</div>
                    </div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                    <h3 className="text-3xl font-bold text-red-600 mb-2">
                      {Math.round(seasonalData.winter2025.avgAqi * (1 + windAdj[0]/100) * (1 + tempInvAdj[0]/100))}
                    </h3>
                    <p className="text-red-800 font-medium">Average Winter AQI</p>
                    <p className="text-sm text-red-600 mt-2">Hazardous air quality expected</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {seasonalData.winter2025.months?.map((month, index) => (
                      <Card key={index} className="bg-gradient-to-br from-background to-accent/10">
                        <CardContent className="p-4 text-center">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">{month.month}</p>
                            <p className="text-2xl font-bold text-foreground">{Math.round(month.avgAqi * (1 + windAdj[0]/100) * (1 + tempInvAdj[0]/100))}</p>
                            <p className="text-xs text-muted-foreground">
                              {getAQIStatus(month.avgAqi).status}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-12 gap-1">
                    {Array.from({ length: 36 }).map((_, idx) => {
                      const base = 200 + (idx % 12) * 5;
                      const val = Math.round(base * (1 + windAdj[0]/100) * (1 + tempInvAdj[0]/100));
                      const color = val > 300 ? "bg-red-500" : val > 250 ? "bg-orange-500" : val > 200 ? "bg-yellow-500" : "bg-green-500";
                      return <div key={idx} className={`h-6 ${color}`} title={`AQI ${val}`}></div>;
                    })}
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Seasonal Factors</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Increased stubble burning in October-November</li>
                      <li>• Reduced wind speeds in winter months</li>
                      <li>• Temperature inversion effects</li>
                      <li>• Increased heating and energy consumption</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Historical context trend moved to bottom */}
        <AQITrendChart
          points={points}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          title="Recent History"
        />
      </div>
    </DashboardLayout>
  );
};

export default Forecast;