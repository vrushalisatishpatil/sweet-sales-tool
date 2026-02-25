import { notes as initialNotes } from "@/data/mockData";
import { useState } from "react";
import { Plus, Search, FileText, Building2, User, Calendar, X, Filter, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const AddNotes = () => {
  const [notesData, setNotesData] = useState(initialNotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [filterDropdown, setFilterDropdown] = useState("All To Do's");
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    category: ""
  });

  const handleOpenAddNoteDialog = () => {
    setIsAddNoteDialogOpen(true);
  };

  const handleCloseAddNoteDialog = () => {
    setIsAddNoteDialogOpen(false);
    setNewNote({
      title: "",
      content: "",
      category: ""
    });
  };

  const handleCreateNote = () => {
    console.log("New note created:", newNote);
    // Add your note creation logic here
    handleCloseAddNoteDialog();
  };

  const handleStatusChange = (noteId: string, newStatus: string) => {
    setNotesData(
      notesData.map((note) =>
        note.id === noteId ? { ...note, category: newStatus } : note
      )
    );
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
            } border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow relative`}
          >
            {/* Close button */}
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>

            {/* Status Dropdown */}
            <div className="mb-3 flex items-center gap-2">
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

            {/* Title */}
            <h3 className="text-[15px] font-bold text-gray-900 mb-2 pr-6 leading-tight">{note.title}</h3>

            {/* Company/Lead (if applicable) */}
            {note.company && (
              <div className="flex items-center gap-1.5 mb-2">
                <Building2 className="h-3.5 w-3.5 text-red-600" />
                <span className="text-[13px] text-red-600 font-medium">{note.company}</span>
              </div>
            )}

            {/* Content */}
            <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
              {note.content}
            </p>

            {/* Footer */}
            <div className="flex items-center gap-4 text-[11px] text-gray-500 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{note.createdBy}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{note.createdAt}</span>
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
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
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
    </div>
  );
};

export default AddNotes;
