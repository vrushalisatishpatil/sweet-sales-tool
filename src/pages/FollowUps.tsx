import { useState } from "react";
import { followUps as initialFollowUps, type FollowUp } from "@/data/mockData";
import { Phone, Mail, MessageCircle, MapPin, ArrowRight, Calendar, Edit, History, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const methodIcons: Record<string, React.ReactNode> = {
  Call: <Phone className="h-5 w-5" />,
  Email: <Mail className="h-5 w-5" />,
  WhatsApp: <MessageCircle className="h-5 w-5" />,
  Visit: <MapPin className="h-5 w-5" />,
};

const FollowUps = () => {
  const [followUpData] = useState<FollowUp[]>(initialFollowUps);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);
  const [isHistoryView, setIsHistoryView] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"New" | "Contacted" | "Follow-up" | "Interested" | "Pending">("Pending");

  const statusOptions = ["New", "Contacted", "Follow-up", "Interested", "Pending"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-500 text-white border-blue-500";
      case "Contacted":
        return "bg-gray-600 text-white border-gray-600";
      case "Follow-up":
        return "bg-yellow-500 text-white border-yellow-500";
      case "Interested":
        return "bg-purple-600 text-white border-purple-600";
      case "Pending":
        return "bg-orange-500 text-white border-orange-500";
      default:
        return "bg-gray-400 text-white border-gray-400";
    }
  };

  // Filter today's follow-ups (you can adjust the logic as needed)
  const todaysFollowUps = followUpData.filter((f) => !f.completed);

  const handleFollowUpClick = (followUp: FollowUp) => {
    setSelectedFollowUp(followUp);
    setIsHistoryView(false);
    setSelectedStatus(followUp.status);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    // Handle form submission here
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Today's Follow-ups</h1>
        <p className="text-sm text-muted-foreground">{todaysFollowUps.length} follow-ups scheduled for today</p>
      </div>

      <div className="space-y-4">
        {todaysFollowUps.map((fu) => (
          <div 
            key={fu.id} 
            className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleFollowUpClick(fu)}
          >
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
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`tel:${fu.phone}`, '_self');
                  }}
                >
                  <Phone className="h-3.5 w-3.5 mr-1.5" />
                  Call
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="min-w-[110px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://wa.me/${fu.phone}`, '_blank');
                  }}
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                  WhatsApp
                </Button>
                <div 
                  className={`px-2.5 py-0.5 text-xs rounded-full border-0 font-medium h-auto w-fit inline-block ${getStatusColor(fu.status)}`}
                >
                  {fu.status}
                </div>
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

      {/* Follow-up Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">
                {selectedFollowUp?.company}
              </DialogTitle>
              <div className="flex gap-2 mr-8">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`gap-2 transition-colors ${
                    !isHistoryView 
                      ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' 
                      : 'hover:bg-red-600 hover:text-white hover:border-red-600'
                  }`}
                  onClick={() => setIsHistoryView(false)}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`gap-2 transition-colors ${
                    isHistoryView 
                      ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' 
                      : 'hover:bg-red-600 hover:text-white hover:border-red-600'
                  }`}
                  onClick={() => setIsHistoryView(true)}
                >
                  <History className="h-4 w-4" />
                  History
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Form Fields - Only show in Edit mode */}
            {!isHistoryView && (
              <>
                {/* Discussion */}
                <div className="space-y-2">
                  <Label htmlFor="discussion" className="text-sm font-medium">
                    Discussion
                  </Label>
                  <Textarea
                    id="discussion"
                    defaultValue={selectedFollowUp?.note}
                    placeholder="Enter discussion details..."
                    className="min-h-[100px] rounded-lg resize-none focus-visible:ring-0 focus-visible:ring-offset-0 border-2 border-gray-300 focus:border-red-500"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between border-2 border-gray-300 text-left font-normal hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                      >
                        <span>{selectedStatus}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <div className="space-y-1 p-2">
                        {statusOptions.map((status) => (
                          <button
                            key={status}
                            className={`w-full px-3 py-2 text-sm text-left rounded-md transition-colors ${
                              selectedStatus === status
                                ? "bg-red-600 text-white flex items-center gap-2"
                                : "hover:bg-gray-100"
                            }`}
                            onClick={() => {
                              setSelectedStatus(status);
                              setIsStatusOpen(false);
                            }}
                          >
                            {selectedStatus === status && <Check className="h-4 w-4" />}
                            {selectedStatus === status ? (
                              <span className={selectedStatus === status ? "ml-6" : ""}>{status}</span>
                            ) : (
                              <span className="ml-6">{status}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Follow-up By and Follow-up Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="followUpBy" className="text-sm font-medium">
                      Follow-up By
                    </Label>
                    <Input
                      id="followUpBy"
                      defaultValue={selectedFollowUp?.by}
                      placeholder="Enter name"
                      className="rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 border-2 border-gray-300 focus:border-red-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="followUpDate" className="text-sm font-medium">
                      Follow-up Date
                    </Label>
                    <Input
                      id="followUpDate"
                      type="date"
                      defaultValue={selectedFollowUp?.date}
                      className="rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 border-2 border-gray-300 focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Next Follow-up and Next Follow-up Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nextFollowUp" className="text-sm font-medium">
                      Next Follow-up
                    </Label>
                    <Input
                      id="nextFollowUp"
                      defaultValue={selectedFollowUp?.nextAction}
                      placeholder="Enter next action"
                      className="rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 border-2 border-gray-300 focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nextFollowUpDate" className="text-sm font-medium">
                      Next Follow-up Date
                    </Label>
                    <Input
                      id="nextFollowUpDate"
                      type="date"
                      placeholder="Select date"
                      className="rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 border-2 border-gray-300 focus:border-red-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Previous History Items - Only show in History view */}
            {isHistoryView && (
              <div className="space-y-4 pt-4">
                <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
                  {/* History Item 1 */}
                  <div className="rounded-lg border-2 border-gray-200 p-4 bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">1st Follow-up</h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Discussion</Label>
                        <p className="mt-1 text-sm text-gray-900">Discussed project timeline and budget requirements in detail</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Follow-up By</Label>
                          <p className="mt-1 text-sm text-gray-900">{selectedFollowUp?.by}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Follow-up Date</Label>
                          <p className="mt-1 text-sm text-gray-900">2025-02-10</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Next Follow-up</Label>
                          <p className="mt-1 text-sm text-gray-900">Schedule product demo</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Next Follow-up Date</Label>
                          <p className="mt-1 text-sm text-gray-900">2025-02-15</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* History Item 2 */}
                  <div className="rounded-lg border-2 border-gray-200 p-4 bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">2nd Follow-up</h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Discussion</Label>
                        <p className="mt-1 text-sm text-gray-900">Initial contact made, expressed interest in our services</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Follow-up By</Label>
                          <p className="mt-1 text-sm text-gray-900">{selectedFollowUp?.by}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Follow-up Date</Label>
                          <p className="mt-1 text-sm text-gray-900">2025-02-05</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Next Follow-up</Label>
                          <p className="mt-1 text-sm text-gray-900">Send detailed proposal</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Next Follow-up Date</Label>
                          <p className="mt-1 text-sm text-gray-900">2025-02-10</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* History Item 3 */}
                  <div className="rounded-lg border-2 border-gray-200 p-4 bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">3rd Follow-up</h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Discussion</Label>
                        <p className="mt-1 text-sm text-gray-900">Cold call - company looking for software solutions</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Follow-up By</Label>
                          <p className="mt-1 text-sm text-gray-900">{selectedFollowUp?.by}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Follow-up Date</Label>
                          <p className="mt-1 text-sm text-gray-900">2025-02-01</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Next Follow-up</Label>
                          <p className="mt-1 text-sm text-gray-900">Initial meeting call</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Next Follow-up Date</Label>
                          <p className="mt-1 text-sm text-gray-900">2025-02-05</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* History Item 4 */}
                  <div className="rounded-lg border-2 border-gray-200 p-4 bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">4th Follow-up</h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Discussion</Label>
                        <p className="mt-1 text-sm text-gray-900">Sent pricing details and service packages</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Follow-up By</Label>
                          <p className="mt-1 text-sm text-gray-900">{selectedFollowUp?.by}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Follow-up Date</Label>
                          <p className="mt-1 text-sm text-gray-900">2025-01-28</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Next Follow-up</Label>
                          <p className="mt-1 text-sm text-gray-900">Follow up on proposal</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Next Follow-up Date</Label>
                          <p className="mt-1 text-sm text-gray-900">2025-02-01</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* History Item 5 */}
                  <div className="rounded-lg border-2 border-gray-200 p-4 bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">5th Follow-up</h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Discussion</Label>
                        <p className="mt-1 text-sm text-gray-900">Client requested additional features and customization options</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Follow-up By</Label>
                          <p className="mt-1 text-sm text-gray-900">{selectedFollowUp?.by}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Follow-up Date</Label>
                          <p className="mt-1 text-sm text-gray-900">2025-01-25</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Next Follow-up</Label>
                          <p className="mt-1 text-sm text-gray-900">Prepare revised quotation</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Next Follow-up Date</Label>
                          <p className="mt-1 text-sm text-gray-900">2025-01-28</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button - Only show in Edit mode */}
            {!isHistoryView && (
              <div className="pt-4">
                <Button 
                  onClick={handleSubmit}
                  className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg h-11"
                >
                  Submit
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FollowUps;
