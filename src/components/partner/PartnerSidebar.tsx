import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Car, 
  LayoutDashboard, 
  FileText, 
  LogOut, 
  ChevronLeft,
  Shield,
  Menu,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/autokopers-logo.jpeg";
import { useIsMobile } from "@/hooks/use-mobile";

interface PartnerSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isAdmin: boolean;
}

const menuItems = [
  { title: "Dashboard", url: "/partner-dashboard", icon: LayoutDashboard },
  { title: "Mano skelbimai", url: "/partner-dashboard", icon: Car, section: "listings" },
  { title: "Sąskaitos", url: "/invoice", icon: FileText, adminOnly: true },
];

export function PartnerSidebar({ isCollapsed, onToggle, isAdmin }: PartnerSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Mobile: show hamburger button when collapsed, overlay menu when open
  if (isMobile) {
    return (
      <>
        {/* Mobile hamburger button */}
        {isCollapsed && (
          <Button
            variant="outline"
            size="icon"
            onClick={onToggle}
            className="fixed top-4 left-4 z-50 h-10 w-10 bg-background shadow-md"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Mobile overlay menu */}
        {!isCollapsed && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={onToggle}
            />
            
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-50 h-screen w-72 bg-sidebar border-r border-sidebar-border flex flex-col animate-in slide-in-from-left duration-200">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
                <Link to="/" className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl overflow-hidden flex-shrink-0 bg-primary/10 flex items-center justify-center shadow-sm">
                    <img 
                      src={logo} 
                      alt="AutoKOPERS" 
                      className="h-9 w-9 object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sidebar-foreground whitespace-nowrap text-lg leading-tight">
                      AutoKOPERS
                    </span>
                    <span className="text-xs text-muted-foreground">Partnerio zona</span>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {menuItems
                  .filter((item) => !item.adminOnly || isAdmin)
                  .map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <Link
                        key={item.title}
                        to={item.url}
                        onClick={onToggle}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                            : "text-sidebar-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    );
                  })}

                {isAdmin && (
                  <Link
                    to="/admin-dashboard"
                    onClick={onToggle}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      location.pathname === "/admin-dashboard"
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground"
                    )}
                  >
                    <Shield className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">Admin zona</span>
                  </Link>
                )}
              </nav>

              {/* Footer */}
              <div className="p-3 border-t border-sidebar-border">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  <span>Atsijungti</span>
                </Button>
              </div>
            </aside>
          </>
        )}
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="h-10 w-10 rounded-xl overflow-hidden flex-shrink-0 bg-primary/10 flex items-center justify-center shadow-sm">
            <img 
              src={logo} 
              alt="AutoKOPERS" 
              className="h-9 w-9 object-contain"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sidebar-foreground whitespace-nowrap text-lg leading-tight">
                AutoKOPERS
              </span>
              <span className="text-xs text-muted-foreground">Partnerio zona</span>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            "h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent",
            isCollapsed && "absolute -right-3 top-6 bg-sidebar border border-sidebar-border rounded-full shadow-md"
          )}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.title}
                to={item.url}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.title}</span>}
              </Link>
            );
          })}

        {isAdmin && (
          <Link
            to="/admin-dashboard"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              location.pathname === "/admin-dashboard"
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-sidebar-foreground"
            )}
          >
            <Shield className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Admin zona</span>}
          </Link>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Atsijungti</span>}
        </Button>
      </div>
    </aside>
  );
}
