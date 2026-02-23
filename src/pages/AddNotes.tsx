import { notes as initialNotes } from "@/data/mockData";
import { useState } from "react";
import { Plus, StickyNote } from "lucide-react";

const AddNotes = () => {
  const [notesData] = useState(initialNotes);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notes</h1>
          <p className="text-sm text-muted-foreground">Keep track of important notes for your leads</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Note
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notesData.map((note) => (
          <div key={note.id} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-status-followup" />
              <h3 className="text-sm font-semibold text-foreground">{note.company}</h3>
            </div>
            <p className="mb-3 text-sm text-muted-foreground leading-relaxed">{note.content}</p>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <p className="text-xs text-muted-foreground">By {note.createdBy}</p>
              <p className="text-xs text-muted-foreground">{note.createdAt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddNotes;
