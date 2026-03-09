import { Search, Upload, Plus, Users, X, Download, Edit, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import * as XLSX from 'xlsx';
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import { matchesDynamicSearch } from "@/lib/search";
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

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object") {
    const maybeError = error as { message?: string; code?: string; details?: string; hint?: string };
    return maybeError.message || maybeError.details || maybeError.hint || "Unknown error";
  }
  return "Unknown error";
};

const isDuplicateIdError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: string; message?: string };
  return maybeError.code === "23505" || maybeError.message?.toLowerCase().includes("duplicate key") === true;
};

const Clients = () => {
  const { userRole } = useUser();
  const [clientsData, setClientsData] = useState<Client[]>([]);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
  const [partyName, setPartyName] = useState("");
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [mainArea, setMainArea] = useState("");
  const [multipleAreas, setMultipleAreas] = useState<string[]>([]);
  const [newAreaInput, setNewAreaInput] = useState("");
  const [areaType, setAreaType] = useState<"main" | "multiple">("main");
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizeCellValue = (value: unknown): string => String(value ?? "").trim();

  const getNextClientSequence = async (): Promise<number> => {
    const currentYear = new Date().getFullYear();
    const yearPrefix = `CLIENT-${currentYear}-`;

    const { data, error } = await supabase
      .from("clients")
      .select("id")
      .like("id", `${yearPrefix}%`)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const latestId = data?.id;
    if (!latestId) return 1;

    const sequence = Number(latestId.replace(yearPrefix, ""));
    return Number.isNaN(sequence) ? 1 : sequence + 1;
  };

  // Generate client ID in format CLIENT-YYYY-NNNN
  const generateClientId = async (): Promise<string> => {
    const currentYear = new Date().getFullYear();
    const yearPrefix = `CLIENT-${currentYear}-`;
    
    try {
      const nextNumber = await getNextClientSequence();
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

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleAddClient = async () => {
    if (!partyName.trim()) return;
    
    try {
      let lastError: unknown = null;
      let inserted = false;

      // Retry a few times in case generated ID already exists due concurrent inserts.
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const newId = await generateClientId();

        const { error } = await supabase
          .from('clients')
          .insert({
            id: newId,
            company: partyName.trim(),
            pincode: pincode.trim() || null,
            state: state.trim() || null,
            main_area: mainArea.trim() || null,
            sub_areas: multipleAreas,
          });

        if (!error) {
          inserted = true;
          break;
        }

        lastError = error;
        if (!isDuplicateIdError(error)) {
          throw error;
        }
      }

      if (!inserted) {
        throw lastError || new Error("Unable to generate a unique client ID");
      }
      
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
      alert(`Error adding client: ${getErrorMessage(error)}`);
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
        const workbook = isExcel
          ? XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer), { type: "array" })
          : XLSX.read(e.target?.result as string, { type: "string" });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });

        if (rows.length === 0) {
          alert("File is empty or has insufficient data");
          return;
        }

        const importedClients: Omit<Client, "id">[] = rows
          .map((row) => {
            const normalizedRow = Object.entries(row).reduce<Record<string, string>>((acc, [key, value]) => {
              acc[key.trim().toLowerCase()] = normalizeCellValue(value);
              return acc;
            }, {});

            const company =
              normalizedRow["company"] ||
              normalizedRow["party name"] ||
              normalizedRow["client"] ||
              "";
            const pincode = normalizedRow["pincode"] || "";
            const state = normalizedRow["state"] || "";
            const mainArea =
              normalizedRow["main area"] ||
              normalizedRow["main_area"] ||
              normalizedRow["mainarea"] ||
              "";
            const multipleAreasStr =
              normalizedRow["sub area"] ||
              normalizedRow["sub areas"] ||
              normalizedRow["multiple areas"] ||
              normalizedRow["multiple area"] ||
              normalizedRow["sub_areas"] ||
              "";

            const multipleAreas = multipleAreasStr
              ? multipleAreasStr
                  .split(/[;,|]/)
                  .map((area) => area.trim())
                  .filter(Boolean)
              : [];

            return {
              company,
              pincode: pincode || null,
              state: state || null,
              main_area: mainArea || null,
              sub_areas: multipleAreas,
            };
          })
          .filter((client) => {
            return Boolean(
              client.company || client.pincode || client.state || client.main_area || client.sub_areas.length > 0
            );
          })
          .map((client) => ({
            ...client,
            company: client.company || "Unnamed Company",
          }));

        if (importedClients.length === 0) {
          alert("No valid rows found to import. Please fill at least Company or other fields.");
          return;
        }
        
        // Save clients to Supabase
        if (importedClients.length > 0) {
          // Generate IDs for all imported clients
          const currentYear = new Date().getFullYear();
          const yearPrefix = `CLIENT-${currentYear}-`;

          let nextNumber = await getNextClientSequence();
          
          const clientsWithIds = importedClients.map((client) => ({
            ...client,
            id: `${yearPrefix}${String(nextNumber++).padStart(4, '0')}`,
          }));
          
          const { error } = await supabase
            .from('clients')
            .insert(clientsWithIds);
          
          if (error) {
            throw new Error(error.message);
          }
          
          // Fetch updated clients list
          await fetchClients();
          alert(`Successfully imported ${importedClients.length} client(s)`);
        }
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Please ensure the format is correct.';
        alert(`Import failed: ${message}`);
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
          {userRole === "admin" && (
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              title="Download CSV template"
            >
              <Download className="h-4 w-4" /> Template
            </button>
          )}
          {userRole === "admin" && (
            <button
              onClick={handleImportClick}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              title="Import clients from CSV or Excel file"
            >
              <Upload className="h-4 w-4" /> Import Excel
            </button>
          )}
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
              {clientsData.filter((client) => matchesDynamicSearch(searchQuery, [
                client.company,
                client.pincode,
                client.state,
                client.main_area,
                client.sub_areas,
                client.id,
              ])).map((client) => (
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





