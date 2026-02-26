import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, PhoneCall, ClipboardList, StickyNote, UserCheck, BarChart3, Building2, ChevronLeft, Search, Bell, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { UserContext } from "@/context/UserContext";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/leads", label: "Leads", icon: Users },
  { path: "/follow-ups", label: "Follow-ups", icon: PhoneCall },
  { path: "/assign-tasks", label: "Assign Tasks", icon: ClipboardList },
  { path: "/add-notes", label: "To Do's", icon: StickyNote },
  { path: "/sales-team", label: "Sales Team", icon: UserCheck, adminOnly: true },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/clients", label: "Clients", icon: Building2 },
];

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [userRole, setUserRole] = useState<"admin" | "salesperson">("salesperson");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSignOut = () => {
    setIsSignedIn(false);
    setShowProfileMenu(false);
  };

  const handleLogin = (role: "admin" | "salesperson") => {
    setUserRole(role);
    setIsSignedIn(true);
  };

  if (!isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-8 shadow-lg">
          <div className="text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground mx-auto">
              W
            </div>
            <h1 className="text-2xl font-bold text-foreground">WAXITY LEADS</h1>
            <p className="text-sm text-muted-foreground">Lead Management System</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => handleLogin("admin")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10"
            >
              Sign in as Admin
            </Button>
            <Button
              onClick={() => handleLogin("salesperson")}
              variant="outline"
              className="w-full font-semibold h-10"
            >
              Sign in as Sales Person
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ userRole }}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className={`${collapsed ? "w-16" : "w-52"} flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200`}>
          {/* Logo */}
          <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              W
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <div className="text-sm font-bold text-foreground">WAXITY</div>
                <div className="text-[10px] font-semibold text-primary">LEADS</div>
                <div className={`text-[8px] font-semibold mt-0.5 ${userRole === "admin" ? "text-blue-600" : "text-green-600"}`}>
                  {userRole === "admin" ? "ADMIN" : "SALES"}
                </div>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 p-2">
            {navItems
              .filter((item) => (!item.adminOnly || userRole === "admin"))
              .map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
          </nav>

          {/* Collapse button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2 border-t border-sidebar-border p-3 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </aside>

        {/* Main */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
            <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search leads, contacts, companies..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-64 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="relative rounded-lg p-2 hover:bg-accent">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                  title="Profile menu"
                >
                  WL
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 top-10 w-40 rounded-lg border border-border bg-card shadow-lg z-50">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </UserContext.Provider>
  );
};

export default AppLayout;
