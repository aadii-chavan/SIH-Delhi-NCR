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
  ChevronDown,
  Shield
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useMemo } from "react";
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
import { useAuth } from "@/hooks/use-auth";

type NavItem = { title: string; url: string; icon: any; badge?: string };

const baseItems: NavItem[] = [
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
  const { isPolicymaker } = useAuth();
  const navigationItems: NavItem[] = useMemo(() => {
    const items = [...baseItems];
    if (isPolicymaker) {
      items.splice(1, 0, { title: "Policy Dashboard", url: "/policy", icon: Shield });
    }
    return items;
  }, [isPolicymaker]);

  // Live AQI data for the sidebar card
  const { aqi, timestamp } = airQualityData.currentAqi;
  const zone = airQualityData.sourceBreakdown?.[0]?.zone ?? "Delhi-NCR";
  const trend = airQualityData.quickStats?.trend;
  const { status, color } = getAQIStatus(aqi);

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-[14px] transition-colors",
      "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      isActive
        ? "bg-white text-foreground shadow-[0_6px_16px_hsl(220_14%_60%_/_0.15)] border border-sidebar-border before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r before:bg-primary"
        : "",
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
            <h2 className="font-semibold text-sm text-foreground">Air Watch</h2>
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
                      <span className="min-w-0 truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                          {item.badge}
                        </span>
                      )}
                      <ChevronDown className="ml-1 hidden sm:block w-4 h-4 text-muted-foreground/60 group-data-[collapsible=icon]:hidden" />
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
