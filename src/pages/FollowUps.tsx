import { useState } from "react";
import { followUps as initialFollowUps, type FollowUp } from "@/data/mockData";
import { Check, Phone, Mail, MessageCircle, MapPin } from "lucide-react";

const methodIcons: Record<string, React.ReactNode> = {
  Call: <Phone className="h-4 w-4" />,
  Email: <Mail className="h-4 w-4" />,
  WhatsApp: <MessageCircle className="h-4 w-4" />,
  Visit: <MapPin className="h-4 w-4" />,
};

const FollowUps = () => {
  const [followUpData, setFollowUpData] = useState<FollowUp[]>(initialFollowUps);

  const toggleComplete = (id: string) => {
    setFollowUpData((prev) => prev.map((f) => f.id === id ? { ...f, completed: !f.completed } : f));
  };

  const pending = followUpData.filter((f) => !f.completed);
  const completed = followUpData.filter((f) => f.completed);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Follow-ups</h1>
        <p className="text-sm text-muted-foreground">Track and manage your scheduled follow-ups</p>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{pending.length}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-status-converted">{completed.length}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
      </div>

      <div className="space-y-3">
        {followUpData.map((fu) => (
          <div key={fu.id} className={`flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-opacity ${fu.completed ? "opacity-60" : ""}`}>
            <button onClick={() => toggleComplete(fu.id)} className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${fu.completed ? "border-status-converted bg-status-converted text-primary-foreground" : "border-border hover:border-primary"}`}>
              {fu.completed && <Check className="h-3 w-3" />}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-semibold text-foreground ${fu.completed ? "line-through" : ""}`}>{fu.company}</h3>
                <span className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs text-muted-foreground">
                  {methodIcons[fu.method]} {fu.method}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{fu.note}</p>
              <p className="mt-1 text-xs text-muted-foreground">By {fu.by}</p>
            </div>
            <p className="shrink-0 text-sm text-muted-foreground">{fu.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowUps;
