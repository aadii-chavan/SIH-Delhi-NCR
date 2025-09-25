import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, AlertCircle, Clock } from "lucide-react";
import { airQualityData, Recommendation } from "@/data/airQualityData";
import { useEffect, useMemo, useState } from "react";

interface RecommendationCardProps {
  recommendation: Recommendation;
  className?: string;
}

export function RecommendationCard({ recommendation, className }: RecommendationCardProps) {
  const storageKey = `rec_status_${recommendation.id}`;
  const [implemented, setImplemented] = useState<boolean>(() => localStorage.getItem(storageKey) === "implemented");
  useEffect(() => {
    localStorage.setItem(storageKey, implemented ? "implemented" : "pending");
  }, [implemented, storageKey]);
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "aqi-severe";
      case "medium":
        return "aqi-moderate";
      case "low":
        return "aqi-good";
      default:
        return "secondary";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-4 h-4" />;
      case "medium":
        return <Clock className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <Card className={`card-gradient shadow-soft hover:shadow-medium smooth-transition border-l-4 border-l-primary ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          Latest AI Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-foreground font-medium leading-relaxed mb-3">
              {recommendation.text}
            </p>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getPriorityIcon(recommendation.priority)}
              <span>Estimated Impact: {recommendation.estimatedImpact}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 items-end">
            <Badge className={getPriorityColor(recommendation.priority)}>
              {recommendation.priority.toUpperCase()} PRIORITY
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-border">
          <Button size="sm" className="flex-1" onClick={() => setImplemented(true)} disabled={implemented}>
            {implemented ? "Implemented" : "Mark as Implemented"}
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecommendationsList({ className }: { className?: string }) {
  const recommendations = airQualityData.recommendations;
  const [urgency, setUrgency] = useState<"all" | "high" | "medium" | "low">("all");
  const [index, setIndex] = useState(0);
  const [implementedMap, setImplementedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const rec of recommendations) {
      map[rec.id] = localStorage.getItem(`rec_status_${rec.id}`) === "implemented";
    }
    return map;
  });
  const filtered = useMemo(() => recommendations.filter(r => urgency === "all" ? true : r.priority === urgency), [recommendations, urgency]);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % Math.max(1, filtered.length)), 60000);
    return () => clearInterval(id);
  }, [filtered.length]);

  const markImplemented = (id: string) => {
    localStorage.setItem(`rec_status_${id}`, "implemented");
    setImplementedMap(prev => ({ ...prev, [id]: true }));
  };

  return (
    <Card className={`card-gradient shadow-soft ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          All Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-3 text-xs">
          <span>Filter:</span>
          {(["all","high","medium","low"] as const).map(v => (
            <Button key={v} size="sm" variant={urgency === v ? "default" : "outline"} onClick={() => setUrgency(v)}>
              {v}
            </Button>
          ))}
        </div>
        {filtered.length > 0 && (
          <div className="p-3 mb-3 rounded border text-sm bg-accent/40">
            <span className="font-medium">Live suggestion:</span> {filtered[index].text}
          </div>
        )}
        <div className="space-y-3">
          {filtered.map((rec) => (
            <div key={rec.id} className="p-3 bg-accent/50 rounded-lg border border-border hover:bg-accent smooth-transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">{rec.text}</p>
                  <p className="text-xs text-muted-foreground">Impact: {rec.estimatedImpact}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button size="sm" variant={implementedMap[rec.id] ? "outline" : "default"} onClick={() => markImplemented(rec.id)} disabled={implementedMap[rec.id]}>
                      {implementedMap[rec.id] ? "Implemented" : "Mark as Implemented"}
                    </Button>
                    {implementedMap[rec.id] && (
                      <Badge className="text-[10px]">Implemented</Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className="text-xs">
                    {rec.priority}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}