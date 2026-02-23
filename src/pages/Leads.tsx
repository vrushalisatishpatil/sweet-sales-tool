import { useState } from "react";
import { leads as initialLeads, getStatusColor, type Lead, type LeadStatus } from "@/data/mockData";
import { Plus, Search, Filter, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Leads = () => {
  const [leadsData] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const statuses: string[] = ["All", "New", "Contacted", "Follow-up", "Interested", "Converted", "Lost", "Pending"];

  const filtered = leadsData.filter((l) => {
    const matchSearch = l.company.toLowerCase().includes(search.toLowerCase()) || l.contact.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedLead(null);
  };

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
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">DATE</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">COMPANY</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">CONTACT PERSON / NO.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">CITY</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">STATE</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">COUNTRY</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ASSIGNED TO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr 
                key={lead.id} 
                onClick={() => handleRowClick(lead)}
                className="border-b border-border last:border-0 hover:bg-accent/50 cursor-pointer"
              >
                <td className="px-4 py-3 text-sm text-muted-foreground">{lead.createdAt}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{lead.company}</td>
                <td className="px-4 py-3">
                  <p className="text-sm text-foreground">{lead.contact}</p>
                  <p className="text-xs text-muted-foreground">{lead.phone}</p>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{lead.city}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{lead.state}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{lead.country}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{lead.assignedTo}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lead Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={selectedLead.company} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Person</Label>
                  <Input id="contact" value={selectedLead.contact} readOnly />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={selectedLead.phone} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={selectedLead.email} readOnly />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={selectedLead.city} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={selectedLead.state} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={selectedLead.country} readOnly />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input id="assignedTo" value={selectedLead.assignedTo} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Input id="status" value={selectedLead.status} readOnly />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Input id="source" value={selectedLead.source} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input id="value" value={`₹${selectedLead.value.toLocaleString()}`} readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date Created</Label>
                <Input id="date" value={selectedLead.createdAt} readOnly />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Close
                </Button>
                <Button>
                  Edit Lead
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Leads;
