import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ChartOptions 
} from "chart.js";
import { BarChart3, Download, Settings, Lightbulb, TrendingDown } from "lucide-react";
import { airQualityData } from "@/data/airQualityData";
import { RecommendationsList } from "@/components/dashboard/RecommendationCard";
import { useEffect, useMemo, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const InterventionAnalytics = () => {
  const [stubbleReduction, setStubbleReduction] = useState([20]);
  const [trafficReduction, setTrafficReduction] = useState([15]);
  const [industrialReduction, setIndustrialReduction] = useState([10]);

  const interventions = airQualityData.interventions;
  const [selectedIntervention, setSelectedIntervention] = useState<string | "all">("all");
  const [durationSim, setDurationSim] = useState([0]);

  // Calculate what-if scenarios
  const currentAQI = 250;
  const estimatedImpact = stubbleReduction[0] * 0.4 + trafficReduction[0] * 0.3 + industrialReduction[0] * 0.2;
  const projectedAQI = Math.max(currentAQI - estimatedImpact, 50);

  // Prepare chart data
  const filteredInterventions = useMemo(() => (
    selectedIntervention === "all"
      ? interventions
      : interventions.filter(i => i.name === selectedIntervention)
  ), [interventions, selectedIntervention]);
  const [zone, setZone] = useState("Delhi Central");
  const [reports, setReports] = useState([
    { user: "citizen1", issue: "Smoke in Karol Bagh", zone: "Delhi Central" },
    { user: "citizen2", issue: "Traffic congestion smog", zone: "Gurgaon" },
    { user: "citizen3", issue: "Industrial odor near plant", zone: "Noida" },
  ]);
  const [viewCount, setViewCount] = useState(1200);
  useEffect(() => {
    const id = setInterval(() => setViewCount((v) => v + Math.floor(Math.random() * 5)), 4000);
    return () => clearInterval(id);
  }, []);

  const chartData = {
    labels: filteredInterventions.map(intervention => intervention.name),
    datasets: [
      {
        label: "AQI Before",
        data: filteredInterventions.map(intervention => intervention.aqiBefore),
        backgroundColor: "hsl(0, 84%, 60% / 0.7)",
        borderColor: "hsl(0, 84%, 60%)",
        borderWidth: 1,
      },
      {
        label: "AQI After (Simulated)",
        data: filteredInterventions.map(intervention => {
          // Required formula: newAQI = aqiAfter * (1 - sliderValue * 0.1)
          const factor = 1 - (durationSim[0] * 0.1);
          return Math.round(intervention.aqiAfter * Math.max(0, factor));
        }),
        backgroundColor: "hsl(142, 76%, 36% / 0.7)",
        borderColor: "hsl(142, 76%, 36%)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        backgroundColor: "hsl(224, 71%, 4%)",
        titleColor: "hsl(0, 0%, 98%)",
        bodyColor: "hsl(0, 0%, 98%)",
        borderColor: "hsl(217, 91%, 60%)",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          afterLabel: function(context) {
            const intervention = interventions[context.dataIndex];
            return `Impact: ${intervention.impact}% reduction`;
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
        grid: {
          color: "hsl(220, 13%, 91%)",
        },
        ticks: {
          color: "hsl(220, 9%, 46%)",
        },
      },
    },
  };

  const exportAnalytics = () => {
    const headers = ["Intervention", "Start Date", "End Date", "AQI Before", "AQI After", "Impact (%)", "Description", "Sim_ProjectAQI", "DurationSim"];
    const rows = filteredInterventions.map(item => [
      item.name,
      item.start,
      item.end,
      item.aqiBefore,
      Math.round(item.aqiAfter * Math.max(0, 1 - durationSim[0] * 0.1)),
      item.impact,
      item.description,
      projectedAQI.toFixed(0),
      durationSim[0]
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "intervention-analytics.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Intervention Analytics</h1>
            <p className="text-muted-foreground">Analyze past intervention effectiveness and simulate future scenarios</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedIntervention} onValueChange={(v) => setSelectedIntervention(v as any)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter intervention" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All interventions</SelectItem>
                {interventions.map(i => (
                  <SelectItem key={i.name} value={i.name}>{i.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={exportAnalytics} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Analytics
            </Button>
          </div>
        </div>

        {/* Intervention Effectiveness Chart */}
        <Card className="card-gradient shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Intervention Effectiveness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* What-If Scenario Simulator */}
        <Card className="card-gradient shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Settings className="w-5 h-5" />
              What-If Scenario Simulator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sliders */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Extend Ban by Days: {durationSim[0]}
                  </label>
                  <Slider
                    value={durationSim}
                    onValueChange={setDurationSim}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Formula: newAQI = aqiAfter * (1 - days * 0.1)
                  </p>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Reduce Stubble Burning: {stubbleReduction[0]}%
                  </label>
                  <Slider
                    value={stubbleReduction}
                    onValueChange={setStubbleReduction}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Impact on AQI: -{(stubbleReduction[0] * 0.4).toFixed(1)} points
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Reduce Vehicle Traffic: {trafficReduction[0]}%
                  </label>
                  <Slider
                    value={trafficReduction}
                    onValueChange={setTrafficReduction}
                    max={40}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Impact on AQI: -{(trafficReduction[0] * 0.3).toFixed(1)} points
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Reduce Industrial Emissions: {industrialReduction[0]}%
                  </label>
                  <Slider
                    value={industrialReduction}
                    onValueChange={setIndustrialReduction}
                    max={30}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Impact on AQI: -{(industrialReduction[0] * 0.2).toFixed(1)} points
                  </p>
                </div>
              </div>

              {/* Projected Results */}
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-4">Projected Impact</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current AQI:</span>
                      <span className="text-lg font-bold text-red-600">{currentAQI}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estimated Reduction:</span>
                      <span className="text-lg font-bold text-green-600">-{estimatedImpact.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Projected AQI:</span>
                      <span className="text-xl font-bold text-primary">{projectedAQI.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Improvement Potential</span>
                  </div>
                  <p className="text-xs text-green-700">
                    Combined interventions could reduce AQI by {((estimatedImpact / currentAQI) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement + Interventions Table and Recommendations */}
        <div className="grid grid-cols-1 gap-6">
          {/* Citizen Engagement Reports */}
          <Card className="card-gradient shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Community Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-muted-foreground">Zone</div>
                <Select value={zone} onValueChange={setZone}>
                  <SelectTrigger className="w-44 h-8">
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Delhi Central">Delhi Central</SelectItem>
                    <SelectItem value="Noida">Noida</SelectItem>
                    <SelectItem value="Gurgaon">Gurgaon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-3 text-sm">Alert views: <span className="font-semibold">{viewCount.toLocaleString()}</span></div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Zone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.filter(r => r.zone === zone).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.user}</TableCell>
                      <TableCell>{r.issue}</TableCell>
                      <TableCell>{r.zone}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Historical Interventions */}
          <Card className="card-gradient shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Historical Interventions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Intervention</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interventions.map((intervention, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{intervention.name}</p>
                          <p className="text-xs text-muted-foreground">{intervention.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(intervention.start).toLocaleDateString()} - {new Date(intervention.end).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            intervention.impact < -15 ? 'bg-green-100 text-green-800' :
                            intervention.impact < -10 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {intervention.impact}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* AI Recommendations (full width) */}
          <RecommendationsList className="w-full" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterventionAnalytics;