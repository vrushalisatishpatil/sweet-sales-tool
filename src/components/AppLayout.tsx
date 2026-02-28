import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, PhoneCall, ClipboardList, StickyNote, UserCheck, BarChart3, Building2, ChevronLeft, Search, Bell, LogOut, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { UserContext } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import type { Session } from "@supabase/supabase-js";

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
  const [session, setSession] = useState<Session | null>(null);
  const [localSessionEmail, setLocalSessionEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "salesperson">("salesperson");
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginRole, setLoginRole] = useState<"admin" | "salesperson">("admin");
  const adminEmail = "care@waxitylubricant.com";

  useEffect(() => {
    const storedEmail = localStorage.getItem("salesperson_email");
    if (storedEmail) {
      setLocalSessionEmail(storedEmail);
      setUserRole("salesperson");
      setUserEmail(storedEmail);
      // Fetch salesperson name
      supabase
        .from("sales_team")
        .select("name")
        .eq("email", storedEmail)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.name) {
            setUserName(data.name);
          }
        });
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localSessionEmail) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
      if (data.session?.user?.email === adminEmail) {
        setUserRole("admin");
      } else if (data.session) {
        setUserRole("salesperson");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setAuthLoading(false);
      if (newSession?.user?.email === adminEmail) {
        setUserRole("admin");
        setUserEmail(newSession.user.email);
        setUserName("Admin");
      } else if (newSession) {
        setUserRole("salesperson");
        setUserEmail(newSession.user.email || null);
        setUserName(null);
      } else {
        setUserRole("salesperson");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [localSessionEmail, adminEmail]);

  const handleSignOut = async () => {
    if (localSessionEmail) {
      localStorage.removeItem("salesperson_email");
      setLocalSessionEmail(null);
      setUserRole("salesperson");
      setUserName(null);
      setUserEmail(null);
    } else {
      await supabase.auth.signOut();
      setUserName(null);
      setUserEmail(null);
    }
    setShowProfileMenu(false);
  };

  const handleLogin = async () => {
    setAuthError(null);
    const trimmedLogin = loginEmail.trim();
    const trimmedPassword = loginPassword.trim();

    if (!trimmedLogin || !trimmedPassword) {
      setAuthError("Please enter your login and password.");
      return;
    }

    if (loginRole === "salesperson") {
      const { data, error: lookupError } = await supabase
        .from("sales_team")
        .select("email, name")
        .eq("email", trimmedLogin)
        .eq("password", trimmedPassword)
        .maybeSingle();

      if (lookupError || !data?.email) {
        setAuthError("Invalid email or password.");
        return;
      }

      localStorage.setItem("salesperson_email", trimmedLogin);
      setLocalSessionEmail(trimmedLogin);
      setUserRole("salesperson");
      setUserEmail(trimmedLogin);
      setUserName(data.name || null);
      setLoginPassword("");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedLogin,
      password: trimmedPassword,
    });
    if (error) {
      setAuthError(error.message);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session && !localSessionEmail) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
        <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="hidden md:flex flex-col justify-between bg-red-600 p-8 text-white">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-lg font-bold text-red-600">
                  W
                </div>
                <h1 className="mt-6 text-3xl font-bold tracking-tight font-serif">Waxity Leads</h1>
                <p className="mt-2 text-sm text-red-100">Lead Management System</p>
              </div>
              <div className="text-sm text-red-100">
                Manage leads, tasks, and follow-ups in one place.
              </div>
            </div>

            <div className="p-8 md:p-10">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground font-serif">Sign in</h2>
                <p className="text-sm text-muted-foreground">Use your admin credentials</p>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-2">
                <Button
                  variant={loginRole === "admin" ? "default" : "outline"}
                  className={loginRole === "admin" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                  onClick={() => {
                    setLoginRole("admin");
                    setLoginEmail("");
                    setLoginPassword("");
                  }}
                >
                  Admin
                </Button>
                <Button
                  variant={loginRole === "salesperson" ? "default" : "outline"}
                  className={loginRole === "salesperson" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                  onClick={() => {
                    setLoginRole("salesperson");
                    setLoginEmail("");
                    setLoginPassword("");
                  }}
                >
                  Sales Person
                </Button>
              </div>

              {authError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {authError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground" htmlFor="email">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="mt-1"
                    placeholder="Your Email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground" htmlFor="password">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pr-10"
                      placeholder="Your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  onClick={handleLogin}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-10"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ userRole, userName, userEmail }}>
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
