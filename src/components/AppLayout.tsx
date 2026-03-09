import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, PhoneCall, ClipboardList, StickyNote, UserCheck, BarChart3, Building2, ChevronLeft, Search, Bell, LogOut, Eye, EyeOff, CircleAlert, ClipboardCheck } from "lucide-react";
import { useEffect, useState, useRef } from "react";
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

interface NotificationItem {
  id: string;
  title: string;
  type: "follow-up" | "task";
  isOverdue: boolean;
  path: string;
  date: string;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const searchableRoutes = ["/leads", "/follow-ups", "/assign-tasks", "/add-notes", "/sales-team", "/clients"];
  const [session, setSession] = useState<Session | null>(null);
  const [localSessionEmail, setLocalSessionEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "salesperson">("salesperson");
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [seenNotificationIds, setSeenNotificationIds] = useState<string[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginRole, setLoginRole] = useState<"admin" | "salesperson">("admin");
  const adminEmail = "care@waxitylubricant.com";
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setGlobalSearch(params.get("q") || "");
  }, [location.search]);

  useEffect(() => {
    if (userRole !== "admin" && location.pathname === "/sales-team") {
      navigate("/leads", { replace: true });
    }
  }, [userRole, location.pathname, navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Close notifications if clicking outside
      if (showNotifications && notificationsRef.current && notificationButtonRef.current) {
        if (!notificationsRef.current.contains(target) && !notificationButtonRef.current.contains(target)) {
          setShowNotifications(false);
        }
      }
      
      // Close profile menu if clicking outside
      if (showProfileMenu && profileMenuRef.current && profileButtonRef.current) {
        if (!profileMenuRef.current.contains(target) && !profileButtonRef.current.contains(target)) {
          setShowProfileMenu(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications, showProfileMenu]);

  const unreadCount = notifications.filter((item) => !seenNotificationIds.includes(item.id)).length;

  const formatDueDate = (value: string) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const fetchNotifications = async () => {
    if (userRole === "salesperson" && !userName) {
      setNotifications([]);
      return;
    }

    try {
      setNotificationsLoading(true);

      const today = new Date().toISOString().split("T")[0];

      let leadsQuery = supabase
        .from("leads")
        .select("id, company, lead_id, next_follow_up_date, assigned_to")
        .not("next_follow_up_date", "is", null)
        .lte("next_follow_up_date", today)
        .order("next_follow_up_date", { ascending: true })
        .limit(10);

      let tasksQuery = supabase
        .from("tasks")
        .select("id, title, due_date, status, assigned_to")
        .not("due_date", "is", null)
        .neq("status", "Completed")
        .lte("due_date", today)
        .order("due_date", { ascending: true })
        .limit(10);

      if (userRole === "salesperson" && userName) {
        leadsQuery = leadsQuery.eq("assigned_to", userName);
        tasksQuery = tasksQuery.eq("assigned_to", userName);
      }

      const [{ data: dueLeads, error: leadsError }, { data: dueTasks, error: tasksError }] = await Promise.all([
        leadsQuery,
        tasksQuery,
      ]);

      if (leadsError) throw leadsError;
      if (tasksError) throw tasksError;

      const leadNotifications: NotificationItem[] = (dueLeads || []).map((lead: any) => {
        const dueDate = lead.next_follow_up_date || today;
        const isOverdue = dueDate < today;
        return {
          id: `lead-${lead.id}`,
          title: `${lead.company || "Lead"}${lead.lead_id ? ` (${lead.lead_id})` : ""}`,
          type: "follow-up",
          isOverdue,
          path: "/follow-ups",
          date: dueDate,
        };
      });

      const taskNotifications: NotificationItem[] = (dueTasks || []).map((task: any) => {
        const dueDate = task.due_date || today;
        const isOverdue = dueDate < today;
        return {
          id: `task-${task.id}`,
          title: task.title || "Task",
          type: "task",
          isOverdue,
          path: "/assign-tasks",
          date: dueDate,
        };
      });

      const unique = new Map<string, NotificationItem>();
      [...leadNotifications, ...taskNotifications].forEach((item) => {
        unique.set(item.id, item);
      });

      const merged = Array.from(unique.values())
        .sort((a, b) => {
          if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
          return a.date.localeCompare(b.date);
        })
        .slice(0, 12);

      setNotifications(merged);
      setSeenNotificationIds((prev) => prev.filter((id) => merged.some((item) => item.id === id)));
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

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

  useEffect(() => {
    if (!session && !localSessionEmail) {
      setNotifications([]);
      setSeenNotificationIds([]);
      return;
    }

    void fetchNotifications();
    const interval = setInterval(() => {
      void fetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, [session, localSessionEmail, userRole, userName]);

  useEffect(() => {
    if (!session && !localSessionEmail) return;

    const channel = supabase
      .channel(`header-notifications-${userRole}-${userName || "all"}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => {
        void fetchNotifications();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        void fetchNotifications();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [session, localSessionEmail, userRole, userName]);

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
    setShowNotifications(false);
    setNotifications([]);
    setSeenNotificationIds([]);
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
        .select("email, name, status")
        .eq("email", trimmedLogin)
        .eq("password", trimmedPassword)
        .maybeSingle();

      if (lookupError || !data?.email) {
        setAuthError("Invalid email or password.");
        return;
      }

      if (data.status === "Inactive") {
        setAuthError("Your account has been deactivated. Please contact your administrator.");
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


  const handleGlobalSearchChange = (value: string) => {
    setGlobalSearch(value);

    const targetPath = searchableRoutes.includes(location.pathname) ? location.pathname : "/leads";
    const params = new URLSearchParams(targetPath === location.pathname ? location.search : "");

    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }

    const nextUrl = params.toString() ? `${targetPath}?${params.toString()}` : targetPath;
    navigate(nextUrl, { replace: true });
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
            <div className="hidden md:flex flex-col items-center justify-center bg-red-600 p-8 text-red-600 text-center">
              <div className="space-y-2">
                <img
                  src="/waxity-login-logo.png"
                  alt="Waxity Lubricant"
                  className="mb-2 mx-auto h-56 w-auto object-contain"
                />
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
          <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-3 py-2">
            <img
              src="/Waxity Logo.png"
              alt="Waxity Logo"
              className={`${collapsed ? "h-10" : "h-12"} w-auto object-contain shrink-0`}
            />
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
                onChange={(e) => handleGlobalSearchChange(e.target.value)}
                className="w-64 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  ref={notificationButtonRef}
                  onClick={() => {
                    const nextOpen = !showNotifications;
                    setShowNotifications(nextOpen);
                    setShowProfileMenu(false);
                    if (nextOpen) {
                      setSeenNotificationIds((prev) => Array.from(new Set([...prev, ...notifications.map((item) => item.id)])));
                      void fetchNotifications();
                    }
                  }}
                  className="relative rounded-lg p-2 hover:bg-accent"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div ref={notificationsRef} className="absolute right-0 top-10 z-50 w-96 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl">
                    <div className="flex items-center justify-between border-b border-border px-3 py-2">
                      <span className="text-sm font-semibold">Notifications</span>
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-muted-foreground">{notifications.length}</span>
                    </div>
                    <div className="max-h-80 overflow-auto">
                      {notificationsLoading ? (
                        <div className="px-3 py-4 text-sm text-muted-foreground">Loading notifications...</div>
                      ) : notifications.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-muted-foreground">No new notifications.</div>
                      ) : (
                        notifications.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setShowNotifications(false);
                              navigate(item.path);
                            }}
                            className="flex w-full items-start gap-3 border-b border-border px-3 py-2.5 text-left hover:bg-accent/60 last:border-b-0"
                          >
                            <span className={`mt-0.5 rounded-md p-1.5 ${item.isOverdue ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                              {item.type === "follow-up" ? <CircleAlert className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="mb-0.5 block text-sm font-medium text-foreground truncate">{item.title}</span>
                              <span className="block text-xs text-muted-foreground">
                                {item.isOverdue ? "Overdue" : "Due today"} {item.type === "follow-up" ? "follow-up" : "task"} • {formatDueDate(item.date)}
                              </span>
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                  title="Profile menu"
                >
                  WL
                </button>
                {showProfileMenu && (
                  <div ref={profileMenuRef} className="absolute right-0 top-10 w-40 rounded-lg border border-border bg-card shadow-lg z-50">
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





