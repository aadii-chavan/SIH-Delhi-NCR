import React, { useMemo } from "react";

type Sources = { stubble: number; traffic: number; industrial: number; other: number };

export function SankeyDiagram({
  sources,
  destinationLabel,
  className,
}: {
  sources: Sources;
  destinationLabel: string;
  className?: string;
}) {
  const items = useMemo(
    () => [
      { key: "stubble", label: "Stubble", value: sources.stubble, color: "#f97316" },
      { key: "traffic", label: "Traffic", value: sources.traffic, color: "#3b82f6" },
      { key: "industrial", label: "Industrial", value: sources.industrial, color: "#ef4444" },
      { key: "other", label: "Other", value: sources.other, color: "#6b7280" },
    ],
    [sources]
  );

  const total = Math.max(1, items.reduce((s, it) => s + it.value, 0));
  const width = 620;
  const height = 280;
  const leftX = 110;
  const rightX = width - 140;
  const laneGap = 10;
  const minLane = 6;

  // Compute vertical positions proportionally
  let currentY = 20;
  const lanes = items.map((it) => {
    const laneH = Math.max(minLane, (it.value / total) * (height - 40 - laneGap * (items.length - 1)));
    const lane = { key: it.key, y: currentY, h: laneH, color: it.color, label: it.label, value: it.value };
    currentY += laneH + laneGap;
    return lane;
  });

  const destY = 20;
  const destH = height - 40;

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" role="img" aria-label="Sankey diagram">
        {/* Destination node */}
        <rect x={rightX} y={destY} width={16} height={destH} rx={8} fill="#111827" opacity={0.06} />
        <text x={rightX + 24} y={destY + 14} fontSize="12" fill="#374151">{destinationLabel}</text>

        {lanes.map((lane) => {
          const strokeW = Math.max(2, (lane.h / destH) * 26);
          const yMid = lane.y + lane.h / 2;
          const path = `M ${leftX} ${yMid} C ${leftX + 120} ${yMid}, ${rightX - 120} ${destY + destH / 2}, ${rightX} ${destY + destH / 2}`;
          return (
            <g key={lane.key}>
              {/* Source node */}
              <rect x={leftX - 16} y={lane.y} width={16} height={lane.h} rx={8} fill={lane.color} opacity={0.9} />
              <text x={leftX - 20} y={lane.y - 4} textAnchor="end" fontSize="11" fill="#374151">
                {lane.label} ({lane.value}%)
              </text>
              {/* Link */}
              <path d={path} stroke={lane.color} strokeWidth={strokeW} fill="none" opacity={0.35} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default SankeyDiagram;


