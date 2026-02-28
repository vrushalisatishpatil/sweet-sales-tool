import { Search, Upload, Plus, Users, X, Download, Edit, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import * as XLSX from 'xlsx';
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Client {
  id: string;
  company: string;
  pincode: string | null;
  state: string | null;
  main_area: string | null;
  sub_areas: string[];
}

// Function to merge duplicate clients with same company, pincode, state, and main_area
const mergeDuplicateClients = (clients: Client[]): Client[] => {
  const clientMap = new Map<string, Client>();
  
  clients.forEach((client) => {
    // Create a unique key based on company, pincode, state, and main_area
    const key = `${client.company}|${client.pincode}|${client.state}|${client.main_area}`;
    
    if (clientMap.has(key)) {
      // Merge sub-areas
      const existingClient = clientMap.get(key)!;
      const mergedAreas = [...new Set([...existingClient.sub_areas, ...client.sub_areas])];
      existingClient.sub_areas = mergedAreas;
    } else {
      // Add new client
      clientMap.set(key, { ...client });
    }
  });
  
  // Return map values as array
  return Array.from(clientMap.values());
};

const Clients = () => {
  const { userRole } = useUser();
  const [clientsData, setClientsData] = useState<Client[]>([]);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [partyName, setPartyName] = useState("");
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [mainArea, setMainArea] = useState("");
  const [multipleAreas, setMultipleAreas] = useState<string[]>([]);
  const [newAreaInput, setNewAreaInput] = useState("");
  const [areaType, setAreaType] = useState<"main" | "multiple">("main");
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate client ID in format CLIENT-YYYY-NNNN
  const generateClientId = async (): Promise<string> => {
    const currentYear = new Date().getFullYear();
    const yearPrefix = `CLIENT-${currentYear}-`;
    
    try {
      // Get all clients with current year to count them
      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .like('id', `${yearPrefix}%`);
      
      if (error) {
        console.error('Error counting clients:', error);
        return `${yearPrefix}0001`; // Fallback to 0001
      }
      
      const count = data?.length || 0;
      const nextNumber = count + 1;
      const paddedNumber = String(nextNumber).padStart(4, '0');
      
      return `${yearPrefix}${paddedNumber}`;
    } catch (error) {
      console.error('Error generating client ID:', error);
      return `${yearPrefix}0001`; // Fallback to 0001
    }
  };

  // Fetch clients from Supabase
  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setClientsData(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async () => {
    if (!partyName.trim()) return;
    
    try {
      const newId = await generateClientId();
      
      const { error } = await supabase
        .from('clients')
        .insert({
          id: newId,
          company: partyName,
          pincode: pincode || null,
          state: state || null,
          main_area: mainArea || null,
          sub_areas: multipleAreas,
        });
      
      if (error) throw error;
      
      // Fetch updated clients list
      await fetchClients();
      
      // Reset form
      setIsAddClientOpen(false);
      setPartyName("");
      setPincode("");
      setState("");
      setMainArea("");
      setMultipleAreas([]);
      setNewAreaInput("");
      setAreaType("main");
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Error adding client. Please try again.');
    }
  };

  const handleEditClient = async () => {
    if (!partyName.trim() || !editingClient) return;
    
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          company: partyName,
          pincode: pincode || null,
          state: state || null,
          main_area: mainArea || null,
          sub_areas: multipleAreas,
        })
        .eq('id', editingClient.id);
      
      if (error) throw error;
      
      // Fetch updated clients list
      await fetchClients();
      
      // Reset form
      setIsEditClientOpen(false);
      setEditingClient(null);
      setPartyName("");
      setPincode("");
      setState("");
      setMainArea("");
      setMultipleAreas([]);
      setNewAreaInput("");
      setAreaType("main");
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Error updating client. Please try again.');
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', clientId);
        
        if (error) throw error;
        
        // Fetch updated clients list
        await fetchClients();
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error deleting client. Please try again.');
      }
    }
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setPartyName(client.company);
    setPincode(client.pincode || "");
    setState(client.state || "");
    setMainArea(client.main_area || "");
    setMultipleAreas(client.sub_areas);
    setIsEditClientOpen(true);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    // Create template with actual clients data from the software
    const templateData = clientsData.map(client => ({
      'Company': client.company,
      'Pincode': client.pincode || '',
      'State': client.state || '',
      'Main Area': client.main_area || '',
      'Sub Area': client.sub_areas.join(';'),
    }));

    // Add 3 empty rows for users to add more clients
    const emptyRows = [
      { 'Company': '', 'Pincode': '', 'State': '', 'Main Area': '', 'Sub Area': '' },
      { 'Company': '', 'Pincode': '', 'State': '', 'Main Area': '', 'Sub Area': '' },
      { 'Company': '', 'Pincode': '', 'State': '', 'Main Area': '', 'Sub Area': '' },
    ];

    const fullData = [...templateData, ...emptyRows];
    const worksheet = XLSX.utils.json_to_sheet(fullData);
    
    // Set column widths for better readability
    const columnWidths = [
      { wch: 25 },  // Company
      { wch: 12 },  // Pincode
      { wch: 18 },  // State
      { wch: 18 },  // Main Area
      { wch: 30 },  // Sub Area
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');
    XLSX.writeFile(workbook, 'clients-data.xlsx');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isExcel = fileExtension === 'xlsx' || fileExtension === 'xls';
    const isCSV = fileExtension === 'csv' || fileExtension === 'txt' || fileExtension === 'tsv';

    if (!isExcel && !isCSV) {
      alert('Please upload a valid CSV, TSV, XLS, or XLSX file');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        let importedClients: Omit<Client, 'id'>[] = [];

        if (isExcel) {
          // Parse Excel file
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rows = XLSX.utils.sheet_to_json<{[key: string]: string}>(worksheet);
          
          if (rows.length === 0) {
            alert('File is empty or has insufficient data');
            return;
          }

          importedClients = rows.map((row) => {
            // Get values from row - handles different column name variations
            const company = row['Company'] || row['company'] || '';
            const pincode = row['Pincode'] || row['pincode'] || '';
            const state = row['State'] || row['state'] || '';
            const mainArea = row['Main Area'] || row['main area'] || row['mainArea'] || '';
            const multipleAreasStr = row['Sub Area'] || row['sub area'] || row['subArea'] || row['Multiple Areas'] || row['multiple areas'] || row['multipleAreas'] || '';

            const multipleAreas = multipleAreasStr 
              ? multipleAreasStr.split(';').map((a: string) => a.trim()).filter((a: string) => a)
              : [];

            return {
              company: company || 'Unnamed Company',
              pincode: pincode || null,
              state: state || null,
              main_area: mainArea || null,
              sub_areas: multipleAreas,
            };
          });
        } else {
          // Parse CSV/TSV file
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            alert('File is empty or has insufficient data');
            return;
          }

          // Parse CSV/TSV (detect delimiter)
          const firstLine = lines[0];
          const delimiter = firstLine.includes('\t') ? '\t' : ',';
          
          // Skip header row
          const dataLines = lines.slice(1);
          
          importedClients = dataLines.map((line) => {
            const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
            
            // Expected columns: Company, Pincode, State, Main Area, Sub Area
            const [company, pincode, state, mainArea, multipleAreasStr] = values;
            
            const multipleAreas = multipleAreasStr 
              ? multipleAreasStr.split(';').map(a => a.trim()).filter(a => a)
              : [];
            
            return {
              company: company || 'Unnamed Company',
              pincode: pincode || null,
              state: state || null,
              main_area: mainArea || null,
              sub_areas: multipleAreas,
            };
          });
        }
        
        // Save clients to Supabase
        if (importedClients.length > 0) {
          // Generate IDs for all imported clients
          const currentYear = new Date().getFullYear();
          const yearPrefix = `CLIENT-${currentYear}-`;
          
          // Get the current count of clients for this year
          const { data: existingData } = await supabase
            .from('clients')
            .select('id', { count: 'exact' })
            .like('id', `${yearPrefix}%`);
          
          let nextNumber = (existingData?.length || 0) + 1;
          
          const clientsWithIds = importedClients.map((client) => ({
            ...client,
            id: `${yearPrefix}${String(nextNumber++).padStart(4, '0')}`,
          }));
          
          const { error } = await supabase
            .from('clients')
            .insert(clientsWithIds);
          
          if (error) throw error;
          
          // Fetch updated clients list
          await fetchClients();
          alert(`Successfully imported ${importedClients.length} client(s)`);
        }
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        alert('Error parsing file. Please ensure the format is correct.');
        console.error(error);
      }
    };
    
    reader.onerror = () => {
      alert('Error reading file');
    };
    
    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground">Manage your client directory ({clientsData.length} total)</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,.tsv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button 
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            title="Download CSV template"
          >
            <Download className="h-4 w-4" /> Template
          </button>
          <button 
            onClick={handleImportClick}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            title="Import clients from CSV or Excel file"
          >
            <Upload className="h-4 w-4" /> Import Excel
          </button>
          {userRole === "admin" && (
            <button 
              onClick={() => {
                setIsAddClientOpen(true);
                // Reset form
                setPartyName("");
                setPincode("");
                setState("");
                setMainArea("");
                setMultipleAreas([]);
                setNewAreaInput("");
                setAreaType("main");
              }}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <Plus className="h-4 w-4" /> Add Client
            </button>
          )}
        </div>
      </div>

      {/* Search Bar and Empty State */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 px-2 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, state, area, or pincode..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-gray-400" 
          />
        </div>

        {/* Empty State */}
        {clientsData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="mb-3 h-16 w-16 text-gray-300" strokeWidth={1.5} />
            <p className="text-base font-medium text-gray-600 mb-1">No clients yet</p>
            <p className="text-sm text-gray-500">Add clients manually or import from Excel</p>
          </div>
        )}
      </div>

      {/* Table - Only show if there are clients */}
      {clientsData.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-accent">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Pincode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Main Area</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Sub Area</th>
                {userRole === "admin" && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {clientsData.filter((client) => {
                const query = searchQuery.toLowerCase();
                return (
                  client.company.toLowerCase().includes(query) ||
                  (client.pincode?.toLowerCase().includes(query) || false) ||
                  (client.state?.toLowerCase().includes(query) || false) ||
                  (client.main_area?.toLowerCase().includes(query) || false) ||
                  client.sub_areas.some(area => area.toLowerCase().includes(query))
                );
              }).map((client) => (
                <tr key={client.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{client.company}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{client.pincode || '-'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{client.state || '-'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{client.main_area || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {client.sub_areas.map((area, idx) => (
                        <span key={idx} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          {area}
                        </span>
                      ))}
                    </div>
                  </td>
                  {userRole === "admin" && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditDialog(client)}
                          className="p-1 rounded hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition"
                          title="Edit client"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-1 rounded hover:bg-red-100 text-gray-600 hover:text-red-600 transition"
                          title="Delete client"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
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
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Area</Label>
              
              {/* Main Area Option */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Main Area</p>
                <Input
                  value={mainArea}
                  onChange={(e) => setMainArea(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="rounded-lg"
                />
              </div>

              {/* Sub Area Option */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Sub Area</p>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newAreaInput}
                      onChange={(e) => setNewAreaInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && newAreaInput.trim()) {
                          setMultipleAreas([...multipleAreas, newAreaInput.trim()]);
                          setNewAreaInput("");
                        }
                      }}
                      placeholder="Type area and press Enter"
                      className="rounded-lg"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (newAreaInput.trim()) {
                          setMultipleAreas([...multipleAreas, newAreaInput.trim()]);
                          setNewAreaInput("");
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-3"
                    >
                      Add
                    </Button>
                  </div>
                  
                  {multipleAreas.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {multipleAreas.map((areaItem, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{areaItem}</span>
                          <button
                            type="button"
                            onClick={() => setMultipleAreas(multipleAreas.filter((_, i) => i !== index))}
                            className="hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
                onClick={handleAddClient}
                className="rounded-lg bg-red-600 hover:bg-red-700"
              >
                Add Client
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Client</DialogTitle>
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
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Area</Label>
              
              {/* Main Area Option */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Main Area</p>
                <Input
                  value={mainArea}
                  onChange={(e) => setMainArea(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="rounded-lg"
                />
              </div>

              {/* Sub Area Option */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Sub Area</p>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newAreaInput}
                      onChange={(e) => setNewAreaInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && newAreaInput.trim()) {
                          setMultipleAreas([...multipleAreas, newAreaInput.trim()]);
                          setNewAreaInput("");
                        }
                      }}
                      placeholder="Type area and press Enter"
                      className="rounded-lg"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (newAreaInput.trim()) {
                          setMultipleAreas([...multipleAreas, newAreaInput.trim()]);
                          setNewAreaInput("");
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-3"
                    >
                      Add
                    </Button>
                  </div>
                  
                  {multipleAreas.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {multipleAreas.map((areaItem, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{areaItem}</span>
                          <button
                            type="button"
                            onClick={() => setMultipleAreas(multipleAreas.filter((_, i) => i !== index))}
                            className="hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditClientOpen(false);
                  setEditingClient(null);
                  setPartyName("");
                  setPincode("");
                  setState("");
                  setMainArea("");
                  setMultipleAreas([]);
                  setNewAreaInput("");
                }}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditClient}
                className="rounded-lg bg-red-600 hover:bg-red-700"
              >
                Update Client
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
