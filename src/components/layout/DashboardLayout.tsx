import { ReactNode, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="h-16 sticky top-0 z-40 border-b border-border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="h-full px-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground" />
                {/* Command/Search */}
                <div className="relative hidden md:block flex-1 max-w-xl">
                  <Input placeholder="Search or type a command" className="pl-9 pr-14 h-9 rounded-lg" />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘K</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Date Display */}
                <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground mr-2">
                  <Calendar className="w-4 h-4" />
                  <span>{today}</span>
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 inline-flex items-center justify-center rounded-full bg-red-500 text-[10px] text-white">2</span>
                </Button>

                {/* Avatar */}
                <Avatar className="size-8">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-6 space-y-6 bg-background">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-border bg-card/30 px-4 py-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>Delhi-NCR Air Quality Dashboard</div>
              <div className="hidden sm:block">Updated {today}</div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
