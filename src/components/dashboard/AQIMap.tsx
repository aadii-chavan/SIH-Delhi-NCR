import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAQIStatus, AQILocation } from "@/data/airQualityData";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "@/hooks/use-language";

interface AQIMapProps {
  locations: AQILocation[];
  center?: [number, number];
  className?: string;
}

export function AQIMap({ locations, className, center }: AQIMapProps) {
  const { t } = useLanguage();
  // Default center of Delhi-NCR
  const defaultCenter: [number, number] = [28.6139, 77.2090];

  const getMarkerColor = (aqi: number) => {
    const { color } = getAQIStatus(aqi);
    if (color.includes("good")) return "#10b981";
    if (color.includes("moderate")) return "#f59e0b";
    if (color.includes("unhealthy")) return "#f97316";
    return "#ef4444";
  };

  const getMarkerSize = (aqi: number) => {
    if (aqi > 300) return 25;
    if (aqi > 200) return 20;
    if (aqi > 100) return 15;
    return 12;
  };

  return (
    <Card className={`card-gradient shadow-soft hover:shadow-medium smooth-transition ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          {t("hyperlocal_map")}
          <span className="text-sm font-normal text-muted-foreground">{t("region_delhi_ncr")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-96 rounded-lg overflow-hidden border border-border">
          <MapContainer
            center={center ?? defaultCenter}
            zoom={10}
            style={{ height: "100%", width: "100%" }}
            className="rounded-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {locations.map((location, index) => {
              const { status } = getAQIStatus(location.aqi);
              return (
                <CircleMarker
                  key={`marker-${index}-${location.lat}-${location.lon}`}
                  center={[location.lat, location.lon]}
                  radius={getMarkerSize(location.aqi)}
                  pathOptions={{
                    fillColor: getMarkerColor(location.aqi),
                    color: getMarkerColor(location.aqi),
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0.6,
                  }}
                >
                  <Popup>
                    <div className="p-2 space-y-2">
                      <h3 className="font-semibold text-sm">
                        {location.location}
                      </h3>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">{t("aqi")}:</span>
                          <span className="text-sm font-bold">{location.aqi}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">{t("status")}:</span>
                          <span className="text-xs font-medium" style={{ color: getMarkerColor(location.aqi) }}>
                            {status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* Map Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#10b981" }}></div>
            <span className="text-muted-foreground">{t("good")} (0-50)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f59e0b" }}></div>
            <span className="text-muted-foreground">{t("moderate")} (51-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f97316" }}></div>
            <span className="text-muted-foreground">{t("unhealthy")} (101-200)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ef4444" }}></div>
            <span className="text-muted-foreground">{t("severe")} (201+)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}