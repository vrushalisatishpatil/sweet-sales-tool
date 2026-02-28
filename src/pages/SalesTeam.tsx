import { useEffect, useState } from "react";
import { Mail, Phone, Plus, Search, CheckCircle2, Loader2, AlertCircle, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";
import { useUser } from "@/context/UserContext";

type SalesPerson = Database['public']['Tables']['sales_team']['Row'];

const SalesTeam = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [salesTeam, setSalesTeam] = useState<SalesPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddPersonDialogOpen, setIsAddPersonDialogOpen] = useState(false);
  const [isEditPersonDialogOpen, setIsEditPersonDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingPerson, setEditingPerson] = useState<SalesPerson | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: ""
  });
  const [newPerson, setNewPerson] = useState({
    name: "",
    phone: "",
    email: "",
    password: ""
  });
  const { userRole } = useUser();

  useEffect(() => {
    fetchSalesTeam();
  }, []);

  useEffect(() => {
    if (isAddPersonDialogOpen) {
      setNewPerson({ name: "", phone: "", email: "", password: "" });
      setShowPassword(false);
    }
  }, [isAddPersonDialogOpen]);

  useEffect(() => {
    if (isEditPersonDialogOpen && editingPerson) {
      setEditFormData({
        name: editingPerson.name,
        phone: editingPerson.phone,
        email: editingPerson.email,
        password: editingPerson.password
      });
    }
  }, [isEditPersonDialogOpen, editingPerson]);

  const generatePersonId = async () => {
    const { data, error } = await supabase
      .from('sales_team')
      .select('person_id');

    if (error) {
      console.error('Error counting sales team members:', error);
      return 'SALES-TEAM-0001';
    }

    const count = (data?.length || 0) + 1;
    return `SALES-TEAM-${String(count).padStart(4, '0')}`;
  };

  const fetchSalesTeam = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('sales_team')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Fetch leads data to calculate statistics for each sales person
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('assigned_to, status');

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
      }

      // Update sales team data with calculated statistics
      const updatedData = (data || []).map((person) => {
        const personLeads = leadsData?.filter(lead => lead.assigned_to === person.name) || [];
        const totalLeads = personLeads.length;
        const convertedLeads = personLeads.filter(lead => lead.status === 'Converted').length;
        const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

        return {
          ...person,
          leads: totalLeads,
          converted: convertedLeads,
          rate: `${conversionRate}%`
        };
      });

      setSalesTeam(updatedData || []);
    } catch (err) {
      console.error('Error fetching sales team:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sales team');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleOpenAddPersonDialog = () => {
    if (userRole !== 'admin') {
      setError('Only admin users can add sales team members');
      return;
    }
    setNewPerson({ name: "", phone: "", email: "", password: "" });
    setShowPassword(false);
    setIsAddPersonDialogOpen(true);
  };

  const handleCloseAddPersonDialog = () => {
    setIsAddPersonDialogOpen(false);
    setNewPerson({
      name: "",
      phone: "",
      email: "",
      password: ""
    });
    setShowPassword(false);
  };

  const handleOpenEditDialog = (person: SalesPerson) => {
    setEditingPerson(person);
    setIsEditPersonDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditPersonDialogOpen(false);
    setEditingPerson(null);
    setEditFormData({ name: "", phone: "", email: "", password: "" });
  };

  const handleUpdateSalesPerson = async () => {
    if (!editingPerson) return;
    
    if (!editFormData.name.trim() || !editFormData.email.trim() || !editFormData.phone.trim() || !editFormData.password.trim()) {
      setError('All fields are required');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('sales_team')
        .update({
          name: editFormData.name.trim(),
          email: editFormData.email.trim(),
          phone: editFormData.phone.trim(),
          password: editFormData.password.trim(),
        })
        .eq('id', editingPerson.id);

      if (updateError) throw updateError;

      await fetchSalesTeam();
      handleCloseEditDialog();
    } catch (err) {
      console.error('Error updating sales person:', err);
      setError(err instanceof Error ? err.message : 'Failed to update sales person');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSalesPerson = async (person: SalesPerson) => {
    if (!confirm(`Are you sure you want to delete ${person.name}?`)) {
      return;
    }

    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('sales_team')
        .delete()
        .eq('id', person.id);

      if (deleteError) throw deleteError;

      await fetchSalesTeam();
    } catch (err) {
      console.error('Error deleting sales person:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete sales person');
    }
  };

  const handleCreateSalesPerson = async () => {
    // Validate input
    if (!newPerson.name.trim() || !newPerson.email.trim() || !newPerson.phone.trim() || !newPerson.password.trim()) {
      setError('All fields are required');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      const personId = await generatePersonId();
      const initials = getInitials(newPerson.name);

      const insertData = {
        person_id: personId,
        name: newPerson.name.trim(),
        email: newPerson.email.trim(),
        phone: newPerson.phone.trim(),
        password: newPerson.password.trim(),
        avatar: initials,
        status: 'Active' as const,
        leads: 0,
        converted: 0,
        rate: '0%',
        leads_assigned: 0,
        conversions: 0
      };

      const { error: insertError } = await supabase
        .from('sales_team')
        .insert([insertData]);

      if (insertError) throw insertError;

      // Refresh the list
      await fetchSalesTeam();
      handleCloseAddPersonDialog();
    } catch (err) {
      console.error('Error creating sales person:', err);
      setError(err instanceof Error ? err.message : 'Failed to create sales person');
    } finally {
      setIsCreating(false);
    }
  };

  // Filter sales team
  const filteredSalesTeam = salesTeam.filter((person) => {
    const matchesSearch = 
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <p className="text-sm text-muted-foreground">Loading sales team...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Error Alert */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales Team</h1>
          <p className="text-sm text-muted-foreground">Manage your sales personnel</p>
        </div>
        {userRole === 'admin' && (
          <button 
            onClick={handleOpenAddPersonDialog}
            className="flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" /> Add Sales Person
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search team members..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground" 
          />
        </div>
      </div>

      {/* Sales Team Grid */}
      {filteredSalesTeam.length === 0 ? (
        <div className="flex items-center justify-center min-h-64 rounded-lg border border-dashed border-gray-300 bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No sales team members found</p>
            {userRole === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setIsAddPersonDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add First Member
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSalesTeam.map((person) => (
            <div key={person.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow relative">
              {/* Header with Avatar, Name, and Status */}
              <div className="flex items-center gap-3 mb-2">
                {/* Avatar */}
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-900 text-white text-sm font-bold flex-shrink-0">
                  {person.avatar}
                </div>

                {/* Name and ID */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-bold text-gray-900 leading-none mb-0.5">{person.name}</h3>
                  <p className="text-[11px] text-blue-600 font-semibold leading-none">ID: {person.person_id}</p>
                </div>

                {/* Status Badge */}
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                  person.status === "Active" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  <CheckCircle2 className="h-3 w-3" />
                  {person.status}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1 mb-3 text-[13px] text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                  <span>{person.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                  <span>{person.email}</span>
                </div>
              </div>

              {/* Password */}
              <div className="mb-3 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                Password: {person.password}
              </div>

              {/* Statistics */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-start gap-6 justify-between">
                  <div className="flex items-start gap-6">
                    <div>
                      <p className="text-xl font-bold text-gray-900">{person.leads}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">Leads</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-green-600">{person.converted}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">Converted</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-red-600">{person.rate}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">Rate</p>
                    </div>
                  </div>
                  {userRole === 'admin' && (
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        onClick={() => handleOpenEditDialog(person)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSalesPerson(person)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Sales Person Dialog */}
      <Dialog open={isEditPersonDialogOpen} onOpenChange={setIsEditPersonDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sales Person</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Enter full name"
                className="mt-1 rounded-lg"
              />
            </div>

            {/* Phone and Email side by side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <Label htmlFor="edit-phone">Mobile Number *</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  className="mt-1 rounded-lg"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="edit-email">Email ID *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="Your Email"
                  className="mt-1 rounded-lg"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="edit-password">Password *</Label>
              <div className="relative mt-1">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  placeholder="Your Password"
                  className="mt-1 rounded-lg pr-10"
                  autoComplete="new-password"
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

            {/* Update Button */}
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg"
              onClick={handleUpdateSalesPerson}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Sales Person'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Sales Person Dialog */}
      <Dialog open={isAddPersonDialogOpen} onOpenChange={setIsAddPersonDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Sales Person</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={newPerson.name}
                onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                placeholder="Enter full name"
                className="mt-1 rounded-lg"
              />
            </div>

            {/* Phone and Email side by side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <Label htmlFor="phone">Mobile Number *</Label>
                <Input
                  id="phone"
                  value={newPerson.phone}
                  onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  className="mt-1 rounded-lg"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email ID *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPerson.email}
                  onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                  placeholder="Your Email"
                  className="mt-1 rounded-lg"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={newPerson.password}
                  onChange={(e) => setNewPerson({ ...newPerson, password: e.target.value })}
                  placeholder="Your Password"
                  className="mt-1 rounded-lg pr-10"
                  autoComplete="new-password"
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

            {/* Create Button */}
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg"
              onClick={handleCreateSalesPerson}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Sales Person'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesTeam;
