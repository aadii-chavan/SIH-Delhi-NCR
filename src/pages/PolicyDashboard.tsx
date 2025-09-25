import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { airQualityData } from "@/data/airQualityData";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type WidgetKey = "aqi" | "sources" | "forecast" | "recommendation" | "engagement";

const defaultLayout: WidgetKey[] = ["aqi","sources","forecast","recommendation","engagement"];

export default function PolicyDashboard() {
  const [layout, setLayout] = useState<WidgetKey[]>(() => {
    const raw = localStorage.getItem("policy_dashboard_layout");
    return raw ? (JSON.parse(raw) as WidgetKey[]) : defaultLayout;
  });
  useEffect(() => {
    localStorage.setItem("policy_dashboard_layout", JSON.stringify(layout));
  }, [layout]);

  const swap = (i: number, j: number) => {
    setLayout(prev => {
      const next = [...prev];
      const t = next[i];
      next[i] = next[j];
      next[j] = t;
      return next;
    });
  };

  const current = airQualityData.currentAqi;
  const recommendation = airQualityData.recommendations[0];
  const [zone, setZone] = useState("Delhi Central");
  const [engagementPct, setEngagementPct] = useState(80);
  useEffect(() => {
    const id = setInterval(() => {
      setEngagementPct((p) => (p >= 95 ? 80 : p + 1));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Policy Dashboard</h1>
            <p className="text-muted-foreground">Policymaker-only overview with configurable widgets</p>
          </div>
          <Button variant="outline" onClick={() => setLayout(defaultLayout)}>Reset Layout</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {layout.map((w, idx) => (
            <div key={`${w}-${idx}`} className="relative group h-full">
              <div className="absolute -top-2 -right-2 flex opacity-0 group-hover:opacity-100 transition">
                {idx > 0 && (
                  <Button size="sm" variant="outline" onClick={() => swap(idx, idx-1)} aria-label="Move left">↑</Button>
                )}
                {idx < layout.length - 1 && (
                  <Button size="sm" variant="outline" onClick={() => swap(idx, idx+1)} aria-label="Move right">↓</Button>
                )}
              </div>
              {w === "aqi" && (
                <Card className="card-gradient shadow-soft h-full min-h-[200px]">
                  <CardHeader>
                    <CardTitle className="text-xl">AQI Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-extrabold text-foreground leading-tight">{current.aqi}</div>
                    <div className="text-base text-muted-foreground mt-1">{new Date(current.timestamp).toLocaleString()}</div>
                  </CardContent>
                </Card>
              )}
              {w === "sources" && (
                <Card className="card-gradient shadow-soft h-full min-h-[200px]">
                  <CardHeader>
                    <CardTitle className="text-lg">Sources (Latest)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(airQualityData.sourceBreakdown[0].sources).map(([k,v]) => (
                        <div key={k} className="flex justify-between"><span className="capitalize">{k}</span><span className="font-medium">{v}%</span></div>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">Latest zone: {airQualityData.sourceBreakdown[0].zone}</div>
                  </CardContent>
                </Card>
              )}
              {w === "forecast" && (
                <Card className="card-gradient shadow-soft h-full min-h-[200px]">
                  <CardHeader>
                    <CardTitle className="text-lg">Forecast Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">Next peak within 24h</div>
                    <div className="text-2xl font-bold">{Math.max(...airQualityData.forecasts.shortTerm.map(f=>f.aqi))}</div>
                  </CardContent>
                </Card>
              )}
              {w === "recommendation" && (
                <RecommendationCard recommendation={recommendation} className="h-full min-h-[200px]" />
              )}
              {w === "engagement" && (
                <Card className="card-gradient shadow-soft h-full min-h-[200px]">
                  <CardHeader>
                    <CardTitle className="text-lg">Citizen Engagement</CardTitle>
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
                    <div className="text-3xl font-bold">{engagementPct}%</div>
                    <div className="text-xs text-muted-foreground">Citizens viewed alerts (mock) — {zone}</div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}


