import { useState } from "react";
import { leads as initialLeads, getStatusColor, type Lead, type LeadStatus } from "@/data/mockData";
import { Plus, Search, Filter, X, User, Phone, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const Leads = () => {
  const [leadsData] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [followUpType, setFollowUpType] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");

  // Add Lead Dialog States
  const [isAddLeadDialogOpen, setIsAddLeadDialogOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    date: "",
    companyName: "",
    contactPerson: "",
    contactNumber: "",
    emailId: "",
    city: "",
    state: "",
    country: "",
    inquirySource: "",
    assignSalesPerson: "",
    productInterested: "",
    initialRemarks: ""
  });

  const statuses: string[] = ["All", "New", "Contacted", "Follow-up", "Interested", "Converted", "Lost", "Pending"];

  const filtered = leadsData.filter((l) => {
    const matchSearch = l.company.toLowerCase().includes(search.toLowerCase()) || l.contact.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDialogOpen(true);
    setUpdateStatus("");
    setFollowUpNotes("");
    setFollowUpType("");
    setNextFollowUpDate("");
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedLead(null);
  };

  const handleSaveFollowUp = () => {
    console.log("Follow-up saved:", {
      leadId: selectedLead?.id,
      notes: followUpNotes,
      type: followUpType,
      date: nextFollowUpDate,
      status: updateStatus
    });
    // Add your follow-up save logic here
  };

  const handleOpenAddLeadDialog = () => {
    setIsAddLeadDialogOpen(true);
  };

  const handleCloseAddLeadDialog = () => {
    setIsAddLeadDialogOpen(false);
    setNewLead({
      date: "",
      companyName: "",
      contactPerson: "",
      contactNumber: "",
      emailId: "",
      city: "",
      state: "",
      country: "",
      inquirySource: "",
      assignSalesPerson: "",
      productInterested: "",
      initialRemarks: ""
    });
  };

  const handleCreateLead = () => {
    console.log("New lead created:", newLead);
    // Add your lead creation logic here
    handleCloseAddLeadDialog();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground">Manage all your leads in one place</p>
        </div>
        <button 
          onClick={handleOpenAddLeadDialog}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {selectedLead && (
            <div className="space-y-6">
              {/* Header with Title and Status */}
              <div className="flex items-center justify-between -mt-2">
                <h2 className="text-xl font-semibold text-foreground">{selectedLead.company}</h2>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(selectedLead.status)}`}>
                  {selectedLead.status}
                </span>
              </div>

              {/* Contact Information Section */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Contact Person</p>
                      <p className="text-sm font-medium text-foreground">{selectedLead.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium text-foreground">{selectedLead.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium text-foreground">{selectedLead.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Details Section */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Lead Details</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Lead ID</p>
                    <p className="text-sm font-medium text-foreground">{selectedLead.leadId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Inquiry Date</p>
                    <p className="text-sm font-medium text-foreground">{selectedLead.inquiryDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">City</p>
                    <p className="text-sm font-medium text-foreground">{selectedLead.city}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">State</p>
                    <p className="text-sm font-medium text-foreground">{selectedLead.state}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Country</p>
                    <p className="text-sm font-medium text-foreground">{selectedLead.country}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Source</p>
                    <p className="text-sm font-medium text-foreground">{selectedLead.source}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Assigned To</p>
                    <p className="text-sm font-medium text-foreground">{selectedLead.assignedTo}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Product Interested</p>
                    <p className="text-sm font-medium text-foreground">{selectedLead.productInterested}</p>
                  </div>
                </div>
              </div>

              {/* Remarks Section */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Remarks</h3>
                <div className="rounded-lg bg-accent/50 p-3">
                  <p className="text-sm text-foreground">{selectedLead.remarks}</p>
                </div>
              </div>

              {/* Update Status Section */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Update Status</h3>
                <Select value={updateStatus} onValueChange={setUpdateStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Follow-up">Follow-up Required</SelectItem>
                    <SelectItem value="Interested">Interested</SelectItem>
                    <SelectItem value="Converted">Converted</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Add Follow-up Section */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Add Follow-up</h3>
                <Textarea
                  placeholder="Enter follow-up notes..."
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Follow-up Type</Label>
                    <Select value={followUpType} onValueChange={setFollowUpType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Call">Call</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="Visit">Visit</SelectItem>
                        <SelectItem value="Meeting">Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Next Follow-up</Label>
                    <Input
                      type="date"
                      value={nextFollowUpDate}
                      onChange={(e) => setNextFollowUpDate(e.target.value)}
                      placeholder="mm/dd/yyyy"
                    />
                  </div>
                </div>
                <Button 
                  className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleSaveFollowUp}
                >
                  Save Follow-up
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add New Lead Dialog */}
      <Dialog open={isAddLeadDialogOpen} onOpenChange={setIsAddLeadDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Date */}
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newLead.date}
                onChange={(e) => setNewLead({ ...newLead, date: e.target.value })}
                placeholder="mm/dd/yyyy"
                className="mt-1"
              />
            </div>

            {/* Company Name and Contact Person */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={newLead.companyName}
                  onChange={(e) => setNewLead({ ...newLead, companyName: e.target.value })}
                  placeholder="Enter company name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={newLead.contactPerson}
                  onChange={(e) => setNewLead({ ...newLead, contactPerson: e.target.value })}
                  placeholder="Enter contact name"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Contact Number and Email ID */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  value={newLead.contactNumber}
                  onChange={(e) => setNewLead({ ...newLead, contactNumber: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="emailId">Email ID</Label>
                <Input
                  id="emailId"
                  type="email"
                  value={newLead.emailId}
                  onChange={(e) => setNewLead({ ...newLead, emailId: e.target.value })}
                  placeholder="email@company.com"
                  className="mt-1"
                />
              </div>
            </div>

            {/* City, State, Country */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={newLead.city}
                  onChange={(e) => setNewLead({ ...newLead, city: e.target.value })}
                  placeholder="Enter city"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={newLead.state}
                  onChange={(e) => setNewLead({ ...newLead, state: e.target.value })}
                  placeholder="Enter state"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={newLead.country}
                  onChange={(e) => setNewLead({ ...newLead, country: e.target.value })}
                  placeholder="Enter country"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Inquiry Source and Assign Sales Person */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inquirySource">Inquiry Source</Label>
                <Select value={newLead.inquirySource} onValueChange={(value) => setNewLead({ ...newLead, inquirySource: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Reference">Reference</SelectItem>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Visit">Visit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assignSalesPerson">Assign Sales Person</Label>
                <Select value={newLead.assignSalesPerson} onValueChange={(value) => setNewLead({ ...newLead, assignSalesPerson: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rahul Sharma">Rahul Sharma</SelectItem>
                    <SelectItem value="Priya Patel">Priya Patel</SelectItem>
                    <SelectItem value="Amit Kumar">Amit Kumar</SelectItem>
                    <SelectItem value="Sneha Gupta">Sneha Gupta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product / Service Interested In */}
            <div>
              <Label htmlFor="productInterested">Product / Service Interested In</Label>
              <Input
                id="productInterested"
                value={newLead.productInterested}
                onChange={(e) => setNewLead({ ...newLead, productInterested: e.target.value })}
                placeholder="Enter product or service"
                className="mt-1"
              />
            </div>

            {/* Initial Remarks */}
            <div>
              <Label htmlFor="initialRemarks">Initial Remarks</Label>
              <Textarea
                id="initialRemarks"
                value={newLead.initialRemarks}
                onChange={(e) => setNewLead({ ...newLead, initialRemarks: e.target.value })}
                placeholder="Enter initial remarks..."
                className="mt-1 min-h-[80px] resize-none"
              />
            </div>

            {/* Create Lead Button */}
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreateLead}
            >
              Create Lead
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Leads;
