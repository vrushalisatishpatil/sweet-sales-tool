export type LeadStatus =
  | "New"
  | "Connected"
  | "Interested"
  | "Not Interested"
  | "Detail Share"
  | "Re-connected"
  | "Negotiation"
  | "Converted"
  | "Irrelevant"
  | "Lost";

export interface Lead {
  id: string;
  company: string;
  contact: string;
  source: string;
  status: LeadStatus;
  phone: string;
  email: string;
  assignedTo: string;
  createdAt: string;
  value: number;
  city: string;
  state: string;
  country: string;
  leadId: string;
  inquiryDate: string;
  productInterested: string;
  remarks: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  company: string;
  note: string;
  by: string;
  method: string;
  phone: string;
  date: string;
  completed: boolean;
  nextAction: string;
  nextFollowUpDate: string;
  status: LeadStatus;
}

export interface SalesPerson {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  leadsAssigned: number;
  conversions: number;
  avatar: string;
  employeeId: string;
  status: "Active" | "Inactive";
  leads: number;
  converted: number;
  rate: string;
}

export interface Task {
  id: string;
  taskId: string;
  title: string;
  description: string;
  assignedTo: string;
  leadCompany: string;
  priority: "High" | "Medium" | "Low" | "Urgent";
  status: "Pending" | "In Progress" | "Completed";
  dueDate: string;
}

export interface Note {
  id: string;
  leadId: string;
  company: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  category: "Completed" | "Pending";
}

export interface Client {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  industry: string;
  convertedDate: string;
  value: number;
  pincode: string;
  state: string;
  mainArea: string;
  multipleAreas: string[];
}

export const leads: Lead[] = [
  { id: "1", company: "TechVista Solutions", contact: "Arjun Mehta", source: "Website", status: "New", phone: "9812345678", email: "arjun@techvista.com", assignedTo: "Rahul Sharma", createdAt: "10/02/2025", value: 250000, city: "Mumbai", state: "Maharashtra", country: "India", leadId: "LD-2025-001", inquiryDate: "2025-02-10", productInterested: "CRM Software", remarks: "Looking for enterprise CRM solution" },
  { id: "2", company: "GreenLeaf Industries", contact: "Kavita Nair", source: "Reference", status: "Connected", phone: "9823456789", email: "kavita@greenleaf.com", assignedTo: "Priya Patel", createdAt: "09/02/2025", value: 180000, city: "Pune", state: "Maharashtra", country: "India", leadId: "LD-2025-002", inquiryDate: "2025-02-09", productInterested: "ERP System", remarks: "Interested in manufacturing ERP solution" },
  { id: "3", company: "Metro Builders", contact: "Rajesh Iyer", source: "Call", status: "Re-connected", phone: "9834567890", email: "rajesh@metrobuilders.com", assignedTo: "Amit Kumar", createdAt: "08/02/2025", value: 420000, city: "Chennai", state: "Tamil Nadu", country: "India", leadId: "LD-2025-003", inquiryDate: "2025-02-08", productInterested: "Project Management Tool", remarks: "Requires project management and tracking system" },
  { id: "4", company: "Sunrise Healthcare", contact: "Dr. Meena Shah", source: "WhatsApp", status: "Interested", phone: "9845678901", email: "meena@sunrisehc.com", assignedTo: "Sneha Gupta", createdAt: "07/02/2025", value: 350000, city: "Ahmedabad", state: "Gujarat", country: "India", leadId: "LD-2025-004", inquiryDate: "2025-02-07", productInterested: "Hospital Management System", remarks: "Looking for comprehensive HMS with billing" },
  { id: "5", company: "FastTrack Logistics", contact: "Nikhil Joshi", source: "Email", status: "Detail Share", phone: "9856789012", email: "nikhil@fasttrack.com", assignedTo: "Rahul Sharma", createdAt: "06/02/2025", value: 150000, city: "Delhi", state: "Delhi", country: "India", leadId: "LD-2025-005", inquiryDate: "2025-02-06", productInterested: "Fleet Management", remarks: "Need fleet tracking and management solution" },
  { id: "6", company: "FoodChain India", contact: "Sanjay Gupta", source: "Visit", status: "Negotiation", phone: "9801234567", email: "sanjay@foodchain.com", assignedTo: "Rahul Sharma", createdAt: "05/02/2025", value: 280000, city: "Bangalore", state: "Karnataka", country: "India", leadId: "LD-2025-006", inquiryDate: "2025-02-05", productInterested: "POS System", remarks: "Wants integrated POS for multiple outlets" },
  { id: "7", company: "AquaPure Water", contact: "Deepa Menon", source: "Email", status: "Not Interested", phone: "9812340000", email: "deepa@aquapure.com", assignedTo: "Priya Patel", createdAt: "04/02/2025", value: 120000, city: "Kochi", state: "Kerala", country: "India", leadId: "LD-2025-007", inquiryDate: "2025-02-04", productInterested: "IoT Dashboard", remarks: "IoT monitoring solution for water quality" },
  { id: "8", company: "SkyNet Telecom", contact: "Vikram Singh", source: "Website", status: "Connected", phone: "9867890123", email: "vikram@skynet.com", assignedTo: "Amit Kumar", createdAt: "03/02/2025", value: 550000, city: "Hyderabad", state: "Telangana", country: "India", leadId: "LD-2025-008", inquiryDate: "2025-02-03", productInterested: "Billing Software", remarks: "Telecom billing and customer management" },
  { id: "9", company: "Elegant Interiors", contact: "Priya Desai", source: "Reference", status: "Interested", phone: "9878901234", email: "priya@elegant.com", assignedTo: "Sneha Gupta", createdAt: "02/02/2025", value: 200000, city: "Surat", state: "Gujarat", country: "India", leadId: "LD-2025-009", inquiryDate: "2025-02-02", productInterested: "Design Software", remarks: "3D design and visualization tools needed" },
  { id: "10", company: "Digital Dynamics", contact: "Rahul Verma", source: "Call", status: "Converted", phone: "9889012345", email: "rahul@digitald.com", assignedTo: "Rahul Sharma", createdAt: "01/02/2025", value: 480000, city: "Kolkata", state: "West Bengal", country: "India", leadId: "LD-2025-010", inquiryDate: "2025-02-01", productInterested: "Marketing Automation", remarks: "Digital marketing automation platform" },
  { id: "11", company: "NatureFirst Organics", contact: "Anita Rao", source: "WhatsApp", status: "Lost", phone: "9890123456", email: "anita@naturefirst.com", assignedTo: "Priya Patel", createdAt: "31/01/2025", value: 90000, city: "Nagpur", state: "Maharashtra", country: "India", leadId: "LD-2025-011", inquiryDate: "2025-01-31", productInterested: "Inventory Management", remarks: "Organic product inventory tracking" },
  { id: "12", company: "BuildRight Construction", contact: "Manoj Patil", source: "Visit", status: "Irrelevant", phone: "9801234500", email: "manoj@buildright.com", assignedTo: "Amit Kumar", createdAt: "30/01/2025", value: 670000, city: "Nashik", state: "Maharashtra", country: "India", leadId: "LD-2025-012", inquiryDate: "2025-01-30", productInterested: "Construction ERP", remarks: "End-to-end construction management system" },
];

export const followUps: FollowUp[] = [
  { id: "1", leadId: "3", company: "Metro Builders", note: "Discussed project management requirements in detail", by: "Amit Kumar", method: "Call", phone: "9834567890", date: "2025-02-13", completed: false, nextAction: "Schedule product demo", nextFollowUpDate: "2025-02-15", status: "New" },
  { id: "2", leadId: "4", company: "Sunrise Healthcare", note: "Sent pricing proposal for HMS software", by: "Sneha Gupta", method: "Email", phone: "9845678901", date: "2025-02-13", completed: false, nextAction: "Follow up on pricing approval", nextFollowUpDate: "2025-02-16", status: "Connected" },
  { id: "3", leadId: "5", company: "FastTrack Logistics", note: "Checked on budget approval status", by: "Rahul Sharma", method: "WhatsApp", phone: "9856789012", date: "2025-02-13", completed: false, nextAction: "Send detailed quotation", nextFollowUpDate: "2025-02-17", status: "Detail Share" },
  { id: "4", leadId: "6", company: "FoodChain India", note: "Visited their main outlet, assessed POS needs", by: "Rahul Sharma", method: "Visit", phone: "9801234567", date: "2025-02-13", completed: false, nextAction: "Prepare customized proposal", nextFollowUpDate: "2025-02-18", status: "Interested" },
  { id: "5", leadId: "1", company: "TechVista Solutions", note: "Initial discovery call, needs identified", by: "Rahul Sharma", method: "Call", phone: "9812345678", date: "2025-02-13", completed: false, nextAction: "Share case studies", nextFollowUpDate: "2025-02-19", status: "Negotiation" },
  { id: "6", leadId: "7", company: "AquaPure Water", note: "Shared IoT dashboard demo link", by: "Priya Patel", method: "Email", phone: "9812340000", date: "2025-02-13", completed: false, nextAction: "Arrange technical discussion", nextFollowUpDate: "2025-02-20", status: "Re-connected" },
];

export const salesTeam: SalesPerson[] = [
  { id: "1", name: "Rahul Sharma", email: "rahul@company.com", phone: "9876543210", role: "Senior Sales Executive", leadsAssigned: 4, conversions: 1, avatar: "RS", employeeId: "SP001", status: "Active", leads: 45, converted: 12, rate: "27%" },
  { id: "2", name: "Priya Patel", email: "priya@company.com", phone: "9876543211", role: "Sales Executive", leadsAssigned: 3, conversions: 0, avatar: "PP", employeeId: "SP002", status: "Active", leads: 38, converted: 15, rate: "39%" },
  { id: "3", name: "Amit Kumar", email: "amit@company.com", phone: "9876543212", role: "Sales Manager", leadsAssigned: 3, conversions: 0, avatar: "AK", employeeId: "SP003", status: "Active", leads: 52, converted: 18, rate: "35%" },
  { id: "4", name: "Sneha Gupta", email: "sneha@company.com", phone: "9876543213", role: "Business Development", leadsAssigned: 2, conversions: 0, avatar: "SG", employeeId: "SP004", status: "Active", leads: 42, converted: 16, rate: "38%" },
  { id: "5", name: "Vikram Singh", email: "vikram@company.com", phone: "9876543214", role: "Sales Executive", leadsAssigned: 1, conversions: 0, avatar: "VS", employeeId: "SP005", status: "Inactive", leads: 30, converted: 10, rate: "33%" },
];

export const tasks: Task[] = [
  { id: "1", taskId: "TSK-001", title: "Schedule demo for TechVista", description: "Set up a product demo session with Arjun Mehta", assignedTo: "Rahul Sharma", leadCompany: "TechVista Solutions", priority: "High", status: "Pending", dueDate: "2025-02-15" },
  { id: "2", taskId: "TSK-002", title: "Send pricing proposal", description: "Prepare and send detailed pricing for HMS Software", assignedTo: "Sneha Gupta", leadCompany: "Sunrise Healthcare", priority: "Urgent", status: "In Progress", dueDate: "2025-02-14" },
  { id: "3", taskId: "TSK-003", title: "Follow up on quotation", description: "Check if Metro Builders received the quotation", assignedTo: "Amit Kumar", leadCompany: "Metro Builders", priority: "Medium", status: "Pending", dueDate: "2025-02-16" },
  { id: "4", taskId: "TSK-004", title: "Collect requirements", description: "Visit and document POS requirements", assignedTo: "Rahul Sharma", leadCompany: "FoodChain India", priority: "Medium", status: "Completed", dueDate: "2025-02-13" },
  { id: "5", taskId: "TSK-005", title: "Send brochure", description: "Email product brochure and case studies", assignedTo: "Priya Patel", leadCompany: "AquaPure Water", priority: "Low", status: "Pending", dueDate: "2025-02-17" },
  { id: "6", taskId: "TSK-006", title: "Contract preparation", description: "Prepare service agreement for Digital Dynamics", assignedTo: "Amit Kumar", leadCompany: "Digital Dynamics", priority: "High", status: "In Progress", dueDate: "2025-02-15" },
  { id: "7", taskId: "TSK-007", title: "Technical discussion", description: "Schedule technical call with IT team", assignedTo: "Priya Patel", leadCompany: "SkyNet Telecom", priority: "Medium", status: "Completed", dueDate: "2025-02-12" },
  { id: "8", taskId: "TSK-008", title: "Budget approval follow-up", description: "Check on budget approval status with finance team", assignedTo: "Sneha Gupta", leadCompany: "FastTrack Logistics", priority: "Low", status: "Pending", dueDate: "2025-02-18" },
];

export const notes: Note[] = [
  { id: "1", leadId: "1", company: "TechVista Solutions", title: "TechVista Requirements Summary", content: "They need enterprise CRM with at least 50 user licenses. Key features: pipeline management, email integration, reporting dashboard. Budget range: 5-8 lakhs annually.", createdBy: "Rahul Sharma", createdAt: "2025-02-13", category: "Completed" },
  { id: "2", leadId: "0", company: "", title: "Competitor Analysis - Q1 2025", content: "Main competitors offering similar CRM solutions at 20% lower pricing. Need to emphasize our support quality and customization options.", createdBy: "Priya Patel", createdAt: "2025-02-12", category: "Pending" },
  { id: "3", leadId: "4", company: "Sunrise Healthcare", title: "Sunrise Healthcare - Decision Makers", content: "Dr. Meena Shah is the primary decision maker. CFO Mr. Ravi needs to approve budget. IT Head Sanjay will evaluate technical aspects.", createdBy: "Sneha Gupta", createdAt: "2025-02-11", category: "Completed" },
  { id: "4", leadId: "0", company: "", title: "Sales Team Weekly Standup Notes", content: "Key points: Focus on converting 'Interested' leads this week. Rahul to handle 3 demos. Priya to close AquaPure deal. Training session on new CRM features Friday.", createdBy: "Amit Kumar", createdAt: "2025-02-10", category: "Pending" },
  { id: "5", leadId: "6", company: "FoodChain India", title: "FoodChain POS Requirements", content: "Need multi-location POS with inventory sync. 12 outlets require seamless integration. Budget: 3-4 lakhs. Pilot at one outlet first before full rollout.", createdBy: "Rahul Sharma", createdAt: "2025-02-09", category: "Completed" },
  { id: "6", leadId: "0", company: "", title: "New Pricing Strategy Ideas", content: "Consider tiered pricing: Basic (up to 10 users), Pro (up to 50 users), Enterprise (unlimited). Add annual discount of 15%. Bundle training with packages.", createdBy: "Priya Patel", createdAt: "2025-02-08", category: "Pending" },
];

export const clients: Client[] = [
  { id: "1", company: "TechVista Solutions", contact: "Arjun Mehta", email: "arjun@techvista.com", phone: "9812345678", industry: "Software", convertedDate: "2025-01-15", value: 250000, pincode: "400001", state: "Maharashtra", mainArea: "Mumbai", multipleAreas: ["Bandra", "Worli"] },
];

export const salesPerformanceData = [
  { name: "Rahul", leads: 45, conversions: 12 },
  { name: "Priya", leads: 38, conversions: 15 },
  { name: "Amit", leads: 52, conversions: 18 },
  { name: "Sneha", leads: 29, conversions: 8 },
  { name: "Vikram", leads: 15, conversions: 5 },
];

export const weeklyLeadTrend = [
  { day: "Mon", leads: 4 },
  { day: "Tue", leads: 7 },
  { day: "Wed", leads: 3 },
  { day: "Thu", leads: 8 },
  { day: "Fri", leads: 6 },
  { day: "Sat", leads: 2 },
  { day: "Sun", leads: 5 },
];

export const leadStatusDistribution = [
  { name: "New", value: 1, color: "hsl(210, 100%, 60%)" },
  { name: "Connected", value: 2, color: "hsl(210, 50%, 45%)" },
  { name: "Interested", value: 2, color: "hsl(270, 60%, 55%)" },
  { name: "Not Interested", value: 1, color: "hsl(0, 0%, 60%)" },
  { name: "Detail Share", value: 1, color: "hsl(45, 93%, 58%)" },
  { name: "Re-connected", value: 1, color: "hsl(200, 80%, 55%)" },
  { name: "Negotiation", value: 1, color: "hsl(30, 100%, 50%)" },
  { name: "Converted", value: 1, color: "hsl(142, 70%, 45%)" },
  { name: "Irrelevant", value: 1, color: "hsl(0, 0%, 45%)" },
  { name: "Lost", value: 1, color: "hsl(0, 72%, 51%)" },
];

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    "New": "bg-status-new text-primary-foreground",
    "Connected": "bg-status-contacted text-primary-foreground",
    "Interested": "bg-status-interested text-primary-foreground",
    "Not Interested": "bg-muted text-muted-foreground",
    "Detail Share": "bg-status-followup text-foreground",
    "Re-connected": "bg-status-contacted text-primary-foreground",
    "Negotiation": "bg-status-pending text-primary-foreground",
    "Converted": "bg-status-converted text-primary-foreground",
    "Irrelevant": "bg-muted text-muted-foreground",
    "Lost": "bg-status-lost text-primary-foreground",
  };
  return colors[status] || "bg-muted text-muted-foreground";
};

export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    "High": "bg-status-lost text-primary-foreground",
    "Medium": "bg-status-followup text-foreground",
    "Low": "bg-status-converted text-primary-foreground",
  };
  return colors[priority] || "bg-muted text-muted-foreground";
};

export const getTaskStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    "Pending": "bg-status-pending text-primary-foreground",
    "In Progress": "bg-status-new text-primary-foreground",
    "Completed": "bg-status-converted text-primary-foreground",
  };
  return colors[status] || "bg-muted text-muted-foreground";
};
