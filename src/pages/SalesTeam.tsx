import { salesTeam } from "@/data/mockData";
import { Mail, Phone, Users } from "lucide-react";

const SalesTeam = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Sales Team</h1>
        <p className="text-sm text-muted-foreground">Your team members and their performance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {salesTeam.map((person) => (
          <div key={person.id} className="rounded-xl border border-border bg-card p-5 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              {person.avatar}
            </div>
            <h3 className="text-sm font-semibold text-foreground">{person.name}</h3>
            <p className="mb-3 text-xs text-muted-foreground">{person.role}</p>
            <div className="mb-3 flex justify-center gap-4 text-xs">
              <div>
                <p className="text-lg font-bold text-foreground">{person.leadsAssigned}</p>
                <p className="text-muted-foreground">Leads</p>
              </div>
              <div>
                <p className="text-lg font-bold text-status-converted">{person.conversions}</p>
                <p className="text-muted-foreground">Conversions</p>
              </div>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center justify-center gap-1"><Mail className="h-3 w-3" />{person.email}</div>
              <div className="flex items-center justify-center gap-1"><Phone className="h-3 w-3" />{person.phone}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesTeam;
