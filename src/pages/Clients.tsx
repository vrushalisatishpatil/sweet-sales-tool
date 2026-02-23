import { clients } from "@/data/mockData";
import { Search, Upload, Plus, Users } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Clients = () => {
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [partyName, setPartyName] = useState("");
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [area, setArea] = useState("");

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground">Manage your client directory ({clients.length} total)</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Upload className="h-4 w-4" /> Import Excel
          </button>
          <button 
            onClick={() => setIsAddClientOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add Client
          </button>
        </div>
      </div>

      {/* Search Bar and Empty State */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 px-2 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, state, area, or pincode..." 
            className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-gray-400" 
          />
        </div>

        {/* Empty State */}
        {clients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="mb-3 h-16 w-16 text-gray-300" strokeWidth={1.5} />
            <p className="text-base font-medium text-gray-600 mb-1">No clients yet</p>
            <p className="text-sm text-gray-500">Add clients manually or import from Excel</p>
          </div>
        )}
      </div>

      {/* Table - Only show if there are clients */}
      {clients.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-accent">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Industry</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Converted Date</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{client.company}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{client.contact}</p>
                    <p className="text-xs text-muted-foreground">{client.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{client.industry}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">₹{(client.value / 1000).toFixed(0)}K</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{client.convertedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Client Dialog */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add New Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-sm font-medium text-gray-900">
                Party Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder="Enter party name"
                className="mt-2 border-2 border-red-500 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-900">Pincode</Label>
                <Input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 400001"
                  className="mt-2 rounded-lg"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-900">State</Label>
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="mt-2 rounded-lg"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900">Area</Label>
              <Input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Mumbai"
                className="mt-2 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddClientOpen(false)}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Handle add client logic here
                  setIsAddClientOpen(false);
                }}
                className="rounded-lg bg-blue-600 hover:bg-blue-700"
              >
                Add Client
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
