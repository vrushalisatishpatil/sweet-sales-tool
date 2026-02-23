import { salesTeam } from "@/data/mockData";
import { useState } from "react";
import { Mail, Phone, Plus, Search, CheckCircle2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const SalesTeam = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddPersonDialogOpen, setIsAddPersonDialogOpen] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: "",
    phone: "",
    email: "",
    username: "",
    password: ""
  });

  const handleOpenAddPersonDialog = () => {
    setIsAddPersonDialogOpen(true);
  };

  const handleCloseAddPersonDialog = () => {
    setIsAddPersonDialogOpen(false);
    setNewPerson({
      name: "",
      phone: "",
      email: "",
      username: "",
      password: ""
    });
  };

  const handleAddPerson = () => {
    console.log("New person added:", newPerson);
    // Add your person creation logic here
    handleCloseAddPersonDialog();
  };

  // Filter sales team
  const filteredSalesTeam = salesTeam.filter((person) => {
    const matchesSearch = 
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales Team</h1>
          <p className="text-sm text-muted-foreground">Manage your sales personnel</p>
        </div>
        <button 
          onClick={handleOpenAddPersonDialog}
          className="flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" /> Add Sales Person
        </button>
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
                <h3 className="text-[15px] font-bold text-gray-900 leading-none">{person.name}</h3>
                <p className="text-[13px] text-blue-600 leading-none mt-0.5">{person.employeeId}</p>
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

            {/* Statistics */}
            <div className="flex items-start gap-6 pt-2 border-t border-gray-200 relative">
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
              
              {/* Edit button */}
              <button className="absolute right-0 top-2 text-gray-400 hover:text-gray-600">
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Sales Person Dialog */}
      <Dialog open={isAddPersonDialogOpen} onOpenChange={setIsAddPersonDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Sales Person</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newPerson.name}
                onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                placeholder="Enter full name"
                className="mt-1 border-2 border-red-500 focus:border-red-500 focus:ring-red-500 rounded-lg"
              />
            </div>

            {/* Mobile Number and Email ID side by side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Mobile Number */}
              <div>
                <Label htmlFor="phone">Mobile Number</Label>
                <Input
                  id="phone"
                  value={newPerson.phone}
                  onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  className="mt-1 rounded-lg"
                />
              </div>

              {/* Email ID */}
              <div>
                <Label htmlFor="email">Email ID</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPerson.email}
                  onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                  placeholder="email@company.com"
                  className="mt-1 rounded-lg"
                />
              </div>
            </div>

            {/* Username and Password side by side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newPerson.username}
                  onChange={(e) => setNewPerson({ ...newPerson, username: e.target.value })}
                  placeholder="Login username"
                  className="mt-1 rounded-lg"
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPerson.password}
                  onChange={(e) => setNewPerson({ ...newPerson, password: e.target.value })}
                  placeholder="Password"
                  className="mt-1 rounded-lg"
                />
              </div>
            </div>

            {/* Create Button */}
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg"
              onClick={handleAddPerson}
            >
              Create Sales Person
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesTeam;
