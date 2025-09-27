import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ReportCard from "@/components/dashboard/ReportCard";
import { Report, ReportStatus, mockReports } from "@/data/reportsData";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type ViewMode = "list" | "map";

const PAGE_SIZE = 6;

const Reports = () => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ReportStatus | "All">("All");
  const [view, setView] = useState<ViewMode>("list");
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((r) => {
      const matchesQuery = !q ||
        r.locationName.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.user.toLowerCase().includes(q);
      const matchesStatus = status === "All" || r.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status, reports]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const pending = filtered.filter((r) => r.status === "Pending").length;
    const verified = filtered.filter((r) => r.status === "Verified").length;
    const resolved = filtered.filter((r) => r.status === "Resolved").length;
    return { total, pending, verified, resolved };
  }, [filtered]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  function handleStatusChange(id: string, next: ReportStatus) {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
  }

  async function handleExportCsv() {
    setExporting(true);
    try {
      const headers = [
        "id","user","imageUrl","description","lat","lng","locationName","timestamp","status",
      ];
      const rows = filtered.map((r) => [
        r.id,
        r.user,
        r.imageUrl,
        r.description.replace(/\n/g, " ").replace(/"/g, '""'),
        r.coordinates.lat.toString(),
        r.coordinates.lng.toString(),
        r.locationName,
        r.timestamp,
        r.status,
      ]);
      const csv = [headers.join(","), ...rows.map((row) => row.map((c) => `"${c}"`).join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reports-export-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Citizen Reports</h1>
          <p className="text-sm text-muted-foreground">Crowdsourced pollution incident reports</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1 flex items-center gap-2">
            <Input
              placeholder="Search by location, keyword, or user"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
            <Select value={status} onValueChange={(v) => { setStatus(v as ReportStatus | "All"); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Verified">Verified</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary">Total: {stats.total}</Badge>
              <Badge className="bg-yellow-100 text-yellow-800">Pending: {stats.pending}</Badge>
              <Badge className="bg-blue-100 text-blue-800">Verified: {stats.verified}</Badge>
              <Badge className="bg-green-100 text-green-800">Resolved: {stats.resolved}</Badge>
            </div>
            <Button variant="outline" onClick={handleExportCsv} disabled={exporting}>Export CSV</Button>
            <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="map">Map View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {view === "list" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.map((r) => (
                <ReportCard key={r.id} report={r} onStatusChange={handleStatusChange} />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Page {page} of {totalPages}</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
              </div>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="h-[560px] w-full">
                <MapContainer center={[28.6139, 77.209]} zoom={9} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {filtered.map((r) => (
                    <Marker key={r.id} position={[r.coordinates.lat, r.coordinates.lng]}>
                      <Popup>
                        <div className="text-sm max-w-xs">
                          <div className="font-medium mb-1">{r.locationName}</div>
                          <div className="mb-1">{r.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(r.timestamp).toLocaleString()} — {r.status}
                          </div>
                          <div className="mt-2 flex gap-2">
                            {r.status !== "Verified" && (
                              <Button size="sm" variant="secondary" onClick={() => handleStatusChange(r.id, "Verified")}>Verify</Button>
                            )}
                            {r.status !== "Resolved" && (
                              <Button size="sm" onClick={() => handleStatusChange(r.id, "Resolved")}>Resolve</Button>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-xs text-muted-foreground">
          Data is mock and actions are client-side only. Ready for backend integration.
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;