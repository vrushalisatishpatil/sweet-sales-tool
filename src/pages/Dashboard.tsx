import { Target, CheckCircle, Clock, Users } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer } from "recharts";
import { leads, followUps, salesTeam, salesPerformanceData, weeklyLeadTrend, leadStatusDistribution, getStatusColor } from "@/data/mockData";
import { Link } from "react-router-dom";

const statCards = [
  { title: "Total Leads", value: leads.length, change: "↑ 12% this week", positive: true, icon: Target, iconColor: "text-primary" },
  { title: "Conversions", value: leads.filter(l => l.status === "Converted").length, change: "↑ 8.3% rate", positive: true, icon: CheckCircle, iconColor: "text-status-converted" },
  { title: "Today's Follow-ups", value: followUps.length, change: "↓ 3 pending", positive: false, icon: Clock, iconColor: "text-status-pending" },
  { title: "Active Sales Team", value: salesTeam.length, change: "", positive: true, icon: Users, iconColor: "text-status-new" },
];

const Dashboard = () => {
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
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
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
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="leads" fill="hsl(210, 80%, 55%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="conversions" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-4 font-semibold text-foreground">Weekly Lead Trend</h3>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={weeklyLeadTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="leads" stroke="hsl(210, 80%, 55%)" strokeWidth={2} dot={{ fill: "hsl(210, 80%, 55%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Leads */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Recent Leads</h3>
            <Link to="/leads" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-accent">
                <div>
                  <p className="text-sm font-medium text-foreground">{lead.company}</p>
                  <p className="text-xs text-muted-foreground">{lead.contact} · {lead.source}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(lead.status)}`}>
                  {lead.status === "Follow-up" ? "Follow-up Required" : lead.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Follow-ups */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Today's Follow-ups</h3>
            <span className="rounded-full bg-status-converted px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
              {followUps.length} scheduled
            </span>
          </div>
          <div className="space-y-3">
            {followUps.map((fu) => (
              <div key={fu.id} className="flex items-start gap-3 rounded-lg p-2 hover:bg-accent">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                  {fu.method === "Call" ? "📞" : fu.method === "Email" ? "📧" : fu.method === "WhatsApp" ? "💬" : "🏢"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{fu.company}</p>
                  <p className="text-xs text-muted-foreground">{fu.note}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">By {fu.by} · {fu.method}</p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">{fu.phone}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
