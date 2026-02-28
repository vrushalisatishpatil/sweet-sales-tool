import { useRef, useState, useEffect, type ChangeEvent } from "react";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import type { LeadStatus } from "@/types/database.types";
import { Plus, Search, Filter, X, User, Phone, Mail, Upload, Download, Pencil, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Lead {
  id: string;
  leadId: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  country: string;
  source: string;
  productInterested: string;
  assignedTo: string;
  status: LeadStatus;
  value: number;
  remarks: string;
  inquiryDate: string;
  createdAt: string;
}

const getStatusColor = (status: LeadStatus) => {
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

const Leads = () => {
  const { userRole } = useUser();
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [salesPersons, setSalesPersons] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [followUpType, setFollowUpType] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const statuses: string[] = [
    "All",
    "New",
    "Connected",
    "Interested",
    "Not Interested",
    "Detail Share",
    "Re-connected",
    "Negotiation",
    "Converted",
    "Irrelevant",
    "Lost",
  ];

  // Fetch leads from Supabase
  useEffect(() => {
    fetchLeads();
    fetchSalesPersons();
  }, []);

  const fetchSalesPersons = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('sales_team')
        .select('id, name, status')
        .eq('status', 'Active')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      setSalesPersons((data || []).map((person) => ({
        id: person.id,
        name: person.name,
      })));
    } catch (err) {
      console.error('Error fetching sales persons:', err);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform Supabase data to match component interface
      const transformedLeads: Lead[] = (data || []).map((dbLead) => ({
        id: dbLead.id,
        leadId: dbLead.lead_id,
        company: dbLead.company,
        contact: dbLead.contact,
        phone: dbLead.phone || '',
        email: dbLead.email || '',
        city: dbLead.city || '',
        state: dbLead.state || '',
        country: dbLead.country || '',
        source: dbLead.source || '',
        productInterested: dbLead.product_interested || '',
        assignedTo: dbLead.assigned_to || '',
        status: dbLead.status as LeadStatus,
        value: dbLead.value || 0,
        remarks: dbLead.remarks || '',
        inquiryDate: dbLead.inquiry_date || '',
        createdAt: new Date(dbLead.created_at).toISOString().split('T')[0],
      }));

      setLeadsData(transformedLeads);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to load leads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateLeadId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `LD${timestamp}${random}`;
  };

  const filtered = leadsData.filter((l) => {
    const matchSearch = l.company.toLowerCase().includes(search.toLowerCase()) || l.contact.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDialogOpen(true);
    setIsEditMode(false);
    setUpdateStatus("");
    setFollowUpNotes("");
    setFollowUpType("");
    setNextFollowUpDate("");
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedLead(null);
    setIsEditMode(false);
  };

  const handleEditLead = () => {
    if (selectedLead) {
      setNewLead({
        date: selectedLead.inquiryDate,
        companyName: selectedLead.company,
        contactPerson: selectedLead.contact,
        contactNumber: selectedLead.phone,
        emailId: selectedLead.email,
        city: selectedLead.city,
        state: selectedLead.state,
        country: selectedLead.country,
        inquirySource: selectedLead.source,
        assignSalesPerson: selectedLead.assignedTo,
        productInterested: selectedLead.productInterested,
        initialRemarks: selectedLead.remarks
      });
      setIsEditMode(true);
    }
  };

  const handleUpdateLead = async () => {
    try {
      if (!selectedLead) return;

      const { error: updateError } = await supabase
        .from('leads')
        .update({
          company: newLead.companyName,
          contact: newLead.contactPerson,
          phone: newLead.contactNumber,
          email: newLead.emailId,
          city: newLead.city,
          state: newLead.state,
          country: newLead.country,
          source: newLead.inquirySource,
          assigned_to: newLead.assignSalesPerson,
          product_interested: newLead.productInterested,
          remarks: newLead.initialRemarks,
          inquiry_date: newLead.date
        })
        .eq('id', selectedLead.id);

      if (updateError) throw updateError;

      await fetchLeads();
      alert('Lead updated successfully!');
      setIsEditMode(false);
      handleCloseDialog();
    } catch (err) {
      console.error('Error updating lead:', err);
      alert('Failed to update lead. Please try again.');
    }
  };

  const handleDeleteLead = async () => {
    if (!selectedLead) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete the lead "${selectedLead.company}"?`);
    if (!confirmDelete) return;

    try {
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .eq('id', selectedLead.id);

      if (deleteError) throw deleteError;

      await fetchLeads();
      alert('Lead deleted successfully!');
      handleCloseDialog();
    } catch (err) {
      console.error('Error deleting lead:', err);
      alert('Failed to delete lead. Please try again.');
    }
  };

  const handleSaveFollowUp = async () => {
    try {
      if (!selectedLead) return;

      // Update lead status if provided
      if (updateStatus) {
        const { error: updateError } = await supabase
          .from('leads')
          .update({ status: updateStatus as LeadStatus })
          .eq('id', selectedLead.id);

        if (updateError) throw updateError;
      }

      // Here you would also save the follow-up notes to a follow_ups table
      // For now, we'll just update the lead status
      console.log("Follow-up saved:", {
        leadId: selectedLead.id,
        notes: followUpNotes,
        type: followUpType,
        date: nextFollowUpDate,
        status: updateStatus
      });

      // Refresh leads list
      await fetchLeads();
      
      alert('Follow-up saved successfully!');
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving follow-up:', err);
      alert('Failed to save follow-up. Please try again.');
    }
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

  const handleCreateLead = async () => {
    try {
      if (!newLead.companyName || !newLead.contactPerson) {
        alert('Please fill in required fields: Company Name and Contact Person');
        return;
      }

      const leadId = generateLeadId();
      
      const { data, error: insertError } = await supabase
        .from('leads')
        .insert([
          {
            lead_id: leadId,
            company: newLead.companyName,
            contact: newLead.contactPerson,
            phone: newLead.contactNumber,
            email: newLead.emailId,
            city: newLead.city,
            state: newLead.state,
            country: newLead.country,
            source: newLead.inquirySource,
            product_interested: newLead.productInterested,
            assigned_to: newLead.assignSalesPerson,
            status: 'New',
            remarks: newLead.initialRemarks,
            inquiry_date: newLead.date || new Date().toISOString().split('T')[0],
            value: 0,
          }
        ])
        .select();

      if (insertError) throw insertError;

      // Refresh leads list
      await fetchLeads();
      
      alert('Lead created successfully!');
      handleCloseAddLeadDialog();
    } catch (err) {
      console.error('Error creating lead:', err);
      alert('Failed to create lead. Please try again.');
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = leadsData.map((lead) => ({
      "Lead ID": lead.leadId,
      "Date": lead.createdAt,
      "Company Name": lead.company,
      "Contact Person": lead.contact,
      "Contact Number": lead.phone,
      "Email": lead.email,
      "City": lead.city,
      "State": lead.state,
      "Country": lead.country,
      "Inquiry Source": lead.source,
      "Assigned To": lead.assignedTo,
      "Status": lead.status,
      "Product Interested": lead.productInterested,
      "Initial Remarks": lead.remarks,
      "Value": lead.value,
      "Inquiry Date": lead.inquiryDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    worksheet["!cols"] = [
      { wch: 12 },
      { wch: 12 },
      { wch: 25 },
      { wch: 22 },
      { wch: 16 },
      { wch: 28 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 14 },
      { wch: 22 },
      { wch: 32 },
      { wch: 12 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, "leads-data.xlsx");
  };

  const handleLeadsFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      
      // Read file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

          if (jsonData.length === 0) {
            setError('The file is empty. Please check your file.');
            setLoading(false);
            return;
          }

          const normalizeDate = (value: unknown) => {
            if (value instanceof Date && !isNaN(value.getTime())) {
              return value.toISOString().split('T')[0];
            }

            if (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value)))) {
              const numeric = typeof value === 'number' ? value : Number(value);
              const parsed = XLSX.SSF.parse_date_code(numeric);
              if (parsed && parsed.y && parsed.m && parsed.d) {
                const date = new Date(parsed.y, parsed.m - 1, parsed.d);
                return date.toISOString().split('T')[0];
              }
            }

            if (typeof value === 'string' && value.trim() !== '') {
              const parsed = new Date(value);
              if (!isNaN(parsed.getTime())) {
                return parsed.toISOString().split('T')[0];
              }
            }

            return new Date().toISOString().split('T')[0];
          };

          // Map imported data to Supabase schema
          const leadsToInsert = jsonData.map((row) => {
            const generatePersonId = () => {
              const timestamp = Date.now().toString().slice(-6);
              const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
              return `LD${timestamp}${random}`;
            };

            return {
              lead_id: generatePersonId(),
              company: row['Company Name'] || row['Company'] || row['company'] || row['Organization'] || '',
              contact: row['Contact Person'] || row['Contact'] || row['contact'] || row['contactPerson'] || '',
              phone: row['Contact Number'] || row['Phone'] || row['phone'] || row['Mobile'] || row['mobile'] || '',
              email: row['Email'] || row['email'] || row['Email ID'] || row['emailId'] || '',
              city: row['City'] || row['city'] || '',
              state: row['State'] || row['state'] || '',
              country: row['Country'] || row['country'] || '',
              source: row['Inquiry Source'] || row['Source'] || row['source'] || row['inquirySource'] || '',
              product_interested: row['Product Interested'] || row['productInterested'] || row['product_interested'] || '',
              assigned_to: row['Assigned To'] || row['assignedTo'] || row['assigned_to'] || row['Assign Sales Person'] || '',
              status: (row['Status'] || row['status'] || 'New') as LeadStatus,
              value: Number(row['Value'] || row['value'] || 0) || 0,
              remarks: row['Initial Remarks'] || row['Remarks'] || row['remarks'] || row['initialRemarks'] || '',
              inquiry_date: normalizeDate(row['Inquiry Date'] || row['inquiryDate'] || row['inquiry_date']),
            };
          });

          // Insert all leads to Supabase
          const { error: insertError } = await supabase
            .from('leads')
            .insert(leadsToInsert);

          if (insertError) {
            console.error('Supabase insert error:', insertError);
            setError(`Failed to import leads: ${insertError.message}`);
            setLoading(false);
            return;
          }

          // Refresh leads list to show imported data
          await fetchLeads();
          setError(null);
          alert(`Successfully imported ${leadsToInsert.length} leads!`);
        } catch (parseError) {
          console.error('Error parsing file:', parseError);
          setError(`Error parsing file: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read file');
        setLoading(false);
      };

      reader.readAsBinaryString(file);
    } catch (err) {
      console.error('Error importing leads:', err);
      setError(`Error importing file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchLeads}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground">Manage all your leads in one place</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.tsv"
            onChange={handleLeadsFileUpload}
            className="hidden"
          />
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            title="Download leads template"
          >
            <Download className="h-4 w-4" /> Template
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            title="Import leads from Excel or CSV"
          >
            <Upload className="h-4 w-4" /> Import
          </button>
          {userRole === "admin" && (
            <button 
              onClick={handleOpenAddLeadDialog}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add Lead
            </button>
          )}
        </div>
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
      {filtered.length > 0 ? (
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
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card p-12 text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No leads found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {leadsData.length === 0 
              ? "Get started by adding your first lead" 
              : "Try adjusting your search or filters"}
          </p>
          {userRole === "admin" && leadsData.length === 0 && (
            <Button onClick={handleOpenAddLeadDialog} className="bg-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" /> Add Your First Lead
            </Button>
          )}
        </div>
      )}

      {/* Lead Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {selectedLead && !isEditMode && (
            <div className="space-y-6">
              {/* Header with Title and Status */}
              <div className="flex items-center justify-between -mt-2 pr-4">
                <h2 className="text-xl font-semibold text-foreground">{selectedLead.company}</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleEditLead}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={handleDeleteLead}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(selectedLead.status)}`}>
                    {selectedLead.status}
                  </span>
                </div>
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
                    <SelectItem value="Connected">Connected</SelectItem>
                    <SelectItem value="Interested">Interested</SelectItem>
                    <SelectItem value="Not Interested">Not Interested</SelectItem>
                    <SelectItem value="Detail Share">Detail Share</SelectItem>
                    <SelectItem value="Re-connected">Re-connected</SelectItem>
                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                    <SelectItem value="Converted">Converted</SelectItem>
                    <SelectItem value="Irrelevant">Irrelevant</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
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

          {/* Edit Lead Form */}
          {selectedLead && isEditMode && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>Edit Lead</DialogTitle>
              </DialogHeader>
              
              {/* Date */}
              <div>
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
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
                  <Label htmlFor="edit-companyName">Company Name</Label>
                  <Input
                    id="edit-companyName"
                    value={newLead.companyName}
                    onChange={(e) => setNewLead({ ...newLead, companyName: e.target.value })}
                    placeholder="Enter company name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-contactPerson">Contact Person</Label>
                  <Input
                    id="edit-contactPerson"
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
                  <Label htmlFor="edit-contactNumber">Contact Number</Label>
                  <Input
                    id="edit-contactNumber"
                    value={newLead.contactNumber}
                    onChange={(e) => setNewLead({ ...newLead, contactNumber: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-emailId">Email ID</Label>
                  <Input
                    id="edit-emailId"
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
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    value={newLead.city}
                    onChange={(e) => setNewLead({ ...newLead, city: e.target.value })}
                    placeholder="Enter city"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-state">State</Label>
                  <Input
                    id="edit-state"
                    value={newLead.state}
                    onChange={(e) => setNewLead({ ...newLead, state: e.target.value })}
                    placeholder="Enter state"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-country">Country</Label>
                  <Input
                    id="edit-country"
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
                  <Label htmlFor="edit-inquirySource">Inquiry Source</Label>
                  <Select value={newLead.inquirySource} onValueChange={(value) => setNewLead({ ...newLead, inquirySource: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INDIAMART">INDIAMART</SelectItem>
                      <SelectItem value="TRADEINDIA">TRADEINDIA</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Call">Call</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-assignSalesPerson">Assign Sales Person</Label>
                    <Select value={newLead.assignSalesPerson} onValueChange={(value) => setNewLead({ ...newLead, assignSalesPerson: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select person" />
                      </SelectTrigger>
                      <SelectContent>
                        {salesPersons.map((person) => (
                          <SelectItem key={person.id} value={person.name}>{person.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
              </div>

              {/* Product Interested */}
              <div>
                <Label htmlFor="edit-productInterested">Product Interested</Label>
                <Input
                  id="edit-productInterested"
                  value={newLead.productInterested}
                  onChange={(e) => setNewLead({ ...newLead, productInterested: e.target.value })}
                  placeholder="Product name"
                  className="mt-1"
                />
              </div>

              {/* Initial Remarks */}
              <div>
                <Label htmlFor="edit-initialRemarks">Remarks</Label>
                <Textarea
                  id="edit-initialRemarks"
                  value={newLead.initialRemarks}
                  onChange={(e) => setNewLead({ ...newLead, initialRemarks: e.target.value })}
                  placeholder="Add remarks..."
                  className="mt-1 min-h-[80px] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleUpdateLead}
                >
                  Update Lead
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditMode(false)}
                >
                  Cancel
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
                    <SelectItem value="INDIAMART">INDIAMART</SelectItem>
                    <SelectItem value="TRADEINDIA">TRADEINDIA</SelectItem>
                    <SelectItem value="DIIPL">DIIPL</SelectItem>
                    <SelectItem value="WEB SITE">WEB SITE</SelectItem>
                    <SelectItem value="EMAIL">EMAIL</SelectItem>
                    <SelectItem value="WHATS APP">WHATS APP</SelectItem>
                    <SelectItem value="CALL">CALL</SelectItem>
                    <SelectItem value="SOCIAL MEDIA">SOCIAL MEDIA</SelectItem>
                    <SelectItem value="CAMPAIGN">CAMPAIGN</SelectItem>
                    <SelectItem value="OTHER">OTHER</SelectItem>
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
                    {salesPersons.map((person) => (
                      <SelectItem key={person.id} value={person.name}>{person.name}</SelectItem>
                    ))}
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
