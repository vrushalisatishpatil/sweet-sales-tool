import { useState } from "react";
import { followUps as initialFollowUps, type FollowUp } from "@/data/mockData";
import { Phone, Mail, MessageCircle, MapPin, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const methodIcons: Record<string, React.ReactNode> = {
  Call: <Phone className="h-5 w-5" />,
  Email: <Mail className="h-5 w-5" />,
  WhatsApp: <MessageCircle className="h-5 w-5" />,
  Visit: <MapPin className="h-5 w-5" />,
};

const FollowUps = () => {
  const [followUpData] = useState<FollowUp[]>(initialFollowUps);

  // Filter today's follow-ups (you can adjust the logic as needed)
  const todaysFollowUps = followUpData.filter((f) => !f.completed);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Today's Follow-ups</h1>
        <p className="text-sm text-muted-foreground">{todaysFollowUps.length} follow-ups scheduled for today</p>
      </div>

      <div className="space-y-4">
        {todaysFollowUps.map((fu) => (
          <div key={fu.id} className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                {methodIcons[fu.method]}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{fu.company}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Calendar className="h-3 w-3" />
                    <span>{fu.date}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-1">
                  {fu.phone} · {fu.method}
                </p>

                <p className="text-sm text-foreground mb-3">
                  {fu.note}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Next:</span>
                    <div className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
                      <ArrowRight className="h-3.5 w-3.5" />
                      <span>{fu.nextAction}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{fu.nextFollowUpDate}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Created by {fu.by}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 shrink-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="min-w-[110px]"
                  onClick={() => window.open(`tel:${fu.phone}`, '_self')}
                >
                  <Phone className="h-3.5 w-3.5 mr-1.5" />
                  Call
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="min-w-[110px]"
                  onClick={() => window.open(`https://wa.me/${fu.phone}`, '_blank')}
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {todaysFollowUps.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No follow-ups scheduled for today</p>
        </div>
      )}
    </div>
  );
};

export default FollowUps;
