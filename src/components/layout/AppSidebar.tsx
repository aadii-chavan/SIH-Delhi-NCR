import { 
  Home, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Minus,
  BarChart3, 
  FileText, 
  Settings,
  Wind,
  MapPin,
  ChevronDown
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { airQualityData, getAQIStatus } from "@/data/airQualityData";

type NavItem = { title: string; url: string; icon: any; badge?: string };

const navigationItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Source Breakdown", url: "/sources", icon: PieChart },
  { title: "Forecast", url: "/forecast", icon: TrendingUp },
  { title: "Interventions", url: "/interventions", icon: BarChart3, badge: "NEW" },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Live AQI data for the sidebar card
  const { aqi, timestamp } = airQualityData.currentAqi;
  const zone = airQualityData.sourceBreakdown?.[0]?.zone ?? "Delhi-NCR";
  const trend = airQualityData.quickStats?.trend;
  const { status, color } = getAQIStatus(aqi);

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-[14px] transition-colors",
      "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      // Active state card with left accent bar like the reference UI
      isActive &&
        "bg-white text-foreground shadow-soft border border-sidebar-border before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r before:bg-primary",
    );

  return (
    <Sidebar
      className="border-r border-border"
      collapsible="icon"
    >
      {/* Header with Logo */}
      <div className="px-5 py-6 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Wind className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-sm text-foreground">TailAQI</h2>
            <p className="text-xs text-muted-foreground">Dashboard</p>
          </div>
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] tracking-wide font-medium text-muted-foreground uppercase">
            Menu
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="mt-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} end className={getNavClass} aria-label={item.title}>
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="min-w-0 truncate">{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                          {item.badge}
                        </span>
                      )}
                      <ChevronDown className="ml-1 hidden sm:block w-4 h-4 text-muted-foreground/60" />
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  );
}
