import { useState } from "react";
import { Report, ReportStatus } from "@/data/reportsData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  report: Report;
  onStatusChange: (id: string, status: ReportStatus) => void;
};

function statusColor(status: ReportStatus) {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "Verified":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "Resolved":
      return "bg-green-100 text-green-800 hover:bg-green-100";
  }
}

export function ReportCard({ report, onStatusChange }: Props) {
  const [expanded, setExpanded] = useState(false);

  const truncated = report.description.length > 140 && !expanded
    ? report.description.slice(0, 140) + "…"
    : report.description;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">{report.user}</CardTitle>
          <Badge className={statusColor(report.status)}>{report.status}</Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          <span>{new Date(report.timestamp).toLocaleString()}</span>
          <span className="mx-2">•</span>
          <span>{report.locationName}</span>
          <span className="mx-2">•</span>
          <span>
            ({report.coordinates.lat.toFixed(4)}, {report.coordinates.lng.toFixed(4)})
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <img
          src={report.imageUrl}
          alt={report.description}
          className="h-40 w-full rounded-md object-cover"
        />
        <p className="text-sm leading-relaxed">
          {truncated}
          {report.description.length > 140 && (
            <Button variant="link" className="px-1" onClick={() => setExpanded((v) => !v)}>
              {expanded ? "Show less" : "Read more"}
            </Button>
          )}
        </p>
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        {report.status !== "Verified" && (
          <Button size="sm" variant="secondary" onClick={() => onStatusChange(report.id, "Verified")}>Verify</Button>
        )}
        {report.status !== "Resolved" && (
          <Button size="sm" variant="default" onClick={() => onStatusChange(report.id, "Resolved")}>Mark Resolved</Button>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">View on Map</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Location - {report.locationName}</DialogTitle>
            </DialogHeader>
            <div className="h-[360px] w-full">
              <MapContainer center={[report.coordinates.lat, report.coordinates.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[report.coordinates.lat, report.coordinates.lng]}>
                  <Popup>
                    <div className="text-sm">
                      <div className="font-medium mb-1">{report.locationName}</div>
                      <div>{report.description}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {new Date(report.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

export default ReportCard;


