import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PollutionSourcesChartProps {
  sources: {
    stubble: number;
    traffic: number;
    industrial: number;
    other: number;
  };
  className?: string;
}

export function PollutionSourcesChart({ sources, className }: PollutionSourcesChartProps) {
  const chartData = {
    labels: ["Stubble Burning", "Vehicle Traffic", "Industrial", "Other Sources"],
    datasets: [
      {
        data: [sources.stubble, sources.traffic, sources.industrial, sources.other],
        backgroundColor: [
          "hsl(25, 95%, 53%)", // Orange for stubble burning
          "hsl(217, 91%, 60%)", // Blue for traffic
          "hsl(0, 84%, 60%)", // Red for industrial
          "hsl(220, 9%, 46%)", // Gray for other
        ],
        borderColor: [
          "hsl(25, 95%, 43%)",
          "hsl(217, 91%, 50%)",
          "hsl(0, 84%, 50%)",
          "hsl(220, 9%, 36%)",
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          "hsl(25, 95%, 63%)",
          "hsl(217, 91%, 70%)",
          "hsl(0, 84%, 70%)",
          "hsl(220, 9%, 56%)",
        ],
        hoverBorderWidth: 3,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          font: {
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "hsl(224, 71%, 4%)",
        titleColor: "hsl(0, 0%, 98%)",
        bodyColor: "hsl(0, 0%, 98%)",
        borderColor: "hsl(217, 91%, 60%)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || "";
            const value = context.parsed;
            return `${label}: ${value}%`;
          },
        },
      },
    },
    cutout: "60%",
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    },
  };

  return (
    <Card className={`card-gradient shadow-soft hover:shadow-medium smooth-transition ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          Pollution Sources Breakdown
          <span className="text-sm font-normal text-muted-foreground">(%)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-80">
          <Doughnut data={chartData} options={options} />
        </div>
        
        {/* Key Insights */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <span className="text-orange-800 font-medium">Primary Source</span>
            <span className="text-orange-600 font-bold">Stubble: {sources.stubble}%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-800 font-medium">Urban Impact</span>
            <span className="text-blue-600 font-bold">Traffic: {sources.traffic}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}