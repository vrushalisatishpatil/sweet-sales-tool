import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";

interface FollowUp {
  id: string;
  company: string;
  contact: string;
  phone: string;
  method: string;
  note: string;
  by: string;
  date: string;
  status: string;
  completed: boolean;
  nextFollowUpDate?: string;
  nextAction?: string;
}
import { Phone, Mail, MessageCircle, MapPin, ArrowRight, Calendar, Edit, History, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const methodIcons: Record<string, React.ReactNode> = {
  Call: <Phone className="h-5 w-5" />,
  Email: <Mail className="h-5 w-5" />,
  WhatsApp: <MessageCircle className="h-5 w-5" />,
  Visit: <MapPin className="h-5 w-5" />,
};

const FollowUps = () => {
  const { userRole, userName } = useUser();
  const [followUpData, setFollowUpData] = useState<FollowUp[]>([]);
  const [salesTeam, setSalesTeam] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);
  const [isHistoryView, setIsHistoryView] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<
    | "New"
    | "Connected"
    | "Interested"
    | "Not Interested"
    | "Detail Share"
    | "Re-connected"
    | "Negotiation"
    | "Converted"
    | "Irrelevant"
    | "Lost"
  >("New");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [completionFilter, setCompletionFilter] = useState<"All" | "Pending" | "Completed">("Pending");
  const [dateFilter, setDateFilter] = useState<"All" | "Today" | "This Week" | "Custom">("All");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  
  // Form input states for follow-up edit
  const [discussion, setDiscussion] = useState("");
  const [followUpBy, setFollowUpBy] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  
  // History state
  const [followUpHistory, setFollowUpHistory] = useState<Array<{
    id: string;
    discussion: string;
    follow_up_by: string;
    follow_up_date: string;
    next_follow_up: string;
    next_follow_up_date: string;
    created_at: string;
  }>>([]);

  // Fetch follow-ups from Supabase
  useEffect(() => {
    fetchFollowUps();
    fetchSalesTeam();
  }, []);

  const fetchSalesTeam = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_team')
        .select('id, name')
        .eq('status', 'Active');
      
      if (error) throw error;
      setSalesTeam(data || []);
    } catch (err) {
      console.error('Error fetching sales team:', err);
    }
  };

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('leads')
        .select('*');
      
      // Filter by assigned user if not admin
      if (userRole === 'salesperson' && userName) {
        query = query.eq('assigned_to', userName);
      }
      
      const { data, error } = await query.order('next_follow_up_date', { ascending: true });
      
      if (error) throw error;
      
      // Transform the data to match FollowUp interface
      const transformedData: FollowUp[] = (data || []).map((lead) => ({
        id: lead.id,
        company: lead.company || '',
        contact: lead.contact || '',
        phone: lead.phone || '',
        method: 'Call', // Default method
        note: lead.remarks || '',
        by: lead.assigned_to || '',
        date: lead.inquiry_date || new Date(lead.created_at).toISOString().split('T')[0],
        status: lead.status || 'New',
        completed: false,
        nextFollowUpDate: lead.next_follow_up_date || '',
        nextAction: lead.remarks || ''
      }));
      
      setFollowUpData(transformedData);
    } catch (err) {
      console.error('Error fetching follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    "New",
    "Connected",
    "Interested",
    "Not Interested",
    "Detail Share",
    "Re-connected",
    "Negotiation",
    "Converted",
    "Irrelevant",
    "Lost",
  ];

  const statusFilterOptions = ["All", ...statusOptions];
  const assigneeOptions = ["All", ...salesTeam.map((person) => person.name)];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-500 text-white border-blue-500";
      case "Connected":
        return "bg-gray-600 text-white border-gray-600";
      case "Not Interested":
        return "bg-gray-400 text-white border-gray-400";
      case "Detail Share":
        return "bg-yellow-500 text-white border-yellow-500";
      case "Re-connected":
        return "bg-sky-500 text-white border-sky-500";
      case "Negotiation":
        return "bg-orange-500 text-white border-orange-500";
      case "Interested":
        return "bg-purple-600 text-white border-purple-600";
      case "Converted":
        return "bg-green-600 text-white border-green-600";
      case "Irrelevant":
        return "bg-gray-500 text-white border-gray-500";
      case "Lost":
        return "bg-red-600 text-white border-red-600";
      default:
        return "bg-gray-400 text-white border-gray-400";
    }
  };

  const parseFollowUpDate = (value: string) => {
    if (!value) return null;
    if (value.includes("/")) {
      const [day, month, year] = value.split("/");
      if (day && month && year) {
        const parsed = new Date(Number(year), Number(month) - 1, Number(day));
        if (!Number.isNaN(parsed.getTime())) return parsed;
      }
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const isSameDay = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

  const getWeekRange = (date: Date) => {
    const day = date.getDay();
    const diffToMonday = (day + 6) % 7;
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - diffToMonday);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return { weekStart, weekEnd };
  };

  const filteredFollowUps = followUpData.filter((item) => {
    if (completionFilter !== "All") {
      const isCompleted = item.completed;
      if (completionFilter === "Completed" && !isCompleted) return false;
      if (completionFilter === "Pending" && isCompleted) return false;
    }

    if (statusFilter !== "All" && item.status !== statusFilter) return false;
    if (assigneeFilter !== "All" && item.by !== assigneeFilter) return false;

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const matchTarget = [
        item.company,
        item.note,
        item.phone,
        item.by,
        item.nextAction,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!matchTarget.includes(query)) return false;
    }

    if (dateFilter !== "All") {
      const dateValue = parseFollowUpDate(item.nextFollowUpDate || item.date);
      if (!dateValue) return false;

      const today = new Date();
      if (dateFilter === "Today" && !isSameDay(dateValue, today)) return false;
      if (dateFilter === "This Week") {
        const { weekStart, weekEnd } = getWeekRange(today);
        if (dateValue < weekStart || dateValue > weekEnd) return false;
      }
      if (dateFilter === "Custom") {
        const startDate = customStartDate ? new Date(customStartDate) : null;
        const endDate = customEndDate ? new Date(customEndDate) : null;
        if (startDate && dateValue < startDate) return false;
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (dateValue > end) return false;
        }
      }
    }

    return true;
  });

  const handleFollowUpClick = (followUp: FollowUp) => {
    setSelectedFollowUp(followUp);
    setIsHistoryView(false);
    setSelectedStatus(followUp.status as any);
    setDiscussion(followUp.note);
    setFollowUpBy(followUp.by);
    setFollowUpDate(followUp.date);
    setNextFollowUp(followUp.nextAction || "");
    setNextFollowUpDate(followUp.nextFollowUpDate || "");
    setIsDialogOpen(true);
    fetchFollowUpHistory(followUp.id);
  };

  const fetchFollowUpHistory = async (leadId: string) => {
    try {
      const { data, error } = await supabase
        .from('follow_up_history')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFollowUpHistory(data || []);
    } catch (err) {
      console.error('Error fetching follow-up history:', err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFollowUp) return;
    
    try {
      // Save to history table
      const { error: historyError } = await supabase
        .from('follow_up_history')
        .insert([
          {
            lead_id: selectedFollowUp.id,
            description: discussion,
            follow_up_by: followUpBy,
            follow_up_date: followUpDate,
            next_follow_up: nextFollowUp,
            next_follow_up_date: nextFollowUpDate,
          }
        ]);
      
      if (historyError) throw historyError;
      
      // Update lead's next follow-up date
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          next_follow_up_date: nextFollowUpDate || null,
          status: selectedStatus as any
        })
        .eq('id', selectedFollowUp.id);
      
      if (updateError) throw updateError;
      
      // Refresh data
      await fetchFollowUps();
      await fetchFollowUpHistory(selectedFollowUp.id);
      
      alert('Follow-up saved successfully!');
    } catch (err) {
      console.error('Error saving follow-up:', err);
      alert('Failed to save follow-up. Please try again.');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Follow-ups</h1>
        <p className="text-sm text-muted-foreground">{loading ? "Loading..." : `${filteredFollowUps.length} follow-ups match your filters`}</p>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-64 space-y-2">
            <Label htmlFor="followup-search" className="text-xs">Search</Label>
            <Input
              id="followup-search"
              placeholder="Search company, note, phone..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-9"
            />
          </div>
          <div className="w-40 space-y-2">
            <Label className="text-xs">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusFilterOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {userRole === "admin" && (
            <div className="w-40 space-y-2">
              <Label className="text-xs">Assigned To</Label>
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Assigned to" />
                </SelectTrigger>
                <SelectContent>
                  {assigneeOptions.map((assignee) => (
                    <SelectItem key={assignee} value={assignee}>
                      {assignee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="w-36 space-y-2">
            <Label className="text-xs">Completion</Label>
            <Select value={completionFilter} onValueChange={(value) => setCompletionFilter(value as "All" | "Pending" | "Completed")}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Completion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-36 space-y-2">
            <Label className="text-xs">Date Range</Label>
            <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as "All" | "Today" | "This Week" | "Custom")}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Today">Today</SelectItem>
                <SelectItem value="This Week">This Week</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {dateFilter === "Custom" && (
            <>
              <div className="w-40 space-y-2">
                <Label htmlFor="custom-start-date" className="text-xs">Start Date</Label>
                <Input
                  id="custom-start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(event) => setCustomStartDate(event.target.value)}
                  className="h-9"
                />
              </div>
              <div className="w-40 space-y-2">
                <Label htmlFor="custom-end-date" className="text-xs">End Date</Label>
                <Input
                  id="custom-end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(event) => setCustomEndDate(event.target.value)}
                  className="h-9"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredFollowUps.map((fu) => (
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

      {filteredFollowUps.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No follow-ups match your filters</p>
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
                    value={discussion}
                    onChange={(e) => setDiscussion(e.target.value)}
                    placeholder="Enter discussion details..."
                    className="min-h-[100px] rounded-lg resize-none focus-visible:ring-0 focus-visible:ring-offset-0 border-2 border-gray-300 focus:border-red-500"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[280px] overflow-y-auto">
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Follow-up By and Follow-up Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="followUpBy" className="text-sm font-medium">
                      Follow-up By
                    </Label>
                    <Input
                      id="followUpBy"
                      value={followUpBy}
                      onChange={(e) => setFollowUpBy(e.target.value)}
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
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
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
                      value={nextFollowUp}
                      onChange={(e) => setNextFollowUp(e.target.value)}
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
                      value={nextFollowUpDate}
                      onChange={(e) => setNextFollowUpDate(e.target.value)}
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
                  {followUpHistory.length > 0 ? (
                    followUpHistory.map((history, index) => {
                      const ordinals = ['st', 'nd', 'rd'];
                      const ordinal = index < 3 ? ordinals[index] : 'th';
                      const number = index + 1;
                      
                      return (
                        <div key={history.id} className="rounded-lg border-2 border-gray-200 p-4 bg-gray-50">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">{number}{ordinal} Follow-up</h4>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Discussion</Label>
                              <p className="mt-1 text-sm text-gray-900">{history.description || '-'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Follow-up By</Label>
                                <p className="mt-1 text-sm text-gray-900">{history.follow_up_by || '-'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Follow-up Date</Label>
                                <p className="mt-1 text-sm text-gray-900">{history.follow_up_date || '-'}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Next Follow-up</Label>
                                <p className="mt-1 text-sm text-gray-900">{history.next_follow_up || '-'}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Next Follow-up Date</Label>
                                <p className="mt-1 text-sm text-gray-900">{history.next_follow_up_date || '-'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-500 py-4">No follow-up history available</p>
                  )}
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
