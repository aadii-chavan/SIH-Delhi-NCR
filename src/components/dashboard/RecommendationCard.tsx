import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, AlertCircle, Clock } from "lucide-react";
import { airQualityData, Recommendation } from "@/data/airQualityData";

interface RecommendationCardProps {
  recommendation: Recommendation;
  className?: string;
}

export function RecommendationCard({ recommendation, className }: RecommendationCardProps) {
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
          <Button size="sm" className="flex-1">
            Implement Now
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

  return (
    <Card className={`card-gradient shadow-soft ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          All Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div key={rec.id} className="p-3 bg-accent/50 rounded-lg border border-border hover:bg-accent smooth-transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">{rec.text}</p>
                  <p className="text-xs text-muted-foreground">Impact: {rec.estimatedImpact}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {rec.priority}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}