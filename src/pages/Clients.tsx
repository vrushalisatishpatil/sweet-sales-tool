import { clients } from "@/data/mockData";
import { Building2 } from "lucide-react";

const Clients = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Clients</h1>
        <p className="text-sm text-muted-foreground">Your converted leads and active clients</p>
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
          <Building2 className="mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No clients yet. Convert leads to see them here.</p>
        </div>
      ) : (
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
    </div>
  );
};

export default Clients;
