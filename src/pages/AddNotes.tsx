import { useEffect, useState } from "react";
import { Plus, Search, FileText, Building2, User, Calendar, X, Filter, Check, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";
import { formatDateDDMMYYYY } from "@/lib/utils";

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
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [filterDropdown, setFilterDropdown] = useState("All To Do's");
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
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.company.toLowerCase().includes(searchQuery.toLowerCase());
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
          <p className="text-sm text-muted-foreground">{totalNotes} to do's</p>
        </div>
        <button 
          onClick={handleOpenAddNoteDialog}
          className="flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" /> Add To Do's
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
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
        <Select value={filterDropdown} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="All To Do's" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All To Do's" className="data-[state=checked]:bg-red-600 data-[state=checked]:text-white">
              <div className="flex items-center gap-2">
                {filterDropdown === "All To Do's" && <Check className="h-4 w-4" />}
                All To Do's
              </div>
            </SelectItem>
            <SelectItem value="Completed" className="data-[state=checked]:bg-red-600 data-[state=checked]:text-white">
              <div className="flex items-center gap-2">
                {filterDropdown === "Completed" && <Check className="h-4 w-4" />}
                Completed
              </div>
            </SelectItem>
            <SelectItem value="In Progress" className="data-[state=checked]:bg-red-600 data-[state=checked]:text-white">
              <div className="flex items-center gap-2">
                {filterDropdown === "In Progress" && <Check className="h-4 w-4" />}
                In Progress
              </div>
            </SelectItem>
            <SelectItem value="Pending" className="data-[state=checked]:bg-red-600 data-[state=checked]:text-white">
              <div className="flex items-center gap-2">
                {filterDropdown === "Pending" && <Check className="h-4 w-4" />}
                Pending
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => {
            setCategoryFilter("All");
            setFilterDropdown("All To Do's");
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            categoryFilter === "All"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All ({totalNotes})
        </button>
        <button
          onClick={() => {
            setCategoryFilter("Completed");
            setFilterDropdown("Completed");
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            categoryFilter === "Completed"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Completed ({completedCount})
        </button>
        <button
          onClick={() => {
            setCategoryFilter("In Progress");
            setFilterDropdown("In Progress");
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            categoryFilter === "In Progress"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          In Progress ({inProgressCount})
        </button>
        <button
          onClick={() => {
            setCategoryFilter("Pending");
            setFilterDropdown("Pending");
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            categoryFilter === "Pending"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Pending ({pendingCount})
        </button>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredNotes.sort((a, b) => {
          // Pending items first, then In Progress, then Completed
          const order: Record<string, number> = { "Pending": 0, "In Progress": 1, "Completed": 2 };
          return (order[a.category] ?? 99) - (order[b.category] ?? 99);
        }).map((note) => (
          <div 
            key={note.id} 
            className={`rounded-lg border ${
              note.category === "Completed"
                ? "border-l-4 border-l-red-500"
                : note.category === "In Progress"
                ? "border-l-4 border-l-blue-400"
                : "border-l-4 border-l-gray-300"
            } border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-full`}
          >
            {/* Status Dropdown */}
            <div className="mb-3 flex items-center gap-2 pr-10">
              <Select value={note.category} onValueChange={(value) => handleStatusChange(note.id, value)}>
                <SelectTrigger className={`h-7 px-2 text-xs font-medium w-fit ${
                  note.category === "Pending" 
                    ? "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-150" 
                    : note.category === "Completed"
                    ? "bg-red-100 text-red-700 border-red-300 hover:bg-red-150"
                    : note.category === "In Progress"
                    ? "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-150"
                    : "bg-gray-100 text-gray-700"
                }`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title - Truncated to 2 lines */}
            <h3 className="text-[15px] font-bold text-gray-900 mb-2 pr-6 leading-tight line-clamp-2 cursor-pointer hover:text-red-600 transition-colors"
              onClick={() => setSelectedNote(note)}>
              {note.title}
            </h3>

            {/* Company/Lead (if applicable) */}
            {note.company && (
              <div className="flex items-center gap-1.5 mb-2">
                <Building2 className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                <span className="text-[13px] text-red-600 font-medium truncate">{note.company}</span>
              </div>
            )}

            {/* Content - Truncated to 4 lines with scrollable container for expansion */}
            <div 
              className="flex-1 overflow-hidden mb-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setSelectedNote(note)}
            >
              <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-4 break-words">
                {note.content}
              </p>
              {note.content && note.content.length > 100 && (
                <p className="text-[11px] text-blue-500 mt-1 font-medium">Click to view full details</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 truncate">
                  <User className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{note.createdBy}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Calendar className="h-3 w-3" />
                  <span>{note.createdAt}</span>
                </div>
              </div>
              {/* Edit and Delete Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditNote(note)}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No notes found</p>
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
