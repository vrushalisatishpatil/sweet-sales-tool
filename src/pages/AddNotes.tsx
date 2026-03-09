import { useEffect, useState } from "react";
import { Plus, Search, FileText, Building2, User, Calendar, X, Filter, Check, Pencil, Trash2, CheckCircle2, Clock, AlertTriangle, ListTodo, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";
import { formatDateDDMMYYYY } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";
import { matchesDynamicSearch } from "@/lib/search";

type TodoStatus = "Pending" | "In Progress" | "Completed";

interface TodoItem {
  id: string;
  title: string;
  content: string;
  category: TodoStatus;
  company: string;
  createdBy: string;
  createdAt: string;
}

const AddNotes = () => {
  const { userRole, userEmail } = useUser();
  const [notesData, setNotesData] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerIdentifier, setOwnerIdentifier] = useState<string | null>(null);
  const [creatorLabel, setCreatorLabel] = useState<string>("Admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<TodoItem | null>(null);
  const [editingNote, setEditingNote] = useState<TodoItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    category: "Pending" as TodoStatus
  });

  useEffect(() => {
    initializeUserContext();
  }, [userRole, userEmail]);

  useEffect(() => {
    if (ownerIdentifier) {
      fetchTodos(ownerIdentifier);
    }
  }, [ownerIdentifier]);

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const initializeUserContext = async () => {
    if (userRole === "admin") {
      setOwnerIdentifier("admin");
      setCreatorLabel("Admin");
      return;
    }

    if (!userEmail) {
      setOwnerIdentifier(null);
      setCreatorLabel("Sales Person");
      return;
    }

    const { data, error } = await supabase
      .from("sales_team")
      .select("person_id")
      .eq("email", userEmail)
      .maybeSingle();

    if (error || !data?.person_id) {
      setOwnerIdentifier(userEmail);
      setCreatorLabel(userEmail);
      return;
    }

    setOwnerIdentifier(data.person_id);
    setCreatorLabel(data.person_id);
  };

  const fetchTodos = async (ownerKey: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("owner_identifier", ownerKey)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformed: TodoItem[] = (data || []).map((todo) => ({
        id: todo.id,
        title: todo.title,
        content: todo.content || "",
        category: (todo.status || "Pending") as TodoStatus,
        company: todo.company || "",
        createdBy: todo.created_by || "",
        createdAt: formatDateDDMMYYYY(todo.created_at),
      }));

      setNotesData(transformed);
    } catch (error) {
      console.error("Error fetching todos:", error);
      setNotesData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddNoteDialog = () => {
    setIsAddNoteDialogOpen(true);
  };

  const handleCloseAddNoteDialog = () => {
    setIsAddNoteDialogOpen(false);
    setNewNote({
      title: "",
      content: "",
      category: "Pending"
    });
  };

  const handleCreateNote = async () => {
    if (!ownerIdentifier || !newNote.title.trim()) return;

    try {
      const { error } = await supabase.from("todos").insert([
        {
          title: newNote.title.trim(),
          content: newNote.content.trim() || null,
          status: newNote.category,
          company: null,
          created_by: creatorLabel,
          owner_identifier: ownerIdentifier,
        },
      ]);

      if (error) throw error;

      await fetchTodos(ownerIdentifier);
      handleCloseAddNoteDialog();
    } catch (error) {
      console.error("Error creating todo:", error);
      alert("Failed to create to-do. Please try again.");
    }
  };

  const handleStatusChange = async (noteId: string, newStatus: string) => {
    if (!ownerIdentifier) return;

    try {
      const { error } = await supabase
        .from("todos")
        .update({ status: newStatus })
        .eq("id", noteId)
        .eq("owner_identifier", ownerIdentifier);

      if (error) throw error;

      setNotesData((prev) =>
        prev.map((note) =>
          note.id === noteId ? { ...note, category: newStatus as TodoStatus } : note
        )
      );
    } catch (error) {
      console.error("Error updating todo status:", error);
      alert("Failed to update status.");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!ownerIdentifier) return;
    
    if (!confirm("Are you sure you want to delete this to-do?")) return;

    try {
      const { error } = await supabase
        .from("todos")
        .delete()
        .eq("id", noteId)
        .eq("owner_identifier", ownerIdentifier);

      if (error) throw error;

      setNotesData((prev) => prev.filter((note) => note.id !== noteId));
      setSelectedNote(null);
    } catch (error) {
      console.error("Error deleting todo:", error);
      alert("Failed to delete to-do.");
    }
  };

  const handleEditNote = (note: TodoItem) => {
    setEditingNote({ ...note });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingNote || !ownerIdentifier) return;

    try {
      const { error } = await supabase
        .from("todos")
        .update({
          title: editingNote.title,
          content: editingNote.content,
          status: editingNote.category,
        })
        .eq("id", editingNote.id)
        .eq("owner_identifier", ownerIdentifier);

      if (error) throw error;

      setNotesData((prev) =>
        prev.map((note) =>
          note.id === editingNote.id ? editingNote : note
        )
      );

      if (selectedNote?.id === editingNote.id) {
        setSelectedNote(editingNote);
      }

      setIsEditDialogOpen(false);
      setEditingNote(null);
      alert("To-do updated successfully!");
    } catch (error) {
      console.error("Error updating todo:", error);
      alert("Failed to update to-do.");
    }
  };

  const handleFilterChange = (value: string) => {
    setFilterDropdown(value);
    // Map dropdown value to category
    if (value === "All To Do's") setCategoryFilter("All");
    else if (value === "Completed") setCategoryFilter("Completed");
    else if (value === "In Progress") setCategoryFilter("In Progress");
    else if (value === "Pending") setCategoryFilter("Pending");
  };

  // Filter notes
  const filteredNotes = notesData.filter((note) => {
    const matchesSearch = matchesDynamicSearch(searchQuery, [
      note.title,
      note.content,
      note.company,
      note.createdBy,
      note.createdAt,
      note.category,
    ]);
    const matchesCategory = categoryFilter === "All" || note.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate counts
  const totalNotes = notesData.length;
  const completedCount = notesData.filter(n => n.category === "Completed").length;
  const inProgressCount = notesData.filter(n => n.category === "In Progress").length;
  const pendingCount = notesData.filter(n => n.category === "Pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-muted-foreground">Loading to do's...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">To Do's</h1>
          <p className="text-sm text-muted-foreground">{totalNotes} to do's found</p>
        </div>
        <button 
          onClick={handleOpenAddNoteDialog}
          className="flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" /> Add To Do's
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total To Do's</p>
            <ListTodo className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-foreground">{totalNotes}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Pending</p>
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-foreground">{pendingCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <AlertTriangle className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-foreground">{inProgressCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Completed</p>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-foreground">{completedCount}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 flex-1 min-w-[200px] max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground" 
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50">
              <Filter className="h-4 w-4 text-gray-600" />
              <span>{categoryFilter === "All" ? "All To Do's" : categoryFilter}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[180px] p-0" align="start">
            <div className="py-1">
              {["All", "Completed", "In Progress", "Pending"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setCategoryFilter(status);
                  }}
                  className={`w-full px-3 py-2 text-sm text-left flex items-center gap-2 ${
                    categoryFilter === status
                      ? "bg-red-600 text-white"
                      : "hover:bg-gray-100 text-gray-900"
                  }`}
                >
                  {categoryFilter === status && <Check className="h-4 w-4" />}
                  <span className={categoryFilter === status ? "" : "ml-6"}>
                    {status === "All" ? "All To Do's" : status}
                  </span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* To Do Cards */}
      <div className="space-y-4">
        {filteredNotes.map((note) => (
          <div key={note.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 cursor-pointer min-w-0" onClick={() => setSelectedNote(note)}>
                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
                    note.category === "Completed"
                      ? "bg-green-100 text-green-700 border-green-300"
                      : note.category === "In Progress"
                      ? "bg-blue-100 text-blue-700 border-blue-300"
                      : "bg-yellow-100 text-yellow-700 border-yellow-300"
                  }`}>
                    {note.category}
                  </span>
                </div>

                {/* Title - Truncated */}
                <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 break-words hover:text-red-600 transition-colors">{note.title}</h3>

                {/* Description - Truncated */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 break-words">{note.content}</p>
                {note.content && note.content.length > 150 && (
                  <p className="text-[11px] text-blue-500 mb-2 font-medium">Click to view full details</p>
                )}

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    <span>{note.createdBy}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{note.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Status Dropdown */}
              <div className="shrink-0 flex items-center gap-2">
                {/* Edit Button */}
                <button
                  onClick={() => handleEditNote(note)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Status Dropdown */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50">
                      <span>{note.category}</span>
                      <ChevronDown className="h-3 w-3 text-gray-500" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[160px] p-0" align="end">
                    <div className="py-1">
                      {["Pending", "In Progress", "Completed"].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(note.id, status)}
                          className={`w-full px-3 py-2 text-sm text-left flex items-center gap-2 ${
                            note.category === status
                              ? "bg-red-600 text-white"
                              : "hover:bg-gray-100 text-gray-900"
                          }`}
                        >
                          {note.category === status && <Check className="h-4 w-4" />}
                          <span className={note.category === status ? "" : "ml-6"}>{status}</span>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No to do's found</p>
        </div>
      )}

      {/* Add Note Dialog */}
      <Dialog open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="noteTitle">Title</Label>
              <Input
                id="noteTitle"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Enter note title"
                className="mt-1 border-red-500 focus:border-red-500 focus:ring-red-500"
              />
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Write your note..."
                className="mt-1 min-h-[120px] resize-none"
              />
            </div>

            {/* Type */}
            <div>
              <Label htmlFor="category">Type</Label>
              <Select value={newNote.category} onValueChange={(value) => setNewNote({ ...newNote, category: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Save Note Button */}
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreateNote}
            >
              Save Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Full Note Dialog */}
      <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Custom Header with Icons */}
          <div className="flex items-center justify-between pr-8 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded text-xs font-medium ${
                selectedNote?.category === "Pending" 
                  ? "bg-yellow-100 text-yellow-700" 
                  : selectedNote?.category === "Completed"
                  ? "bg-red-100 text-red-700"
                  : selectedNote?.category === "In Progress"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}>
                {selectedNote?.category}
              </div>
            </div>
            {/* Action Icons */}
            {selectedNote && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    handleEditNote(selectedNote);
                    setSelectedNote(null);
                  }}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    handleDeleteNote(selectedNote.id);
                    setSelectedNote(null);
                  }}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          {selectedNote && (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 break-words">
                  {selectedNote.title}
                </h2>
              </div>

              {/* Company */}
              {selectedNote.company && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <Building2 className="h-5 w-5 text-red-600" />
                  <span className="text-red-600 font-medium">{selectedNote.company}</span>
                </div>
              )}

              {/* Full Content */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Details</h3>
                <p className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap break-words bg-gray-50 p-4 rounded-lg">
                  {selectedNote.content}
                </p>
              </div>

              {/* Footer Info with Action Buttons */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{selectedNote.createdBy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedNote.createdAt}</span>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleEditNote(selectedNote);
                      setSelectedNote(null);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteNote(selectedNote.id);
                      setSelectedNote(null);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          {editingNote && (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="editTitle">Title</Label>
                <Input
                  id="editTitle"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  placeholder="Enter note title"
                  className="mt-1 border-red-500 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="editContent">Content</Label>
                <Textarea
                  id="editContent"
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  placeholder="Write your note..."
                  className="mt-1 min-h-[120px] resize-none"
                />
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select value={editingNote.category} onValueChange={(value) => setEditingNote({ ...editingNote, category: value as TodoStatus })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </Button>
                <Button 
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingNote(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNotes;
