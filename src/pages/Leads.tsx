import { useState } from "react";
import { leads as initialLeads, getStatusColor, type Lead, type LeadStatus } from "@/data/mockData";
import { Plus, Search, Filter } from "lucide-react";

const Leads = () => {
  const [leadsData] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const statuses: string[] = ["All", "New", "Contacted", "Follow-up", "Interested", "Converted", "Lost", "Pending"];

  const filtered = leadsData.filter((l) => {
    const matchSearch = l.company.toLowerCase().includes(search.toLowerCase()) || l.contact.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground">Manage all your leads in one place</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-1.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-48 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {statuses.map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filterStatus === s ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground hover:bg-sidebar-accent"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-accent">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Company</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Source</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Assigned To</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{lead.company}</td>
                <td className="px-4 py-3">
                  <p className="text-sm text-foreground">{lead.contact}</p>
                  <p className="text-xs text-muted-foreground">{lead.email}</p>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{lead.source}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(lead.status)}`}>{lead.status}</span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{lead.assignedTo}</td>
                <td className="px-4 py-3 text-sm text-foreground">₹{(lead.value / 1000).toFixed(0)}K</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{lead.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leads;
