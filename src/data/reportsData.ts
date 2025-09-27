export type ReportStatus = "Pending" | "Verified" | "Resolved";

export type Report = {
  id: string;
  user: string;
  imageUrl: string;
  description: string;
  coordinates: { lat: number; lng: number };
  locationName: string;
  timestamp: string; // ISO
  status: ReportStatus;
};

export const mockReports: Report[] = [
  {
    id: "rpt-001",
    user: "Amit Sharma",
    imageUrl: "/placeholder.svg",
    description:
      "Thick smoke observed near the industrial area, strong smell of chemicals.",
    coordinates: { lat: 28.6139, lng: 77.209 },
    locationName: "Connaught Place, New Delhi",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "Pending",
  },
  {
    id: "rpt-002",
    user: "Priya Verma",
    imageUrl: "/placeholder.svg",
    description:
      "Garbage burning reported near residential park. Persistent smoke for 20 minutes.",
    coordinates: { lat: 28.7041, lng: 77.1025 },
    locationName: "Rohini, Delhi",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: "Verified",
  },
  {
    id: "rpt-003",
    user: "Rahul Gupta",
    imageUrl: "/placeholder.svg",
    description: "Dust storm from construction site without proper covers.",
    coordinates: { lat: 28.4595, lng: 77.0266 },
    locationName: "Gurugram, Haryana",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    status: "Pending",
  },
  {
    id: "rpt-004",
    user: "Simran Kaur",
    imageUrl: "/placeholder.svg",
    description: "Open burning near fields, visible flames and black smoke.",
    coordinates: { lat: 28.4089, lng: 77.3178 },
    locationName: "Faridabad, Haryana",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: "Resolved",
  },
  {
    id: "rpt-005",
    user: "Neha Singh",
    imageUrl: "/placeholder.svg",
    description:
      "Heavy vehicle idling causing fumes at traffic signal for long duration.",
    coordinates: { lat: 28.5355, lng: 77.391 },
    locationName: "Noida, Uttar Pradesh",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "Verified",
  },
  {
    id: "rpt-006",
    user: "Arjun Mehta",
    imageUrl: "/placeholder.svg",
    description:
      "Illegal brick kiln operating late night with visible emissions.",
    coordinates: { lat: 28.9845, lng: 77.7064 },
    locationName: "Meerut, Uttar Pradesh",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    status: "Pending",
  },
];


