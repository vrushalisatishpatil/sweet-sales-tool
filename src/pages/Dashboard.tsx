import { useEffect, useState } from "react";
import { Target, CheckCircle, Clock, Users, Phone, Mail, MessageSquare, MapPin } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Area, AreaChart, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";
import type { LeadStatus } from "@/types/database.types";

const leadStatusColors: Record<LeadStatus, string> = {
  New: "#3b82f6",
  Connected: "#22c55e",
  Interested: "#a855f7",
  "Not Interested": "#ef4444",
  "Detail Share": "#eab308",
  "Re-connected": "#14b8a6",
  Negotiation: "#f97316",
  Converted: "#10b981",
  Irrelevant: "#6b7280",
  Lost: "#f43f5e",
};

const getStatusColorClass = (status: LeadStatus) => {
  const colors: Record<LeadStatus, string> = {
    New: "bg-blue-100 text-blue-700",
    Connected: "bg-green-100 text-green-700",
    Interested: "bg-purple-100 text-purple-700",
    "Not Interested": "bg-red-100 text-red-700",
    "Detail Share": "bg-yellow-100 text-yellow-700",
    "Re-connected": "bg-teal-100 text-teal-700",
    Negotiation: "bg-orange-100 text-orange-700",
    Converted: "bg-emerald-100 text-emerald-700",
    Irrelevant: "bg-gray-100 text-gray-700",
    Lost: "bg-rose-100 text-rose-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
};

const Dashboard = () => {
  const { userRole, userName } = useUser();
  const [leadsData, setLeadsData] = useState<Array<{
    id: string;
    company: string;
    contact: string;
    source: string | null;
    assigned_to: string | null;
    next_follow_up_date: string | null;
    status: LeadStatus;
    created_at: string;
  }>>([]);
  const [salesTeamData, setSalesTeamData] = useState<Array<{
    id: string;
    name: string;
    leads: number;
    converted: number;
    status: "Active" | "Inactive";
  }>>([]);

  useEffect(() => {
    const fetchSalesTeam = async () => {
      try {
        const { data, error } = await supabase
          .from("sales_team")
          .select("id, name, status")
          .order("name", { ascending: true });

        if (error) throw error;
        setSalesTeamData(
          (data || []).map((person) => ({
            id: person.id,
            name: person.name,
            leads: 0,
            converted: 0,
            status: person.status,
          }))
        );
      } catch (err) {
        console.error("Error fetching sales team for dashboard:", err);
      }
    };

    const fetchLeads = async () => {
      try {
        let query = supabase
          .from("leads")
          .select("id, company, contact, source, assigned_to, next_follow_up_date, status, created_at");
        
        // Filter by assigned salesperson if not admin
        if (userRole === 'salesperson' && userName) {
          query = query.eq('assigned_to', userName);
        }
        
        const { data, error } = await query
          .order("created_at", { ascending: false });

        if (error) throw error;
        setLeadsData((data || []) as Array<{
          id: string;
          company: string;
          contact: string;
          source: string | null;
          assigned_to: string | null;
          next_follow_up_date: string | null;
          status: LeadStatus;
          created_at: string;
        }>);
      } catch (err) {
        console.error("Error fetching leads for dashboard:", err);
      }
    };

    fetchSalesTeam();
    fetchLeads();
  }, [userRole, userName]);

  const visibleSalesTeam =
    userRole === "admin"
      ? salesTeamData
      : salesTeamData.filter((person) => person.name === userName);

  const salesPerformanceData = visibleSalesTeam.map((person) => {
    const personLeads = leadsData.filter((lead) => lead.assigned_to === person.name);
    const personConversions = personLeads.filter((lead) => lead.status === "Converted").length;

    return {
      name: person.name,
      leads: personLeads.length,
      conversions: personConversions,
    };
  });

  const activeSalesCount = salesTeamData.filter((person) => person.status === "Active").length;

  const todayDate = new Date().toISOString().split("T")[0];
  const todaysFollowUpsCount = leadsData.filter((lead) => lead.next_follow_up_date === todayDate).length;

  const statusOrder: LeadStatus[] = ["New", "Connected", "Interested", "Not Interested", "Detail Share", "Re-connected", "Negotiation", "Converted", "Irrelevant", "Lost"];
  const leadStatusDistribution = statusOrder.map((status) => ({
    name: status,
    value: leadsData.filter((lead) => lead.status === status).length,
    color: leadStatusColors[status],
  })).filter((item) => item.value > 0);

  const recentLeads = leadsData.slice(0, 5);

  const statCards = [
    { title: "Total Leads", value: leadsData.length, change: "", positive: true, icon: Target, iconColor: "text-primary" },
    { title: "Conversions", value: leadsData.filter((lead) => lead.status === "Converted").length, change: "", positive: true, icon: CheckCircle, iconColor: "text-status-converted" },
    { title: "Today's Follow-ups", value: todaysFollowUpsCount, change: "", positive: false, icon: Clock, iconColor: "text-status-followup" },
    { title: "Active Sales Team", value: activeSalesCount, change: "", positive: true, icon: Users, iconColor: "text-status-new" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back! Here's your lead pipeline overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.title} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            <p className="mt-1 text-3xl font-bold text-foreground">{stat.value}</p>
            {stat.change && (
              <p className={`mt-1 text-xs ${stat.positive ? "text-status-converted" : "text-primary"}`}>
                {stat.change}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Pie Chart */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-4 font-semibold text-foreground">Lead Status Distribution</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={leadStatusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {leadStatusDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            {leadStatusDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name} ({item.value})
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-4 font-semibold text-foreground">Sales Person Performance</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={salesPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Bar dataKey="leads" fill="hsl(210, 85%, 35%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="conversions" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-4">
        {/* Recent Leads */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Recent Leads</h3>
            <Link to="/leads" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentLeads.length > 0 ? (
              recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-accent">
                  <div>
                    <p className="text-sm font-medium text-foreground">{lead.company}</p>
                    <p className="text-xs text-muted-foreground">{lead.contact} · {lead.source || "-"}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColorClass(lead.status)}`}>
                    {lead.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent leads</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
